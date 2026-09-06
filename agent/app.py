"""
Ask about Safwan — a small retrieval-augmented, tool-using agent.

Runs on a Hugging Face Space. A Groq-hosted model answers questions about Safwan
Ali, grounding every factual claim in one of two tools:

  * search_profile(query)   -> semantic search over knowledge/*.md
  * list_github_repos()     -> live call to the public GitHub API

The model is instructed to answer only from tool output and to decline when the
answer is not in scope.
"""

from __future__ import annotations

import json
import os
import pathlib
import re
import time
from functools import lru_cache

import gradio as gr
import requests

try:
    from dotenv import load_dotenv

    load_dotenv()
except Exception:  # dotenv is optional; the Space supplies the key as a secret
    pass

GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "").strip()
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
MODEL = os.environ.get("GROQ_MODEL", "openai/gpt-oss-120b")
FALLBACK_MODEL = "openai/gpt-oss-20b"
GITHUB_USER = "Safwan2003"
KNOWLEDGE_DIR = pathlib.Path(__file__).parent / "knowledge"
MAX_TOOL_TURNS = 4

SYSTEM_PROMPT = """You are the assistant on Safwan Ali's portfolio site. Safwan is
an AI Engineer in Karachi, Pakistan (BSCS, Salim Habib University, 2026).

Answer questions about Safwan for recruiters, hiring managers, and collaborators.

Rules:
- Ground every factual claim in tool output. Call `search_profile` for anything
  about his background, experience, projects, research, or skills. Call
  `list_github_repos` for questions about his code, repositories, or GitHub
  activity. You may call tools more than once.
- If the tools do not contain the answer, say so plainly and suggest emailing
  safwanalimukaddam@gmail.com. Do not guess or invent details, dates, employers,
  or metrics.
- Be concise and professional. A few sentences or a short list is usually enough.
  No hype, no emoji, no citation markers or footnotes.
- You represent Safwan; write in the third person ("Safwan built...", not "I
  built...").
"""

# --------------------------------------------------------------------------- #
# Knowledge base + retrieval
# --------------------------------------------------------------------------- #


def _load_chunks() -> list[dict]:
    """Split the markdown knowledge base into retrievable chunks."""
    chunks: list[dict] = []
    for path in sorted(KNOWLEDGE_DIR.glob("*.md")):
        text = path.read_text(encoding="utf-8")
        # Split on markdown headings, keep the heading with its body.
        parts = re.split(r"\n(?=#{1,3} )", text)
        for part in parts:
            part = part.strip()
            if not part:
                continue
            # Further split very long sections on blank lines.
            if len(part) > 1400:
                buf = ""
                for para in part.split("\n\n"):
                    if len(buf) + len(para) > 1200 and buf:
                        chunks.append({"source": path.stem, "text": buf.strip()})
                        buf = ""
                    buf += para + "\n\n"
                if buf.strip():
                    chunks.append({"source": path.stem, "text": buf.strip()})
            else:
                chunks.append({"source": path.stem, "text": part})
    return chunks


CHUNKS = _load_chunks()


class Retriever:
    """Semantic retrieval with a graceful fallback to TF-IDF."""

    def __init__(self, chunks: list[dict]):
        self.chunks = chunks
        self.mode = "none"
        self._model = None
        self._emb = None
        self._vectorizer = None
        self._matrix = None
        texts = [c["text"] for c in chunks]
        try:
            from sentence_transformers import SentenceTransformer

            self._model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
            self._emb = self._model.encode(texts, normalize_embeddings=True)
            self.mode = "embeddings"
        except Exception as exc:  # noqa: BLE001
            print(f"[retriever] embeddings unavailable ({exc}); using TF-IDF")
            from sklearn.feature_extraction.text import TfidfVectorizer

            self._vectorizer = TfidfVectorizer(stop_words="english")
            self._matrix = self._vectorizer.fit_transform(texts)
            self.mode = "tfidf"

    def search(self, query: str, k: int = 4) -> list[dict]:
        if self.mode == "embeddings":
            import numpy as np

            q = self._model.encode([query], normalize_embeddings=True)[0]
            scores = self._emb @ q
        else:
            from sklearn.metrics.pairwise import cosine_similarity

            q = self._vectorizer.transform([query])
            scores = cosine_similarity(q, self._matrix)[0]
        ranked = sorted(range(len(scores)), key=lambda i: scores[i], reverse=True)
        return [self.chunks[i] for i in ranked[:k]]


RETRIEVER = Retriever(CHUNKS)
print(f"[retriever] {len(CHUNKS)} chunks indexed in '{RETRIEVER.mode}' mode")


# --------------------------------------------------------------------------- #
# Tools
# --------------------------------------------------------------------------- #


def search_profile(query: str) -> str:
    hits = RETRIEVER.search(query, k=4)
    if not hits:
        return "No matching information found."
    return "\n\n---\n\n".join(f"[{h['source']}]\n{h['text']}" for h in hits)


@lru_cache(maxsize=1)
def _github_repos_cached(_bucket: int) -> str:
    try:
        resp = requests.get(
            f"https://api.github.com/users/{GITHUB_USER}/repos",
            params={"per_page": 100, "sort": "updated"},
            headers={"Accept": "application/vnd.github+json"},
            timeout=15,
        )
        resp.raise_for_status()
        repos = resp.json()
    except Exception as exc:  # noqa: BLE001
        return f"Could not reach the GitHub API ({exc})."
    rows = []
    for r in repos:
        if r.get("fork"):
            continue
        rows.append(
            f"- {r['name']} ({r.get('language') or 'n/a'}, "
            f"{r.get('stargazers_count', 0)}*, updated {r.get('updated_at', '')[:10]}): "
            f"{(r.get('description') or 'no description').strip()} "
            f"-> {r['html_url']}"
        )
    return f"{len(rows)} non-fork public repositories for {GITHUB_USER}:\n" + "\n".join(rows)


