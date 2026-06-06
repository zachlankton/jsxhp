# AGENTS.md — JSXHP

## 1. Project Overview

JSXHP is a **custom, lightweight server-side rendering (SSR) web framework** built from scratch on Bun. It provides React-like JSX syntax with streaming HTML rendering, file-system routing (Next.js style), server-side session management, and HTMX-based client interactivity.

**What it is NOT:** This is not React. The JSX runtime is a homegrown implementation in `jsxRuntime/`. The `types/` directory contains forked React type definitions only for TypeScript compatibility — there is zero React dependency.

## 2. Essential Commands

| Command | Description |
|---------|-------------|
| `bun install` | Install dependencies (`@types/bun`, `typescript`) |
| `bun run index.ts` | Start the dev server on `localhost:3000` |
| `bun run index.ts` | There is no separate test/lint/build step — Bun handles everything at runtime |

## 3. Architecture

```
index.ts              → Server entry: Bun serve, filesystem router, static files, session handling
├── jsxRuntime/       → THE FRAMEWORK CORE (custom JSX runtime, NOT React)
│   ├── jsx-dev-runtime.ts  → jsx/jsxDEV factory, renderToHTML (streaming SSR), walkJSXElement,
│   │                         useSession(), useRequestContext(), createPostCommand(),
│   │                         AsyncLocalStorage for request/session context
│   └── jsx-runtime.ts      → Re-exports from jsx-dev-runtime (for production builds)
├── pages/            → File-system routes (Next.js style via Bun.FileSystemRouter)
│   ├── index.tsx           → "/" route
│   ├── FramedComp.tsx      → "/framedcomp" route (HTMX + session demo)
│   ├── UserInfo.tsx        → Async component with .LoaderFallback pattern
│   └── githubAuth.ts       → GitHub OAuth helper (not routed)
├── public/           → Static assets (served at matching paths)
└── types/            → Forked React type declarations (TypeScript compatibility only)
```

**Request flow:**
1. Bun `serve()` receives request → parses session cookie → creates/loads session
2. `Bun.FileSystemRouter` matches URL to a `.tsx` file in `pages/`
3. Module is imported (cached in `importModuleCache`)
4. Component is wrapped via `jsxDEV()` and streamed to HTML via `renderToHTML()`
5. `renderToHTML` walks the JSX tree, enqueuing HTML chunks to a `ReadableStream`
6. Async components render a fallback first, then swap in resolved content via inline `<script>`
7. Session is persisted to temp filesystem before response closes

## 4. Code Style and Conventions

- **Language:** TypeScript, ESNext target, `strict: true`, `verbatimModuleSyntax`
- **JSX:** `jsx: "react-jsx"`, `jsxImportSource: "jsxRuntime"` — TypeScript compiles JSX to calls to our custom `jsxDEV()`
- **Components:** Default-exported functions returning JSX. Can be `async` for streaming with loading fallbacks.
- **Props:** Destructure at the function signature. Type inline or via interfaces.
- **Session:** Access via `useSession()` — it's a mutable plain object per request. Mutate directly (`session.foo = bar`).
- **Request context:** Access via `useRequestContext()` — returns `{ request, url, session, cookies }`.
- **POST commands:** Use `createPostCommand(name, callback)` for HTMX-driven server actions. Only executes on matching POST requests.
- **Async loading fallbacks:** Attach a static `LoaderFallback` property to async components:
  ```tsx
  export default async function MyComp() { ... }
  MyComp.LoaderFallback = <div>Loading...</div>;
  ```
- **HTML attributes:** Use `class` (not `className`). The runtime converts camelCase to dash-case automatically.
- **Style objects:** Pass objects to `style` prop — the runtime converts to CSS strings.

## 5. Key Constraints & Rules

- **NO React imports.** Do not import from `react` or `react-dom`. The JSX runtime is entirely custom.
- **No client-side framework.** There is no hydration, no client-side re-rendering. Interactivity is via HTMX (`hx-post`, `hx-target`, etc.) causing full re-renders on the server.
- **No build step.** Bun runs TypeScript directly. There is no bundler, transpiler, or compiler output.
- **Session is server-only.** Sessions are in-memory Maps persisted to temp JSON files. No browser storage.
- **Streaming is the default.** All rendering goes through `ReadableStream`. Do not attempt to render to a string.
- **Route files MUST default-export a component.** The router expects `module.default` to be the component function.
- **`createPostCommand` only works inside a component function.** It requires both `requestContext` and `functionContext` AsyncLocalStorage stores.

## 6. Things to Avoid

- ❌ Do NOT add React, ReactDOM, Next.js, or any other framework as a dependency.
- ❌ Do NOT add a build step (Webpack, Vite, esbuild, etc.). Bun handles everything.
- ❌ Do NOT use `className` — use `class`.
- ❌ Do NOT attempt client-side interactivity (event handlers like `onClick`). Use HTMX attributes (`hx-post`, `hx-get`, `hx-target`) instead.
- ❌ Do NOT modify `types/index.d.ts` unless you understand it's a forked React type file used purely for JSX type-checking.
- ❌ Do NOT use `useState`, `useEffect`, or any React hooks. Use `useSession()` for server-side state.
- ❌ Do NOT assume the component tree is re-rendered. Each request is a fresh render.
- ❌ Do NOT change the `jsxImportSource` in `tsconfig.json` from `"jsxRuntime"`.
