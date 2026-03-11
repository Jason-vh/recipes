# Recipes

Personal recipe collection at [recipes.vhtm.eu](https://recipes.vhtm.eu). Built with Nuxt 4 and PostgreSQL, deployed on Railway.

Anyone can browse and search recipes. Writes are protected behind auth.

The app exposes an MCP endpoint, so I can create and edit recipes from Claude.ai (mobile or web) using natural language. The MCP integration uses OAuth 2.1; the web UI uses simple bearer token auth.

## Tech stack

Bun, Nuxt 4, PostgreSQL, Drizzle ORM, Tailwind CSS, MCP SDK (`@modelcontextprotocol/sdk` + `mcp-auth`)

## MCP tools

`list_recipes`, `get_recipe`, `create_recipe`, `update_recipe`, `delete_recipe`, `list_tags`

## Local development

```bash
bun install
bun run dev
```

Runs at `http://localhost:3000`.

### Environment variables

| Variable       | Description                          |
| -------------- | ------------------------------------ |
| `DATABASE_URL` | PostgreSQL connection string         |
| `APP_SECRET`   | Secret for auth tokens               |
| `APP_URL`      | Public URL (defaults to `localhost`)  |

### Database

Migrations live in `./drizzle`, schema in `./server/db/schema.ts`.

```bash
# generate a migration after changing the schema
bunx drizzle-kit generate

# apply migrations
bunx drizzle-kit migrate
```

## Linting and formatting

oxlint + oxfmt, enforced by lefthook on commit.

```bash
bun run lint
bun run format
bun run format:check
```

## Deployment

Deployed on Railway (app + managed Postgres) via Dockerfile. Push to main and it deploys.

Config is in `railway.toml`.
