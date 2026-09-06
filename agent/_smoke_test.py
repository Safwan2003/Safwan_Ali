"""Headless smoke test — exercises retrieval, both tools, and the agent loop
without pulling in Gradio. Not shipped to the Space (delete or ignore)."""
import sys
import types

# Stub gradio so app.py imports without the real package.
fake = types.ModuleType("gradio")
fake.ChatInterface = lambda **kw: types.SimpleNamespace(launch=lambda *a, **k: None)
themes = types.ModuleType("gradio.themes")
themes.Soft = lambda **kw: None
fake.themes = themes
sys.modules["gradio"] = fake
sys.modules["gradio.themes"] = themes

import app  # noqa: E402

print("retriever mode:", app.RETRIEVER.mode)
print("chunks:", len(app.CHUNKS))

print("\n--- search_profile('voice ai experience') ---")
print(app.search_profile("voice ai experience")[:400])

print("\n--- list_github_repos() (first 300 chars) ---")
print(app.list_github_repos()[:300])

for q in [
    "Does Safwan have production voice-AI experience?",
    "What were the accuracy and ROC-AUC numbers for Med-GReF?",
    "How many public repositories does he have and name three?",
    "What is his favourite colour?",  # should decline
]:
    print(f"\n=== Q: {q}")
    out = ""
    for chunk in app.respond(q, []):
        out = chunk
    print(out)
