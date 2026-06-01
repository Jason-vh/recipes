# exe.dev deployment — recipes

Production is live at:

```text
https://recipes.vhtm.eu
```

Hosted on the shared `vhtm-eu` VM. The arch + conventions live in
<https://github.com/Jason-vh/vhtm.eu>. This file is just the per-app
runbook.

## Architecture

```text
client
  -> https://recipes.vhtm.eu
  -> exe.dev edge (TLS termination)
  -> vhtm-eu VM :8080
  -> Caddy (host-matched via apps/recipes/deploy/caddy.snippet)
  -> 127.0.0.1:3002
  -> recipes app container (Nuxt + Bun)
  -> shared Postgres on the apps-net Docker network (DB: recipes)
```

## Files in this directory

| File | Purpose |
|---|---|
| `caddy.snippet` | Routing for `recipes.vhtm.eu` → `127.0.0.1:3002`. Imported by `/etc/caddy/Caddyfile` via `apps/*/deploy/caddy.snippet`. |
| `env.production.example` | Shape of `.env.production` (written by CI from secrets, not committed). |
| `README.md` | This file. |

## One-time exe.dev / DNS setup

```bash
# Register the hostname with the exe.dev edge:
ssh exe.dev domain add vhtm-eu recipes.vhtm.eu

# DNS at Porkbun:
#   recipes.vhtm.eu  CNAME  vhtm-eu.exe.xyz
```

## GitHub Actions secrets

| Secret | Source |
|---|---|
| `APP_SECRET` | App-level Bearer token / session secret. Keep stable across deploys. |
| `RECIPES_DB_PASSWORD` | Password for the `recipes` role in the shared Postgres. Set once when the DB was created (see <https://github.com/Jason-vh/vhtm.eu/blob/main/infra/postgres/README.md>). |

## Deploy

Every push to `main`:

1. Runs on the self-hosted runner labeled `recipes-prod`.
2. Writes `.env.production` from GitHub Actions secrets.
3. Copies the checkout into `/home/exedev/apps/recipes`.
4. `docker compose up -d --build` from that stable directory.
5. `caddy validate` + `systemctl reload caddy` so any change to
   `deploy/caddy.snippet` takes effect.
6. Migrations apply automatically on app startup via
   `server/plugins/migrate.ts`.

## Operations

```bash
ssh vhtm-eu.exe.xyz
cd /home/exedev/apps/recipes

# Container status:
docker compose ps

# App logs:
docker compose logs -f app

# Restart app:
docker compose restart app

# Open a DB shell as the recipes role:
docker compose -f /home/exedev/infra/postgres/docker-compose.yml exec postgres \
  psql -U recipes -d recipes
```

## Database

This app has one database in the shared Postgres instance, owned by the
`recipes` role:

```text
host: postgres (over the apps-net Docker network)
db:   recipes
user: recipes
```

DB administration runbooks (create, dump, restore) live with the shared
instance: <https://github.com/Jason-vh/vhtm.eu/blob/main/infra/postgres/README.md>.

## Public site check

```bash
curl -I https://recipes.vhtm.eu
```
