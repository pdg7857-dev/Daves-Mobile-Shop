# Dave's Mobile Shop

Online store + admin back-office for a mobile phone repair and resale business. Phones and parts ship anywhere in Canada.

## What's in here

- **Public site**: home, services, in-stock phones, parts catalogue, contact, customer order tracking, and a unique landing page per city (GTA, Montréal, Ottawa, Québec, Moncton, Halifax).
- **Online store**: cart, checkout with Canadian tax + shipping calculation, order placement, e-Transfer payment workflow, customer order lookup.
- **Admin** (password-protected at `/admin`): order management with status workflow and tracking numbers, inventory CRUD with IMEI / serial / purchase tracking, repair history per device, parts inventory, suppliers.
- **API** (`/api/*`): JSON endpoints for orders, inventory, repairs, parts, suppliers, and auth.

## Stack

- Next.js 15 (App Router) + TypeScript + React 18
- Tailwind CSS
- Prisma + Postgres (any Postgres works: Neon, Vercel Postgres, Supabase, Railway, local Docker)
- HMAC-signed cookie session (no external auth dep)
- LocalStorage-backed cart with server-side validation at order time

## Deploy to Vercel (live preview, ~5 min)

1. **Create a free Postgres database.** Easiest is [Neon](https://neon.tech) (free tier, no credit card). Create a project, copy the connection string — it looks like `postgresql://user:pass@host/db?sslmode=require`.

2. **Import this repo in Vercel.** Go to [vercel.com/new](https://vercel.com/new), pick `pdg7857-dev/daves-mobile-shop`, and on the import screen select branch `claude/mobile-repair-website-NDfZW` (or merge to `main` first).

3. **Add environment variables** in the Vercel project settings:
   - `DATABASE_URL` → your Neon connection string
   - `ADMIN_PASSWORD` → any password you'll remember
   - `SESSION_SECRET` → generate with `openssl rand -hex 32`
   - `NEXT_PUBLIC_BUSINESS_EMAIL` → the email you use for Interac e-Transfer
   - `NEXT_PUBLIC_BUSINESS_PHONE` → your business phone

4. **Deploy.** Vercel runs `prisma generate && prisma db push` during the build, which creates all the tables in your Postgres DB from `prisma/schema.prisma`. You'll get a `*.vercel.app` URL.

5. **Seed sample data (optional, one-time):** locally point your `.env` `DATABASE_URL` at the same Neon DB and run `npm run db:seed`. Or just add inventory through `/admin`.

6. **Visit your site.** Open `/admin`, sign in with `ADMIN_PASSWORD`, add a phone or two, then browse `/inventory` and `/cart` as a customer.

## Local dev

```bash
# 1. Install
npm install

# 2. Configure
cp .env.example .env
# In .env:
#   DATABASE_URL=postgresql://...   (Neon free tier, or local docker:
#                                    docker run --name dms-pg -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:16)
#   ADMIN_PASSWORD=<pick one>
#   SESSION_SECRET=$(openssl rand -hex 32)
#   NEXT_PUBLIC_BUSINESS_EMAIL=your-etransfer-email@example.com

# 3. Initialize DB schema + seed
npx prisma db push
npm run db:seed

# 4. Run
npm run dev
# → http://localhost:3000
# → http://localhost:3000/admin  (sign in with ADMIN_PASSWORD)
```

## Public pages

| URL | What it is |
| --- | --- |
| `/` | Hero, featured phones, services preview, city directory |
| `/services` | All 10 repair services with pricing and turnaround |
| `/inventory` | Phones for sale; filter by city and brand |
| `/inventory/[id]` | Phone detail with service history + Add to cart |
| `/parts` | Parts catalogue; filter by category |
| `/parts/[id]` | Part detail with quantity selector |
| `/cart` | Shopping cart with live totals |
| `/checkout` | Customer info, shipping address, Canadian tax + shipping calculation |
| `/orders` | Customer order lookup (order # + email) |
| `/orders/[orderNumber]` | Order status, items, tracking number when shipped |
| `/locations/[city]` | Unique city landing page (GTA, Montréal, Ottawa, Québec, Moncton, Halifax) |
| `/contact` | Contact info + per-location hours |
| `/admin` | Staff login |

## Admin pages (require sign-in)

| URL | What it is |
| --- | --- |
| `/admin/dashboard` | Order KPIs, revenue, inventory value, low-stock alerts |
| `/admin/orders` | Filterable orders table by status |
| `/admin/orders/[id]` | Order detail; update status, set tracking number, internal notes |
| `/admin/inventory` | Inventory table with search and status filter |
| `/admin/inventory/new` | Add a phone |
| `/admin/inventory/[id]` | Edit a phone + log repairs |
| `/admin/parts` | Parts table |
| `/admin/parts/new` | Add a part |
| `/admin/parts/[id]` | Edit a part |
| `/admin/suppliers` | Supplier list + add form |

## Order workflow

1. **Customer**: adds phones / parts to cart, fills checkout form, submits.
2. **System**: validates availability inside a DB transaction, reserves phones (`status: reserved`), decrements part stock, creates the order with status `pending_payment`. Order number issued (`DMS-XXXXXX`).
3. **Customer**: sees confirmation page with e-Transfer instructions including order number for the memo line.
4. **Admin**: receives the order in `/admin/orders`, manually marks `paid` after e-Transfer arrives.
5. **Admin**: marks `shipped` and enters tracking number + carrier → phones flip from `reserved` to `sold`, customer sees tracking on their order page.
6. **Admin**: marks `delivered` (optional).

Cancelling or refunding a not-yet-shipped order automatically restores phones to `for_sale` and replenishes part stock.

## Data model

```
Supplier   → name, contact, notes
Phone      → brand, model, storage, color, condition, IMEI, serial,
             purchasePrice, askingPrice, status (for_sale|in_repair|reserved|sold),
             purchaseDate, supplierId/purchasedFrom, notes, city, imageUrl,
             soldDate, salePrice, soldTo
Repair     → phoneId, serviceType, description, partCost, laborCost, performedBy, performedAt
Part       → name, category, compatibleWith, brand, price, stock, imageUrl, description
Order      → orderNumber, customerName, customerEmail, customerPhone,
             addressLine1/2, city, province, postalCode, country, customerNotes,
             status, subtotal, shippingCost, taxAmount, total, paymentMethod,
             trackingNumber, carrier, adminNotes, paidAt, shippedAt, deliveredAt, cancelledAt
OrderItem  → orderId, itemType (phone|part), phoneId|partId, name, unitPrice, quantity
```

See `prisma/schema.prisma` for the canonical schema.

## Canadian tax & shipping

Tax rates per province (`src/lib/shipping.ts`):

| Province | Rate | Label |
| --- | --- | --- |
| ON | 13% | HST |
| QC | 14.975% | GST + QST |
| NB · NS · NL · PE | 15% | HST |
| BC · MB | 12% | GST + PST |
| SK | 11% | GST + PST |
| AB · NT · NU · YT | 5% | GST |

Shipping rule: **free on orders ≥ $200**, otherwise $15 standard / $25 to NT/NU/YT.
All amounts authoritatively recalculated server-side at order placement — the client total is only a display estimate.

## Payment

Default flow is **Interac e-Transfer** — the order is created in `pending_payment` and the customer receives instructions on the confirmation page. Admin manually flips to `paid` when the transfer arrives.

To wire up Stripe Checkout instead:
1. `npm install stripe @stripe/stripe-js`
2. Add a `/api/checkout/session` route that creates a Stripe Checkout session from cart contents
3. On Stripe webhook `checkout.session.completed`, PATCH `/api/admin/orders/[id]` with `status: "paid"`
4. Replace the e-Transfer message in `src/app/orders/[orderNumber]/page.tsx`

## API endpoints

### Public
| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/api/orders` | Place an order (no auth) |
| `POST` | `/api/auth/login` | Form-encoded `password` → sets session cookie |
| `POST` | `/api/auth/logout` | Clears session |

### Admin (session cookie required)
| Method | Path | Purpose |
| --- | --- | --- |
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
| `PATCH`| `/api/admin/orders/:id` | Update order status, tracking, notes (handles inventory side-effects) |
| `DELETE` | `/api/admin/orders/:id` | Delete an order |

## Production notes

- The build command runs `prisma db push` to sync the schema. For stricter production workflows, generate migrations locally with `npx prisma migrate dev --name <change>`, commit the `prisma/migrations/` folder, and swap the build script to use `prisma migrate deploy`.
- Set `NODE_ENV=production`, regenerate `SESSION_SECRET`, pick a strong `ADMIN_PASSWORD`.
- For multi-user staff accounts, replace the single-password auth in `src/lib/auth.ts` with a User table + bcrypt/argon2.
- For email confirmations on new orders, add a hook in `src/app/api/orders/route.ts` after the transaction commits (Resend / Postmark / SES).
