# Dave's Mobile Shop

Public website + admin/back-end for a mobile phone repair and resale business.

## What's in here

- **Public site**: home, services, in-stock phones, parts catalogue, contact, and a unique landing page per city (GTA, Montréal, Ottawa, Québec, Moncton, Halifax).
- **Admin** (password-protected at `/admin`): inventory CRUD with IMEI / serial / purchase tracking, repair history per device, parts inventory, suppliers.
- **API** (`/api/*`): JSON endpoints for inventory, repairs, parts, suppliers, and auth.

## Stack

- Next.js 15 (App Router) + TypeScript + React 18
- Tailwind CSS
- Prisma + SQLite (swap to Postgres in production by editing `prisma/schema.prisma`)
- HMAC-signed cookie session (no external auth dep)

## Quick start

```bash
# 1. Install
npm install

# 2. Configure
cp .env.example .env
# In .env:
#   ADMIN_PASSWORD=<pick one>
#   SESSION_SECRET=$(openssl rand -hex 32)

# 3. Initialize DB
npx prisma migrate dev --name init
npm run db:seed

# 4. Run
npm run dev
# → http://localhost:3000
# → http://localhost:3000/admin (sign in with ADMIN_PASSWORD)
```

## Pages

| URL | What it is |
| --- | --- |
| `/` | Hero, featured phones, services preview, city directory |
| `/services` | All 10 repair services with pricing and turnaround |
| `/inventory` | All phones for sale; filter by city and brand |
| `/inventory/[id]` | Public phone detail with service history |
| `/parts` | Parts catalogue; filter by category |
| `/parts/[id]` | Part detail |
| `/locations` | City directory |
| `/locations/[city]` | Unique city landing page (one for each of GTA, Montréal, Ottawa, Québec, Moncton, Halifax) |
| `/contact` | Contact info + per-city hours |
| `/admin` | Staff login |
| `/admin/dashboard` | KPIs + recent intake + low-stock alerts |
| `/admin/inventory` | Inventory table with search and status filter |
| `/admin/inventory/new` | Add a phone |
| `/admin/inventory/[id]` | Edit a phone + log repairs |
| `/admin/parts` | Parts table |
| `/admin/parts/new` | Add a part |
| `/admin/parts/[id]` | Edit a part |
| `/admin/suppliers` | Supplier list + add form |

## Data model

```
Supplier      → name, contact, notes
Phone         → brand, model, storage, color, condition, IMEI, serial,
                purchasePrice, askingPrice, status (for_sale|in_repair|reserved|sold),
                purchaseDate, supplierId/purchasedFrom, notes, city, imageUrl,
                soldDate, salePrice, soldTo
Repair        → phoneId, serviceType, description, partCost, laborCost, performedBy, performedAt
Part          → name, category, compatibleWith, brand, price, stock, imageUrl, description
```

See `prisma/schema.prisma` for the canonical schema.

## API endpoints (admin only — all require a valid session cookie)

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/api/auth/login` | Form-encoded `password` → sets session cookie |
| `POST` | `/api/auth/logout` | Clears session |
| `GET`  | `/api/inventory` | List phones |
| `POST` | `/api/inventory` | Create phone |
| `GET`  | `/api/inventory/:id` | Fetch one |
| `PATCH`| `/api/inventory/:id` | Update |
| `DELETE` | `/api/inventory/:id` | Delete |
| `POST` | `/api/inventory/:id/repairs` | Log a repair |
| `DELETE` | `/api/inventory/:id/repairs?repairId=` | Remove a repair |
| `GET`  | `/api/parts` | List parts |
| `POST` | `/api/parts` | Create |
| `PATCH`| `/api/parts/:id` | Update |
| `DELETE` | `/api/parts/:id` | Delete |
| `GET`  | `/api/suppliers` | List suppliers |
| `POST` | `/api/suppliers` | Create |

## Customising

- **Branding**: edit `src/components/Header.tsx`, `src/components/Footer.tsx`, and Tailwind colours in `tailwind.config.ts`.
- **Cities**: copy lives in `src/lib/cities.ts`. Add or remove cities there and the locations directory, footer, inventory filter, and per-city landing pages all update automatically.
- **Services**: edit `src/lib/services.ts`.
- **Contact info**: set `NEXT_PUBLIC_BUSINESS_PHONE` and `NEXT_PUBLIC_BUSINESS_EMAIL` in `.env`.

## Production notes

- Swap SQLite for Postgres by changing the `datasource db` block in `prisma/schema.prisma` and pointing `DATABASE_URL` at Postgres.
- Run `npm run prisma:deploy` instead of `migrate dev`.
- Set `NODE_ENV=production`, regenerate `SESSION_SECRET`, and pick a strong `ADMIN_PASSWORD`.
- For a hardened multi-user setup, replace the single-password auth in `src/lib/auth.ts` with a proper user table + password hashing (bcrypt/argon2).
