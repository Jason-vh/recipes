import { migrate } from "drizzle-orm/postgres-js/migrator";
import { db } from "../db";

async function runWithRetry(fn: () => Promise<void>, retries = 5, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      await fn();
      return;
    } catch (error) {
      if (i === retries - 1) throw error;
      console.log(`Migration attempt ${i + 1} failed, retrying in ${delay}ms...`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}

export default defineNitroPlugin(async () => {
  console.log("Running database migrations...");
  await runWithRetry(async () => {
    await migrate(db, { migrationsFolder: "drizzle" });
  });
  console.log("Database migrations complete.");
});
