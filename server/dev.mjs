import { createServer } from "vite";
import apiApp from "./api.mjs";

const API_PORT = 3210;

async function start() {
  const apiServer = apiApp.listen(API_PORT, () => {
    console.log(`  API server running at http://localhost:${API_PORT}`);
  });

  const vite = await createServer({
    server: { port: 5173, open: true },
  });

  await vite.listen();

  vite.printUrls();

  console.log();
  console.log("  Open http://localhost:5173 in your browser to start.");
  console.log("  Press Ctrl+C to stop.");
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
