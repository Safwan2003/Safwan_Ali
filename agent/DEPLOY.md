# Deploying the agent to Vercel

Free. ~5 minutes. The Groq key is a server-side environment variable — it never
reaches the browser and is never committed to git.

> Why not Hugging Face Spaces? HF now requires a paid PRO plan to run Gradio/Docker
> Spaces on the free CPU tier. Vercel's free tier runs this at no cost.

## Option A — Vercel dashboard (no CLI)

1. Push this repo to GitHub (already done).
2. Go to <https://vercel.com/new> and **Import** `Safwan2003/Safwan_Ali`.
3. **Root Directory:** set it to `agent`.
4. **Environment Variables:** add `GROQ_API_KEY` = your key from
   <https://console.groq.com/keys>.
5. **Deploy.**
6. Note the production URL (e.g. `https://safwan-ali.vercel.app` or
   `https://ask-about-safwan.vercel.app`). Its `/api/chat` is the endpoint.

## Option B — Vercel CLI

```bash
npm i -g vercel
cd agent
vercel                       # link / create the project, first deploy (preview)
vercel env add GROQ_API_KEY  # paste the key, choose Production
vercel --prod                # production deploy
```

## After deploying

1. Open the deploy URL — you should get a working chat page.
2. In the portfolio's `index.html`, set:

   ```js
   var AGENT_API = 'https://<your-vercel-url>/api/chat';
   ```

   (Send the URL back and it gets wired in + committed.)

## Rotate the key

If the Groq key has been shared anywhere (chat, a paste), create a fresh one at
<https://console.groq.com/keys>, update the Vercel env var, and redeploy.

## Updating what the agent knows

Edit `knowledge/*.md` → `npm run sync` → commit/push (Vercel redeploys on push).
