import { serve } from "bun";
import {
  importModuleCache,
  internalSessionStore,
  jsxDEV,
  renderToHTML,
  requestContext,
  sessionStore,
} from "./jsxRuntime/jsx-dev-runtime";
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

// pre load and cache all routes
Object.keys(router.routes).forEach(async (key) => {
  const filePath = router.routes[key];
  console.log("pre loading route", key, filePath);
  const importModule = await import(filePath);
  importModuleCache.set(filePath, importModule);
});

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseCookiesAndReturnMap(cookieHeader: string) {
  return cookieHeader.split(";").reduce((prevValue, currValue) => {
    const [key, value] = currValue.split("=");
    prevValue[key] = value;
    return prevValue;
  }, {} as Record<string, string>);
}

const server = serve({
  port: 3000,

  async fetch(req) {
    const url = new URL(req.url);

    // check for session cookie
    const cookies = parseCookiesAndReturnMap(req.headers.get("Cookie") || "");
    const sessionId = cookies["sessionId"] ?? crypto.randomUUID();
    let session = sessionStore.get(sessionId);
    let internalSession = internalSessionStore.get(sessionId);
    if (!session) {
      // get system temp folder
      const tempDir = Bun.env.TMPDIR ?? Bun.env.TEMPDIR ?? Bun.env.TEMP;
      console.log("tempDir", tempDir);
      const tempFilePath = `${tempDir}/${sessionId}.json`;
      if (await Bun.file(tempFilePath).exists()) {
        session = JSON.parse(await Bun.file(tempFilePath).text());
      } else {
        session = { id: sessionId };
      }

      if (!internalSession) {
        internalSession = { id: sessionId };
      }

      sessionStore.set(sessionId, session);
      internalSessionStore.set(sessionId, internalSession);
    }

    const match = router.match(req);
    if (match) {
      const url = new URL(req.url);

      return await requestContext.run(
        { request: req, session, internalSession, url, cookies },
        async () => {
          let importModule;
          if (importModuleCache.has(match.filePath)) {
            importModule = importModuleCache.get(match.filePath);
          } else {
            importModule = await import(match.filePath);
            importModuleCache.set(match.filePath, importModule);
          }

          internalSession.component = importModule.default;

          // wrap importModule.default in a JSX structure
          const jsxTree = jsxDEV(
            importModule.default,
            {},
            null,
            false,
            undefined,
            undefined
          );

          const stream = new ReadableStream({
            async start(controller) {
              controller.enqueue("<!DOCTYPE html>\n");
              await renderToHTML(jsxTree, controller);
              // get system temp folder
              const tempDir = Bun.env.TMPDIR ?? Bun.env.TEMPDIR ?? Bun.env.TEMP;
              const tempFilePath = `${tempDir}/${sessionId}.json`;
              await Bun.write(tempFilePath, JSON.stringify(session));

              controller.close();
            },
          });

          const resp = new Response(stream, {
            headers: {
              "Transfer-Encoding": "chunked",
              "Content-Type": "text/html; charset=UTF-8",
              "X-Content-Type-Options": "nosniff",
            },
          });

          if (sessionId !== cookies["sessionId"]) {
            // set secure session cookie that expires in 1 hour
            resp.headers.set(
              "Set-Cookie",
              `sessionId=${sessionId}; Secure; HttpOnly; SameSite=Strict; Max-Age=${
                60 * 60 * 24
              }`
            );
          }

          return resp;
        }
      );
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
