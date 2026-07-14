import { createServer } from "node:http";
import { createReadStream, statSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const args = new Set(process.argv.slice(2));
const serveRoot = args.has("--dist") ? path.join(projectRoot, "dist") : projectRoot;
const publicDir = args.has("--dist") ? serveRoot : path.join(projectRoot, "public");
const port = Number(process.env.PORT || 5173);
const backendOrigin = process.env.API_ORIGIN || "http://localhost:3001";

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".mp3": "audio/mpeg",
  ".mp4": "video/mp4",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

function send(res, status, body, headers = {}) {
  res.writeHead(status, headers);
  res.end(body);
}

function resolveStaticPath(urlPath) {
  const decodedPath = decodeURIComponent(urlPath);
  const relativePath = decodedPath === "/" ? "index.html" : decodedPath.slice(1);
  // Try the source/build root first, then the public dir (so vendored
  // modules like ./vendor/three.module.js resolve both in dev and in build).
  for (const baseDir of [serveRoot, publicDir]) {
    const filePath = path.resolve(baseDir, relativePath);
    const relativeToBase = path.relative(baseDir, filePath);
    if (relativeToBase.startsWith("..") || path.isAbsolute(relativeToBase)) continue;
    try {
      statSync(filePath);
      return filePath;
    } catch {
      // keep looking in the next base dir
    }
  }
  return null;
}

async function proxyApi(req, res) {
  const target = new URL(req.url, backendOrigin);
  const headers = { ...req.headers, host: target.host };
  delete headers.connection;
  delete headers["content-length"];
  delete headers["transfer-encoding"];
  const hasBody = req.method !== "GET" && req.method !== "HEAD";
  const body = hasBody
    ? Buffer.concat(await Array.fromAsync(req))
    : undefined;

  const fetchUpstream = () => fetch(target, {
    method: req.method,
    headers,
    body,
  });

  try {
    let upstream;
    try {
      upstream = await fetchUpstream();
    } catch {
      // node --watch 重启后端时，连接池里可能短暂保留旧连接；重试一次即可恢复。
      await new Promise((resolve) => setTimeout(resolve, 150));
      upstream = await fetchUpstream();
    }

    res.writeHead(upstream.status, Object.fromEntries(upstream.headers));
    if (!upstream.body) {
      res.end();
      return;
    }

    for await (const chunk of upstream.body) {
      res.write(chunk);
    }
    res.end();
  } catch (err) {
    send(res, 502, JSON.stringify({ error: `后端连接失败：${err.message}` }), {
      "content-type": "application/json; charset=utf-8",
    });
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname.startsWith("/api/")) {
    await proxyApi(req, res);
    return;
  }

  const filePath = resolveStaticPath(url.pathname);
  if (!filePath) {
    send(res, 403, "Forbidden");
    return;
  }

  try {
    const stats = statSync(filePath);
    if (!stats.isFile()) throw new Error("Not a file");

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      "content-type": mimeTypes[ext] || "application/octet-stream",
      "cache-control": "no-store",
    });
    createReadStream(filePath).pipe(res);
  } catch {
    const indexHtml = await readFile(path.join(serveRoot, "index.html"), "utf-8");
    send(res, 200, indexHtml, {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
    });
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`frontend preview listening on http://127.0.0.1:${port}`);
  console.log(`serving ${path.relative(projectRoot, serveRoot) || "."}`);
  console.log(`proxying /api to ${backendOrigin}`);
});
