import { migrate } from "drizzle-orm/postgres-js/migrator";
import { db } from "../db";

export default defineNitroPlugin(async () => {
  console.log("Running database migrations...");
  try {
    await migrate(db, { migrationsFolder: "drizzle" });
    console.log("Database migrations complete.");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
});
