import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { db } from "../../../db";
import { passkeys } from "../../../db/schema";

const challenges = new Map<string, { challenge: string; expiresAt: number }>();
export { challenges as authChallenges };

export default defineEventHandler(async () => {
  const credentials = await db.select().from(passkeys);

  if (credentials.length === 0) {
    throw createError({ statusCode: 400, statusMessage: "No passkeys registered" });
  }

  const options = await generateAuthenticationOptions({
    rpID: new URL(process.env.APP_URL || "http://localhost:3000").hostname,
    allowCredentials: credentials.map((c) => ({ id: c.credentialId })),
    userVerification: "preferred",
  });

  const challengeId = crypto.randomUUID();
  challenges.set(challengeId, {
    challenge: options.challenge,
    expiresAt: Date.now() + 5 * 60 * 1000,
  });

  return { options, challengeId };
});
