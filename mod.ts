import { serve } from "./server/mod.ts";
import * as log from "std/log/mod.ts";

console.log("AAAAAA")

const devMode = Deno.args[0] === 'dev';

log.info(`Maaaaybe listening on http://localhost:something...?`);
const server = await serve({
  devMode,
  importMap: devMode ? "import_map_dev.json" : "import_map.json",
});

if (devMode) {
  log.info("Running in developer mode");
}

log.info(`Listening on http://localhost:${server.port}...`);
await server.listener;
