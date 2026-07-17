#!/usr/bin/env node

import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { buildConfigFromFormData, validateConfig } from "./lib/config.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

const configPath = process.argv[2];

if (!configPath) {
  console.error("Usage: node scripts/validate.mjs <config.json>");
  process.exit(1);
}

try {
  const raw = await readFile(resolve(configPath), "utf8");
  const formData = JSON.parse(raw);
  const config = buildConfigFromFormData(formData);
  validateConfig(config);
  console.log("Configuration is valid.");
} catch (error) {
  console.error("Validation failed:", error.message);
  process.exitCode = 1;
}
