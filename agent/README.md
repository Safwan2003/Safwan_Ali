# Ask about Safwan

A small grounded, tool-using chat agent that answers questions about **Safwan Ali**
— AI Engineer. It's the live demo behind
[safwan2003.github.io/Safwan_Ali](https://safwan2003.github.io/Safwan_Ali/) and
also runs standalone at the deployment URL.

## How it works

```
POST /api/chat  { messages: [...] }
        │
        ▼
Vercel Edge Function  (GROQ_API_KEY stays here, never sent to the browser)
        │
        ├─ keyword-retrieve the 4 most relevant chunks from knowledge/*.md
        ├─ Groq chat model (openai/gpt-oss-120b, fallback openai/gpt-oss-20b)
        │     └─ may call the tool:  get_github_repos()  → live api.github.com
        └─ returns the grounded answer as plain text
```

- **Grounding.** The model is given only a short CORE bio, the retrieved context,
  and tool output — and is told to decline when the answer isn't there.
- **Retrieval.** `knowledge/*.md` is bundled into `api/_knowledge.js`
  (`npm run sync`) and split into chunks; a tiny keyword scorer picks the top few
  per question. Keeps each request small — important on Groq's free tier.
- **Tool.** `get_github_repos` hits the public GitHub API live (cached 10 min).
- **Model.** `openai/gpt-oss-120b` on Groq, `openai/gpt-oss-20b` as an automatic
  fallback.

## Layout

| Path | Purpose |
| --- | --- |
| `api/chat.js` | the Edge function — retrieval, tool loop, Groq call |
| `knowledge/*.md` | source of truth for everything the agent may say |
| `api/_knowledge.js` | generated bundle (`npm run sync`) |
| `public/index.html` | standalone chat page served at the deploy root |
| `scripts/bundle.mjs` | regenerates the bundle from `knowledge/` |

## Run locally

```bash
cd agent
npm install -g vercel          # once
cp .env.example .env           # paste your Groq key
npm run sync                   # build api/_knowledge.js
vercel dev                     # http://localhost:3000
```

## Deploy

See [`DEPLOY.md`](DEPLOY.md). Hosted free on Vercel; `GROQ_API_KEY` is a Vercel
environment variable.

## Editing what it knows

Edit `knowledge/*.md`, run `npm run sync`, redeploy. Nothing else to touch.
