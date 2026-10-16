# Sanghavi Gold API

NestJS + PostgreSQL (Prisma) + Firebase Auth. Customers and staff sign in with Firebase on the website;
the API verifies their ID token on every request and decides what they may do.

## Setup
1. `cp .env.example .env`, then fill in `DATABASE_URL` (Neon) and `FIREBASE_SERVICE_ACCOUNT_BASE64`.
2. `npm install`
3. `npm run prisma:migrate -- --name init`  (creates the tables)
4. `npm run dev`  →  http://localhost:4000/api/health

## Layout
```
src/
  config/     env validation (fails fast at startup)
  firebase/   IdentityProvider abstraction + Firebase implementation
  auth/       token guard, RBAC roles → permissions, permissions guard, GET /auth/me
  team/       admin team management (grant/remove admin by email) + repository
  audit/      append-only audit log of sensitive actions
  prisma/     database client
```

## Admin access model
- **Owners** are listed in `OWNER_EMAILS`. They can manage the team and read the audit log.
- Owners add admins by email (`POST /api/team`). If the person has no account yet, the invite waits
  until they sign in with that **verified** email.
- Removing someone (`DELETE /api/team/:email`) clears their role and signs them out everywhere.
- `team_members` is the source of truth; Firebase custom claims (`role`, `admin`) mirror it so
  Firestore rules keep working. `GET /api/auth/me` reconciles the two on every sign-in.

## Endpoints
| Method | Path | Who |
|---|---|---|
| GET | /api/health | anyone |
| GET | /api/auth/me | any signed-in user |
| GET / POST | /api/team | owner |
| DELETE | /api/team/:email | owner |
| GET | /api/audit-logs | owner |

## Tests
`npm test` runs the unit tests (team rules, RBAC) with in-memory fakes; no database needed.
