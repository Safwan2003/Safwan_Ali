# Portfolio rebuild + live "Ask about Safwan" agent

**Date:** 2026-09-06
**Owner:** Safwan Ali
**Live URL:** https://safwan2003.github.io/Safwan_Ali/ (submitted on job applications)

## Goal

Replace the WebGL/Three.js portfolio with a professional, fast, recruiter-friendly
static site, and add a genuinely clickable live AI agent so applications that
require "working links to live systems, automations, agents, or repositories with
real code that you personally built" are satisfied.

## Non-goals

- No build step, no framework. Stays a zero-build GitHub Pages site.
- No backend in this repo. The agent runs on a Hugging Face Space.
- No secrets in git.

## Deliverables

### 1. `index.html` — rebuilt static portfolio

- Single page, semantic HTML, inline CSS, minimal vanilla JS.
- Clean minimal light aesthetic: off-white ground, ink text, one restrained accent.
  All-Onest typography, self-hosted from `assets/fonts.css` (no external requests).
- Sections: Hero → About → **Live demo** (agent, embedded iframe + open-full link)
  → Selected projects → Experience → Skills / stack → Contact.
- Responsive; respects `prefers-reduced-motion`; keyboard-navigable; real `<title>`,
  meta description, Open Graph tags, favicon.
- Every outbound link verified reachable before completion.

### 2. `agent/` — Vercel Edge Function

> Originally planned as a Hugging Face Gradio Space; HF now requires paid PRO for
> Gradio Spaces on free CPU, so this moved to Vercel's free tier.

- `api/chat.js`: Vercel Edge Function. `POST { messages }` → grounded answer.
  - Model: `openai/gpt-oss-120b` (Groq), fallback `openai/gpt-oss-20b`.
  - Retrieval: `knowledge/*.md` bundled into `api/_knowledge.js`, chunked, scored
    by keyword overlap; top ~4 chunks + a short CORE bio go into the system prompt
    (keeps each call small — Groq free tier is 8k TPM).
  - Tool: `get_github_repos()` — live GET to the public GitHub API (cached 10 min).
  - System prompt: answer only from CORE + retrieved context + tool output; refuse
    when unknown; concise, recruiter tone; hard rules against the inflated claims
    (no "submitted"/"published" for Med-GReF, no "specialization", no "SUPARCO
    project").
- `knowledge/`: markdown source of truth — `about.md`, `experience.md`,
  `projects.md`, `research.md`, `skills.md`.
- `public/index.html`: standalone chat page at the deploy root.
- `scripts/bundle.mjs` (`npm run sync`), `package.json`, `vercel.json`, `README.md`,
  `DEPLOY.md`, `.env.example`.
- `.env` holds `GROQ_API_KEY` locally only; git-ignored. In production it is a
  Vercel environment variable.
- Portfolio integration: `index.html` has an inline chat widget posting to
  `AGENT_API` (the Vercel `/api/chat` URL) — no iframe.

### 3. Cleanup

- Delete `secret-pathways-assets/` (Three.js, foreground art, old font bundle).
- Rewrite root `README.md`.
- `.gitignore`: add `agent/.env`, `__pycache__/`, `.venv/`.

## Deployment flow

1. Claude builds everything; agent tested locally against the real key.
2. Safwan imports the repo on Vercel with root directory `agent`, adds
   `GROQ_API_KEY` as an env var, deploys.
3. Safwan gives Claude the Vercel URL; Claude sets `AGENT_API` in `index.html`
   and commits.
4. GitHub repo Settings → Pages → deploy from `main` / root.

## Honesty pass (2026-09-06, after user review)

Corrected before submission: degree is a general BSc CS with *elective* ML/data
coursework (not a specialization); Med-GReF is an *in-progress working paper*
(not submitted/published); the lunar project is *self-directed*, built around
public ICUBE-Qamar specs (early SUPARCO contact did not become a collaboration);
voice + Busman work is *employer code* shown without repo links. "Final-year
student" → "2026 graduate".

## Security note

The Groq key was shared in chat; it should be rotated once the Space is live and
the new value stored only as the Space secret.

## Testing

- `python3 -m http.server` — manual pass of the static site at desktop + mobile widths.
- `cd agent && python app.py` — manual pass of the chat, including a question that
  triggers each tool.
- Link check: every external href in `index.html` returns < 400.