def list_github_repos() -> str:
    # Cache in 10-minute buckets so the API is not hit on every message.
    return _github_repos_cached(int(time.time() // 600))


TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "search_profile",
            "description": (
                "Semantic search over Safwan's profile: background, experience, "
                "projects, research (Med-GReF), and skills. Use for any factual "
                "question about him."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "A focused search query."}
                },
                "required": ["query"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "list_github_repos",
            "description": (
                "Live list of Safwan's public GitHub repositories (name, language, "
                "stars, last update, description, URL). Use for questions about his "
                "code or repositories."
            ),
            "parameters": {"type": "object", "properties": {}},
        },
    },
]

TOOL_IMPLS = {"search_profile": search_profile, "list_github_repos": list_github_repos}


# --------------------------------------------------------------------------- #
# Groq call + agent loop
# --------------------------------------------------------------------------- #


def _groq(messages: list[dict], stream: bool, tools: bool = True):
    payload = {
        "model": MODEL,
        "messages": messages,
        "temperature": 0.3,
        "max_completion_tokens": 900,
        "stream": stream,
    }
    if tools:
        payload["tools"] = TOOLS
        payload["tool_choice"] = "auto"
    headers = {"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"}
    last = None
    for attempt in range(3):
        resp = requests.post(GROQ_URL, headers=headers, json=payload, timeout=90, stream=stream)
        if resp.status_code == 400 and payload["model"] != FALLBACK_MODEL:
            payload["model"] = FALLBACK_MODEL
            continue
        if resp.status_code in (429, 500, 502, 503) and attempt < 2:
            last = resp
            time.sleep(1.5 * (attempt + 1))
            continue
        resp.raise_for_status()
        return resp
    if last is not None:
        last.raise_for_status()
    return resp  # pragma: no cover


def _history_to_messages(history: list[dict]) -> list[dict]:
    msgs = [{"role": "system", "content": SYSTEM_PROMPT}]
    for turn in history:
        role = turn.get("role")
        content = turn.get("content")
        if role in ("user", "assistant") and isinstance(content, str) and content:
            msgs.append({"role": role, "content": content})
    return msgs


def respond(message: str, history: list[dict]):
    if not GROQ_API_KEY:
        yield "The agent is not configured: GROQ_API_KEY is missing on the Space."
        return

    messages = _history_to_messages(history)
    messages.append({"role": "user", "content": message})

    # Tool-resolution loop (non-streaming).
    for _ in range(MAX_TOOL_TURNS):
        try:
            data = _groq(messages, stream=False).json()
        except Exception as exc:  # noqa: BLE001
            yield f"Sorry — the model call failed ({exc}). Please try again."
            return

        choice = data["choices"][0]["message"]
        tool_calls = choice.get("tool_calls")
        if not tool_calls:
            messages.append({"role": "assistant", "content": choice.get("content", "")})
            break

        messages.append(
            {
                "role": "assistant",
                "content": choice.get("content") or "",
                "tool_calls": tool_calls,
            }
        )
        for call in tool_calls:
            name = call["function"]["name"]
            try:
                args = json.loads(call["function"].get("arguments") or "{}")
            except json.JSONDecodeError:
                args = {}
            impl = TOOL_IMPLS.get(name)
            result = impl(**args) if impl else f"Unknown tool: {name}"
            messages.append(
                {"role": "tool", "tool_call_id": call["id"], "name": name, "content": str(result)}
            )
    else:
        yield "That question needed too many lookups. Try narrowing it down."
        return

    # Stream the final answer.
    try:
        resp = _groq(messages, stream=True, tools=False)
    except Exception as exc:  # noqa: BLE001
        # Fall back to whatever non-streamed content we already have.
        final = messages[-1].get("content") if messages[-1]["role"] == "assistant" else ""
        yield final or f"Sorry — streaming failed ({exc})."
        return

    acc = ""
    for line in resp.iter_lines():
        if not line or not line.startswith(b"data: "):
            continue
        chunk = line[6:]
        if chunk == b"[DONE]":
            break
        try:
            delta = json.loads(chunk)["choices"][0]["delta"].get("content")
        except (json.JSONDecodeError, KeyError, IndexError):
            continue
        if delta:
            acc += delta
            yield acc
    if not acc:
        yield "Sorry — I couldn't produce an answer. Please try rephrasing."


# --------------------------------------------------------------------------- #
# UI
# --------------------------------------------------------------------------- #

EXAMPLES = [
    "Does Safwan have production voice-AI experience?",
    "What is Med-GReF and what were its results?",
    "What has he built with agentic / multi-agent workflows?",
    "Show me his GitHub repositories.",
    "Is he available for hire, and what roles is he looking for?",
]

DESCRIPTION = (
    "A retrieval-augmented, tool-using agent that answers questions about "
    "**Safwan Ali** — AI Engineer. It grounds answers in a "
    "curated knowledge base and a live call to the GitHub API. "
    "Built by Safwan with Groq + Gradio. "
    "[Portfolio](https://safwan2003.github.io/Safwan_Ali/) · "
    "[Source](https://github.com/Safwan2003/Safwan_Ali/tree/main/agent)"
)

demo = gr.ChatInterface(
    fn=respond,
    type="messages",
    title="Ask about Safwan",
    description=DESCRIPTION,
    examples=EXAMPLES,
    theme=gr.themes.Soft(primary_hue="red", neutral_hue="stone"),
)

if __name__ == "__main__":
    demo.launch()
