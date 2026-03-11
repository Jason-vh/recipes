import { getQuery } from "h3";

export default defineEventHandler((event) => {
  const query = getQuery(event);
  const oauthParams = JSON.stringify({
    client_id: query.client_id || "",
    redirect_uri: query.redirect_uri || "",
    state: query.state || "",
    code_challenge: query.code_challenge || "",
    code_challenge_method: query.code_challenge_method || "",
    scope: query.scope || "",
  });

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
    button:disabled { opacity: 0.5; cursor: not-allowed; }
    .error { color: #dc2626; font-size: 0.875rem; margin-bottom: 1rem; }
    .status { color: #666; font-size: 0.875rem; margin-bottom: 1rem; }
    .hidden { display: none; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Authorize Access</h1>

    <div id="loading">
      <p>Checking authentication...</p>
    </div>

    <!-- Passkey authentication (shown when passkeys exist) -->
    <div id="auth-view" class="hidden">
      <p>Authenticate with your passkey to grant access.</p>
      <div id="auth-error" class="error hidden"></div>
      <button id="auth-btn" onclick="authenticate()">Authenticate with Passkey</button>
    </div>

    <!-- Passkey registration (shown when no passkeys exist) -->
    <div id="register-view" class="hidden">
      <p>No passkey registered yet. Enter your app secret to set one up.</p>
      <div id="reg-error" class="error hidden"></div>
      <input type="password" id="secret" placeholder="App Secret" autofocus>
      <button id="reg-btn" onclick="register()">Register Passkey</button>
    </div>
  </div>

  <script>
    // SimpleWebAuthn browser helpers (inline to avoid CDN dependency)
    function bufferToBase64url(buffer) {
      const bytes = new Uint8Array(buffer);
      let str = '';
      for (const b of bytes) str += String.fromCharCode(b);
      return btoa(str).replace(/\\+/g, '-').replace(/\\//g, '_').replace(/=+$/, '');
    }

    function base64urlToBuffer(base64url) {
      const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64 + '='.repeat((4 - base64.length % 4) % 4);
      const binary = atob(padded);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      return bytes.buffer;
    }

    const oauth = ${oauthParams};

    async function init() {
      try {
        const res = await fetch('/oauth/webauthn/status');
        const { registered } = await res.json();
        document.getElementById('loading').classList.add('hidden');
        if (registered) {
          document.getElementById('auth-view').classList.remove('hidden');
          // Auto-trigger authentication
          authenticate();
        } else {
          document.getElementById('register-view').classList.remove('hidden');
        }
      } catch (e) {
        document.getElementById('loading').innerHTML = '<p class="error">Failed to check status.</p>';
      }
    }

    async function register() {
      const secret = document.getElementById('secret').value;
      const errEl = document.getElementById('reg-error');
      const btn = document.getElementById('reg-btn');
      errEl.classList.add('hidden');
      btn.disabled = true;
      btn.textContent = 'Setting up...';

      try {
        // Get registration options
        const optRes = await fetch('/oauth/webauthn/register-options', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ secret }),
        });
        if (!optRes.ok) {
          const err = await optRes.json();
          throw new Error(err.statusMessage || 'Invalid secret');
        }
        const { options, challengeId } = await optRes.json();

        // Convert for WebAuthn API
        options.challenge = base64urlToBuffer(options.challenge);
        options.user.id = base64urlToBuffer(options.user.id);
        if (options.excludeCredentials) {
          options.excludeCredentials = options.excludeCredentials.map(c => ({
            ...c, id: base64urlToBuffer(c.id),
          }));
        }

        // Create credential
        const credential = await navigator.credentials.create({ publicKey: options });

        // Serialize for server
        const serialized = {
          id: credential.id,
          rawId: bufferToBase64url(credential.rawId),
          type: credential.type,
          response: {
            attestationObject: bufferToBase64url(credential.response.attestationObject),
            clientDataJSON: bufferToBase64url(credential.response.clientDataJSON),
          },
          clientExtensionResults: credential.getClientExtensionResults(),
          authenticatorAttachment: credential.authenticatorAttachment,
        };

        // Verify registration
        const verRes = await fetch('/oauth/webauthn/register-verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ challengeId, credential: serialized, secret }),
        });
        if (!verRes.ok) throw new Error('Registration verification failed');

        // Success — now authenticate
        document.getElementById('register-view').classList.add('hidden');
        document.getElementById('auth-view').classList.remove('hidden');
        authenticate();
      } catch (e) {
        errEl.textContent = e.message || 'Registration failed';
        errEl.classList.remove('hidden');
        btn.disabled = false;
        btn.textContent = 'Register Passkey';
      }
    }

    async function authenticate() {
      const errEl = document.getElementById('auth-error');
      const btn = document.getElementById('auth-btn');
      errEl.classList.add('hidden');
      btn.disabled = true;
      btn.textContent = 'Authenticating...';

      try {
        // Get authentication options
        const optRes = await fetch('/oauth/webauthn/auth-options', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!optRes.ok) throw new Error('Failed to get auth options');
        const { options, challengeId } = await optRes.json();

        // Convert for WebAuthn API
        options.challenge = base64urlToBuffer(options.challenge);
        if (options.allowCredentials) {
          options.allowCredentials = options.allowCredentials.map(c => ({
            ...c, id: base64urlToBuffer(c.id),
          }));
        }

        // Get assertion
        const credential = await navigator.credentials.get({ publicKey: options });

        // Serialize for server
        const serialized = {
          id: credential.id,
          rawId: bufferToBase64url(credential.rawId),
          type: credential.type,
          response: {
            authenticatorData: bufferToBase64url(credential.response.authenticatorData),
            clientDataJSON: bufferToBase64url(credential.response.clientDataJSON),
            signature: bufferToBase64url(credential.response.signature),
            userHandle: credential.response.userHandle ? bufferToBase64url(credential.response.userHandle) : null,
          },
          clientExtensionResults: credential.getClientExtensionResults(),
          authenticatorAttachment: credential.authenticatorAttachment,
        };

        // Verify and get auth code
        const verRes = await fetch('/oauth/webauthn/auth-verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ challengeId, credential: serialized, oauth }),
        });
        if (!verRes.ok) throw new Error('Authentication failed');
        const { redirect } = await verRes.json();

        // Redirect with auth code
        window.location.href = redirect;
      } catch (e) {
        errEl.textContent = e.message || 'Authentication failed';
        errEl.classList.remove('hidden');
        btn.disabled = false;
        btn.textContent = 'Authenticate with Passkey';
      }
    }

    init();
  </script>
</body>
</html>`;

  event.node.res.setHeader("Content-Type", "text/html");
  return html;
});
