import type { H3Event } from "h3";
import { createError, getHeader } from "h3";

/**
 * Validates Bearer token or OAuth access token against APP_SECRET.
 * Call at the top of each protected handler.
 */
export function requireAuth(event: H3Event): void {
  const authHeader = getHeader(event, "authorization");
  if (!authHeader) {
    throw createError({ statusCode: 401, statusMessage: "Missing Authorization header" });
  }

  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) {
    throw createError({ statusCode: 401, statusMessage: "Invalid Authorization header format" });
  }

  const secret = process.env.APP_SECRET;
  if (!secret) {
    throw createError({ statusCode: 500, statusMessage: "APP_SECRET not configured" });
  }

  // Accept either the raw APP_SECRET or an OAuth-issued token
  if (token !== secret && !validateOAuthToken(token)) {
    throw createError({ statusCode: 403, statusMessage: "Invalid token" });
  }
}

// In-memory store for OAuth access tokens (maps token -> expiry timestamp)
const oauthTokens = new Map<string, number>();

export function storeOAuthToken(token: string, expiresInSeconds: number): void {
  oauthTokens.set(token, Date.now() + expiresInSeconds * 1000);
}

function validateOAuthToken(token: string): boolean {
  const expiry = oauthTokens.get(token);
  if (!expiry) return false;
  if (Date.now() > expiry) {
    oauthTokens.delete(token);
    return false;
  }
  return true;
}

// In-memory store for OAuth authorization codes
const authCodes = new Map<
  string,
  {
    expiresAt: number;
    codeChallenge?: string;
    codeChallengeMethod?: string;
    redirectUri: string;
    clientId: string;
  }
>();

export function storeAuthCode(
  code: string,
  data: {
    expiresAt: number;
    codeChallenge?: string;
    codeChallengeMethod?: string;
    redirectUri: string;
    clientId: string;
  },
): void {
  authCodes.set(code, data);
}

export function consumeAuthCode(
  code: string,
): {
  codeChallenge?: string;
  codeChallengeMethod?: string;
  redirectUri: string;
  clientId: string;
} | null {
  const data = authCodes.get(code);
  if (!data) return null;
  authCodes.delete(code);
  if (Date.now() > data.expiresAt) return null;
  return data;
}
