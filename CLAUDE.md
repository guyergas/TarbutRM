@AGENTS.md

# TarbutRM - Internal Store Management System

## Project Overview

TarbutRM is a Next.js-based internal store/inventory management system with:
- Real-time inventory tracking
- Order management and fulfillment
- Admin dashboard for menu & item management
- Image upload with cropping functionality
- Multi-role authentication (Admin, Staff, User)
- RTL support for Hebrew interface
- Dark mode support

## Technology Stack

- **Frontend:** Next.js 15+ with TypeScript, Tailwind CSS
- **Backend:** Next.js API routes with server actions
- **Database:** PostgreSQL 15+ with Prisma ORM
- **Authentication:** NextAuth.js with credentials provider
- **Containers:** Docker & Docker Compose
- **Deployment:** Systemd services on Linux

## Key Architecture Decisions

### Database Persistence
- Uses **named Docker volume** (`tarbutrm_postgres_data`) mounted to `/var/lib/tarbutrm/postgres`
- Data persists across container restarts
- **CRITICAL:** Use `make stop` (safe) not `docker compose down -v` (destructive)

### Image Handling
- Crop box size defaults to container size (309px) for frame-filling UX
- Slider maximum limited to crop frame size (not image size)
- Images compressed to JPEG 0.8 quality to prevent serialization errors
- Base64 data URLs used for seamless client-server transfer

### Routing & Components
- `/admin/*` routes removed (orphaned, no UI links) - ItemEditor moved to `/src/components/`
- Store page (`/store/[menuId]`) handles item management via `UnifiedItemModal`
- New items created via `CreateItemModal` (uses shared `ItemEditor` component)
- Admin panel accessible via `/admin/users` link in top navigation

### Authentication
- NextAuth.js with custom credentials provider
- Session stored in database (`Session` model)
- Verification tokens for password reset flow
- User roles: `ADMIN`, `STAFF`, `USER`

## Development & Deployment

### Running the Environment

This project uses **systemd services** for persistent, background execution.

**Development Environment**
```bash
make run          # Start dev service (http://localhost:3001)
make stop         # Stop all services
sudo systemctl status tarbutrm-dev  # Check service status
sudo systemctl logs -u tarbutrm-dev  # View logs
```

**Production Environment**
```bash
make prod         # Start prod service (http://localhost:80)
sudo systemctl status tarbutrm-prod # Check service status
sudo systemctl logs -u tarbutrm-prod # View logs
```

**Direct Service Management**
```bash
sudo systemctl start tarbutrm-dev
sudo systemctl stop tarbutrm-dev
sudo systemctl restart tarbutrm-dev
sudo systemctl enable tarbutrm-dev   # Auto-start on boot
sudo systemctl disable tarbutrm-dev  # Disable auto-start
```

### Database Management

**Backup Database**
```bash
make store              # Backup dev database
make store ENV=prod     # Backup prod database
```

**Restore Database**
```bash
make load                                        # Restore from latest backup
make load FILE=backups/backup_20260411.sql       # Restore specific backup
make load ENV=prod FILE=backups/backup_*.sql     # Restore prod database
```

**Migrations & Seeding**
```bash
make migrate            # Run Prisma migrations
make seed              # Run database seed script
```

## Important Files & Locations

### Core Application Files
- `/src/app/(app)/` - Protected app routes
- `/src/app/api/` - API endpoints
- `/src/components/ItemEditor.tsx` - Reusable item editor (was in /admin/items/[id]/)
- `/src/modules/` - Business logic and services
- `/prisma/schema.prisma` - Database schema
- `/docker-compose.yml` - Docker configuration
- `/Makefile` - Build and deployment commands

### Database Utilities
- `/prisma/import-cocktails.ts` - Import menu items from JSON
- `/prisma/update-password.ts` - Update user password with bcrypt hashing
- `/prisma/seed.ts` - Initial database seeding

### Backup & Snapshots
- `/backups/latest.sql` - Current database snapshot (symlink)
- `/backups/backup_TIMESTAMP.sql` - Historical backups

## Development Guidelines

### When Modifying Image Cropping
- Default crop size set in `useEffect` when cropper mounts
- Both `UnifiedItemModal.tsx` and `/src/components/ItemEditor.tsx` need updates
- Slider max controlled by `maxCropSize` state
- Container size measured via `cropperContainerRef.current.offsetWidth`

### When Adding New Routes
- Routes in `src/app/(app)/` are protected by middleware
- Check that they're linked from navigation or called from code
- Orphaned routes (no incoming links) should be removed or documented

### Database Schema Changes
- All schema changes in `/prisma/schema.prisma`
- Create migrations with: `npx prisma migrate dev --name <migration_name>`
- Push migrations with: `make migrate`

### Server Actions & Forms
- Use `"use server"` directive for server-side logic
- Pass primitives (string, number, boolean) to avoid serialization issues
- Large data (images) should be JPEG 0.8 quality or lower
- Test with `make run` before committing

## Security Considerations

### DevTools
- **Disabled in production** (`NODE_ENV !== "development"`)
- Only enabled in development for debugging
- Eruda devtools won't load on production deployments

### Authentication
- All `/api/` routes check `session?.user.role`
- Admin-only operations check `role === "ADMIN"`
- Passwords hashed with bcryptjs (10 rounds)
- NEXTAUTH_SECRET must be strong and unique per environment

### Database
- Use parameterized queries (Prisma handles this)
- Never expose raw SQL or connection strings in client code
- Validate user role before modifying data

## Important Notes

- Services defined in `/etc/systemd/system/tarbutrm-*.service`
- All services restart automatically on failure
- Logs sent to systemd journal (use `systemctl logs` to view)
- Only one environment (dev or prod) can run simultaneously (port conflicts)
- Database volume survives container restarts and updates
- Always backup before major changes (`make store`)

