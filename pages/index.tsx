import crypto from "crypto";
import { useRequestContext, useSession } from "jsxRuntime/jsx-dev-runtime";
import UserInfo from "./UserInfo";
import FramedComp from "./FramedComp";

function ReqContext() {
  const reqCtx = useRequestContext();
  const session = useSession();
  // console.log("reqCtx", reqCtx);
  // console.log("session", session);
  session.test = session.test ?? 0;
  session.test++;
  return <div>Hello Test {session.test}</div>;
}

export default function LoginPage() {
  const users = [
    { name: "John Doe", email: "john.doe@example.com", delayMs: 1000 },
    { name: "Jane Doe", email: "jane.doe@example.com", delayMs: 3000 },
    { name: "John Smith", email: "john.smith@example.com", delayMs: 2000 },
  ];
  return (
    <html lang="en" key="testKey">
      <head>
        <meta charSet="UTF-8" />
        <meta name="description" content="Login with GitHub" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>GitHub Login</title>
        <style>{`body { font-family: sans-serif; }`}</style>
        <script src="/htmx.min.js"></script>
      </head>
      <body>
        <div style="overflow: hidden; width: 0; height: 0">
          Need to do this because safari won't progressively render unless there
          is a minimum of 1kb to display -
          ZDg73thckm71vkusY7Q4H4Vtna6K0GFcxuj4EF4FqNDL7bVeW+zbbLWV8nML4f+vnfrPSceVkEXa+WTLft1U4HdXhrZzT5Ll3hjNhtVfopZlvdxri/DKp1ZL7r9kT70K7yk1FJEU+z4JxNjqI1bqouKBf2lQS0SZKMdIv4Pw9nkJl2WGYDMEK/jOCnCNWbcvZgVyuwnyi5BK9wKFkeVIXiH/vMQtDUwoGbOdrFfwa2HYHxS+kmOvg/oyTLVnJB2LUMTm9Wc5Z8NG00/GUHsrqAe1GmJFaxCtM+wO/YBXSAG8QUpKRmc2mdQn2Xz4vPQNruz9AOSuGfRXrQpM242QmzC9N+fzA0U9pcYdNnBcqI2qWU0LLpfJHs2qfy+qpd0XzjCvL04ZP0/7g9VIgEoltTtkKeFMnLAiTde1f2OTKIoDW17cI2jucfZfSUIt6D1P2hpmX2x9FsLRj/Gxeok2n31L1Veo8P1pGMX33e+cRQSlNDFcZ9/wlCQQ/cBd3VTRvTcPoB5LFyvt0yxlwOY2usbnaF3rTASNEoZqj0UdGMIkJt8itm570DXumHSSVYZhl1BH14ewZ2iliHD9qZxo39UtvxNOXb7mRRj/w//vUNYgrm+4r99qod8EOe/XTsIm0pWg0ipRPoDl9foYJ5XsP4cQZIyyQOQ+4MLceSiLSnGKa3rHJronAz1zZdHxalIK2iimUK5JyM5Pa6s9NzJz0vIVkJlWdEMN7cgtHGXl/H29bfvjARENzSoDx5fcBi9tpxg+n3d+Jp2961nFJa+f7LHgQ15xptkAbq9MdxIwsLR5EKta71IktB59ZAGzZD9FsZC/DYfSKzpZTNtzZYYtqPhGQLFiXhnOFO5FfyXV/ad1RWV1VBIbvoOP1+8UQW4dl/T/2kt67OKR5dANXKgAvLDUf2AzHWjo70HOUYrFEb38UjUn3A61W2yQ+6ZskQ0Ts6ryUrYGPMWQWhvSxRERA1oRFaCGPFDWOOp4pJxIkt4jA73Plxs+a6BVI2xxzn20Pa51KnJBPc9Daiep/i19YumagSw+J26hLf/19OeW4eerb4FD4JqBF0a2jEKOETiUI3rAIIS/SGZqG99YUMeRGCLDJsSUt5DtmJH9oronuMDGBXul3ILIzxAeXF9Ct5k3eH60Pybw+d8ozR7lt+UCZKRxVdhjSw4ypQQiqUqsqXev16YLHr5+8tFFp54lBGYT24LlDYZ/WEuluU6LVw/Lai/bNrLYGHSkQVGc3xc8yWg1XnirMY/YnLn1xl0y7AM7JplEqGBNXMl43NwqHLBP9QYzOWXBJ4cAX2jvA+EZnT994GD7OP9O3JHEm6hUVGdDAXkP1IkyaxKlpq69Zz3JBA==
        </div>
        <ReqContext />
        <FramedComp />
        {/* <div>
          <>
            <div>
              <h1>Login with GitHub</h1>
              {users.map((user) => (
                <UserInfo key={user.email} delayMs={user.delayMs} user={user} />
              ))}
            </div>
          </>
        </div> */}
      </body>
    </html>
  );
}
