# Safwan Ali — portfolio

Personal portfolio for **Safwan Ali**, AI Engineer (Karachi, Pakistan).

Live: <https://safwan2003.github.io/Safwan_Ali/>

A static `index.html` for GitHub Pages, plus a live AI agent (`agent/`) that runs
free on Vercel and is embedded into the site.

## Layout

```
.
├── index.html              # the whole site — semantic HTML, inline CSS, minimal JS
├── assets/
│   ├── fonts.css            # self-hosted Onest subset (no external requests)
│   ├── SafwanAli_Resume.pdf
│   └── Med-GReF_Paper.pdf
├── agent/                   # "Ask about Safwan" — grounded, tool-using chat agent
│   ├── api/chat.js          # Vercel Edge Function (retrieval + tool loop + Groq)
│   ├── knowledge/*.md       # source of truth for what the agent may say
│   ├── public/index.html    # standalone chat page
│   ├── README.md
│   └── DEPLOY.md
└── docs/superpowers/specs/  # design notes
```

## The live agent

`agent/` is a Vercel Edge Function. A Groq-hosted model answers questions about
Safwan, grounded in `agent/knowledge/*.md` (keyword-retrieved per question) and a
live `get_github_repos` tool call. The `GROQ_API_KEY` stays server-side. The
portfolio's "Live agent" section talks to it directly. See
[`agent/README.md`](agent/README.md) and [`agent/DEPLOY.md`](agent/DEPLOY.md).

## Run locally

```bash
python3 -m http.server 8000              # site → http://localhost:8000
cd agent && npm run sync && vercel dev   # agent → http://localhost:3000  (needs agent/.env)
```

## Deploy

- **Site:** GitHub repo → Settings → Pages → Deploy from branch → `main` / root.
- **Agent:** see [`agent/DEPLOY.md`](agent/DEPLOY.md), then set `AGENT_API` in
  `index.html` to the Vercel URL.

## Contact

- safwanalimukaddam@gmail.com
- <https://github.com/Safwan2003>
- <https://linkedin.com/in/safwan-ali-281aa1275>
