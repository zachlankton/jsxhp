import { serve } from "bun";
import { renderToHTML } from "./jsxRuntime/jsx-dev-runtime";
import { readdir } from "node:fs/promises";

const router = new Bun.FileSystemRouter({
  style: "nextjs",
  dir: "./pages",
  origin: "https://mydomain.com",
});

// recursivly scan all files in the public folder
const publicFiles = await readdir("./public", { recursive: true });
const publicFilesMap = publicFiles.reduce((prevValue, currValue) => {
  prevValue[`/${currValue}`] = true;
  return prevValue;
}, {} as Record<string, boolean>);

const importModuleCache = new Map<string, any>();

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const server = serve({
  port: 3000,

  async fetch(req) {
    const url = new URL(req.url);

    const match = router.match(req);
    if (match) {
      let importModule;
      if (importModuleCache.has(match.filePath)) {
        importModule = importModuleCache.get(match.filePath);
      } else {
        importModule = await import(match.filePath);
        importModuleCache.set(match.filePath, importModule);
      }

      const jsxTree = importModule.default();

      const stream = new ReadableStream({
        async start(controller) {
          controller.enqueue("<!DOCTYPE html>\n");
          await renderToHTML(jsxTree, controller);
          controller.close();
        },
      });

      return new Response(stream, {
        headers: {
          "Transfer-Encoding": "chunked",
          "Content-Type": "text/html; charset=UTF-8",
          "X-Content-Type-Options": "nosniff",
        },
      });
    }

    // serve static files
    if (publicFilesMap[url.pathname]) {
      return new Response(Bun.file(`./public/${url.pathname}`));
    }

    return new Response("Not Found", { status: 404 });
  },
  error(error) {
    return new Response(`<pre>${error}\n${error.stack}</pre>`, {
      headers: {
        "Content-Type": "text/html",
      },
    });
  },
});

console.log(`Server running at http://localhost:${server.port}`);
