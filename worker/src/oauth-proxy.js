const GITHUB_AUTHORIZE_URL = "https://github.com/login/oauth/authorize";
const GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token";

function html(body, init = {}) {
  return new Response(body, {
    ...init,
    headers: {
      "content-type": "text/html; charset=utf-8",
      ...(init.headers || {}),
    },
  });
}

function getOrigin(request) {
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

function jsonError(message, status = 400) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

function encodeState(siteId) {
  return btoa(JSON.stringify({ site_id: siteId || "" }));
}

function decodeState(state) {
  if (!state) return {};

  try {
    return JSON.parse(atob(state));
  } catch {
    return {};
  }
}

async function handleAuth(request, env) {
  if (!env.GITHUB_CLIENT_ID) {
    return jsonError("Missing GITHUB_CLIENT_ID Worker secret.", 500);
  }

  const url = new URL(request.url);
  const scope = url.searchParams.get("scope") || env.GITHUB_SCOPE || "repo";
  const siteId = url.searchParams.get("site_id") || "";
  const redirectUri = `${getOrigin(request)}/callback`;
  const githubUrl = new URL(GITHUB_AUTHORIZE_URL);

  githubUrl.searchParams.set("client_id", env.GITHUB_CLIENT_ID);
  githubUrl.searchParams.set("redirect_uri", redirectUri);
  githubUrl.searchParams.set("scope", scope);
  githubUrl.searchParams.set("state", encodeState(siteId));

  return Response.redirect(githubUrl.toString(), 302);
}

async function exchangeCodeForToken(code, request, env) {
  const response = await fetch(GITHUB_TOKEN_URL, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "user-agent": "yyb-decap-oauth",
    },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: `${getOrigin(request)}/callback`,
    }),
  });

  return response.json();
}

async function handleCallback(request, env) {
  if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
    return jsonError("Missing GitHub OAuth Worker secrets.", 500);
  }

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = decodeState(url.searchParams.get("state"));

  if (!code) {
    return jsonError("Missing GitHub OAuth code.");
  }

  const tokenResponse = await exchangeCodeForToken(code, request, env);

  if (!tokenResponse.access_token) {
    return html(
      `<p>GitHub 登录失败。</p><pre>${escapeHtml(JSON.stringify(tokenResponse, null, 2))}</pre>`,
      { status: 400 },
    );
  }

  const payload = {
    token: tokenResponse.access_token,
    provider: "github",
    site_id: state.site_id || "",
  };

  return html(`<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <title>GitHub 登录完成</title>
  </head>
  <body>
    <p>GitHub 登录完成，可以关闭此窗口。</p>
    <script>
      const authorization = 'authorization:github:success:' + JSON.stringify(${JSON.stringify(payload)});

      function receiveMessage(event) {
        window.opener.postMessage(authorization, event.origin);
        window.removeEventListener('message', receiveMessage, false);
        window.close();
      }

      window.addEventListener('message', receiveMessage, false);
      window.opener.postMessage('authorizing:github', '*');
    </script>
  </body>
</html>`);
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/auth") {
      return handleAuth(request, env);
    }

    if (url.pathname === "/callback") {
      return handleCallback(request, env);
    }

    return html("<p>yyb Decap OAuth Proxy is running.</p>");
  },
};
