import { getQuery } from "h3";

export default defineEventHandler((event) => {
  const query = getQuery(event);

  // Render a simple password form that preserves OAuth params
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
    .error { color: #dc2626; font-size: 0.875rem; margin-bottom: 1rem; display: none; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Authorize Access</h1>
    <p>Enter your password to grant access to your recipes.</p>
    <div class="error" id="error">Invalid password</div>
    <form method="POST" action="/oauth/authorize">
      <input type="hidden" name="client_id" value="${escapeHtml(String(query.client_id || ""))}">
      <input type="hidden" name="redirect_uri" value="${escapeHtml(String(query.redirect_uri || ""))}">
      <input type="hidden" name="state" value="${escapeHtml(String(query.state || ""))}">
      <input type="hidden" name="code_challenge" value="${escapeHtml(String(query.code_challenge || ""))}">
      <input type="hidden" name="code_challenge_method" value="${escapeHtml(String(query.code_challenge_method || ""))}">
      <input type="hidden" name="response_type" value="${escapeHtml(String(query.response_type || "code"))}">
      <input type="hidden" name="scope" value="${escapeHtml(String(query.scope || ""))}">
      <input type="password" name="password" placeholder="Password" required autofocus>
      <button type="submit">Authorize</button>
    </form>
  </div>
</body>
</html>`;

  event.node.res.setHeader("Content-Type", "text/html");
  return html;
});

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
