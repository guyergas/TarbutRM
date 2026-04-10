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
- [x] P1-07 Configure Prisma with PostgreSQL (`DATABASE_URL` via Docker Compose)
- [x] P1-08 Define `User` model: `id`, `name`, `email`, `passwordHash`, `role` (enum: USER/STAFF/ADMIN), `balance` (Decimal, default 0), `active`, `createdAt`, `updatedAt`, `createdBy?`
- [x] P1-09 Create initial Prisma migration
- [x] P1-10 Configure Auth.js: credentials provider, **database session strategy** (Prisma adapter), `Session` + `VerificationToken` tables
- [x] P1-11 Create seed script: creates first ADMIN user (email + password from env)

### Auth Flows
- [x] P1-12 Login page (`/login`) + Server Action (validate credentials, start session)
- [x] P1-13 Logout Server Action (`signOut`, redirect to `/login`)
- [x] P1-14 Session-aware nav: show user name, role badge, logout button

### RBAC & Route Protection
- [x] P1-15 `middleware.ts`: protect all non-public routes, redirect unauthenticated to `/login`, redirect wrong-role to own home
- [x] P1-16 `lib/rbac.ts`: role guard helpers used in service layer (second line of defense)
- [x] P1-17 Role-based layout shells: USER layout, STAFF layout, ADMIN layout (separate navs)

### User Module (`/src/modules/user/`)
- [x] P1-18 `userService.createUser(data, actorId)` — ADMIN only, hashes password, sets `createdBy`
- [x] P1-19 `userService.getUserById(id)`
- [x] P1-20 `userService.listUsers(filters?)` — supports filter by role and active status
- [x] P1-21 `userService.changeRole(userId, newRole, actorId)` — ADMIN only; deletes all target user sessions after change
- [x] P1-22 `userService.setActive(userId, active, actorId)` — ADMIN only; on deactivate, deletes all target user sessions immediately
- [x] P1-23 `userService.resetPassword(userId, newPassword, actorId)` — ADMIN only; bcrypt hash; deletes all target user sessions after reset

### Admin Screens
- [x] P1-24 `/admin/users` — user list (name, email, role, status, created date); link to detail
- [x] P1-25 `/admin/users/new` — create user form (name, email, password, role); Server Action calls `userService.createUser`
- [x] P1-26 `/admin/users/[id]` — user detail page:
  - Display: name, email, role, active status, createdAt, createdBy
  - Actions: change role (dropdown + save), activate/deactivate (toggle button), reset password (form)

### Placeholder Pages (for other roles to land somewhere)
- [x] P1-27 `/dashboard` — minimal authenticated landing for USER role
- [x] P1-28 `/staff/queue` — placeholder for STAFF role (message: "Coming soon")

### Tests
- [x] P1-29 Unit: `userService.createUser` (success, duplicate email, invalid role)
- [x] P1-30 Unit: `userService.changeRole`, `setActive`, `resetPassword`
- [x] P1-31 Unit: RBAC guard helpers (allow/deny per role)
- [x] P1-32 E2E: admin login → create user → logout
- [x] P1-33 E2E: new user login → sees dashboard → logout (session cleared, `/login` redirects correctly)
- [x] P1-34 E2E: unauthenticated access to `/dashboard` redirects to `/login`
- [x] P1-35 E2E: STAFF user cannot access `/admin/users`
- [x] P1-36 E2E: USER cannot access `/staff/queue`

---

## Phase 2 — Wallet

> **Status:** Partially done. Admin credit/debit form and `BudgetTransaction` model are live. User-facing wallet page is missing.

> **No open decisions — proceed when ready.**

- [x] P2-01 Prisma: `BudgetTransaction` model with `userId`, `amount`, `note?`, `createdBy`, `createdAt`
- [x] P2-02 Prisma migration
- [x] P2-03 Atomic credit/debit: `prisma.$transaction([budgetTransaction.create, user.update balance])` in admin action
- [x] P2-04 Admin `/admin/user/[id]`: credit/debit form + transaction history table
- [ ] P2-05 User `/wallet`: balance display + paginated transaction history (amount, note, date, performed by)

