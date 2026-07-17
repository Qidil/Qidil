#!/usr/bin/env node

import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { writeFile } from "node:fs/promises";
import { buildConfigFromFormData, validateConfig } from "./lib/config.mjs";
import { generateHeroAssets } from "./lib/hero.mjs";
import { generateProfileReadme } from "./lib/readme.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");
const outputDir = resolve(projectRoot, "output");
const assetsDir = resolve(outputDir, "assets/hero");

const configPath = process.argv[2];
const imagePath = process.argv[3];

if (!configPath || !imagePath) {
  console.error("Usage: node scripts/generate.mjs <config.json> <portrait.png>");
  process.exit(1);
}

try {
  const { readFile } = await import("node:fs/promises");
  const raw = await readFile(resolve(configPath), "utf8");
  const formData = JSON.parse(raw);
  const config = buildConfigFromFormData(formData);
  validateConfig(config);

  const sourceBuffer = await readFile(resolve(imagePath));
  const manifest = await generateHeroAssets({ config, sourceBuffer, outputDirectory: assetsDir });
  await generateProfileReadme({ config, manifest, readmePath: resolve(outputDir, "README.md") });
  await writeFile(resolve(outputDir, "profile.config.json"), JSON.stringify(config, null, 2));

  console.log(`Profile generated successfully (asset version ${manifest.version}).`);
  console.log(`Output: ${outputDir}`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
