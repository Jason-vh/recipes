import { readBody, createError } from "h3";
import { randomBytes, createHash } from "crypto";
import { consumeAuthCode, storeOAuthToken } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { grant_type, code, redirect_uri, client_id, code_verifier } = body;

  if (grant_type !== "authorization_code") {
    throw createError({ statusCode: 400, statusMessage: "Unsupported grant_type" });
  }

  if (!code) {
    throw createError({ statusCode: 400, statusMessage: "Missing code" });
  }

  const authCode = consumeAuthCode(code);
  if (!authCode) {
    throw createError({ statusCode: 400, statusMessage: "Invalid or expired authorization code" });
  }

  // Validate redirect_uri matches
  if (redirect_uri && redirect_uri !== authCode.redirectUri) {
    throw createError({ statusCode: 400, statusMessage: "redirect_uri mismatch" });
  }

  // Validate client_id matches
  if (client_id && client_id !== authCode.clientId) {
    throw createError({ statusCode: 400, statusMessage: "client_id mismatch" });
  }

  // Validate PKCE code_verifier if code_challenge was provided
  if (authCode.codeChallenge) {
    if (!code_verifier) {
      throw createError({ statusCode: 400, statusMessage: "Missing code_verifier" });
    }

    const expectedChallenge = base64UrlEncode(
      createHash("sha256").update(code_verifier).digest()
    );

    if (expectedChallenge !== authCode.codeChallenge) {
      throw createError({ statusCode: 400, statusMessage: "Invalid code_verifier" });
    }
  }

  // Issue access token
  const accessToken = randomBytes(32).toString("hex");
  const expiresIn = 3600 * 24; // 24 hours
  storeOAuthToken(accessToken, expiresIn);

  event.node.res.setHeader("Content-Type", "application/json");
  event.node.res.setHeader("Cache-Control", "no-store");

  return {
    access_token: accessToken,
    token_type: "Bearer",
    expires_in: expiresIn,
  };
});

function base64UrlEncode(buffer: Buffer): string {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}
