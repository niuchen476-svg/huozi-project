import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const distDir = path.join(projectRoot, "dist");
const basePath = process.argv.includes("--pages") ? "/huozi-project/" : "/";
const normalizedBase = basePath.endsWith("/") ? basePath : `${basePath}/`;

await build({
  root: projectRoot,
  base: normalizedBase,
  configFile: path.join(projectRoot, "vite.config.js"),
  build: {
    outDir: distDir,
    emptyOutDir: true,
  },
});

// Asset paths stored as JavaScript or copied public JSON are not rewritten by
// Vite. Fix those literals in the production bundle so GitHub Pages can serve
// them below /huozi-project/.
if (normalizedBase !== "/") {
  async function rewriteAssetPaths(dir) {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await rewriteAssetPaths(fullPath);
        continue;
      }
      if (!entry.isFile() || ![".css", ".js", ".mjs", ".json"].includes(path.extname(entry.name))) {
        continue;
      }

      const content = await readFile(fullPath, "utf-8");
      const rewritten = content.replace(/(["'(\/])\/assets\//g, `$1${normalizedBase}assets/`);
      if (rewritten !== content) await writeFile(fullPath, rewritten);
    }
  }

  await rewriteAssetPaths(distDir);
}

console.log(`production bundle written to ${path.relative(projectRoot, distDir)}`);
