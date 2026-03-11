import { readBody, createError } from "h3";
import { verifyRegistrationResponse } from "@simplewebauthn/server";
import { db } from "../../../db";
import { passkeys } from "../../../db/schema";
import { registrationChallenges } from "./register-options.post";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { challengeId, credential, secret } = body;

  // Require APP_SECRET for registration
  if (secret !== process.env.APP_SECRET) {
    throw createError({ statusCode: 403, statusMessage: "Invalid secret" });
  }

  const stored = registrationChallenges.get(challengeId);
  if (!stored || Date.now() > stored.expiresAt) {
    registrationChallenges.delete(challengeId);
    throw createError({ statusCode: 400, statusMessage: "Challenge expired" });
  }
  registrationChallenges.delete(challengeId);

  const appUrl = process.env.APP_URL || "http://localhost:3000";
  const rpID = new URL(appUrl).hostname;
  const origin = appUrl;

  const verification = await verifyRegistrationResponse({
    response: credential,
    expectedChallenge: stored.challenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
  });

  if (!verification.verified || !verification.registrationInfo) {
    throw createError({ statusCode: 400, statusMessage: "Verification failed" });
  }

  const { credential: cred } = verification.registrationInfo;

  // Store as base64url strings
  await db.insert(passkeys).values({
    credentialId: cred.id,
    publicKey: Buffer.from(cred.publicKey).toString("base64url"),
    counter: cred.counter,
  });

  return { success: true };
});
