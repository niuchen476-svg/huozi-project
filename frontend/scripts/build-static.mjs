import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const distDir = path.join(projectRoot, "dist");
const basePath = process.argv.includes("--pages") ? "/huozi-project/" : "/";

await rm(distDir, { recursive: true, force: true });
await mkdir(distDir, { recursive: true });
await cp(path.join(projectRoot, "public"), distDir, { recursive: true });
await cp(path.join(projectRoot, "src"), path.join(distDir, "src"), { recursive: true });

const indexHtml = await readFile(path.join(projectRoot, "index.html"), "utf-8");
const normalizedBase = basePath.endsWith("/") ? basePath : `${basePath}/`;
const builtHtml = indexHtml
  .replace('href="/src/style.css"', `href="${normalizedBase}src/style.css"`)
  .replace('src="/src/main.js"', `src="${normalizedBase}src/main.js"`)
  .replace(
    '<script type="module"',
    `<script>window.__STATIC_MODE__ = true; window.__BASE_PATH__ = "${normalizedBase}";</script>\n    <script type="module"`
  );

await writeFile(path.join(distDir, "index.html"), builtHtml);

console.log(`static build written to ${path.relative(projectRoot, distDir)}`);
