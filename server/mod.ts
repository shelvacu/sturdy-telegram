import * as esbuild from "https://deno.land/x/esbuild@v0.17.19/mod.js";
// Import the WASM build on platforms where running subprocesses is not
// permitted, such as Deno Deploy, or when running without `--allow-run`.
// import * as esbuild from "https://deno.land/x/esbuild@v0.17.19/wasm.js";

import { denoPlugins } from "https://deno.land/x/esbuild_deno_loader@0.8.1/mod.ts";


import * as path from "std/path/mod.ts";
import { expandGlob } from "std/fs/mod.ts";
import { createRouter } from "./routes.tsx";
import { Application } from "oak";
import { openDb } from "./database.ts";

// import { bundle, type BundleOptions } from "https://deno.land/x/emit@0.24.0/mod.ts";

// const __filename = new URL(import.meta.url).pathname;
// const __dirname = path.dirname(__filename);

// https://stackoverflow.com/questions/61829367/node-js-dirname-filename-equivalent-in-deno
const __filename = path.fromFileUrl(import.meta.url);
// Without trailing slash
const __dirname = path.dirname(path.fromFileUrl(import.meta.url));

// The path to the client files relative to the proect root
const clientDir = path.join(__dirname, "..", "client");

export type ServerConfig = {
  port?: number;
  devMode?: boolean;
  importMap?: string;
};

async function buildStyles(): Promise<string> {
  // Build and cache the styles
  let styles = "";
  for await (
    const entry of expandGlob(
      path.join(__dirname, "..", "client", "**", "*.css"),
    )
  ) {
    const text = await Deno.readTextFile(entry.path);
    styles += `${text}\n`;
  }

  return styles;
}

async function buildClient(config?: ServerConfig): Promise<string> {
  // const bundleOptions: BundleOptions = {
  //   type: "module",
  //   allowRemote: true,
  //   importMap: path.join(__dirname, "..", "import_map.json"),
  //   compilerOptions: {
  //     // target: "esnext",
  //     lib: ["dom", "dom.iterable", "dom.asynciterable", "deno.ns"],
  //   },
  // };
  // const emitOptions: Deno.EmitOptions = {
  //   bundle: "module",
  //   check: false,
  //   importMapPath: path.join(__dirname, "..", "import_map.json"),
  //   compilerOptions: {
  //     target: "esnext",
  //     lib: ["dom", "dom.iterable", "dom.asynciterable", "deno.ns"],
  //   },
  // };

  // if (config?.devMode) {
  //   bundleOptions.compilerOptions!.inlineSourceMap = true;
  //   bundleOptions.importMap = path.join(
  //     __dirname,
  //     "..",
  //     "import_map_dev.json",
  //   );
  // }



  // const { files, diagnostics } = await Deno.emit(
  //   path.join(clientDir, "mod.tsx"),
  //   emitOptions,
  // );

  // if (diagnostics.length > 0) {
  //   console.warn(Deno.formatDiagnostics(diagnostics));
  // }

  // const { code } = await bundle(path.join(clientDir, "mod.tsx"), bundleOptions);
  console.log("clientDir is ", clientDir);
  console.log("__filename is ", __filename);
  console.log("__dirname is ", __dirname);
  const entryPoints = [path.join(clientDir, "mod.tsx")];
  console.log("entryPoints is ", entryPoints);
  const result = await esbuild.build({
    plugins: [...denoPlugins({
      importMapURL: path.toFileUrl(path.join(__dirname, "..", "import_map_dev.json")).toString()
    })],
    entryPoints,
    write: false,
    bundle: true,
    format: 'esm',
    treeShaking: true
  })

  console.log(result.warnings);
  console.log(result.errors);

  return result.outputFiles[0].text;
}

/**
 * Watch styles. Live update them.
 */
async function watchStyles(
  updateStyles: (newStyles: string) => void,
  signal: AbortSignal,
) {
  console.log("clientDir is ", clientDir);
  const watcher = Deno.watchFs(clientDir);
  let timer: number | undefined;

  signal.addEventListener("abort", () => watcher.close());

  for await (const event of watcher) {
    if (event.paths.some((p) => /\.css$/.test(p))) {
      clearTimeout(timer);
      timer = setTimeout(async () => {
        updateStyles(await buildStyles());
      }, 250);
    }
  }
}

export async function serve(config?: ServerConfig) {
  console.log("Building styles and client");
  const [styles, client] = await Promise.all([
    buildStyles(),
    buildClient(config ?? {}),
  ]);
  console.log("Built!!!!!!");

  const db = openDb();
  console.log("A");
  const { router, updateStyles } = createRouter({
    client,
    styles,
    db,
    devMode: config?.devMode,
  });
  const app = new Application();
  console.log("B");

  app.use(router.routes());
  app.use(router.allowedMethods());
  console.log("C");

  // serve assets in the public directory
  app.use(async (ctx) => {
    await ctx.send({
      root: path.join(__dirname, "..", "public"),
    });
  });
  console.log("D");

  const port = config?.port ?? 8765;

  // The abort signal can be used to gracefully shutdown a listening server and
  // style watcher
  const controller = new AbortController();
  const { signal } = controller;
  
  console.log("E");

  const listener = app.listen({ port, signal });

  if (config?.devMode) {
    watchStyles(updateStyles, signal);
  }
  
  console.log("F");

  listener.finally(() => db.close());

  console.log("G");
  return {
    listener,
    port,
    close: () => controller.abort(),
  };
}

export type Server = Awaited<ReturnType<typeof serve>>;
