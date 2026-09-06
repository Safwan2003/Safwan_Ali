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

### 2. `agent/` — Hugging Face Space (Gradio)

- `app.py`: Gradio `ChatInterface`. Groq chat model with a tool-calling loop.
  - Model: `openai/gpt-oss-120b` (Groq), fallback `openai/gpt-oss-20b`.
  - Tools:
    - `search_profile(query)` — retrieval over `knowledge/*.md`, embedded with
      `sentence-transformers` MiniLM, cosine similarity, top-k chunks.
    - `list_github_repos()` — live GET to the public GitHub API for Safwan's repos.
  - System prompt: answer only from retrieved evidence / tool output; refuse
    politely when unknown; concise, recruiter-appropriate tone.
- `knowledge/`: markdown source of truth — `about.md`, `experience.md`,
  `projects.md`, `research.md`, `skills.md`.
- `requirements.txt`, `README.md` (architecture write-up — the repo is itself
  portfolio material), `.env.example`.
- `.env` holds `GROQ_API_KEY` locally only; git-ignored.
- `DEPLOY.md`: step-by-step — create Space, push folder, set `GROQ_API_KEY` secret.

### 3. Cleanup

- Delete `secret-pathways-assets/` (Three.js, foreground art, old font bundle).
- Rewrite root `README.md`.
- `.gitignore`: add `agent/.env`, `__pycache__/`, `.venv/`.

## Deployment flow

1. Claude builds everything; agent tested locally against the real key.
2. Safwan creates the HF Space `Safwan2003/ask-about-safwan`, pushes `agent/`,
   adds `GROQ_API_KEY` as a Space secret.
3. Safwan gives Claude the Space URL; Claude wires it into `index.html`
   (iframe `src` + "open full" link) and commits.
4. GitHub repo Settings → Pages → deploy from `main` / root.

## Security note

The Groq key was shared in chat; it should be rotated once the Space is live and
the new value stored only as the Space secret.

## Testing

- `python3 -m http.server` — manual pass of the static site at desktop + mobile widths.
- `cd agent && python app.py` — manual pass of the chat, including a question that
  triggers each tool.
- Link check: every external href in `index.html` returns < 400.
