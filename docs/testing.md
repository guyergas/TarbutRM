# Testing Strategy

## Philosophy
- Test behavior, not implementation details
- Unit test service layer business rules; E2E test user journeys
- Tests must pass before any commit is approved
- No mocking the database in service layer tests — use a real test DB

---

## Test Types

### Unit / Integration Tests
**Tool:** Vitest
**DB:** `tarbutrm_test` — real Postgres, same container, separate database
**Scope:** Service layer functions

Test at the service layer, not the UI. Each test runs against a real DB that is reset between test files (via `prisma migrate reset --force`).

**What to test:**
- Business rule enforcement (balance >= 0, order status transitions, role guards)
- Edge cases (exact-balance purchase, insufficient balance, invalid role, unknown entity)
- Status history records created correctly (changedBy, changedAt, fromStatus, toStatus)
- Atomic operations (order creation fails cleanly — no partial state)

**What NOT to test:**
- Next.js pages or React components
- Prisma internals
- Auth.js session handling

### E2E Tests
**Tool:** Playwright
**Target:** Running dev container (`make run`)
**Scope:** Full browser-level user journeys

---

## Critical E2E Flows (must all pass before any release)

| # | Flow | Roles involved |
|---|------|----------------|
| 1 | Admin login → create USER → logout | ADMIN |
| 2 | New user login → view dashboard → logout → verify session cleared | USER |
| 3 | Unauthenticated access to `/dashboard` → redirected to `/login` | — |
| 4 | STAFF cannot access `/admin/users` → redirected | STAFF |
| 5 | USER cannot access `/staff/queue` → redirected | USER |
| 6 | Admin credits wallet → user sees updated balance and transaction history | ADMIN, USER |
| 7 | User places order → balance deducted → order in history | USER |
| 8 | User cannot place order with insufficient balance → clear error, balance unchanged | USER |
| 9 | Staff advances order NEW → IN_PROGRESS → COMPLETED | STAFF |
| 10 | Each status advance recorded in order status history | STAFF |

---

## Test Database

- Name: `tarbutrm_test`
- Lives in the same Postgres Docker container
- Reset between test runs: `prisma migrate reset --force --skip-seed`
- Never use dev or prod DB for tests

---

## CI Pipeline (Phase 5)

Runs on every PR and every merge to `main`:

```
1. npm run lint
2. npm run type-check
3. npm run test:unit        (Vitest, against tarbutrm_test)
4. npm run test:e2e         (Playwright, headless, against make run)
```

All steps must pass. PR cannot merge if any step fails.

---

## Test File Conventions

```
/src/modules/user/user.service.test.ts
/src/modules/wallet/wallet.service.test.ts
/src/modules/product/product.service.test.ts
/src/modules/order/order.service.test.ts

/e2e/
  auth.spec.ts        flows 1–2
  rbac.spec.ts        flows 3–5
  wallet.spec.ts      flow 6
  orders.spec.ts      flows 7–10
```

---

## Running Tests Locally

```bash
# Unit tests (once)
npm run test

# Unit tests (watch mode)
npm run test -- --watch

# E2E (requires make run running)
make run
npm run test:e2e
```

---

## Coverage Goals (MVP)

| Layer | Target |
|-------|--------|
| Service layer — business rules | >80% line coverage |
| E2E critical flows (table above) | 100% covered |
| React components / pages | Not targeted in MVP |

---

## Phase-by-Phase Test Additions

| Phase | Tests added |
|-------|-------------|
| 1 | userService unit tests, E2E flows 1–5 |
| 2 | walletService unit tests, E2E flow 6 |
| 3 | productService unit tests |
| 4 | orderService unit tests, E2E flows 7–10 |
| 5 | Full suite review, CI wired up, coverage report |
