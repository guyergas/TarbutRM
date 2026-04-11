# TarbutRM - Internal Store Management System

A Next.js-based internal store management system with real-time inventory management, order tracking, and admin controls.

## Prerequisites

- **Docker** & **Docker Compose** - for containerized deployment
- **Node.js 18+** - for local development
- **PostgreSQL 15+** - database (runs in container)
- **Make** - for simplified command execution

## Quick Start

### Development Environment

```bash
# Start dev server (runs on port 3001)
make run

# Stop all services
make stop

# View dev logs
make logs
```

### Production Environment

```bash
# Start production server (runs on port 80, reverse-proxied via nginx)
make prod ENV=prod

# Stop production
make stop
```

## Installation & First-Time Setup

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/guyergas/TarbutRM.git
cd TarbutRM
npm install
```

### 2. Configure Environment Variables

Create `.env.dev` and `.env.prod` files in the project root:

**`.env.dev`** (Development)
```bash
DATABASE_URL="postgresql://postgres:password@db:5432/tarbutrm_dev"
NEXTAUTH_URL="http://localhost:3001"
NEXTAUTH_SECRET="your-secret-key-here"
```

**`.env.prod`** (Production)
```bash
DATABASE_URL="postgresql://postgres:password@db:5432/tarbutrm_prod"
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-secret-key-here"
```

### 3. Start the Application

```bash
# Development
make run

# Production
make prod ENV=prod
```

### 4. Initialize Database (First Time Only)

```bash
# Run migrations
make migrate

# Load initial data (optional - if you have a backup)
make load FILE=backups/latest.sql
```

## Database Management

### Backup Database

```bash
# Backup dev database
make store

# Backup prod database
make store ENV=prod

# Output: backups/backup_YYYYMMDD_HHMMSS.sql (also symlinked as latest.sql)
```

### Restore Database

```bash
# Restore dev database from latest backup
make load

# Restore from specific backup
make load FILE=backups/backup_20260411_141213.sql

# Restore prod database
make load ENV=prod FILE=backups/backup_20260411_141213.sql
```

### Important: Database Persistence

The database uses a **named Docker volume** for persistence:
- Volume: `tarbutrm_postgres_data`
- Mount point: `/var/lib/tarbutrm/postgres`

**Do NOT use `docker compose down -v`** (removes volume). Use:
```bash
make stop  # Safe - preserves data
```

## Development Workflows

### Starting Fresh

```bash
# Stop services
make stop

# Start fresh dev environment
make run

# Create/update database schema
make migrate
```

### Database Seeding

```bash
# Run seed script (imports initial data)
make seed
```

### Running Locally Without Docker

```bash
npm run dev
# Requires DATABASE_URL pointing to local/remote PostgreSQL
```

## Available Commands

| Command | Purpose |
|---------|---------|
| `make run` | Start dev environment (port 3001) |
| `make prod` | Start production environment (port 80) |
| `make stop` | Stop all services |
| `make store` | Backup database to `backups/backup_TIMESTAMP.sql` |
| `make load` | Restore database from backup |
| `make migrate` | Run Prisma migrations |
| `make seed` | Run database seed script |
| `make logs` | View app container logs |
| `make shell` | Open shell in app container |

## Deployment on New Server

### Prerequisites Check

- [ ] Docker & Docker Compose installed
- [ ] Make installed
- [ ] Git cloned
- [ ] `.env.dev` and `.env.prod` created with valid credentials

### Fresh Deployment Checklist

```bash
# 1. Clone repo
git clone https://github.com/guyergas/TarbutRM.git
cd TarbutRM

# 2. Install Node dependencies
npm install

# 3. Configure environment (.env.dev and .env.prod)
# - Set DATABASE_URL
# - Set NEXTAUTH_SECRET (generate new random string)
# - Set NEXTAUTH_URL for your domain

# 4. Start development environment
make run

# 5. Run migrations (creates tables)
make migrate

# 6. (Optional) Load backup from existing installation
make load FILE=backups/latest.sql

# 7. Verify deployment
# Visit http://YOUR-IP:3001
# Check "Dev environment is ready!" message
```

### For Production Deployment

```bash
# Start production instead of dev
make prod ENV=prod

# Verify production (port 80)
# Visit http://YOUR-DOMAIN
```

## Project Structure

```
src/
├── app/
│   ├── (app)/          # Main app routes (protected)
│   │   ├── admin/      # Admin panel
│   │   ├── store/      # Store/inventory management
│   │   ├── orders/     # Order management
│   │   └── profile/    # User profile
│   ├── api/            # API endpoints
│   └── auth/           # Authentication
├── components/         # Reusable components
├── lib/                # Utilities and helpers
└── modules/            # Business logic modules

prisma/
├── schema.prisma       # Database schema
├── seed.ts             # Database seeding
├── import-cocktails.ts # Utility: import menu items
└── update-password.ts  # Utility: password management

backups/
├── latest.sql          # Latest database backup (symlink)
└── backup_*.sql        # Historical backups
```

## Key Features

- **Admin Dashboard** - Manage menu items, inventory, orders
- **Real-time Inventory** - Track stock levels across items
- **Order Management** - Create, track, and fulfill orders
- **User Roles** - Admin, Staff, User with role-based access
- **Image Cropping** - Upload and crop item images
- **Database Snapshots** - Backup and restore functionality
- **Dark Mode** - RTL-friendly interface with theme support

## Troubleshooting

### Service Won't Start

```bash
# Check systemd service status
sudo systemctl status tarbutrm-dev

# View detailed logs
sudo systemctl logs -u tarbutrm-dev

# Restart service
sudo systemctl restart tarbutrm-dev
```

### Database Connection Issues

```bash
# Verify database is running
docker ps | grep db

# Check database logs
docker logs tarbutrm-db-1

# Verify environment variables
cat .env.dev | grep DATABASE_URL
```

### Port Already in Use

```bash
# Dev uses port 3001, Prod uses port 80
# Check what's using the port:
lsof -i :3001  # Dev
lsof -i :80    # Prod

# Stop conflicting services
sudo systemctl stop <service-name>
```

## Database Utilities

### Import Cocktails Menu

```bash
# Script location: prisma/import-cocktails.ts
# Imports 14 cocktail items with full descriptions
docker exec tarbutrm-app-1 npx tsx prisma/import-cocktails.ts
```

### Update User Password

```bash
# Script location: prisma/update-password.ts
# Updates admin password using bcryptjs hashing
docker exec tarbutrm-app-1 npx tsx prisma/update-password.ts
```

## Environment Variables Reference

| Variable | Purpose | Example |
|----------|---------|---------|
| `DATABASE_URL` | PostgreSQL connection | `postgresql://user:pass@db:5432/tarbutrm_dev` |
| `NEXTAUTH_URL` | Authentication callback URL | `http://localhost:3001` |
| `NEXTAUTH_SECRET` | Session encryption key | `your-random-secret-string` |

## Support

For issues, check:
1. Service logs: `sudo systemctl logs -u tarbutrm-dev`
2. Docker logs: `docker logs tarbutrm-app-1`
3. Systemd status: `sudo systemctl status tarbutrm-dev`

## Notes

- Database persists across container restarts (volume-mounted)
- Only one environment (dev/prod) can run simultaneously (port conflicts)
- NEXTAUTH_SECRET should be a strong random string for production
- Backups are stored in `backups/` directory with timestamps
- `latest.sql` symlink always points to most recent backup
