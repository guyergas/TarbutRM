# Backlog

Tasks grouped by phase. One task at a time. Check off only when committed and approved.

---

## Phase 1 — Foundation (Auth + RBAC + User Management)

### Infrastructure
- [x] P1-01 Initialize Next.js project (TypeScript, Tailwind, ESLint, Prettier)
- [x] P1-02 Create `docker-compose.yml` — Postgres with named volume `pg_data`
- [x] P1-03 Create `docker-compose.dev.yml` — app in dev mode, port 3000, `.env.dev`
- [x] P1-04 Create `docker-compose.prod.yml` — app in prod mode, port 80, `.env.prod`
- [x] P1-05 Create `Makefile` with targets: `run`, `prod`, `stop`, `store`, `load`, `migrate`, `seed`, `logs`, `shell`
- [x] P1-06 Create `.env.example` with all required variables documented

### Database & Auth Setup
- [ ] P1-07 Configure Prisma with PostgreSQL (`DATABASE_URL` via Docker Compose)
- [ ] P1-08 Define `User` model: `id`, `name`, `email`, `passwordHash`, `role` (enum: USER/STAFF/ADMIN), `balance` (Decimal, default 0), `active`, `createdAt`, `updatedAt`, `createdBy?`
- [ ] P1-09 Create initial Prisma migration
- [ ] P1-10 Configure Auth.js: credentials provider, **database session strategy** (Prisma adapter), `Session` + `VerificationToken` tables
- [ ] P1-11 Create seed script: creates first ADMIN user (email + password from env)

### Auth Flows
- [ ] P1-12 Login page (`/login`) + Server Action (validate credentials, start session)
- [ ] P1-13 Logout Server Action (`signOut`, redirect to `/login`)
- [ ] P1-14 Session-aware nav: show user name, role badge, logout button

### RBAC & Route Protection
- [ ] P1-15 `middleware.ts`: protect all non-public routes, redirect unauthenticated to `/login`, redirect wrong-role to own home
- [ ] P1-16 `lib/rbac.ts`: role guard helpers used in service layer (second line of defense)
- [ ] P1-17 Role-based layout shells: USER layout, STAFF layout, ADMIN layout (separate navs)

### User Module (`/src/modules/user/`)
- [ ] P1-18 `userService.createUser(data, actorId)` — ADMIN only, hashes password, sets `createdBy`
- [ ] P1-19 `userService.getUserById(id)`
- [ ] P1-20 `userService.listUsers(filters?)` — supports filter by role and active status
- [ ] P1-21 `userService.changeRole(userId, newRole, actorId)` — ADMIN only; deletes all target user sessions after change
- [ ] P1-22 `userService.setActive(userId, active, actorId)` — ADMIN only; on deactivate, deletes all target user sessions immediately
- [ ] P1-23 `userService.resetPassword(userId, newPassword, actorId)` — ADMIN only; bcrypt hash; deletes all target user sessions after reset

### Admin Screens
- [ ] P1-24 `/admin/users` — user list (name, email, role, status, created date); link to detail
- [ ] P1-25 `/admin/users/new` — create user form (name, email, password, role); Server Action calls `userService.createUser`
- [ ] P1-26 `/admin/users/[id]` — user detail page:
  - Display: name, email, role, active status, createdAt, createdBy
  - Actions: change role (dropdown + save), activate/deactivate (toggle button), reset password (form)

### Placeholder Pages (for other roles to land somewhere)
- [ ] P1-27 `/dashboard` — minimal authenticated landing for USER role
- [ ] P1-28 `/staff/queue` — placeholder for STAFF role (message: "Coming soon")

### Tests
- [ ] P1-29 Unit: `userService.createUser` (success, duplicate email, invalid role)
- [ ] P1-30 Unit: `userService.changeRole`, `setActive`, `resetPassword`
- [ ] P1-31 Unit: RBAC guard helpers (allow/deny per role)
- [ ] P1-32 E2E: admin login → create user → logout
- [ ] P1-33 E2E: new user login → sees dashboard → logout (session cleared, `/login` redirects correctly)
- [ ] P1-34 E2E: unauthenticated access to `/dashboard` redirects to `/login`
- [ ] P1-35 E2E: STAFF user cannot access `/admin/users`
- [ ] P1-36 E2E: USER cannot access `/staff/queue`

---

## Phase 2 — Wallet

- [ ] P2-01 Prisma: `WalletTransaction` model — `id`, `userId`, `type` (CREDIT/DEBIT), `amount`, `balanceBefore`, `balanceAfter`, `note?`, `orderId?`, `createdBy`, `createdAt`
- [ ] P2-02 Prisma migration for `WalletTransaction`
- [ ] P2-03 `walletService.credit(userId, amount, note, actorId)` — updates `User.balance` + inserts transaction (in `prisma.$transaction`)
- [ ] P2-04 `walletService.debit(userId, amount, orderId, actorId)` — checks balance >= amount, updates + inserts (in `prisma.$transaction`), throws if insufficient
- [ ] P2-05 `walletService.getBalance(userId)`
- [ ] P2-06 `walletService.getHistory(userId, pagination)`
- [ ] P2-07 Admin `/admin/users/[id]`: add credit wallet form (amount, note) — calls `walletService.credit`
- [ ] P2-08 Admin `/admin/users/[id]`: show current balance
- [ ] P2-09 User `/wallet`: balance display + paginated transaction history (type, amount, balanceBefore, balanceAfter, note, date)
- [ ] P2-10 Unit: credit (balance updated, transaction recorded, balanceBefore/After correct)
- [ ] P2-11 Unit: debit (success, insufficient balance rejection, balance unchanged on failure)
- [ ] P2-12 Unit: concurrent debit safety (balance cannot go negative even under race condition)

