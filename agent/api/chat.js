// "Ask about Safwan" — a grounded, tool-using chat agent.
//
// Vercel Edge Function. Streams newline-delimited JSON events:
//   {type:"status", text}        progress: retrieving / thinking / querying GitHub
//   {type:"answer_start", grounding:{sources:[...], tool:bool}}
//   {type:"token", text}         a piece of the streamed answer
//   {type:"done"}
//   {type:"error", text}
//
// A Groq-hosted model answers questions about Safwan Ali, grounded in a bundled
// knowledge base (agent/knowledge/*.md, keyword-retrieved per question) and a live
// tool call to the public GitHub API. GROQ_API_KEY never leaves the server.

import { CHUNKS } from "./_knowledge.js";

export const config = { runtime: "edge" };

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "openai/gpt-oss-120b";
const FALLBACK_MODEL = "openai/gpt-oss-20b";
const GITHUB_USER = "Safwan2003";
const MAX_TOOL_TURNS = 3;
const ALLOW_ORIGIN = "*";

const CORE = `Safwan Ali — AI Engineer in Karachi, Pakistan. BSc Computer Science,
Salim Habib University (graduated June 2026), elective ML/data coursework (not a
formal specialization). Works as an AI Engineer at MarkyTech (internship converted
to an ongoing role). Contact: safwanalimukaddam@gmail.com,
github.com/Safwan2003, linkedin.com/in/safwan-ali-281aa1275.`;

const INSTRUCTIONS = `You are the assistant on Safwan Ali's portfolio site. Answer
questions about Safwan for recruiters, hiring managers, and collaborators.

Scope — this is the only thing you do:
- Only answer questions about Safwan Ali: his background, experience, projects,
  research, skills, and how to reach him. For anything else — writing or debugging
  code, general knowledge, math, homework, opinions, roleplay, drafting text
  unrelated to his work — decline in one short sentence and steer back to Safwan's
  work. Do not produce code or content that is not about describing what Safwan
  has done.

Grounding:
- Use ONLY the CORE facts, the retrieved CONTEXT, and get_github_repos output.
  If something is not there, say so plainly and suggest emailing
  safwanalimukaddam@gmail.com. Never invent employers, dates, titles, or metrics.
- Never attribute a tool, technology, platform, or metric to a project unless the
  retrieved CONTEXT explicitly connects the two. If asked how something was built
  and the detail is not in CONTEXT, say what is known and offer the email — do not
  guess at the stack.
- Med-GReF is an in-progress working paper — never say it is "submitted",
  "published", or "peer-reviewed". The lunar project is self-directed, built only
  around public ICUBE-Qamar specs — not a SUPARCO project.

Style:
- Be concise and professional: a few sentences or a short list. No hype, no
  emoji, no citation markers, no markdown tables (use a short plain or bulleted
  list instead).
- Write in the third person ("Safwan built…", not "I built…").
- Call get_github_repos for any question about his code, repositories, or GitHub
  activity.`;

// ---- retrieval -------------------------------------------------------------

const STOP = new Set(
  "the and for his her was are does did has have what which who how safwan you your with about into can could would should tell show name give list".split(" ")
);

function retrieve(query, k = 4) {
  const terms = (query.toLowerCase().match(/[a-z0-9]{3,}/g) || []).filter((t) => !STOP.has(t));
  if (!terms.length) return CHUNKS.slice(0, k);
  const scored = CHUNKS.map((c) => {
    const lc = c.text.toLowerCase();
    let s = 0;
    for (const t of terms) {
      const hits = lc.split(t).length - 1;
      if (hits) s += 1 + Math.log(hits);
    }
    return { c, s };
  }).sort((a, b) => b.s - a.s);
  const top = scored.filter((x) => x.s > 0).slice(0, k).map((x) => x.c);
  return top.length ? top : CHUNKS.slice(0, k);
}

function systemPrompt(chunks) {
  return `${INSTRUCTIONS}

--- CORE ---
${CORE}
--- CONTEXT (retrieved for this question) ---
${chunks.map((c) => c.text).join("\n\n")}
--- END ---`;
}

// ---- tool ----------------------------------------------------------------

const TOOLS = [
  {
    type: "function",
    function: {
      name: "get_github_repos",
      description:
        "Live list of Safwan's public GitHub repositories (name, language, stars, last update, description, URL).",
      parameters: { type: "object", properties: {} },
    },
  },
];

let repoCache = { at: 0, text: "" };

async function getGithubRepos() {
  if (Date.now() - repoCache.at < 600_000 && repoCache.text) return repoCache.text;
  try {
    const r = await fetch(
      `https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=updated`,
      { headers: { Accept: "application/vnd.github+json", "User-Agent": "ask-about-safwan" } }
    );
    if (!r.ok) return `GitHub API returned ${r.status}.`;
    const repos = await r.json();
    const rows = repos
      .filter((x) => !x.fork)
      .map(
        (x) =>
          `- ${x.name} (${x.language || "n/a"}, ${x.stargazers_count}*, updated ${String(
            x.updated_at
          ).slice(0, 10)}): ${(x.description || "no description").trim()} -> ${x.html_url}`
      );
    repoCache = {
      at: Date.now(),
      text: `${rows.length} non-fork public repositories for ${GITHUB_USER}:\n${rows.join("\n")}`,
    };
    return repoCache.text;
  } catch (e) {
    return `Could not reach the GitHub API (${e}).`;
  }
}

