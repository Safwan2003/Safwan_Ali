# Deploying the agent to Hugging Face Spaces

One-time, ~10 minutes. Nothing secret is committed to git — the key lives only as
a Space secret.

## 1. Authenticate the CLI

```bash
pip install -U "huggingface_hub[cli]"
hf auth login          # paste a WRITE token from https://huggingface.co/settings/tokens
```

## 2. Create the Space and push `agent/`

From the repo root:

```bash
hf repo create Safwan2003/ask-about-safwan --repo-type space --space_sdk gradio

hf upload Safwan2003/ask-about-safwan ./agent . --repo-type space \
  --exclude ".venv/*" --exclude ".env" --exclude "__pycache__/*" --exclude "_smoke_test.py"
```

## 3. Add the Groq key as a secret

1. Open <https://huggingface.co/spaces/Safwan2003/ask-about-safwan/settings>.
2. **Variables and secrets** → **New secret**.
3. Name: `GROQ_API_KEY`. Value: your key from <https://console.groq.com/keys>.
4. Save. The Space rebuilds automatically.

> Rotate the key first if it has been shared anywhere (chat, email, a paste). Set
> the fresh value here and nowhere else.

## 4. Wait for the build

First build installs `sentence-transformers` and downloads the MiniLM model
(~90 MB) — allow 3–5 minutes. When the status is **Running**, test a few
questions.

Public URL:

```
https://safwan2003-ask-about-safwan.hf.space
```

This is already wired into `index.html` (iframe `src` + "Open full screen" link),
so the portfolio picks it up as soon as the Space is running.

## Updating later

Edit `agent/knowledge/*.md` or `agent/app.py`, then re-run the `hf upload` command.
The Space redeploys on push.
