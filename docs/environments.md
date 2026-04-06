# Environments

## Overview

Everything runs on a single VM using Docker Compose. Two environments share the same Postgres container but use **separate databases**.

| Environment | Command | DB | Port | Use |
|-------------|---------|-----|------|-----|
| Dev / Test | `make run` | `tarbutrm_dev` | 3000 | Daily testing on VM |
| Production | `make prod` | `tarbutrm_prod` | 80 | Live system |

---

## Quick Start

### First-time setup on the VM
```bash
git clone https://github.com/guyergas/TarbutRM.git && cd TarbutRM
cp .env.example .env.dev   # fill in: POSTGRES_PASSWORD, AUTH_SECRET, NEXTAUTH_URL
cp .env.example .env.prod  # fill in: POSTGRES_PASSWORD (same), AUTH_SECRET (different), NEXTAUTH_URL
make run                   # starts dev environment
make migrate               # applies DB migrations → creates tarbutrm_dev
make seed                  # creates the first ADMIN user
# open http://<vm-ip>:3000
```

### Daily dev workflow
```bash
make run       # start (or restart after reboot)
make stop      # stop all containers
make logs      # tail app logs
make shell     # open shell inside app container
```

### Backup and restore
```bash
make store              # backup tarbutrm_dev → backups/backup_TIMESTAMP.sql
make store ENV=prod     # backup tarbutrm_prod
make load               # restore tarbutrm_dev from backups/latest.sql  ⚠ destructive
make load ENV=prod      # restore tarbutrm_prod from backups/latest.sql ⚠ destructive
make load FILE=backups/backup_20260401_120000.sql ENV=prod  # restore specific file
```

### Switching to production
```bash
make stop                # stop dev
make prod                # build + start prod (port 80)
make migrate ENV=prod    # apply migrations to tarbutrm_prod
make seed ENV=prod       # first time only — creates ADMIN user
# open http://<vm-ip>
```

### App healthcheck
Both dev and prod containers expose `GET /api/health → { status: "ok" }`.
Docker monitors this endpoint to determine container health status.

---

## Docker Compose Architecture

```
VM
├── docker-compose.yml        ← Postgres service + named volume (shared base)
├── docker-compose.dev.yml    ← App in dev mode, port 3000, .env.dev
├── docker-compose.prod.yml   ← App in prod mode, port 80, .env.prod
└── backups/                  ← DB dump files (make store / make load)
```

**Postgres** runs in a single container. Both `tarbutrm_dev` and `tarbutrm_prod` databases live inside it.

**Named volume** `pg_data` stores all Postgres data. Persists across container restarts, rebuilds, and `docker compose down`. Destroyed only by `docker volume rm pg_data` — no Make target ever does this.

---

## Makefile Commands

```makefile
make run              # Build + start dev environment (hot reload, tarbutrm_dev)
make prod             # Build + start production environment (optimized build, tarbutrm_prod)
make stop             # Stop all containers
make store            # Dump prod DB → backups/backup_YYYYMMDD_HHMMSS.sql + symlink latest.sql
make load             # Restore prod DB from backups/latest.sql (destructive)
make load FILE=x.sql  # Restore from specific file
make load ENV=dev     # Restore into dev DB instead of prod
make migrate          # Run Prisma migrations on dev DB
make migrate ENV=prod # Run Prisma migrations on prod DB
make seed             # Run seed script on dev DB
make seed ENV=prod    # Run seed script on prod DB (first deploy only)
make logs             # Tail app container logs
make shell            # Open shell inside app container
```

---

## Backup / Restore

### `make store`
- Dumps `tarbutrm_prod` using `pg_dump`
- Saves to: `./backups/backup_YYYYMMDD_HHMMSS.sql`
- Symlinks `./backups/latest.sql` → most recent backup

### `make load`
- **Destructive** — drops and recreates the target database
- Default: restores `tarbutrm_prod` from `./backups/latest.sql`
- Optional args:
  ```bash
  make load FILE=backups/backup_20260401_120000.sql   # specific file
  make load ENV=dev                                    # restore into dev DB
  make load FILE=backups/backup_20260401.sql ENV=dev  # both
  ```

Backup files are plain SQL — portable, inspectable, can be committed for small seed datasets.

---

## Environment Variables

Two `.env` files, never committed. Use `.env.example` as template.

**`.env.dev`** (used by `make run`)
```env
DATABASE_URL="postgresql://postgres:password@db:5432/tarbutrm_dev"
AUTH_SECRET="<random 32+ char secret — different from prod>"
NEXTAUTH_URL="http://<vm-ip>:3000"
NODE_ENV="development"
SEED_ADMIN_EMAIL="admin@example.com"
SEED_ADMIN_PASSWORD="<initial admin password>"
```

**`.env.prod`** (used by `make prod`)
```env
DATABASE_URL="postgresql://postgres:password@db:5432/tarbutrm_prod"
AUTH_SECRET="<random 32+ char secret — different from dev>"
NEXTAUTH_URL="http://<vm-ip>"
NODE_ENV="production"
SEED_ADMIN_EMAIL="admin@example.com"
SEED_ADMIN_PASSWORD="<initial admin password>"
```

`AUTH_SECRET` must be unique per environment. Generate with: `openssl rand -base64 32`

---

## First-Time Setup on VM

```bash
git clone https://github.com/guyergas/TarbutRM.git
cd TarbutRM

cp .env.example .env.dev    # fill in values
cp .env.example .env.prod   # fill in values

make prod                   # build + start production containers
make migrate ENV=prod        # apply DB migrations to prod DB
make seed ENV=prod           # create first ADMIN user
```

Open `http://<vm-ip>` — system is live.

---

## DB Separation

| Database | Used by | Created by |
|----------|---------|-----------|
| `tarbutrm_dev` | `make run` | `make migrate` (first run) |
| `tarbutrm_prod` | `make prod` | `make migrate ENV=prod` (first run) |

The two databases are fully isolated. Running `make run` never touches `tarbutrm_prod`. Running `make prod` never touches `tarbutrm_dev`.

---

## Migration Strategy

- All schema changes via Prisma migrations (committed to git under `prisma/migrations/`)
- Never use `prisma db push` or `prisma migrate dev` against prod
- Always apply to dev first, verify, then apply to prod:
  ```bash
  make migrate          # dev first
  make migrate ENV=prod # prod after verification
  ```
- Destructive migrations (drop column, rename) require a manual review step before prod

---

## Secrets Management

- Local `.env.dev` and `.env.prod` files — gitignored
- `AUTH_SECRET` is unique per environment
- Postgres password set in both `.env` files and `docker-compose.yml` (or override via env)
- No secrets ever committed to git