---

## Phase 3 — Products

- [ ] P3-01 Prisma: `Product` model — `id`, `name`, `description?`, `price`, `stock`, `status` (ACTIVE/INACTIVE), `createdAt`, `updatedAt`, `createdBy`
- [ ] P3-02 Prisma: `ProductStatusHistory` model — `id`, `productId`, `fromStatus`, `toStatus`, `changedBy`, `changedAt`, `note?`
- [ ] P3-03 Prisma migration
- [ ] P3-04 `productService.create(data, actorId)` — STAFF/ADMIN
- [ ] P3-05 `productService.update(id, data, actorId)` — STAFF/ADMIN
- [ ] P3-06 `productService.setStatus(id, newStatus, actorId, note?)` — appends to `ProductStatusHistory`
- [ ] P3-07 `productService.listActive()` — USER-facing, ACTIVE only
- [ ] P3-08 `productService.listAll(filters?)` — STAFF/ADMIN, all statuses
- [ ] P3-09 Admin/Staff `/admin/products` — product list with status badge
- [ ] P3-10 Admin/Staff `/admin/products/new` — create product form
- [ ] P3-11 Admin/Staff `/admin/products/[id]` — edit form, toggle status button, status history table
- [ ] P3-12 User `/products` — active product listing (name, description, price, stock)
- [ ] P3-13 Unit: create, update, setStatus (history appended, changedBy set correctly)
- [ ] P3-14 Unit: inactive products excluded from `listActive`

---

## Phase 4 — Orders

- [ ] P4-01 Prisma: `Order` model — `id`, `userId`, `status` (NEW/IN_PROGRESS/COMPLETED), `total`, `createdAt`, `updatedAt`
- [ ] P4-02 Prisma: `OrderItem` model — `id`, `orderId`, `productId`, `quantity`, `unitPrice`, `subtotal`
- [ ] P4-03 Prisma: `OrderStatusHistory` model — `id`, `orderId`, `fromStatus`, `toStatus`, `changedBy`, `changedAt`, `note?`
- [ ] P4-04 Prisma migration
- [ ] P4-05 `orderService.createOrder(userId, items[], actorId)` — atomic: stock check → balance check → `prisma.$transaction([walletDebit, orderInsert, itemsInsert, historyInsert])`
- [ ] P4-06 `orderService.advanceStatus(orderId, actorId)` — STAFF/ADMIN; enforces NEW→IN_PROGRESS→COMPLETED only; appends `OrderStatusHistory`
- [ ] P4-07 `orderService.getOrder(orderId, actorId)` — USER sees own only; STAFF/ADMIN see all
- [ ] P4-08 `orderService.listOrders(userId?, filters?)` — USER filtered by own; STAFF/ADMIN see all
- [ ] P4-09 User `/products` — add to cart interaction
- [ ] P4-10 User order placement flow → confirmation page
- [ ] P4-11 User `/orders` — own order list (status badge, total, date)
- [ ] P4-12 User `/orders/[id]` — order detail (items, totals, status history)
- [ ] P4-13 Staff `/staff/queue` — live queue (NEW + IN_PROGRESS), sorted by createdAt
- [ ] P4-14 Staff `/staff/orders/[id]` — order detail + advance status button
- [ ] P4-15 Unit: createOrder success (balance deducted, order + items + history created atomically)
- [ ] P4-16 Unit: createOrder insufficient balance (nothing created, balance unchanged)
- [ ] P4-17 Unit: createOrder out of stock (rejected)
- [ ] P4-18 Unit: advanceStatus valid transitions (NEW→IN_PROGRESS, IN_PROGRESS→COMPLETED)
- [ ] P4-19 Unit: advanceStatus invalid (COMPLETED→anything rejected)
- [ ] P4-20 E2E: full order lifecycle (place → staff advances → completed, balance reflects deduction)

---

## Phase 5 — Hardening & Production Readiness

- [ ] P5-01 CI pipeline: lint + type-check + unit tests + E2E on PR and merge to `main`
- [ ] P5-02 Expand seed script: admin + 2 staff + 5 users + 10 products + sample orders
- [ ] P5-03 DB indexes: `userId` on `WalletTransaction`, `userId+status` on `Order`, `status` on `Product`
- [ ] P5-04 Security audit: RBAC coverage gaps, input validation, Prisma injection safety
- [ ] P5-05 Error boundary + user-facing error message polish across all forms
- [ ] P5-06 Full E2E suite — all 7 critical flows from testing.md
- [ ] P5-07 Production deploy checklist + runbook
- [ ] P5-08 Verify `make store` / `make load` round-trip on staging
