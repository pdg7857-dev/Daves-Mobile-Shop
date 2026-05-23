# Dave's To-Do

A unified task inbox that aggregates work from across Dave's businesses:

- **Mobile shop orders** — pulled directly from the mobile shop Postgres (`Order` table). Surfaces every order in a non-terminal status, with priority boosted by age.
- **Mobile shop Dave Care plans** — surfaces warranty plans expiring in the next 30 days.
- **Toyota customer leads** — pulled from the toyota-backend REST API. Surfaces every customer in an active sales stage, with follow-up dates lifted into `dueDate`.
- **Personal todos** — manually added one-offs.
- **Recurring tasks** — templates that spawn fresh tasks daily/weekly/monthly.

Google Calendar sync is intentionally out of scope for v1.

## Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS for styling
- Prisma + Postgres for the todo app's own data
- `pg` driver for read-only access to the mobile shop database
- `fetch` against the Toyota REST API

## Setup

1. `cd todo-app && npm install`
2. Copy `.env.example` → `.env` and fill in:
   - `DATABASE_URL` — Postgres for this app's data
   - `MOBILE_SHOP_DATABASE_URL` — read-only Postgres for the mobile shop
   - `TOYOTA_API_BASE` + `TOYOTA_API_TOKEN` — Toyota backend
   - `CRON_SECRET` — random string for the `/api/cron` endpoint
3. `npm run prisma:migrate -- --name init` to create the schema
4. `npm run dev` — runs on port 3001

## How sync works

- The UI's **Sync now** button calls a server action that runs both source pollers, records the result in `SyncRun`, and spawns any due recurring tasks.
- The same logic is exposed at `POST /api/sync` (UI-equivalent) and `GET /api/cron` (auth via `CRON_SECRET` bearer header).
- Scraped tasks are upserted on `(source, sourceId)` so re-running sync is idempotent. Terminal statuses upstream (e.g. an order marked `delivered`) automatically close the matching task.

To schedule, add to `vercel.json`:

```json
{ "crons": [{ "path": "/api/cron", "schedule": "*/15 * * * *" }] }
```

…or run `npm run sync:once` from any cron host.

## File map

```
prisma/schema.prisma        Task, RecurringTask, SyncRun models
src/lib/db.ts               Prisma singleton
src/lib/sources.ts          Source enum + labels/colors
src/lib/mobile-shop.ts      Postgres → Task upserts for orders + care plans
src/lib/toyota.ts           REST API → Task upserts for customer leads
src/lib/recurrence.ts       computeNextDueDate + spawnDueRecurringTasks
src/lib/sync.ts             syncAll orchestrator with SyncRun audit
src/app/actions.ts          Server actions for create/complete/snooze/dismiss
src/app/page.tsx            Dashboard with source-grouped tasks + filters
src/app/personal/new        Add a personal task
src/app/recurring           List + manage recurring tasks
src/app/recurring/new       Create a recurring task
src/app/api/sync            Manual trigger
src/app/api/cron            Authenticated trigger for schedulers
scripts/sync-once.ts        Standalone CLI runner
```
