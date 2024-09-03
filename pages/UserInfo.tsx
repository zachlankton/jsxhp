import UserFriends from "./UserFriends";

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default async function UserInfo({
  delayMs,
  user,
}: {
  delayMs: number;
  user: { name: string; email: string };
}) {
  await delay(delayMs);
  return (
    <div style="border: 1px solid black; padding: 10px; height: 316px;">
      <p>User Info</p>
      <p>Name: {user.name}</p>
      <p>Email: {user.email}</p>
      <UserFriends delayMs={delayMs} user={user} />
    </div>
  );
}

UserInfo.LoaderFallback = (
  <div style="border: 1px solid black; padding: 10px; height: 316px;">
    Loading...
  </div>
);
