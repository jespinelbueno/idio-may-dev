import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, extname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const entryPages = [
  "index.html",
  "services.html",
  "loading-screens/icon-color-loader/index.html",
];
const errors = [];
const visitedFiles = new Set();
const discoveredJavaScript = new Set();

const isExternalReference = (reference) =>
  !reference ||
  reference.startsWith("#") ||
  /^(?:data:|https?:|mailto:|tel:|javascript:)/i.test(reference);

const cleanReference = (reference) => reference.split(/[?#]/, 1)[0].trim();

const toRepositoryPath = (sourceFile, reference, { publicAsset = false } = {}) => {
  const cleanPath = cleanReference(reference);

  if (isExternalReference(cleanPath) || !cleanPath) return null;

  return publicAsset || cleanPath.startsWith("assets/")
    ? resolve(rootDirectory, cleanPath)
    : resolve(dirname(sourceFile), cleanPath);
};

const reportMissingReference = (sourceFile, reference) => {
  errors.push(relative(rootDirectory, sourceFile) + " references missing " + reference);
};

const visitReference = (sourceFile, reference, options) => {
  const target = toRepositoryPath(sourceFile, reference, options);

  if (!target) return;

  if (!existsSync(target)) {
    reportMissingReference(sourceFile, reference);
    return;
  }

  const extension = extname(target).toLowerCase();

  if (extension === ".css") visitCss(target);
  if (extension === ".js") visitJavaScript(target);
};

const visitHtml = (filePath) => {
  if (visitedFiles.has(filePath)) return;
  visitedFiles.add(filePath);

  const html = readFileSync(filePath, "utf8");
  const referencePattern = /\b(?:src|href)\s*=\s*["']([^"']+)["']/gi;

  for (const match of html.matchAll(referencePattern)) {
    visitReference(filePath, match[1], { publicAsset: match[1].startsWith("assets/") });
  }
};

const visitCss = (filePath) => {
  if (visitedFiles.has(filePath)) return;
  visitedFiles.add(filePath);

  const css = readFileSync(filePath, "utf8");
  const importPattern = /@import\s+(?:url\(\s*)?["']?([^"'()\s]+)["']?\s*\)?/gi;
  const urlPattern = /url\(\s*["']?([^"'()]+)["']?\s*\)/gi;

  for (const match of css.matchAll(importPattern)) {
    visitReference(filePath, match[1]);
  }

  for (const match of css.matchAll(urlPattern)) {
    visitReference(filePath, match[1]);
  }
};

const visitJavaScript = (filePath) => {
  if (visitedFiles.has(filePath)) return;
  visitedFiles.add(filePath);
  discoveredJavaScript.add(filePath);

  const source = readFileSync(filePath, "utf8");
  const moduleImportPattern = /\b(?:import|export)\s+(?:[^"']*?\s+from\s+)?["']([^"']+)["']/g;
  const publicAssetPattern = /["'](assets\/[^"']+)["']/g;

  for (const match of source.matchAll(moduleImportPattern)) {
    visitReference(filePath, match[1]);
  }

  for (const match of source.matchAll(publicAssetPattern)) {
    visitReference(filePath, match[1], { publicAsset: true });
  }
};

const hashFile = (filePath) =>
  createHash("sha256").update(readFileSync(filePath)).digest("hex");

const checkAssetAliases = () => {
  const aliases = JSON.parse(readFileSync(resolve(rootDirectory, "tools/asset-aliases.json"), "utf8"));

  for (const [legacyPath, canonicalPath] of Object.entries(aliases)) {
    const legacyFile = resolve(rootDirectory, legacyPath);
    const canonicalFile = resolve(rootDirectory, canonicalPath);

    if (!existsSync(legacyFile)) {
      errors.push("Asset alias is missing legacy file " + legacyPath);
      continue;
    }

    if (!existsSync(canonicalFile)) {
      errors.push("Asset alias is missing canonical file " + canonicalPath);
      continue;
    }

    if (hashFile(legacyFile) !== hashFile(canonicalFile)) {
      errors.push("Asset alias content differs: " + legacyPath + " !== " + canonicalPath);
    }
  }
};

const listJavaScriptFiles = (directory) =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = resolve(directory, entry.name);

    if (entry.isDirectory()) return listJavaScriptFiles(entryPath);
    return entry.isFile() && entry.name.endsWith(".js") ? [entryPath] : [];
  });

for (const entryPage of entryPages) {
  const pagePath = resolve(rootDirectory, entryPage);

  if (!existsSync(pagePath)) {
    errors.push("Missing entry page " + entryPage);
    continue;
  }

  visitHtml(pagePath);
}

for (const filePath of listJavaScriptFiles(resolve(rootDirectory, "scripts"))) {
  discoveredJavaScript.add(filePath);
}

for (const filePath of discoveredJavaScript) {
  try {
    execFileSync(process.execPath, ["--check", filePath], {
      cwd: rootDirectory,
      stdio: "pipe",
    });
  } catch (error) {
    const detail = error.stderr?.toString().trim() || error.message;
    errors.push(
      "JavaScript syntax check failed for " + relative(rootDirectory, filePath) + ": " + detail,
    );
  }
}

checkAssetAliases();

if (errors.length) {
  console.error("Site check failed:");
  errors.forEach((error) => console.error("- " + error));
  process.exit(1);
}

console.log(
  "Site check passed: " +
    visitedFiles.size +
    " linked source files, " +
    discoveredJavaScript.size +
    " JavaScript modules, and asset aliases verified.",
);
