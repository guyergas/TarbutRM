# Implementation Plan

## Delivery Strategy
Each phase produces a working, deployable increment. No phase starts until the previous is approved and merged. Work is task-by-task within each phase.

---

## Phase 1 — Foundation (Auth + RBAC + User Management)

**Goal:** Working system deployable with `make run` / `make prod`. Admin can log in, manage users. All roles can log in and log out. Route protection enforced.

**Scope clarifications:**
- No open self-registration — admin creates all accounts
- First admin user created via seed script
- No password reset UI — admin resets from `/admin/users/[id]`
- No OAuth — credentials only

**Deliverables:**
- Docker Compose setup (Postgres + app) with named volume for persistence
- Makefile: `run`, `prod`, `stop`, `store`, `load`, `migrate`, `seed`, `logs`, `shell`
- `.env.example` template
- Next.js project scaffold (TypeScript, Tailwind, ESLint, Prettier)
- Prisma schema: `User` (id, name, email, passwordHash, role, balance, active, createdAt, updatedAt, createdBy)
- Auth.js: credentials login, JWT session with role, logout Server Action
- RBAC middleware protecting all routes by role
- Role-based nav layout (USER / STAFF / ADMIN shells)
- Admin screens: `/admin/users`, `/admin/users/new`, `/admin/users/[id]`
  - Create user (name, email, password, role)
  - Change role
  - Activate / deactivate
  - Reset password
- Seed script: creates first ADMIN user
- Unit tests: auth service, RBAC guards
- E2E tests: login, logout, protected route redirect, role isolation

**Exit criteria:**
- `make prod` on VM → system live at `http://<vm-ip>`
- Admin logs in, creates a STAFF user and a USER
- Each role logs in, sees correct nav, cannot access other roles' routes
- Logout clears session and redirects to `/login`

---

## Phase 2 — Wallet

**Goal:** Admin can credit wallets. Users see their balance and transaction history.

**Deliverables:**
- Prisma schema: `WalletTransaction` (id, userId, type, amount, balanceBefore, balanceAfter, note, orderId?, createdBy, createdAt)
- Wallet service: `credit`, `debit`, `getBalance`, `getHistory` — only service that writes `User.balance`
- Admin: credit wallet form on `/admin/users/[id]`
- User: `/wallet` page (balance + paginated transaction history)
- Unit tests: credit, debit, balance floor enforcement (cannot go < 0)

**Exit criteria:**
- Admin credits user → balance updates → transaction recorded
- Debit below zero rejected with clear error
- Transaction history shows correct balanceBefore / balanceAfter on each row

---

## Phase 3 — Products

**Goal:** Admin/Staff manage product catalog. Users browse active products.

**Deliverables:**
- Prisma schema: `Product`, `ProductStatusHistory`
- Product service: `create`, `update`, `setStatus` (appends to `ProductStatusHistory` on every status change)
- Admin/Staff: `/admin/products`, `/admin/products/new`, `/admin/products/[id]`
  - Create product (name, description, price, stock)
  - Edit product
  - Toggle ACTIVE / INACTIVE (records history)
  - View status history on product detail page
- User: `/products` (active products only, no status history visible)
- Unit tests: product service (create, status transitions, history appended)

**Exit criteria:**
- Admin creates product → appears in user product list
- Status toggled → history record created with changedBy and changedAt
- Inactive products not visible to USER role

---

## Phase 4 — Orders

**Goal:** Users place orders. Staff processes them through full lifecycle.

**Deliverables:**
- Prisma schema: `Order`, `OrderItem`, `OrderStatusHistory`
- Order service:
  - `createOrder(userId, items[])` — atomic: balance check + wallet debit + order insert in single Prisma transaction; stock check per item
  - `advanceStatus(orderId, actorId)` — NEW→IN_PROGRESS→COMPLETED, appends to `OrderStatusHistory`
- User: product listing with "add to cart" → order placement → confirmation
- User: `/orders` (own order history) and `/orders/[id]` (order detail + status history)
- Staff: `/staff/queue` (NEW + IN_PROGRESS orders) and `/staff/orders/[id]` (advance status)
- Unit tests: createOrder (success, insufficient balance, out of stock), advanceStatus (valid, invalid transitions)
- E2E: full flow — place order → balance deducted → staff advances to COMPLETED

**Exit criteria:**
- User places order → balance deducted atomically → order in history
- Insufficient balance → order rejected, balance unchanged
- Staff advances order through full lifecycle, each step recorded in history

---

## Phase 5 — Hardening & Production Readiness

**Goal:** CI pipeline, full test coverage, staging live, production ready.

**Deliverables:**
- CI pipeline: lint + type-check + unit tests + E2E on every PR and merge to `main`
- Staging environment live (`make run` on VM, separate DB)
- Seed script expanded: admin + products + sample users for staging
- Security audit: RBAC gaps, input validation, injection risks
- DB indexes: `userId` on `WalletTransaction`, `userId + status` on `Order`, `status` on `Product`
- Error handling polish: user-facing error messages, form validation feedback
- Full E2E suite covering all critical user journeys (see testing.md)
- Production deploy checklist

**Exit criteria:**
- CI green on all checks
- Staging deployed, all roles manually verified end-to-end
- Production deployed, admin user configured

---

## Milestones Summary

| Phase | Focus | Status |
|-------|-------|--------|
| 1 | Auth + RBAC + User Mgmt + Docker/Make | Pending |
| 2 | Wallet | Pending |
| 3 | Products | Pending |
| 4 | Orders | Pending |
| 5 | Hardening + CI + Production | Pending |
