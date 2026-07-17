#!/usr/bin/env node

import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { buildConfigFromFormData, validateConfig } from "./lib/config.mjs";
import { generateProfileReadme } from "./lib/readme.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");
const outputDir = resolve(projectRoot, "output");
const assetsDir = resolve(outputDir, "assets/hero");

const configPath = process.argv[2];

if (!configPath) {
  console.error("Usage: node scripts/generate-readme.mjs <config.json>");
  process.exit(1);
}

try {
  const raw = await readFile(resolve(configPath), "utf8");
  const formData = JSON.parse(raw);
  const config = buildConfigFromFormData(formData);
  validateConfig(config);

  const manifestPath = resolve(assetsDir, "manifest.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  await generateProfileReadme({ config, manifest, readmePath: resolve(outputDir, "README.md") });
  console.log("Generated README.md from config.");
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
