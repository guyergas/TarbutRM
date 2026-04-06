# Architecture

## Approach: Modular Monolith

Single Next.js (App Router) application. No separate backend service. Module boundaries enforced at the code level — each module owns its service layer, types, and DB access. Cross-module calls go through service interfaces only, never direct DB queries.

**Migration path:** Any module can be extracted into a standalone service by moving its service layer and Prisma schema to a separate process with a dedicated DB. The interface contract stays the same.

---

## Request Flow

```
Browser
  └── Next.js App Router
        ├── React Server Components (read / render)
        ├── Server Actions (mutations)
        └── Middleware (RBAC — runs on every request)
              └── Module Service Layer (business logic)
                    └── Prisma ORM
                          └── PostgreSQL
```

---

## Auth

### Registration
- **Closed system — no open self-registration.**
- Only `ADMIN` can create user accounts.
- Admin sets the initial password at creation time.
- New users receive their credentials directly from the admin (out of band).

### Login
- Credentials provider (email + password).
- Password hashed with `bcrypt` (never stored in plain text).
- Auth.js handles session creation.

### Logout
- Server Action: calls `signOut()` from Auth.js, clears session cookie, redirects to `/login`.
- Navigation includes a visible logout button for all authenticated roles.

### Session Strategy
- **Database-backed sessions** (Auth.js database adapter, not JWT).
- Session record stored in `Session` table, referenced by httpOnly cookie.
- On every request, middleware validates the session ID against the DB.
- This enables immediate enforcement of admin actions:

| Admin action | Effect on active sessions |
|---|---|
| Deactivate user | All user sessions deleted → immediate lockout |
| Change role | All user sessions deleted → next login gets new role |
| Reset password | All user sessions deleted → forced re-login |

- Auth.js manages `Session`, `Account`, `VerificationToken` tables automatically via the Prisma adapter.

### Password Reset
- Admin types a new password manually in the form at `/admin/users/[id]`.
- On save: password is re-hashed with bcrypt, all existing sessions for that user are deleted.
- **No force-change-on-next-login** — not in MVP.
- Admin communicates the new password to the user out-of-band.

### Auth.js Route Handlers
- Auth.js requires `/api/auth/[...nextauth]` route handler — this is the **only** route handler in Phase 1.
- All other auth actions (logout) use Server Actions.

---

## Module Boundaries

### Rule
No module may import another module's Prisma queries directly. All cross-module data access goes through the target module's service layer.

```
✓  orderService.create() → calls walletService.debit()
✗  orderService.create() → prisma.user.update({ balance: ... })
```

### Module Ownership

#### `auth`
- Responsibility: credential validation, session lifecycle
- Owns: Auth.js config, credential comparison
- Does NOT own: user creation (delegates to `user` module)

#### `user`
- Responsibility: identity, profile, role, activation status
- Owns: `User` table (all fields **except** `balance`)
- Explicitly does NOT own `User.balance` — that field is owned by `wallet`
- Operations: create user, update name/email, change role, activate, deactivate

#### `wallet`
- Responsibility: all balance reads and writes, transaction history
- Owns: `User.balance` field + `WalletTransaction` table
- **Only module allowed to write `User.balance`**
- Operations: credit, debit, get balance, get transaction history
- Enforces: balance never goes below 0 (checked before every debit, inside a transaction)

#### `product`
- Responsibility: product catalog, status management
- Owns: `Product` table + `ProductStatusHistory` table
- Operations: create, update, toggle status (ACTIVE/INACTIVE)

#### `order`
- Responsibility: order lifecycle, line items, status transitions
- Owns: `Order`, `OrderItem`, `OrderStatusHistory` tables
- Calls `wallet` module to debit balance on order creation
- Calls `product` module to check stock on order creation

---

## Status History

### Decision: History lives inside each module (not a shared audit module)
Status history is tightly coupled to the lifecycle of its parent entity. A shared audit module would be premature abstraction.

### Order Status History
- Table: `OrderStatusHistory`
- Owned by: `order` module
- Written by: `orderService.advanceStatus()`
- Fields: `id`, `orderId`, `fromStatus`, `toStatus`, `changedBy` (userId), `changedAt`, `note?`
- Every status transition (including creation with status `NEW`) appends a record.
- Append-only. No updates. No deletes.

### Product Status History
- Table: `ProductStatusHistory`
- Owned by: `product` module
- Written by: `productService.setStatus()`
- Fields: `id`, `productId`, `fromStatus`, `toStatus`, `changedBy` (userId), `changedAt`, `note?`
- Every status change appends a record.
- Append-only. No updates. No deletes.

### Who changed it
`changedBy` is always the `userId` from the active session, passed from the Server Action into the service layer. Never inferred inside the service — always passed explicitly.

---

## Routes & Screens

### Public (unauthenticated)
| Route | Description |
|-------|-------------|
| `/login` | Login form |

No public registration page — admin creates accounts.

### User (role: USER)
| Route | Description |
|-------|-------------|
| `/dashboard` | Welcome, balance summary, recent orders |
| `/products` | Browse active products |
| `/orders` | Own order history |
| `/orders/[id]` | Order detail + status history |
| `/wallet` | Current balance + transaction history |

