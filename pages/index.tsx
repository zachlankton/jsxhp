import crypto from "crypto";

export default function LoginPage() {
  const githubAuthUrl = "https://github.com/login/oauth/authorize";
  const githubParams = new URLSearchParams();
  githubParams.set("client_id", process.env.GITHUB_CLIENT_ID ?? "");
  githubParams.set("redirect_uri", "http://localhost:3000/callback");
  githubParams.set("state", "testing:state:param");

  const githubUrl = `${githubAuthUrl}?${githubParams.toString()}`;
  return (
    <html lang="en" key="testKey">
      <head>
        <meta charSet="UTF-8" />
        <meta name="description" content="Login with GitHub" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>GitHub Login</title>
        <style>{`body { font-family: sans-serif; }`}</style>
      </head>
      <body>
        <div style="overflow: hidden; width: 0; height: 0">
          Need to do this because safari won't progressively render unless there
          is a minimum of 1kb to display -
          ZDg73thckm71vkusY7Q4H4Vtna6K0GFcxuj4EF4FqNDL7bVeW+zbbLWV8nML4f+vnfrPSceVkEXa+WTLft1U4HdXhrZzT5Ll3hjNhtVfopZlvdxri/DKp1ZL7r9kT70K7yk1FJEU+z4JxNjqI1bqouKBf2lQS0SZKMdIv4Pw9nkJl2WGYDMEK/jOCnCNWbcvZgVyuwnyi5BK9wKFkeVIXiH/vMQtDUwoGbOdrFfwa2HYHxS+kmOvg/oyTLVnJB2LUMTm9Wc5Z8NG00/GUHsrqAe1GmJFaxCtM+wO/YBXSAG8QUpKRmc2mdQn2Xz4vPQNruz9AOSuGfRXrQpM242QmzC9N+fzA0U9pcYdNnBcqI2qWU0LLpfJHs2qfy+qpd0XzjCvL04ZP0/7g9VIgEoltTtkKeFMnLAiTde1f2OTKIoDW17cI2jucfZfSUIt6D1P2hpmX2x9FsLRj/Gxeok2n31L1Veo8P1pGMX33e+cRQSlNDFcZ9/wlCQQ/cBd3VTRvTcPoB5LFyvt0yxlwOY2usbnaF3rTASNEoZqj0UdGMIkJt8itm570DXumHSSVYZhl1BH14ewZ2iliHD9qZxo39UtvxNOXb7mRRj/w//vUNYgrm+4r99qod8EOe/XTsIm0pWg0ipRPoDl9foYJ5XsP4cQZIyyQOQ+4MLceSiLSnGKa3rHJronAz1zZdHxalIK2iimUK5JyM5Pa6s9NzJz0vIVkJlWdEMN7cgtHGXl/H29bfvjARENzSoDx5fcBi9tpxg+n3d+Jp2961nFJa+f7LHgQ15xptkAbq9MdxIwsLR5EKta71IktB59ZAGzZD9FsZC/DYfSKzpZTNtzZYYtqPhGQLFiXhnOFO5FfyXV/ad1RWV1VBIbvoOP1+8UQW4dl/T/2kt67OKR5dANXKgAvLDUf2AzHWjo70HOUYrFEb38UjUn3A61W2yQ+6ZskQ0Ts6ryUrYGPMWQWhvSxRERA1oRFaCGPFDWOOp4pJxIkt4jA73Plxs+a6BVI2xxzn20Pa51KnJBPc9Daiep/i19YumagSw+J26hLf/19OeW4eerb4FD4JqBF0a2jEKOETiUI3rAIIS/SGZqG99YUMeRGCLDJsSUt5DtmJH9oronuMDGBXul3ILIzxAeXF9Ct5k3eH60Pybw+d8ozR7lt+UCZKRxVdhjSw4ypQQiqUqsqXev16YLHr5+8tFFp54lBGYT24LlDYZ/WEuluU6LVw/Lai/bNrLYGHSkQVGc3xc8yWg1XnirMY/YnLn1xl0y7AM7JplEqGBNXMl43NwqHLBP9QYzOWXBJ4cAX2jvA+EZnT994GD7OP9O3JHEm6hUVGdDAXkP1IkyaxKlpq69Zz3JBA==
        </div>

        <div>
          <>
            <div>
              <h1>Login with GitHub</h1>
              <UserInfo
                delayMs={1000}
                user={{ name: "John Doe", email: "john.doe@example.com" }}
              />
              <UserInfo
                delayMs={3000}
                user={{ name: "Jane Doe", email: "jane.doe@example.com" }}
              />
              <UserInfo
                delayMs={2000}
                user={{ name: "John Smith", email: "john.smith@example.com" }}
              />
            </div>
          </>
        </div>
      </body>
    </html>
  );
}

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function UserInfo({
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

async function UserFriends({
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

async function UserFriend({
  delayMs,
  user,
  friend,
}: {
  delayMs: number;
  user: { name: string; email: string };
  friend: { name: string; email: string };
}) {
  await delay(delayMs);
  return (
    <div style="border: 1px solid black; padding: 10px; height: 19px;">
      Name: {user.name} is friends with {friend.name}
    </div>
  );
}

UserFriend.LoaderFallback = (
  <div style="border: 1px solid black; padding: 10px; height: 19px;">
    Loading...
  </div>
);
