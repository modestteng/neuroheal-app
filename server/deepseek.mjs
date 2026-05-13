import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";
import { createServer } from "node:http";

const PORT = Number(process.env.PORT || process.env.DEEPSEEK_PORT || 8787);
const HOST = process.env.HOST || process.env.DEEPSEEK_HOST || "0.0.0.0";
const BASE_URL = (process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com").replace(/\/$/, "");
const MODEL = process.env.DEEPSEEK_MODEL || "deepseek-v4-flash";
const API_KEY = process.env.DEEPSEEK_API_KEY;
const REQUEST_LIMIT = 1_000_000;
const MAX_HISTORY = 12;
const DIST_DIR = resolve(process.cwd(), "dist");

const SYSTEM_PROMPT = [
  "你是 NeuroHeal 应用里的 AI 心理陪伴助手“小愈”。",
  "你的目标是温和倾听、帮助用户梳理感受，并给出简短、具体、可执行的建议。",
  "不要冒充医生，不要做诊断，不要给出确定性的医疗结论。",
  "如果用户提到自伤、自杀、伤害他人或明显危机，请先表达关切，并鼓励立即联系当地紧急支持、可信任的人或线下专业机构。",
  "回复默认使用中文，语气平静自然，长度控制在 2 到 5 句。",
].join("\n");

const CONTENT_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webmanifest": "application/manifest+json",
  ".woff2": "font/woff2",
};

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end(JSON.stringify(payload));
}

function readBody(request) {
  return new Promise((resolveBody, reject) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > REQUEST_LIMIT) {
        reject(new Error("Request body is too large."));
        request.destroy();
      }
    });

    request.on("end", () => resolveBody(body));
    request.on("error", reject);
  });
}

function normalizeMessages(messages) {
  if (!Array.isArray(messages)) return [];

  return messages
    .filter((message) => message && (message.role === "assistant" || message.role === "user") && typeof message.content === "string")
    .map((message) => ({
      role: message.role,
      content: message.content.trim(),
    }))
    .filter((message) => message.content.length > 0)
    .slice(-MAX_HISTORY);
}

async function handleChat(request, response) {
  if (!API_KEY) {
    sendJson(response, 500, { error: "Missing DEEPSEEK_API_KEY on the backend server." });
    return;
  }

  try {
    const rawBody = await readBody(request);
    const payload = rawBody ? JSON.parse(rawBody) : {};
    const messages = normalizeMessages(payload.messages);

    if (!messages.some((message) => message.role === "user")) {
      sendJson(response, 400, { error: "At least one user message is required." });
      return;
    }

    const upstream = await fetch(`${BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.7,
        max_tokens: 600,
        stream: false,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
      }),
    });

    const data = await upstream.json();
    const reply = data?.choices?.[0]?.message?.content?.trim();

    if (!upstream.ok) {
      sendJson(response, upstream.status, { error: data?.error?.message || "DeepSeek request failed." });
      return;
    }

    if (!reply) {
      sendJson(response, 502, { error: "DeepSeek returned an empty reply." });
      return;
    }

    sendJson(response, 200, { reply });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected backend error.";
    sendJson(response, 500, { error: message });
  }
}

function safeAssetPath(pathname) {
  const decoded = decodeURIComponent(pathname);
  const relativePath = decoded === "/" ? "index.html" : decoded.replace(/^\/+/, "");
  const normalizedPath = normalize(relativePath).replace(/^(\.\.[/\\])+/, "");
  const fullPath = resolve(DIST_DIR, normalizedPath);

  if (!fullPath.startsWith(DIST_DIR)) return null;
  return fullPath;
}

function serveStatic(request, response, pathname) {
  if (!existsSync(DIST_DIR)) {
    sendJson(response, 503, { error: "Frontend build not found. Run npm run build before starting production mode." });
    return;
  }

  const requestedPath = safeAssetPath(pathname);
  const assetPath = requestedPath && existsSync(requestedPath) && statSync(requestedPath).isFile()
    ? requestedPath
    : join(DIST_DIR, "index.html");

  const extension = extname(assetPath);
  const contentType = CONTENT_TYPES[extension] || "application/octet-stream";
  const cacheControl = assetPath.endsWith("index.html") ? "no-cache" : "public, max-age=31536000, immutable";

  response.writeHead(200, {
    "Content-Type": contentType,
    "Cache-Control": cacheControl,
  });
  createReadStream(assetPath).pipe(response);
}

const server = createServer((request, response) => {
  const url = new URL(request.url || "/", `http://${request.headers.host || `${HOST}:${PORT}`}`);

  if (request.method === "GET" && url.pathname === "/api/health") {
    sendJson(response, 200, { ok: true, model: MODEL, configured: Boolean(API_KEY) });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/chat") {
    void handleChat(request, response);
    return;
  }

  if (request.method === "GET" || request.method === "HEAD") {
    serveStatic(request, response, url.pathname);
    return;
  }

  sendJson(response, 404, { error: "Not found." });
});

server.listen(PORT, HOST, () => {
  console.log(`NeuroHeal server listening on http://${HOST}:${PORT}`);
});