// ---- groq --------------------------------------------------------------

function cors(extra = {}) {
  return {
    "Access-Control-Allow-Origin": ALLOW_ORIGIN,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    ...extra,
  };
}

const BASE = { temperature: 0.3, max_completion_tokens: 800 };

async function groq(apiKey, body) {
  let payload = { ...body };
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(GROQ_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.status === 400 && payload.model !== FALLBACK_MODEL) {
      payload = { ...payload, model: FALLBACK_MODEL };
      continue;
    }
    if ([429, 500, 502, 503].includes(res.status) && attempt < 2) {
      await new Promise((r) => setTimeout(r, 1200 * (attempt + 1)));
      continue;
    }
    return res;
  }
  return fetch(GROQ_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

// ---- handler ----------------------------------------------------------

export default async function handler(req) {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors() });
  if (req.method !== "POST") return new Response("POST only", { status: 405, headers: cors() });

  const apiKey = process.env.GROQ_API_KEY;

  let clean = [];
  try {
    const body = await req.json();
    clean = (Array.isArray(body.messages) ? body.messages : []).filter(
      (m) =>
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim()
    );
  } catch {
    return new Response("Bad JSON", { status: 400, headers: cors() });
  }

  const lastUser = [...clean].reverse().find((m) => m.role === "user")?.content || "";
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const emit = (obj) => controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));
      const fail = (text) => {
        emit({ type: "error", text });
        controller.close();
      };

      try {
        if (!apiKey) return fail("The agent isn't configured: GROQ_API_KEY is missing on the server.");
        if (!lastUser) return fail("Ask a question to get started.");

        emit({ type: "status", text: "Retrieving relevant context" });
        const chunks = retrieve(lastUser);
        const sources = [...new Set(chunks.map((c) => c.source))];

        const messages = [
          { role: "system", content: systemPrompt(chunks) },
          ...clean.slice(-6),
        ];

        emit({ type: "status", text: "Reasoning over the evidence" });

        let toolUsed = false;
        let toolCapped = true;

        for (let turn = 0; turn < MAX_TOOL_TURNS; turn++) {
          const res = await groq(apiKey, { ...BASE, model: MODEL, messages, tools: TOOLS, tool_choice: "auto" });
          if (!res.ok) return fail(`The model service returned ${res.status}. Please try again in a moment.`);
          const msg = (await res.json()).choices?.[0]?.message ?? {};

          if (!msg.tool_calls?.length) {
            toolCapped = false;
            break;
          }
          toolUsed = true;
          emit({ type: "status", text: "Querying the GitHub API" });
          messages.push({ role: "assistant", content: msg.content || "", tool_calls: msg.tool_calls });
          for (const call of msg.tool_calls) {
            const result =
              call.function?.name === "get_github_repos"
                ? await getGithubRepos()
                : `Unknown tool: ${call.function?.name}`;
            messages.push({ role: "tool", tool_call_id: call.id, name: call.function?.name, content: result });
          }
        }

        emit({ type: "status", text: "Writing the answer" });
        emit({ type: "answer_start", grounding: { sources, tool: toolUsed } });

        // Final answer — streamed token by token, tool-free.
        const res = await groq(apiKey, { ...BASE, model: MODEL, messages, stream: true });
        if (!res.ok || !res.body) {
          // one non-streamed retry
          const r2 = await groq(apiKey, { ...BASE, model: MODEL, messages });
          const a = r2.ok ? ((await r2.json()).choices?.[0]?.message?.content || "").trim() : "";
          emit({ type: "token", text: a || "Sorry — I couldn't produce an answer. Please rephrase." });
          emit({ type: "done" });
          return controller.close();
        }

        const reader = res.body.getReader();
        const dec = new TextDecoder();
        let buf = "";
        let got = false;
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += dec.decode(value, { stream: true });
          const lines = buf.split("\n");
          buf = lines.pop() || "";
          for (const line of lines) {
            const s = line.trim();
            if (!s.startsWith("data:")) continue;
            const p = s.slice(5).trim();
            if (p === "[DONE]") continue;
            try {
              const d = JSON.parse(p).choices?.[0]?.delta?.content;
              if (d) {
                got = true;
                emit({ type: "token", text: d });
              }
            } catch {
              /* keep-alive / partial */
            }
          }
        }
        if (!got) emit({ type: "token", text: "Sorry — I couldn't produce an answer. Please rephrase." });
        emit({ type: "done" });
        controller.close();
      } catch (e) {
        fail(`Unexpected error: ${String(e).slice(0, 200)}`);
      }
    },
  });

  return new Response(stream, {
    headers: cors({ "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" }),
  });
}
