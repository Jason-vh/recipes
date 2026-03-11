# Recipes App

## Database Migrations

**Never write migration files by hand.** Always use `bunx drizzle-kit generate` to create migrations. If the interactive prompt blocks in the CLI, run it outside of Claude Code so you can select the correct option.

Hand-written migrations cause issues:
- Missing snapshot files in `drizzle/meta/`
- Incorrect `when` timestamps in `_journal.json` (must be newer than all previous entries)
- Drizzle migrator silently skips migrations it thinks are already applied

After generating, verify the SQL and journal entry look correct before committing.

Migrations run automatically on startup via `server/plugins/migrate.ts` (non-blocking with retries).

## Deployment

- Railway deploys on push to `main`
- Custom domain: `recipes.vhtm.eu`
- DATABASE_URL uses Railway internal networking (`postgres.railway.internal`)

## Code Style

- oxfmt for formatting, oxlint for linting (enforced by lefthook pre-commit)
- Bun as runtime and package manager
