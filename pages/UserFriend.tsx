import { useSession } from "jsxRuntime/jsx-dev-runtime";

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default async function UserFriend(props: {
  delayMs: number;
  user: { name: string; email: string };
  friend: { name: string; email: string };
}) {
  props = props ?? {};
  props.delayMs = props.delayMs ?? 1000;
  props.user = props.user ?? {
    name: "John Doe",
    email: "john.doe@example.com",
  };
  props.friend = props.friend ?? {
    name: "Jane Doe",
    email: "jane.doe@example.com",
  };
  const { delayMs, user, friend } = props;
  const session = useSession();
  await delay(delayMs);
  return (
    <div style="border: 1px solid black; padding: 10px;">
      Name: {user.name} is friends with {friend.name} {session.test}
    </div>
  );
}

UserFriend.LoaderFallback = (
  <div style="border: 1px solid black; padding: 10px; height: 19px;">
    Loading...
  </div>
);
