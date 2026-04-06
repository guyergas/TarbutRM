# Architecture Decision Log

---

## ADR-001: Modular Monolith over Microservices

**Date:** 2026-04-06
**Status:** Accepted

**Context:** MVP for a closed internal store. Team size small. Ops complexity must be minimal.

**Decision:** Modular monolith. Single Next.js application with enforced module boundaries at the code level (service layer per module, no cross-module DB access except through service interfaces).

**Consequences:**
- Simpler deployment (one process, one DB)
- Easier local development
- Module boundaries enforced by convention, not network — requires discipline
- Migration path: any module can be extracted to a standalone service by moving its service layer and Prisma schema to a separate process

---

## ADR-002: DB-Backed Sessions over JWT

**Date:** 2026-04-06
**Status:** Accepted

**Context:** Admin must be able to immediately deactivate users, change roles, and reset passwords with instant effect. JWT is stateless — a deactivated user retains access until token expiry (up to 8h), which is unacceptable for an admin-controlled closed system.

**Decision:** Auth.js with **database session strategy** (Prisma adapter). Sessions stored in `Session` table. Middleware validates session against DB on every request.

**Mechanism for instant revocation:**
- Deactivate user → delete all rows in `Session` where `userId = target` → immediate lockout
- Change role → delete sessions → next login picks up new role
- Reset password → delete sessions → forced re-login

**Consequences:**
- One extra DB read per request (session lookup) — acceptable for an internal tool
- Slightly more complex Prisma schema (Session, VerificationToken tables required by Auth.js adapter)
- No OAuth in MVP — credentials only
- Session expiry configurable (default: 30 days, can be shortened)

---

## ADR-003: Atomic Order Creation with Prisma Transactions

**Date:** 2026-04-06
**Status:** Accepted

**Context:** Order creation must simultaneously debit wallet and insert order. If either fails, both must roll back.

**Decision:** Use `prisma.$transaction([...])` for all order creation operations.

**Consequences:**
- Guarantees consistency; no partial state (charged but no order, or order but not charged)
- Slightly more complex service code — acceptable trade-off

---

## ADR-004: Append-Only Status History Tables

**Date:** 2026-04-06
**Status:** Accepted

**Context:** Business requirement — audit trail for order and product status changes.

**Decision:** `OrderStatusHistory` and `ProductStatusHistory` are append-only. No updates, no deletes. Each transition inserts a new row with `fromStatus`, `toStatus`, `changedBy`, `changedAt`.

**Consequences:**
- Full audit trail always available
- Slightly more storage — negligible for this scale

---

## ADR-005: No Refunds, No Cancellations in MVP

**Date:** 2026-04-06
**Status:** Accepted

**Context:** Business rules explicitly exclude refunds and cancellations.

**Decision:** Order status is strictly forward-only: NEW → IN_PROGRESS → COMPLETED. No backward transitions, no cancel status. Service layer enforces this.

**Consequences:**
- Simpler state machine
- If refunds are needed post-MVP, add a `REFUNDED` terminal state and a new `WalletTransaction` of type `REFUND`

---

## ADR-007: Docker Compose + Makefile for All Environments

**Date:** 2026-04-06
**Status:** Accepted

**Context:** System runs entirely on a single VM. User wants simple `make run` / `make prod` commands, not cloud-specific CLIs. Needs persistent storage and easy DB backup/restore.

**Decision:** Docker Compose manages Postgres + app containers. A Makefile wraps all operations. Single Postgres container hosts both `tarbutrm_dev` and `tarbutrm_prod` databases. Named Docker volume (`pg_data`) ensures data persists across restarts. `make store` / `make load` handle backup and restore via `pg_dump`.

**Consequences:**
- Zero dependency on cloud providers — works on any VM with Docker
- `make run` and `make prod` are the only commands users need to know
- Both environments share one Postgres instance (acceptable for a VM — simplifies ops)
- Backups are plain SQL files — portable and human-readable

---

## ADR-006: Balance Stored Denormalized on User

**Date:** 2026-04-06
**Status:** Accepted

**Context:** Need fast balance reads (check before every order). Could compute from transaction log but that's expensive.

**Decision:** `User.balance` is a cached denormalized field, always kept in sync by the Wallet service. The transaction log remains the source of truth for history; `User.balance` is the source of truth for current balance.

**Consequences:**
- Fast balance reads (single field lookup)
- Risk of drift if balance is ever mutated outside the Wallet service — mitigated by: only the Wallet service may write `User.balance`, enforced by code review and architecture boundary
