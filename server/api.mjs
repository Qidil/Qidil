import express from "express";
import multer from "multer";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { validateConfig, buildConfigFromFormData } from "../scripts/lib/config.mjs";
import { generateHeroAssets } from "../scripts/lib/hero.mjs";
import { generateProfileReadmeContent } from "../scripts/lib/readme.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");
const outputDir = resolve(projectRoot, "output");
const assetsDir = resolve(projectRoot, "assets/hero");

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const app = express();
app.use(express.json());

app.post("/api/generate", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Portrait image is required", errors: [{ path: "image", messages: ["Portrait image is required"] }] });
    }

    let formData;
    try {
      formData = JSON.parse(req.body.config);
    } catch {
      return res.status(400).json({ message: "Invalid configuration data" });
    }

    let config;
    try {
      config = buildConfigFromFormData(formData);
      validateConfig(config);
    } catch (err) {
      const errorMsg = err.message;
      const fieldMatch = errorMsg.match(/^Invalid configuration: (.+)$/);
      if (fieldMatch) {
        const fieldPath = fieldMatch[1].split(":")[0].trim();
        return res.status(400).json({ errors: [{ path: fieldPath, messages: [fieldMatch[1]] }] });
      }
      return res.status(400).json({ message: errorMsg });
    }

    const sourceBuffer = Buffer.from(req.file.buffer);

    const manifest = await generateHeroAssets({
      config,
      sourceBuffer,
      outputDirectory: assetsDir,
    });

    const readme = await generateProfileReadmeContent({ config, manifest });

    const readmePath = resolve(projectRoot, "README.md");
    await writeFile(readmePath, readme);

    const configPath = resolve(outputDir, "profile.config.json");
    await writeFile(configPath, JSON.stringify(config, null, 2));

    res.json({
      manifest,
      readme,
      config,
      outputDir: outputDir,
    });
  } catch (err) {
    console.error("Generate error:", err);
    res.status(500).json({ message: err.message || "Internal server error" });
  }
});

app.get("/api/preview/:filename", async (req, res) => {
  try {
    const filePath = resolve(assetsDir, req.params.filename);
    const content = await readFile(filePath, "utf8");
    res.setHeader("Content-Type", "image/svg+xml");
    res.send(content);
  } catch {
    res.status(404).json({ message: "File not found" });
  }
});

app.get("/api/download/:filename", async (req, res) => {
  try {
    const filePath = resolve(assetsDir, req.params.filename);
    const content = await readFile(filePath, "utf8");
    res.setHeader("Content-Disposition", `attachment; filename="${req.params.filename}"`);
    res.setHeader("Content-Type", "image/svg+xml");
    res.send(content);
  } catch {
    res.status(404).json({ message: "File not found" });
  }
});

app.post("/api/save-readme", async (req, res) => {
  try {
    const { readme } = req.body;
    if (!readme || typeof readme !== "string") {
      return res.status(400).json({ message: "README content is required" });
    }
    const rootReadmePath = resolve(projectRoot, "README.md");
    await writeFile(rootReadmePath, readme);
    res.json({ success: true, path: rootReadmePath });
  } catch (err) {
    console.error("Save README error:", err);
    res.status(500).json({ message: err.message || "Failed to save README.md" });
  }
});

export default app;