---

## Phase 3 — Store & Inventory Management

> **Status:** Complete ✓

> **All decisions resolved. Ready to implement.**
>
> **Structure:** Menu → Section → Item (3-level hierarchy)
> - **Menu**: `archived` flag (soft-delete); position order. Visible = not archived. Default menu = first visible menu by position. `/` redirects to default.
> - **Section**: belongs to one menu; `archived` flag; position order within its menu
> - **Item**: belongs to exactly one section (and transitively one menu) via `sectionId` FK; `archived` flag; fields: name, description, price, inStock (boolean), position, image
> - To reuse an item in another section: duplicate it — each copy is independent and can have its own price/position
>
> **Unified store view:** Single `/store/[menuId]` page for all roles (USER/STAFF/ADMIN). Top bar lists visible menus; side nav lists sections; grid shows items. Admin controls (edit/reorder/archive) appear inline on hover—no separate admin pages.
>
> **Role-based visibility:**
> - **USER**: Browse only. Stock status shown via badge.
> - **STAFF**: Stock toggle button on each item (in/out). No other controls.
> - **ADMIN**: Stock toggle + Edit button on each item; edit/reorder/archive controls on menus (top nav) and sections (sidebar); "+ new section" / "+ new item" buttons visible.
>
> **Who manages:**
> - ADMIN: full control — menus, sections, items (create/update/archive/duplicate), stock toggle, all via inline controls in store view
> - STAFF: stock toggle only (`inStock`) on items — cannot modify menus, sections, or item details
>
> **Stock:** boolean (`inStock` true/false); every change is recorded in `ItemStockHistory` (append-only, never mutated). `changedBy` always passed explicitly from session.
> **Items:** soft-delete via `archived` flag (never hard-deleted); archived items hidden from store
> **Out-of-stock items:** shown in store but marked as "אזל מהמלאי" (not hidden)

### Database
- [x] P3-01 Prisma: `Menu` model — `id`, `name`, `archived`, `position`, `createdAt`, `updatedAt`, `createdBy` (visible menus = not archived; archived menus moved to end)
- [x] P3-02 Prisma: `Section` model — `id`, `menuId`, `name`, `archived`, `position`, `createdAt`, `updatedAt`, `createdBy` (visible sections = not archived; archived moved to end)
- [x] P3-03 Prisma: `Item` model — `id`, `sectionId` (FK→Section), `name`, `description?`, `price`, `inStock`, `position`, `archived`, `image?`, `createdAt`, `updatedAt`, `createdBy`
- [x] P3-04 Prisma: `ItemStockHistory` model — `id`, `itemId` (FK→Item), `inStock` (new value after change), `changedBy` (FK→User), `changedAt`
- [x] P3-05 Prisma migration

