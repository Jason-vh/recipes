import { readBody, sendRedirect, createError } from "h3";
import { randomBytes } from "crypto";
import { storeAuthCode } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { password, client_id, redirect_uri, state, code_challenge, code_challenge_method, scope } =
    body;

  const secret = process.env.APP_SECRET;
  if (!secret) {
    throw createError({ statusCode: 500, statusMessage: "APP_SECRET not configured" });
  }

  if (password !== secret) {
    // Re-render the form with error
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Authorize - Recipes</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, system-ui, sans-serif; background: #f8f9fa; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 1rem; }
    .card { background: white; border-radius: 12px; padding: 2rem; max-width: 400px; width: 100%; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    h1 { font-size: 1.25rem; margin-bottom: 0.5rem; }
    p { color: #666; font-size: 0.875rem; margin-bottom: 1.5rem; }
    input[type="password"] { width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 8px; font-size: 1rem; margin-bottom: 1rem; }
    button { width: 100%; padding: 0.75rem; background: #2563eb; color: white; border: none; border-radius: 8px; font-size: 1rem; cursor: pointer; }
    button:hover { background: #1d4ed8; }
    .error { color: #dc2626; font-size: 0.875rem; margin-bottom: 1rem; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Authorize Access</h1>
    <p>Enter your password to grant access to your recipes.</p>
    <div class="error">Invalid password. Please try again.</div>
    <form method="POST" action="/oauth/authorize">
      <input type="hidden" name="client_id" value="${escapeHtml(client_id || "")}">
      <input type="hidden" name="redirect_uri" value="${escapeHtml(redirect_uri || "")}">
      <input type="hidden" name="state" value="${escapeHtml(state || "")}">
      <input type="hidden" name="code_challenge" value="${escapeHtml(code_challenge || "")}">
      <input type="hidden" name="code_challenge_method" value="${escapeHtml(code_challenge_method || "")}">
      <input type="hidden" name="response_type" value="code">
      <input type="hidden" name="scope" value="${escapeHtml(scope || "")}">
      <input type="password" name="password" placeholder="Password" required autofocus>
      <button type="submit">Authorize</button>
    </form>
  </div>
</body>
</html>`;
    event.node.res.setHeader("Content-Type", "text/html");
    return html;
  }

  // Password correct — issue authorization code
  const code = randomBytes(32).toString("hex");
  storeAuthCode(code, {
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
    codeChallenge: code_challenge,
    codeChallengeMethod: code_challenge_method,
    redirectUri: redirect_uri,
    clientId: client_id,
  });

  const redirectUrl = new URL(redirect_uri);
  redirectUrl.searchParams.set("code", code);
  if (state) redirectUrl.searchParams.set("state", state);

  return sendRedirect(event, redirectUrl.toString());
});

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
