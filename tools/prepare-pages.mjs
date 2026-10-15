import { copyFileSync, lstatSync, mkdirSync, readdirSync } from "node:fs";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export const publicPages = [
  "index.html", "services.html", "about.html", "events.html", "contact.html",
  "coming-soon.html", "404.html", "loading-screens/icon-color-loader/index.html",
];

const publicFiles = [...publicPages, "styles.css", "service-worker.js", ".nojekyll",
  "loading-screens/icon-color-loader/styles.css"];
const publicDirectories = new Map([
  ["scripts", new Set([".js"])],
  ["styles", new Set([".css"])],
  ["assets", new Set([".svg", ".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif", ".ico", ".ttf", ".otf", ".woff", ".woff2", ".mp4", ".webm"])],
  // Active legacy media URLs remain public for compatibility.
  ["services/assets", new Set([".svg", ".jpg", ".png"])],
]);

// Packaging only: source files remain the build-free, canonical site.
export const preparePages = (sourceRoot, destination) => {
  const source = resolve(sourceRoot);
  const output = resolve(destination);
  if (output === source || source.startsWith(output + "/")) {
    throw new Error("Pages output must not contain the source checkout");
  }
  // Require fresh output, avoiding accidental publication of leftover files.
  mkdirSync(output);
  const copy = (path) => {
    const input = join(source, path);
    if (!lstatSync(input).isFile()) throw new Error(`Not a regular public file: ${path}`);
    const target = join(output, path);
    mkdirSync(dirname(target), { recursive: true });
    copyFileSync(input, target);
  };
  const visit = (path, extensions) => {
    if (!lstatSync(join(source, path)).isDirectory()) throw new Error(`Not a regular public directory: ${path}`);
    for (const entry of readdirSync(join(source, path), { withFileTypes: true })) {
      if (entry.isSymbolicLink()) throw new Error(`Symlink in public directory: ${path}/${entry.name}`);
      if (entry.name.startsWith(".")) continue;
      const child = join(path, entry.name);
      if (entry.isDirectory()) visit(child, extensions);
      else if (entry.isFile() && extensions.has(extname(entry.name).toLowerCase())) copy(child);
    }
  };
  for (const path of publicFiles) copy(path);
  for (const [path, extensions] of publicDirectories) visit(path, extensions);
};

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (!process.argv[2]) throw new Error("Usage: node tools/prepare-pages.mjs <fresh-output-directory>");
  preparePages(root, process.argv[2]);
  console.log("Public Pages files prepared.");
}
