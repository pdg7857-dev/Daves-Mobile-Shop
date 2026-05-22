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
- Prisma + SQLite (swap to Postgres in production by editing `prisma/schema.prisma`)
- HMAC-signed cookie session (no external auth dep)
- LocalStorage-backed cart with server-side validation at order time

## Quick start

```bash
# 1. Install
npm install

# 2. Configure
cp .env.example .env
# In .env:
#   ADMIN_PASSWORD=<pick one>
#   SESSION_SECRET=$(openssl rand -hex 32)
#   NEXT_PUBLIC_BUSINESS_EMAIL=your-etransfer-email@example.com

# 3. Initialize DB
npx prisma migrate dev --name init
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

- Swap SQLite for Postgres by changing the `datasource db` block in `prisma/schema.prisma` and pointing `DATABASE_URL` at Postgres.
- Run `npm run prisma:deploy` instead of `migrate dev`.
- Set `NODE_ENV=production`, regenerate `SESSION_SECRET`, pick a strong `ADMIN_PASSWORD`.
- For multi-user staff accounts, replace the single-password auth in `src/lib/auth.ts` with a User table + bcrypt/argon2.
- For email confirmations on new orders, add a hook in `src/app/api/orders/route.ts` after the transaction commits (Resend / Postmark / SES).