### Service layer
- [x] P3-06 `menuService.listVisible()` — returns non-archived menus ordered by position; resolves default (first by position)
- [x] P3-07 `menuService.getMenuWithSections(menuId)` — returns menu + non-archived sections + non-archived items per section (user-facing)
- [x] P3-08 `menuService.listAll()` — ADMIN, all menus (archived + visible)
- [x] P3-09 `menuService.create(data, actorId)` — ADMIN; creates new menu, not archived
- [x] P3-10 `menuService.update(id, data, actorId)` — ADMIN; updates name only, cannot edit archived menus
- [x] P3-11 `menuService.archive(id, actorId)` — ADMIN; sets `archived: true`, moves to end by position
- [x] P3-12 `menuService.reorder(orderedIds, actorId)` — ADMIN; updates position; archived menus stay at end
- [x] P3-13 `sectionService.create(menuId, data, actorId)` — ADMIN; creates new section in menu, not archived
- [x] P3-14 `sectionService.update(id, data, actorId)` — ADMIN; updates name only, cannot edit archived sections
- [x] P3-15 `sectionService.archive(id, actorId)` — ADMIN; sets `archived: true`, moves to end by position
- [x] P3-16 `sectionService.reorder(menuId, orderedIds, actorId)` — ADMIN; updates position within menu; archived stay at end
- [x] P3-17 `itemService.create(sectionId, data, actorId)` — ADMIN; appends to end of section; sets initial stock history record (inStock=true)
- [x] P3-18 `itemService.update(id, data, actorId)` — ADMIN; updates name/desc/price/image; cannot edit archived items
- [x] P3-19 `itemService.archive(id, actorId)` — ADMIN; sets `archived: true`, moves to end by position
- [x] P3-20 `itemService.setStock(id, inStock, actorId)` — ADMIN or STAFF; atomic: `prisma.$transaction([item.update(inStock), itemStockHistory.create({itemId, inStock, changedBy: actorId, changedAt: now})])`
- [x] P3-21 `itemService.duplicate(id, targetSectionId, actorId)` — ADMIN; creates copy in target section at end; rejects if source archived; sets initial stock history (inStock=true)
- [x] P3-22 `itemService.reorder(sectionId, orderedIds, actorId)` — ADMIN; updates position; archived items stay at end

### Store page (unified for all roles)
- [x] P3-23 `/store/[menuId]` — single view for USER/STAFF/ADMIN:
  - **All**: menu nav bar (visible menus); section sidebar; item grid with image/name/desc/price; "אזל מהמלאי" badge on OOS items
  - **STAFF+ADMIN**: stock toggle button on each item (במלאי ↔ אזל מהמלאי)
  - **ADMIN only**: edit icon button next to stock button; section sidebar shows edit/reorder/archive controls on hover; menu bar shows edit/reorder/archive controls on hover; "+ new section" button in sidebar header; "+ new item" button in section heading

### Admin detail pages
- [x] P3-24 `/admin/items/[id]` — full item editor (inline modal or page):
  - Display: name, description, price, image, current stock status, stock history table
  - Actions: save edits, toggle stock, archive, duplicate to section
  - Stock history: date, new status (in/out), changed by user name/role

### Redirects & nav
- [x] P3-25 Store nav bar — visible menus as tabs in top nav; active menu highlighted
- [x] P3-26 `/` redirect — resolves first visible menu by position; redirects to `/store/[menuId]`

### Seed data (for testing) ✓
When P3 schema is implemented, seed the following test data structure:

