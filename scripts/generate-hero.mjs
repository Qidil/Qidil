#!/usr/bin/env node

import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { buildConfigFromFormData, validateConfig } from "./lib/config.mjs";
import { generateHeroAssets } from "./lib/hero.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");
const outputDir = resolve(projectRoot, "output");
const assetsDir = resolve(outputDir, "assets/hero");

const configPath = process.argv[2];
const imagePath = process.argv[3];

if (!configPath || !imagePath) {
  console.error("Usage: node scripts/generate-hero.mjs <config.json> <portrait.png>");
  process.exit(1);
}

try {
  const raw = await readFile(resolve(configPath), "utf8");
  const formData = JSON.parse(raw);
  const config = buildConfigFromFormData(formData);
  validateConfig(config);

  const sourceBuffer = await readFile(resolve(imagePath));
  const manifest = await generateHeroAssets({ config, sourceBuffer, outputDirectory: assetsDir });
  console.log(`Generated four hero assets (version ${manifest.version}).`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
