# Deploying the agent to Hugging Face Spaces

One-time, ~10 minutes. Nothing secret is committed to git — the key lives only as
a Space secret.

## 1. Create the Space

1. Go to <https://huggingface.co/new-space>.
2. Owner: **Safwan2003**. Space name: **ask-about-safwan**.
3. SDK: **Gradio**. Hardware: **CPU basic (free)**. Visibility: **Public**.
4. Create the Space. Leave the web editor — you will push from your machine.

## 2. Push the `agent/` folder to the Space

From the repo root:

```bash
# install the HF CLI once
pip install -U "huggingface_hub[cli]"
huggingface-cli login          # paste a token from huggingface.co/settings/tokens

# push just the agent/ folder as the Space root
huggingface-cli upload Safwan2003/ask-about-safwan ./agent . --repo-type=space \
  --exclude ".venv/*" --exclude ".env" --exclude "__pycache__/*" --exclude "_smoke_test.py"
```

(Or: `git clone https://huggingface.co/spaces/Safwan2003/ask-about-safwan`, copy
the contents of `agent/` into it, `git add -A && git commit && git push`.)

## 3. Add the Groq key as a secret

1. Open the Space → **Settings** → **Variables and secrets** → **New secret**.
2. Name: `GROQ_API_KEY`. Value: your Groq key from
   <https://console.groq.com/keys>.
3. Save. The Space rebuilds automatically.

> Rotate the key first if it has been shared anywhere (chat, email, a paste). Set
> the fresh value here and nowhere else.

## 4. Wait for the build

First build installs `sentence-transformers` and downloads the MiniLM model
(~90 MB) — allow 3–5 minutes. When the status is **Running**, test a few
questions.

The public URL is:

```
https://safwan2003-ask-about-safwan.hf.space
```

## 5. Wire it into the portfolio

Send that URL back and it gets set as the iframe `src` and the "open full
screen" link in `index.html`, then committed.

## Updating later

Edit `agent/knowledge/*.md` or `agent/app.py`, then re-run the `huggingface-cli
upload` command (or push from the cloned Space repo). The Space redeploys on
push.
