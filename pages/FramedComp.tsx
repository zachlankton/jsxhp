import { useRequestContext, useSession } from "jsxRuntime/jsx-dev-runtime";

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default async function FramedComp() {
  const reqCtx = useRequestContext();
  const session = useSession();
  await delay(1000);
  session.framedComp = session.framedComp || 0;
  if (
    reqCtx.request.method === "POST" &&
    reqCtx.url.searchParams.has("increment")
  ) {
    session.framedComp++;
  }
  if (
    reqCtx.request.method === "POST" &&
    reqCtx.url.searchParams.has("decrement")
  ) {
    session.framedComp--;
  }
  return (
    <div class="framed-comp" hx-target=".framed-comp" hx-swap="outerHTML">
      <div>Test</div>
      <p>{session.framedComp}</p>
      <button hx-post="/framedcomp?increment">Increment</button>
      <button hx-post="/framedcomp?decrement">Decrement</button>
    </div>
  );
}
