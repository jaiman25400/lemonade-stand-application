# Lemonade Stand

Customer app and API for a digital lemonade stand. Browse drinks from the live catalog, build a cart, and place an order. The **server calculates the total** and returns a confirmation number.

Frontend and backend live in one public repository:

```text
lemonade-stand-application/
├── docker-compose.yml   PostgreSQL
├── server/              NestJS API  →  http://localhost:3000/api
└── client/              Expo (React Native) app
```

---

## Prerequisites

- Node.js 20 or later
- npm
- Docker Desktop (for PostgreSQL)
- [Expo Go](https://expo.dev/go) on a phone, **or** a browser for the web preview

---

## Setup, build, and run

### 1. Backend — database + API

Start from the **repository root** and paste the whole block. It starts PostgreSQL, creates the `.env`, installs dependencies, and runs the API in watch mode.

**macOS / Linux**

```bash
docker compose up -d
cd server
cp .env.example .env
npm install
npm run start:dev
```

**Windows (PowerShell)**

```powershell
docker compose up -d
cd server
Copy-Item .env.example .env -Force
npm install
npm run start:dev
```

Wait for `API listening on http://localhost:3000/api` in the terminal. Tables are created on first boot, so there is no migration step. If Postgres is still starting, TypeORM retries the connection automatically.

PostgreSQL runs on **localhost:5433** (container port 5432) so it does not collide with a local Postgres on 5432. Leave this terminal running.

Production-style build instead of watch mode (optional):

```bash
cd server
npm run build
npm run start:prod
```

| URL | Purpose |
| --- | --- |
| http://localhost:3000/api/health | Health check |
| http://localhost:3000/docs | Swagger — admin create/update/delete for drinks and sizes |
| `GET /api/beverages` | Catalog with sizes and prices |
| `POST /api/orders` | Place an order |
| `GET /api/orders/:confirmationNumber` | Look up an order |

On Windows, allow inbound **3000** (API) and **8081** (Metro) if you use a physical phone.

### 2. Frontend (`/client`)

Leave the API running. Open a **second terminal** at the repository root and paste:

```bash
cd client
npm install
npx expo start
```

- **Phone:** scan the QR code with Expo Go. The phone must be on the **same Wi-Fi** as your PC. The app does **not** use `localhost` on device — it uses the LAN IP Expo already printed (for example `10.0.0.169`).
- **Web:** press `w` in the Expo terminal. The browser talks to `http://localhost:3000/api`.

There is no native `ios/` / `android/` build in this repo. Expo Go loads the JavaScript bundle. That matches the assignment (Expo is allowed) and is how reviewers can run the app without Xcode or Android Studio.

Optional API override (must include `/api`):

```bash
# client/.env
EXPO_PUBLIC_API_URL=http://10.0.0.169:3000/api
```

Pull down on the menu after you change the catalog in Swagger. The app refetches `GET /api/beverages` — no app rebuild.

### If the menu cannot load

| You see | Typical cause |
| --- | --- |
| Can't reach the API… | Nest is not running, firewall, or phone on a different network |
| Request timed out… | Nest started but did not answer in time |
| The server had a problem… | Nest returned HTTP 5xx |
| Validation / item not available | Nest returned HTTP 4xx with a message |

Fix the cause, then tap **Retry** (menu) or **Place order** again (cart).

---

## Tests

### API — unit tests

Services with mocked repositories. No database needed.

```bash
cd server
npm test
```

Covers the order total being computed from catalog prices (never the client), duplicate lines merging before pricing, rejecting items that are not on the menu, and `NotFoundException` for unknown ids.

### API — integration tests

Boots the real Nest application with the real validation pipe and exception filter, and drives it over HTTP with `supertest` against **the running PostgreSQL container**.

```bash
# Postgres must be up and server/.env must exist — see step 1 above
docker compose up -d
cd server
npm run test:e2e
```

Eight scenarios in `server/test/app.e2e-spec.ts`:

| Scenario | What it proves |
| --- | --- |
| `GET /api/health` | App boots with the global `/api` prefix |
| `GET /api/beverages` | Catalog endpoint returns a list |
| Beverage create → read → update → delete | Full admin CRUD round trip, then 404 after delete |
| Link size + price to a beverage | Sizes, pricing, and unlink work end to end |
| **Place an order** | Server computes `total` from catalog prices and issues an `LS-XXXXXXXX` confirmation |
| **Re-read the order after a price change** | Line prices are snapshotted — the historic order still totals the original amount |
| Order with a client-supplied `total`, and order with no contact | Both rejected with `400` |
| Unknown route | Consistent error body (`statusCode`, `message`, `path`, `timestamp`) |

### App — unit tests

```bash
cd client
npm test
```

Cart behaviour (merging lines, totals, quantity cap), checkout validation (name plus phone **or** email), size reconciliation after a catalog refetch, request timeout and cancellation, and API error mapping for network / timeout / 4xx / 5xx.

The client suite is unit-level. There are no rendered-component tests; the logic that would drive them is extracted into pure modules and tested directly.

---

## Assumptions

- **Admin is Swagger, not a phone screen.** The assignment asks for beverage/size CRUD on the API. Reviewers manage the catalog at http://localhost:3000/docs. The React Native app is the customer flow only (menu → cart → confirmation).
- **Phone or email, not both required.** The assignment says the customer provides a phone number *or* an email. Name is always required.
- **The charged total is the server total.** The cart shows a live estimate from catalog prices already in the app. Confirmation shows the amount Nest persisted.
- **Expo Go is the delivery method.** No App Store / Play Store build, push notifications, or login.
- **PostgreSQL is the database.** TypeORM `synchronize` is on in non-production so tables appear on first boot. Do not use that in a real production deploy.
- **North American phone formatting in the app.** The UI stores 10 national digits and submits `+1XXXXXXXXXX`. Nest accepts a slightly wider phone pattern so Swagger/try-it still works.
- **Kubb regenerate is not part of daily run.** `openapi:pull` / `generate:api` are only needed after the Nest contract changes. Nest must be running for the pull.

---

## Design choices

- **One public repo, `/client` and `/server`.** HTTP only between them. No shared runtime.
- **Nest modules** for health, sizes, beverages, and orders (controllers / services / DTOs / entities).
- **Money in integer cents** on the server, stored as `numeric(10,2)`. Order lines snapshot drink name, size name, and unit price so later catalog edits do not rewrite history.
- **React Native:** Expo Router stack (Menu → Cart → Confirmation). Cart is React Context. Menu load and place-order use TanStack Query. The HTTP client is generated from Nest OpenAPI with [Kubb](https://kubb.dev) so types stay aligned with the API.
- **Queries retry only transient network failures.** `POST /orders` never retries.
- **Database in Docker, API on the host.** Compose runs Postgres. Nest stays on the machine so Expo Go on a phone can reach it via the LAN IP (`localhost` inside a container would not be the phone’s PC).

---

## Bonus features

1. **Unit and integration tests** — Nest has unit specs over mocked repositories plus an **integration suite** that drives the real app over HTTP against PostgreSQL (admin CRUD, order placement with a server-calculated total, price snapshotting, validation rejections, error-body shape). The React Native app has unit specs for cart logic, checkout validation, size reconciliation, request timeouts, and API error mapping. See [Tests](#tests).
2. **Input validation** — Client: name, email format, 10-digit phone, contact required. Nest: `class-validator` DTOs, whitelist, at-least-one contact, quantity bounds.
3. **State management** — React Context for cart + customer fields; TanStack Query for server state (menu cache, mutation for checkout).
4. **Containerization** — `docker-compose.yml` runs PostgreSQL 16 with a named volume and healthcheck.
5. **User interface** — Menu with sizes/prices, cart badge, quantity steppers, checkout form, confirmation with selectable confirmation number. Keyboard-safe checkout on iOS/Android.
6. **Sequence diagram** — order placement flow below.

---

## Order flow

```mermaid
sequenceDiagram
  actor Customer
  participant App as Expo app
  participant API as NestJS
  participant DB as PostgreSQL

  Customer->>App: Open menu
  App->>API: GET /api/beverages
  API->>DB: Load drinks + sizes
  API-->>App: Catalog (prices)
  Customer->>App: Add items, name, email or phone
  Customer->>App: Place order
  App->>API: POST /api/orders
  API->>DB: Snapshot line prices, save order
  API-->>App: confirmationNumber + total
  App-->>Customer: Confirmation screen
```

---

## Error handling

- **Nest:** global `ValidationPipe` and `AllExceptionsFilter` return JSON `{ statusCode, message, path, timestamp }`. Unknown drink/size on an order is `400`. Missing confirmation is `404`. Unexpected failures are `500` without leaking internals.
- **App:** timeouts, “API not reachable”, Nest 4xx messages, and 5xx are mapped to copy on the menu and cart. Retry stays available.

---

## Regenerating the typed client (optional)

Only after Nest API/DTO changes:

```bash
cd client
npm run openapi:pull
npm run generate:api
```

Do not hand-edit `client/src/gen`.
