# AGENTS.md — JSXHP

## 1. Project Overview

JSXHP is a **custom, lightweight server-side rendering (SSR) web framework** built from scratch on Bun. It provides React-like JSX syntax with streaming HTML rendering, file-system routing (Next.js style), server-side session management, and HTMX-based client interactivity.

**What it is NOT:** This is not React. The JSX runtime is a homegrown implementation in `jsxRuntime/`. The `types/` directory contains forked React type definitions only for TypeScript compatibility — there is zero React dependency.

## 2. Essential Commands

| Command | Description |
|---------|-------------|
| `bun install` | Install dependencies (`@types/bun`, `typescript`) |
| `bun run index.ts` | Start the dev server on `localhost:3000` |

There is no separate test, lint, or build step. Bun runs TypeScript directly at runtime.

## 3. Architecture

```
index.ts              → Server entry: Bun serve, filesystem router, static files, session handling
├── jsxRuntime/       → THE FRAMEWORK CORE (custom JSX runtime, NOT React)
│   ├── jsx-dev-runtime.ts  → jsx/jsxDEV factory, renderToHTML (streaming SSR), walkJSXElement,
│   │                         useSession(), useRequestContext(), createPostCommand(), delay(),
│   │                         AsyncLocalStorage for request/session context, module import cache
│   └── jsx-runtime.ts      → Re-exports jsxDEV, jsx, renderToHTML from jsx-dev-runtime
├── pages/            → File-system routes (Next.js style via Bun.FileSystemRouter)
│   ├── index.tsx           → "/" route (demo page)
│   ├── FramedComp.tsx      → "/framedcomp" route (HTMX + session state demo)
│   ├── UserInfo.tsx        → Async component with .LoaderFallback pattern
│   ├── UserFriends.tsx     → Nested async component with .LoaderFallback
│   ├── UserFriend.tsx      → Leaf async component with .LoaderFallback
│   └── githubAuth.ts       → GitHub OAuth helper (utility, not a route)
├── public/           → Static assets (served at matching paths, e.g. /htmx.min.js)
└── types/            → Forked React type declarations (TypeScript compatibility only)
```

**Request flow:**
1. Bun `serve()` receives request → parses `sessionId` cookie → creates/loads session from in-memory `Map` or temp JSON file
2. `Bun.FileSystemRouter` (style: "nextjs") matches URL to a `.tsx`/`.ts` file in `pages/`
3. Module is dynamically imported and cached in `importModuleCache` (pre-warmed at startup)
4. Component's `default` export is wrapped via `jsxDEV()` into a JSX tree
5. `renderToHTML()` walks the JSX tree, enqueuing HTML chunks to a `ReadableStream`
6. **Async components:** A fallback (`.LoaderFallback`) renders first; once resolved, content is streamed and an inline `<script>` swaps the fallback out
7. Session is persisted to a temp JSON file (`$TMPDIR/$sessionId.json`) before the stream closes
8. If `sessionId` was generated (not from cookie), a `Set-Cookie` header is attached

**Key internals:**
- `requestContext` — `AsyncLocalStorage` holding `{ request, url, session, internalSession, cookies }` per request
- `functionContext` — `AsyncLocalStorage` holding `{ component }` per component invocation (used by `createPostCommand`)
- `sessionStore` / `internalSessionStore` — in-memory `Map<string, any>` keyed by `sessionId`
- `importModuleCache` — `Map<string, any>` caching dynamically imported route modules

## 4. Code Style and Conventions

- **Language:** TypeScript, ESNext target, `strict: true`, `verbatimModuleSyntax`, `noEmit`
- **JSX:** `jsx: "react-jsx"`, `jsxImportSource: "jsxRuntime"` — TypeScript compiles JSX to `jsxDEV()` calls from our custom runtime
- **Components:** Default-exported functions returning JSX. Can be `async` for streaming with loading fallbacks.
- **Props:** Destructure at the function signature. Type inline or via interfaces.
- **Session:** Access via `useSession()` — it's a mutable plain object per request. Mutate directly: `session.foo = bar`.
- **Request context:** Access via `useRequestContext()` — returns `{ request, url, session, cookies }`.
- **POST commands:** Use `createPostCommand(name, callback)` for HTMX-driven server actions. Only executes when `req.method === "POST"` and `url.searchParams.has(name)`.
- **Async loading fallbacks:** Attach a static `LoaderFallback` JSX property to async components:
  ```tsx
  export default async function MyComp() { ... }
  MyComp.LoaderFallback = <div>Loading...</div>;
  ```
- **HTML attributes:** Use `class` (not `className`). The runtime converts camelCase to dash-case automatically.
- **Style objects:** Pass plain objects to the `style` prop — the runtime converts to CSS strings.
- **Imports:** Import runtime utilities from `"jsxRuntime/jsx-dev-runtime"` (the path alias is configured in `tsconfig.json`).

## 5. Key Constraints & Rules

- **NO React imports.** Do not import from `react` or `react-dom`. The JSX runtime is entirely custom.
- **No client-side framework.** There is no hydration, no client-side re-rendering. Interactivity is via HTMX (`hx-post`, `hx-target`, etc.) causing full server re-renders.
- **No build step.** Bun runs TypeScript directly. There is no bundler, transpiler, or compiler output.
- **Session is server-only.** Sessions are in-memory Maps persisted to temp JSON files. No browser storage.
- **Streaming is the default.** All rendering goes through `ReadableStream`. Do not attempt to render to a string.
- **Route files MUST default-export a component.** The router expects `module.default` to be the component function.
- **`createPostCommand` only works inside a component function.** It requires both `requestContext` and `functionContext` AsyncLocalStorage stores to be active.
- **Server port is hardcoded to 3000** in `index.ts`.
- **Session cookie max-age is 1 day** (`60 * 60 * 24` seconds).
- **Error handling:** `unhandledRejection` and `uncaughtException` are caught and logged — the server stays alive.

## 6. Things to Avoid

- ❌ Do NOT add React, ReactDOM, Next.js, or any other framework as a dependency.
- ❌ Do NOT add a build step (Webpack, Vite, esbuild, etc.). Bun handles everything.
- ❌ Do NOT use `className` — use `class`.
- ❌ Do NOT attempt client-side interactivity (event handlers like `onClick`). Use HTMX attributes (`hx-post`, `hx-get`, `hx-target`) instead.
- ❌ Do NOT modify `types/index.d.ts` unless you understand it's a forked React type file used purely for JSX type-checking.
- ❌ Do NOT use `useState`, `useEffect`, or any React hooks. Use `useSession()` for server-side state.
- ❌ Do NOT assume the component tree is re-rendered. Each request is a fresh render from scratch.
- ❌ Do NOT change the `jsxImportSource` in `tsconfig.json` from `"jsxRuntime"`.
- ❌ Do NOT use `self-closing` tags for elements with children — the runtime does basic tag generation and expects explicit closing tags.
- ❌ Do NOT pass `undefined` props — the runtime filters them out, but it's better to omit them entirely.
