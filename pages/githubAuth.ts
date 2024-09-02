// https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/generating-a-user-access-token-for-a-github-app

export async function handleCallback(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  console.log("url", req.url);
  console.log("code", code);

  if (!code) {
    return new Response("Missing code parameter", { status: 400 });
  }

  const githubAccessTokenUrl = "https://github.com/login/oauth/access_token";
  const queryParams = new URLSearchParams();
  queryParams.set("client_id", process.env.GITHUB_CLIENT_ID ?? "");
  queryParams.set("client_secret", process.env.GITHUB_CLIENT_SECRET ?? "");
  queryParams.set("code", code ?? "");
  queryParams.set("redirect_uri", "http://localhost:3000/callback");

  const urlWithParams = `${githubAccessTokenUrl}?${queryParams.toString()}`;

  const response = await fetch(urlWithParams, {
    method: "POST",
  });

  const data = await response.text();

  const parsedData = parse(data);
  console.log("data", parsedData);

  // get user info
  const userInfoResponse = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${parsedData.access_token}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  const userInfo = await userInfoResponse.json();
  console.log("userInfo", userInfo);
  return new Response("Handle Callback");
}

function parse(data: string) {
  const parsedData: Record<string, string> = {};
  const pairs = data.split("&");
  for (const pair of pairs) {
    const [key, value] = pair.split("=");
    parsedData[key] = value;
  }
  return parsedData;
}
