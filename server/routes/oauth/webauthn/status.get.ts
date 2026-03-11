import { db } from "../../../db";
import { passkeys } from "../../../db/schema";
import { count } from "drizzle-orm";

export default defineEventHandler(async () => {
  const [result] = await db.select({ count: count() }).from(passkeys);
  return { registered: result.count > 0 };
});
