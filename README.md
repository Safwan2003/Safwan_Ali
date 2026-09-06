# Safwan Ali — portfolio

Personal portfolio for **Safwan Ali**, AI Engineer (Karachi, Pakistan).

Live: <https://safwan2003.github.io/Safwan_Ali/>

Zero build. A static `index.html` for GitHub Pages plus a live AI agent that runs
on Hugging Face Spaces.

## Layout

```
.
├── index.html          # the whole site — semantic HTML, inline CSS, minimal JS
├── assets/
│   ├── fonts.css        # self-hosted Onest subset (no external requests)
│   ├── SafwanAli_Resume.pdf
│   └── Med-GReF_Paper.pdf
├── agent/              # "Ask about Safwan" — RAG + tool-using agent (HF Space)
│   ├── app.py
│   ├── knowledge/       # markdown source of truth for the agent
│   ├── requirements.txt
│   ├── README.md
│   └── DEPLOY.md
└── docs/superpowers/specs/   # design notes
```

## The live agent

`agent/` is a Gradio app: a Groq-hosted model answers questions about Safwan by
calling two tools — semantic search over `agent/knowledge/*.md`, and a live call
to the GitHub API. It is deployed separately as a Hugging Face Space and embedded
in `index.html`. See [`agent/README.md`](agent/README.md) and
[`agent/DEPLOY.md`](agent/DEPLOY.md).

## Run locally

```bash
python3 -m http.server 8000      # site → http://localhost:8000
cd agent && python app.py        # agent (needs a GROQ_API_KEY in agent/.env)
```

## Deploy

- **Site:** GitHub repo → Settings → Pages → Deploy from branch → `main` / root.
- **Agent:** see [`agent/DEPLOY.md`](agent/DEPLOY.md).

## Contact

- safwanalimukaddam@gmail.com
- <https://github.com/Safwan2003>
- <https://linkedin.com/in/safwan-ali-281aa1275>
