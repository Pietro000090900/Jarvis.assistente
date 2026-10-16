const http = require("http");
const fs = require("fs");
const path = require("path");

function loadEnv() {
  const p = path.join(__dirname, ".env");
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (m && !m[1].startsWith("#") && process.env[m[1]] === undefined) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
}
loadEnv();
const http = require("http");
const fs = require("fs");
const path = require("path");
const PUBLIC = __dirname;
const PORT = Number(process.env.PORT || 3000);

const MAX_BODY = 100_000;

const server = http.createServer(async (req, res) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("X-Frame-Options", "DENY");

  if (req.url === "/api/health" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    return res.end(JSON.stringify({
      ok: true,
      configured: Boolean(process.env.AI_API_KEY),
      model: process.env.AI_MODEL || "gpt-4.1-mini"
    }));
  }

  if (req.url === "/api/chat" && req.method === "POST") {
    if (!process.env.AI_API_KEY) {
      res.writeHead(503, { "Content-Type": "application/json; charset=utf-8" });
      return res.end(JSON.stringify({ error: "A IA ainda não foi configurada no servidor. Configure AI_API_KEY." }));
    }
    let raw = "";
    req.on("data", chunk => {
      raw += chunk;
      if (raw.length > MAX_BODY) {
        res.writeHead(413, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ error: "Pedido muito grande." }));
        req.destroy();
      }
    });
    req.on("end", async () => {
      try {
        const body = JSON.parse(raw || "{}");
        if (!Array.isArray(body.messages) || body.messages.length === 0) {
          res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
          return res.end(JSON.stringify({ error: "Envie uma lista de mensagens." }));
        }
        const messages = body.messages.slice(-20).map(m => ({
          role: ["user", "assistant"].includes(m.role) ? m.role : "user",
          content: String(m.content || "").slice(0, 8000)
        }));
        const endpoint = (process.env.AI_BASE_URL || "https://api.openai.com/v1").replace(/\/+$/, "") + "/chat/completions";
        const upstream = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.AI_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: process.env.AI_MODEL || "gpt-4.1-mini",
            messages: [
              { role: "system", content:
                "Você é J.A.R.V.I.S., um assistente pessoal em português brasileiro. Seja inteligente, objetivo, calmo e prestativo. Não afirme ter executado ações sem ferramentas que confirmem isso. Diferencie fatos de suposições. Não revele segredos nem peça chaves de API. Para ações externas, explique limitações e peça confirmação quando necessário."
              },
              ...messages
            ],
            temperature: 0.7
          })
        });
        const data = await upstream.json().catch(() => ({}));
        if (!upstream.ok) {
          res.writeHead(upstream.status === 429 ? 429 : 502, { "Content-Type": "application/json; charset=utf-8" });
          return res.end(JSON.stringify({ error: data.error?.message || `Erro do provedor de IA (${upstream.status}).` }));
        }
        const answer = data.choices?.[0]?.message?.content;
        if (!answer) throw new Error("O provedor não retornou uma resposta.");
        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ answer }));
      } catch (e) {
        if (!res.headersSent) {
          res.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
          res.end(JSON.stringify({ error: e.message || "Erro interno." }));
        }
      }
    });
    return;
  }

  let pathname = decodeURIComponent((req.url || "/").split("?")[0]);
  if (pathname === "/") pathname = "/index.html";
  const filePath = path.normalize(path.join(PUBLIC, pathname));
  if (!filePath.startsWith(PUBLIC)) {
    res.writeHead(403); return res.end("Forbidden");
  }
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); return res.end("Not found"); }
    const ext = path.extname(filePath);
    const types = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".svg": "image/svg+xml" };
    res.writeHead(200, { "Content-Type": types[ext] || "application/octet-stream" });
    res.end(data);
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`J.A.R.V.I.S. ativo na porta ${PORT}`);
});
