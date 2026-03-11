# Recipes App

## Database Migrations

**Never write migration files by hand.** Always use `bunx drizzle-kit generate` to create migrations. If the interactive prompt blocks in the CLI, ask the user to run it interactively. Never use `drizzle-kit push`.

Hand-written migrations cause issues:
- Missing snapshot files in `drizzle/meta/`
- Incorrect `when` timestamps in `_journal.json` (must be newer than all previous entries)
- Drizzle migrator silently skips migrations it thinks are already applied

After generating, review the SQL — drizzle-kit may include redundant statements (e.g., re-creating tables or dropping tables that were already handled by earlier migrations due to stale snapshots). Remove any redundant statements before committing.

Migrations run automatically on startup via `server/plugins/migrate.ts` (non-blocking with retries).

## Deployment

- Railway deploys on push to `main`
- Custom domain: `recipes.vhtm.eu`
- DATABASE_URL uses Railway internal networking (`postgres.railway.internal`)

## Code Style

- oxfmt for formatting, oxlint for linting (enforced by lefthook pre-commit)
- Bun as runtime and package manager
