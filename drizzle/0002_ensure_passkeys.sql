CREATE TABLE IF NOT EXISTS "passkeys" (
	"id" serial PRIMARY KEY NOT NULL,
	"credential_id" text NOT NULL,
	"public_key" text NOT NULL,
	"counter" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "passkeys_credential_id_unique" UNIQUE("credential_id")
);
--> statement-breakpoint
DROP TABLE IF EXISTS "tags" CASCADE;
--> statement-breakpoint
DROP TABLE IF EXISTS "recipe_tags" CASCADE;
