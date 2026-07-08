import { cp, mkdir, readFile, rm, writeFile, readdir, stat } from "node:fs/promises";
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

// Rewrite absolute asset paths in all copied source files (CSS / JS)
// so url("/assets/...") works under the subdirectory base path
if (normalizedBase !== "/") {
  const srcDistDir = path.join(distDir, "src");
  async function walk(dir) {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) await walk(full);
      if (!entry.isFile()) continue;
      const ext = path.extname(entry.name);
      if (ext !== ".css" && ext !== ".js" && ext !== ".mjs") continue;
      let content = await readFile(full, "utf-8");
      // Replace "/assets/" references in url(), inline styles, JS strings.
      // Use a capture group for the leading quote/paren so it is preserved
      // (otherwise eating the quote breaks JS string literals and CSS url()).
      content = content.replace(/(["'(\/])\/assets\//g, `$1${normalizedBase}assets/`);
      await writeFile(full, content);
    }
  }
  await walk(srcDistDir);
}

console.log(`static build written to ${path.relative(projectRoot, distDir)}`);
