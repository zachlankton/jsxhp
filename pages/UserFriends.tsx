import UserFriend from "./UserFriend";

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default async function UserFriends({
  delayMs,
  user,
}: {
  delayMs: number;
  user: { name: string; email: string };
}) {
  await delay(delayMs);
  const friends = [
    { name: "John Doe", email: "john.doe@example.com", delayMs: 1000 },
    { name: "Jane Doe", email: "jane.doe@example.com", delayMs: 3000 },
    { name: "John Smith", email: "john.smith@example.com", delayMs: 2000 },
  ];
  return (
    <div style="border: 1px solid black; padding: 10px; height: 175px;">
      <p>User Friends</p>
      {friends.map((friend) => (
        <UserFriend
          key={friend.email}
          delayMs={friend.delayMs}
          user={user}
          friend={friend}
        />
      ))}
    </div>
  );
}

UserFriends.LoaderFallback = (
  <div style="border: 1px solid black; padding: 10px; height: 175px;">
    Loading...
  </div>
);
