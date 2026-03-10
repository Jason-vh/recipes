import { migrate } from "drizzle-orm/postgres-js/migrator";
import { db } from "../db";

async function runWithRetry(fn: () => Promise<void>, retries = 10, delay = 3000) {
  for (let i = 0; i < retries; i++) {
    try {
      await fn();
      return;
    } catch (error: any) {
      if (i === retries - 1) throw error;
      console.log(`Migration attempt ${i + 1}/${retries} failed (${error?.message || error}), retrying in ${delay}ms...`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}

export default defineNitroPlugin(async () => {
  // Run migrations in the background so the server can start and pass healthchecks
  // even if the database isn't immediately available
  (async () => {
    try {
      console.log("Running database migrations...");
      await runWithRetry(async () => {
        await migrate(db, { migrationsFolder: "drizzle" });
      });
      console.log("Database migrations complete.");
    } catch (error) {
      console.error("Migration failed after all retries:", error);
    }
  })();
});
