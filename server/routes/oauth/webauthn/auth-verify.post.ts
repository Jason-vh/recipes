import { readBody, createError } from "h3";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import { randomBytes } from "crypto";
import { db } from "../../../db";
import { passkeys } from "../../../db/schema";
import { eq } from "drizzle-orm";
import { storeAuthCode } from "../../../utils/auth";
import { authChallenges } from "./auth-options.post";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { challengeId, credential, oauth } = body;

  const stored = authChallenges.get(challengeId);
  if (!stored || Date.now() > stored.expiresAt) {
    authChallenges.delete(challengeId);
    throw createError({ statusCode: 400, statusMessage: "Challenge expired" });
  }
  authChallenges.delete(challengeId);

  // Find the credential in the database
  const [passkey] = await db
    .select()
    .from(passkeys)
    .where(eq(passkeys.credentialId, credential.id))
    .limit(1);

  if (!passkey) {
    throw createError({ statusCode: 400, statusMessage: "Unknown credential" });
  }

  const appUrl = process.env.APP_URL || "http://localhost:3000";

  const verification = await verifyAuthenticationResponse({
    response: credential,
    expectedChallenge: stored.challenge,
    expectedOrigin: appUrl,
    expectedRPID: new URL(appUrl).hostname,
    credential: {
      id: passkey.credentialId,
      publicKey: Buffer.from(passkey.publicKey, "base64url"),
      counter: passkey.counter,
    },
  });

  if (!verification.verified) {
    throw createError({ statusCode: 400, statusMessage: "Verification failed" });
  }

  // Update counter
  await db
    .update(passkeys)
    .set({ counter: verification.authenticationInfo.newCounter })
    .where(eq(passkeys.id, passkey.id));

  // Issue OAuth authorization code
  const code = randomBytes(32).toString("hex");
  storeAuthCode(code, {
    expiresAt: Date.now() + 5 * 60 * 1000,
    codeChallenge: oauth.code_challenge,
    codeChallengeMethod: oauth.code_challenge_method,
    redirectUri: oauth.redirect_uri,
    clientId: oauth.client_id,
  });

  const redirectUrl = new URL(oauth.redirect_uri);
  redirectUrl.searchParams.set("code", code);
  if (oauth.state) redirectUrl.searchParams.set("state", oauth.state);

  return { redirect: redirectUrl.toString() };
});