**Menu 1: פאב (Pub)** — position 1
- **Section: בירות (Beers)** — position 1
  - **Item: גולדסטאר** — 5 NIS, in stock, with image (https://upload.wikimedia.org/wikipedia/he/thumb/a/a8/Goldstar_beer_bottle.jpg/220px-Goldstar_beer_bottle.jpg), position 1
  - **Item: קורונה** — 10 NIS, in stock, no image, position 2
- **Section: קוקטליים (Cocktails)** — position 2
  - **Item: וויסקי סאוור** — 20 NIS, in stock, no image, position 1

**Menu 2: פורים (Purim)** — position 2, empty (no sections)

## Phase 4 — Basket

> **Status:** Complete ✓

> **Decisions resolved:**
> - [x] **D4-01** Cart storage: **Server-side (DB, survives refresh)**
> - [x] **D4-02** Max quantity per item: **Unlimited**
> - [x] **D4-03** Cart behaviour when a product goes inactive mid-session: **Show warning (grayed out with reduced opacity)**

### Implementation ✓
- [x] P4-01 Cart state: implement chosen storage strategy
- [x] P4-02 `/store` — "הוסף לסל" button per product; quantity selector
- [x] P4-03 Cart icon in TopBar showing item count badge
- [x] P4-04 Cart modal (drawer) — cart summary: items, quantities, line totals, grand total, "לתשלום" button
- [x] P4-05 Add / remove / clear cart actions

---

## Phase 5 — Purchase (Orders)

> **Status:** Complete ✓ (all backend and user-facing features implemented)

> **Decisions confirmed:**
> - [x] **D5-01** Insufficient balance at checkout: **Block with error**
> - [x] **D5-02** Order cancellation: **Orders are final (no user cancellation)**
> - [x] **D5-03** Stock decrement: **Stock managed by STAFF/ADMIN only, not auto-decremented**

### Database
- [x] P5-01 Prisma: `Order` model — `id`, `userId`, `status` (NEW/IN_PROGRESS/COMPLETED), `total`, `createdAt`, `updatedAt`, `orderNumber` (sequential)
- [x] P5-02 Prisma: `OrderItem` model — `id`, `orderId`, `itemId`, `quantity`, `unitPrice`, `subtotal`
- [x] P5-03 Prisma: `OrderStatusHistory` model — `id`, `orderId`, `toStatus`, `changedBy`, `changedAt`
- [x] P5-04 Prisma migration — Order (with orderNumber autoincrement), OrderItem, OrderStatusHistory

### Service layer
- [x] P5-05 `orderService.createOrder(userId, items[])` — atomic: stock check → balance check → `prisma.$transaction([walletDebit, orderInsert, itemsInsert, historyInsert])`
- [x] P5-06 `orderService.cancelOrder(orderId, actorId)` — USER on own NEW order only (per D5-02); refunds balance atomically
- [x] P5-07 `orderService.advanceStatus(orderId, actorId)` — STAFF/ADMIN; NEW→IN_PROGRESS→COMPLETED; appends `OrderStatusHistory`
- [x] P5-08 `orderService.getOrder(orderId, actorId)` — USER sees own only; STAFF/ADMIN see all
- [x] P5-09 `orderService.listUserOrders(userId)` — USER filtered by own; includes items and status history with changer details

### User-facing ✓
- [x] P5-10 CartModal — "לתשלום" triggers checkout with confirmation dialog; shows balance, total, items count
- [x] P5-11 Order confirmation — redirects to `/orders/[id]` after successful placement; clears cart
- [x] P5-12 `/orders` — user order history (status badge, total, date); clickable rows
- [x] P5-13 `/orders/[id]` — order detail (items, totals, status history timeline)

### Staff
- [x] P5-14 `/staff/queue` — NEW + IN_PROGRESS orders sorted by createdAt (table with status badge, item count, total)
- [x] P5-15 `/staff/orders/[id]` — order detail page with "Advance Status" button for STAFF/ADMIN

### Tests
- [x] P5-16 Unit: createOrder success (balance deducted, order + items + history created atomically)
- [x] P5-17 Unit: createOrder insufficient balance (nothing created, balance unchanged)
- [x] P5-18 Unit: createOrder out of stock (rejected)
- [x] P5-19 Unit: advanceStatus valid transitions
- [x] P5-20 Unit: advanceStatus invalid (COMPLETED→anything rejected)
- [x] P5-21 E2E: full order lifecycle (place → staff advances → completed, balance reflects deduction)

---

## Phase 6 — Hardening & Production Readiness

- [ ] P6-01 CI pipeline: lint + type-check + unit tests + E2E on PR and merge to `main`
- [ ] P6-02 Expand seed script: admin + 2 staff + 5 users + 10 products + sample orders
- [ ] P6-03 DB indexes: `userId` on `BudgetTransaction`, `userId+status` on `Order`, `status` on `Product`
- [ ] P6-04 Security audit: RBAC coverage gaps, input validation, Prisma injection safety
- [ ] P6-05 Error boundary + user-facing error message polish across all forms
- [ ] P6-06 Full E2E suite — all critical flows
- [ ] P6-07 Production deploy checklist + runbook
- [ ] P6-08 Verify `make store` / `make load` round-trip on staging
