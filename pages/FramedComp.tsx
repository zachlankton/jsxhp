import {
  createPostCommand,
  delay,
  useSession,
} from "jsxRuntime/jsx-dev-runtime";

export default async function FramedComp() {
  const session = useSession();
  session.framedComp = session.framedComp || 0;
  createPostCommand("inc", () => session.framedComp++);
  createPostCommand("dec", () => session.framedComp--);
  await delay(1000);

  return (
    <div class="framed-comp" hx-target=".framed-comp" hx-swap="outerHTML">
      <div>Test</div>
      <p>{session.framedComp}</p>
      <button hx-post="/framedcomp?inc">Increment</button>
      <button hx-post="/framedcomp?dec">Decrement</button>
    </div>
  );
}
