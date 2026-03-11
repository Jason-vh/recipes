import { readBody, createError } from "h3";
import { generateRegistrationOptions } from "@simplewebauthn/server";
import { db } from "../../../db";
import { passkeys } from "../../../db/schema";

// Temporary challenge store (in-memory, keyed by a random ID)
const challenges = new Map<string, { challenge: string; expiresAt: number }>();
export { challenges as registrationChallenges };

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  // Require APP_SECRET for registration
  if (body.secret !== process.env.APP_SECRET) {
    throw createError({ statusCode: 403, statusMessage: "Invalid secret" });
  }

  const appUrl = process.env.APP_URL || "http://localhost:3000";
  const rpID = new URL(appUrl).hostname;

  const existingCredentials = await db.select().from(passkeys);

  const options = await generateRegistrationOptions({
    rpName: "Recipes",
    rpID,
    userName: "owner",
    userDisplayName: "Owner",
    attestationType: "none",
    excludeCredentials: existingCredentials.map((c) => ({
      id: c.credentialId,
    })),
    authenticatorSelection: {
      residentKey: "preferred",
      userVerification: "preferred",
    },
  });

  // Store challenge for verification
  const challengeId = crypto.randomUUID();
  challenges.set(challengeId, {
    challenge: options.challenge,
    expiresAt: Date.now() + 5 * 60 * 1000,
  });

  return { options, challengeId };
});
