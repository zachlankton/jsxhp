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
    <div class="framed-comp">
      <div>Test</div>
      <p>{session.framedComp}</p>
      <button hx-post="/framedcomp?inc" hx-target="#content">
        Increment
      </button>
      <button hx-post="/framedcomp?dec" hx-target="#content">
        Decrement
      </button>
      <div id="content"></div>
    </div>
  );
}