### Staff (role: STAFF + ADMIN)
| Route | Description |
|-------|-------------|
| `/staff/queue` | Orders with status NEW and IN_PROGRESS |
| `/staff/orders/[id]` | Order detail + advance status action |

### Admin (role: ADMIN only)
| Route | Description |
|-------|-------------|
| `/admin/users` | User list (all users, filterable by role/status) |
| `/admin/users/new` | Create user form (name, email, password, role) |
| `/admin/users/[id]` | User detail: edit profile, change role, activate/deactivate, reset password, view wallet, credit wallet |
| `/admin/products` | Product list |
| `/admin/products/new` | Create product form |
| `/admin/products/[id]` | Edit product, toggle status, view status history |

### Logout
- No dedicated route.
- Server Action bound to a logout button in the nav.
- On success: clears session, redirects to `/login`.

---

## RBAC

### Middleware
`middleware.ts` at project root. Runs on every request.
- Unauthenticated → redirect to `/login`
- Authenticated but wrong role for route → redirect to their home (`/dashboard`)
- Matching role → pass through

### Service Layer Guard
All service functions validate the caller's role independently of the middleware. Defense in depth — middleware can be misconfigured, service layer cannot be bypassed.

### RBAC Matrix
| Action | USER | STAFF | ADMIN |
|--------|------|-------|-------|
| Login / Logout | ✓ | ✓ | ✓ |
| View own wallet + history | ✓ | ✓ | ✓ |
| Browse active products | ✓ | ✓ | ✓ |
| Place order | ✓ | — | — |
| View own orders | ✓ | — | — |
| View all orders (queue) | — | ✓ | ✓ |
| Advance order status | — | ✓ | ✓ |
| Create/edit products | — | ✓ | ✓ |
| Toggle product status | — | ✓ | ✓ |
| Create users | — | — | ✓ |
| Change user role | — | — | ✓ |
| Activate / deactivate user | — | — | ✓ |
| Reset user password | — | — | ✓ |
| Credit wallet | — | — | ✓ |

---

## Route Handlers vs Server Actions

### Use Server Actions for (almost everything):
- All form submissions (create user, login, create order, credit wallet)
- Simple mutations (change role, activate/deactivate, advance order status, logout)
- Anything triggered from the browser by the logged-in user

### Use Route Handlers (`/api/`) for:
- Auth.js internals: `/api/auth/[...nextauth]` — required by Auth.js
- Future webhooks or external integrations
- Any endpoint called from outside the browser (scripts, cron, external systems)

**MVP rule:** If it's not Auth.js, it's a Server Action.

---

## Phase 1 Data Model

Prisma schema for Phase 1 (Auth + Users only):

```prisma
enum Role {
  USER
  STAFF
  ADMIN
}

model User {
  id           String    @id @default(cuid())
  name         String
  email        String    @unique
  passwordHash String
  role         Role      @default(USER)
  balance      Decimal   @default(0) @db.Decimal(10, 2)
  active       Boolean   @default(true)
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  createdBy    String?   // userId of the ADMIN who created this account
  sessions     Session[]
}

// Auth.js required tables (managed by Prisma adapter)
model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime
  @@unique([identifier, token])
}
```

Notes:
- `balance` present from Phase 1, initialized to 0, owned by wallet module starting Phase 2
- `createdBy` nullable — the first ADMIN is seeded with no creator
- `Session` and `VerificationToken` required by Auth.js Prisma adapter
- `onDelete: Cascade` on Session — deleting a User deletes all their sessions
- No `WalletTransaction`, `Product`, `Order` tables yet — added in their respective phases

---

## Key Invariants (System-Wide)

1. **No open registration** — only ADMIN creates accounts
2. **Balance immutability** — `User.balance` written only by wallet module
3. **Atomic order creation** — balance debit + order insert in a single `prisma.$transaction`
4. **Forward-only order status** — NEW → IN_PROGRESS → COMPLETED, no reversals
5. **Append-only history** — `OrderStatusHistory` and `ProductStatusHistory` never updated or deleted
6. **changedBy always explicit** — service functions receive `actorId` from session, never infer it
7. **Service layer is the last line of defense** — RBAC enforced in middleware AND service layer

---

## Directory Structure

```
/src
  /app
    /(auth)
      login/
    /(user)
      dashboard/
      wallet/
      orders/
        [id]/
    /(shop)
      products/
    /(staff)
      queue/
      orders/[id]/
    /(admin)
      users/
        new/
        [id]/
      products/
        new/
        [id]/
  /modules
    /auth
      service.ts
      types.ts
    /user
      service.ts
      types.ts
    /wallet
      service.ts
      types.ts
    /product
      service.ts
      types.ts
    /order
      service.ts
      types.ts
  /lib
    prisma.ts       Prisma client singleton
    auth.ts         Auth.js config
    rbac.ts         Role guard helpers
  /components
    /ui             Shared UI primitives
    /layout         Nav, shell per role
/prisma
  schema.prisma
  seed.ts
  migrations/
/e2e                Playwright tests
middleware.ts       RBAC middleware (root level)
Makefile
docker-compose.yml
docker-compose.dev.yml
docker-compose.prod.yml
.env.example
```
