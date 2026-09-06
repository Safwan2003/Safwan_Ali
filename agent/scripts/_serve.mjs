// Local dev server for the Edge function — `GROQ_API_KEY=... node scripts/_serve.mjs`
// Not deployed. Vercel provides this via `vercel dev`.
import { createServer } from "node:http";
import handler from "../api/chat.js";

const port = process.env.PORT || 3000;

createServer(async (req, res) => {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const request = new Request(`http://localhost:${port}${req.url}`, {
    method: req.method,
    headers: req.headers,
    body: ["GET", "HEAD"].includes(req.method) ? undefined : Buffer.concat(chunks).toString("utf8"),
  });
  const response = await handler(request);
  res.writeHead(response.status, Object.fromEntries(response.headers));
  if (response.body) {
    const reader = response.body.getReader();
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(Buffer.from(value));
    }
  }
  res.end();
}).listen(port, () => console.log(`agent dev server on http://localhost:${port}/api/chat`));
