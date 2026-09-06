---
title: Ask About Safwan
emoji: 💬
colorFrom: red
colorTo: gray
sdk: gradio
sdk_version: 5.9.1
app_file: app.py
pinned: false
short_description: A RAG + tool-using agent that answers questions about Safwan Ali.
---

# Ask about Safwan

A small retrieval-augmented, tool-using agent that answers questions about
**Safwan Ali** — AI Engineer. It is the live demo behind
[safwan2003.github.io/Safwan_Ali](https://safwan2003.github.io/Safwan_Ali/).

## How it works

```
user question
   │
   ▼
Groq chat model (openai/gpt-oss-120b)  ──►  decides which tool(s) to call
   │                                             │
   │   ┌─────────────────────────────────────────┤
   │   ▼                                         ▼
   │  search_profile(query)                 list_github_repos()
   │   • MiniLM sentence-embeddings          • live GET api.github.com
   │   • cosine top-k over knowledge/*.md    • cached in 10-min buckets
   │   • TF-IDF fallback if torch is absent
   │   ▼                                         ▼
   └──◄──────────── tool results ────────────────┘
   │
   ▼
final answer, streamed token-by-token
```

- **Grounding.** The system prompt forbids answering from parametric memory —
  every factual claim must come from a tool result, and the model is told to
  decline when the answer is not in the knowledge base.
- **Knowledge base.** `knowledge/*.md` — plain markdown, split on headings into
  retrievable chunks at startup. Editing a fact means editing one markdown file.
- **Agent loop.** Up to 4 tool-resolution rounds, then the answer is streamed.
- **Model.** `openai/gpt-oss-120b` on Groq, with `openai/gpt-oss-20b` as an
  automatic fallback on a 400.

## Run locally

```bash
cd agent
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # then paste your Groq key into .env
python app.py
```

If `sentence-transformers` is unavailable the retriever falls back to TF-IDF, so
the app still runs with only `gradio requests python-dotenv scikit-learn`.

## Deploy

See [`DEPLOY.md`](DEPLOY.md).

## Layout

| Path | Purpose |
| --- | --- |
| `app.py` | Gradio UI, retrieval, tools, and the agent loop |
| `knowledge/` | Markdown source of truth for everything the agent may say |
| `requirements.txt` | Pinned dependencies |
| `.env.example` | Local configuration template |
