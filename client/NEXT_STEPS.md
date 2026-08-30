# React Native client — current setup and next steps

This file is a study guide. The backend (`/server`) is done. This document explains what `/client` is today, what the latest Expo logs mean, and the small steps we will take to build the lemonade app.

---

## Honest status (read this first)

| Question | Answer |
| --- | --- |
| Did Expo start correctly? | **Yes.** Metro is running at `exp://10.0.0.169:8081`. |
| Did the phone connect? | **Yes.** The line `iOS Bundled … expo-router/entry.js (1087 modules)` means Expo Go on your iPhone downloaded the JavaScript bundle. That is the success signal. |
| Are the red stream errors a crash? | **No.** `Cannot pipe to a closed or destroyed stream` is the **web** preview disconnecting mid-response. Ignore it for phone work. |
| `pointerEvents is deprecated` | Harmless Expo/web warning. Not your code. |
| Is this production-standard lemonade code? | **No.** You have a working Expo **starter**, not the assignment app yet. |
| Is it a good starting structure? | **Yes, as a blank canvas.** Expo SDK 54, TypeScript, Expo Router, ESLint. After `npm run reset-project`, the live screens are two files. That is easier to learn than the demo tabs. |
| Are we ready to write lemonade features? | **Yes — that is the next work.** The app does not yet fetch beverages, build a cart, or submit orders. |

The first iOS bundle took ~28 seconds. Later reloads should be much faster.

---

## What the assignment requires from the app

The React Native app is the **customer** UI. Admin create/update/delete of drinks is already covered by the NestJS API (and Swagger at `http://localhost:3000/docs`). The phone app does **not** need admin screens.

1. **Browse** — `GET /api/beverages` and show each drink with its sizes and prices.
2. **Build an order** — pick one or more items (type + size + quantity), enter **name** and **phone or email**, show a **live total**.
3. **Submit** — `POST /api/orders` (server calculates the real total). Show the **confirmation number**.
4. **Stay dynamic** — if an admin changes a drink in the API, the next fetch in the app shows it. No app rebuild.
5. **HTTP only** — talk to NestJS over HTTP. Handle errors and show a message on screen.

**Bonus (if time):** client-side validation, a clear cart store (Context or Zustand), tests, a sequence diagram, a cleaner UI.

---

## How the whole repo fits together

```text
lemonade-stand-application/
├── docker-compose.yml     PostgreSQL (port 5433)
├── server/                NestJS API  →  http://localhost:3000/api
└── client/                This Expo app (phone talks to the API)
```

Flow you will build:

```text
Phone (Expo Go)
    │  GET  /api/beverages
    │  POST /api/orders
    ▼
NestJS (server)
    │
    ▼
PostgreSQL
```

**Important for a physical phone:** `localhost` on the phone means the phone itself, not your PC. The phone must call your PC’s LAN IP, which Expo already detected as **`10.0.0.169`**. So the API base URL on device will look like `http://10.0.0.169:3000/api`, while a browser on the PC can still use `http://localhost:3000/api`. The Nest server must be running, and Windows Firewall must allow port **3000** (same idea as Metro on 8081).

---

## React Native crash course (start here)

React Native is React, but the building blocks are **native**, not HTML.

| Web (what you may know) | React Native |
| --- | --- |
| `<div>` | `<View>` |
| `<p>` / `<span>` | `<Text>` (text **must** be inside `Text`) |
| `<input>` | `<TextInput>` |
| `<button>` | `<Pressable>` or `<Button>` |
| CSS files | `StyleSheet.create({ ... })` |
| `className` | `style={styles.foo}` |
| Browser | Expo Go (dev) or a real app binary (later) |

**Expo** is the toolchain: it gives you a project, Metro (the bundler), and Expo Go so you can run on a phone without Xcode/Android Studio for this assignment.

**Expo Router** is file-based routing. A file under `app/` becomes a screen. `app/index.tsx` is the home screen. `app/_layout.tsx` wraps every screen (like a root layout in Next.js).

**Metro** watches your files, bundles JavaScript, and sends it to the phone. Edit a file → the phone reloads. That is why admin API changes can appear on the next fetch without rebuilding a native binary.

---

## Current `/client` map (after reset)

Two layers exist on disk:

1. **Live app** — what Expo Go actually runs (`app/index.tsx` + `app/_layout.tsx`).
2. **`app-example/`** — the original Expo demo (tabs, Hello Wave, etc.). It is **not** loaded. `.gitignore` already ignores `app-example`. You can delete that folder when you no longer want it as a reference.

### Live files (the real starting point)

| File | Use case |
| --- | --- |
| `app/_layout.tsx` | Root layout. Today it only renders `<Stack />` (a stack navigator with no extra screens). Later this is where we wrap the app with a cart provider and set the header title. |
| `app/index.tsx` | Home screen. Today it is a centered `View` + `Text` placeholder. This will become the drink menu. |
| `package.json` | Scripts and libraries. `npx expo start` / `npm start` starts Metro. Dependencies: React 19, React Native 0.81, Expo SDK 54, Expo Router. |
| `app.json` | Expo config: app name, icons, splash screen, plugins (`expo-router`, splash). Not business logic. |
| `tsconfig.json` | TypeScript. `strict: true`. `@/*` path alias means `@/foo` = file at project root `foo`. |
| `eslint.config.js` | Lint rules via `eslint-config-expo`. |
| `assets/images/` | Icons, splash, favicon. Used by `app.json`, not by our screens yet. |
| `.gitignore` | Ignores `node_modules`, `.expo`, `app-example`, native `ios/`/`android/` folders. |
| `AGENTS.md` / `CLAUDE.md` | Notes for AI tools: read Expo **v54** docs, not a newer SDK. You can ignore these while learning. |
| `README.md` | Default Expo welcome. We will replace this with real run instructions before submit. |

### Config / tooling only

| File | Use case |
| --- | --- |
| `.vscode/` | Editor suggestions (optional). |
| `.expo/` | Local cache from `expo start`. Do not commit. |
| `node_modules/` | Installed packages. Do not edit. |
| `expo-env.d.ts` | Generated types for Expo. |

### `app-example/` (demo only — not in the running app)

These files taught Expo’s default template. They are useful as copy-paste examples, then delete the folder.

| File | What it taught |
| --- | --- |
| `app-example/app/_layout.tsx` | Root stack + light/dark theme + a modal screen. |
| `app-example/app/(tabs)/_layout.tsx` | Bottom tabs (Home / Explore). Folders in `(parentheses)` are **route groups** — they organize files without adding a URL segment. |
| `app-example/app/(tabs)/index.tsx` | Demo home with parallax scroll. |
| `app-example/app/(tabs)/explore.tsx` | Second tab. |
| `app-example/app/modal.tsx` | A screen opened as a modal. |
| `app-example/components/*` | Reusable UI: themed text/view, haptic tab button, icons. |
| `app-example/hooks/*` | `useColorScheme`, `useThemeColor` — light/dark helpers. |
| `app-example/constants/theme.ts` | Color tokens. |
| `app-example/scripts/reset-project.js` | The script you already ran. |

You do **not** need to restore the demo tabs for the assignment. A simple stack (Menu → Cart/Checkout → Confirmation) is clearer.

---

## Backend APIs the app will use

Base path: `/api` (see `server` `API_PREFIX`).

| Method | Path | App use |
| --- | --- | --- |
| `GET` | `/api/health` | Smoke test that the phone can reach Nest. |
| `GET` | `/api/beverages` | Menu. Each item: `id`, `name`, `sizes[]` with `{ id, name, price }`. |
| `POST` | `/api/orders` | Place order. Body below. **Do not send a total** — the server computes it. |
| `GET` | `/api/orders/:confirmationNumber` | Optional lookup. Assignment only requires showing the number after submit. |

`POST /api/orders` body:

```json
{
  "customerName": "Ada Lovelace",
  "email": "ada@example.com",
  "phone": "+1 416 555 0100",
  "items": [
    { "beverageId": "<uuid>", "sizeId": "<uuid>", "quantity": 2 }
  ]
}
```

Rules the server already enforces:

- Name required.
- At least one of **email** or **phone**.
- At least one item; quantity 1–99.
- Unknown drink/size combinations → `400`.
- Response includes `confirmationNumber` (like `LS-A1B2C3D4`) and `total`.

Admin-only endpoints (`POST/PATCH/DELETE` beverages and sizes) stay in Swagger. The phone app only **reads** the catalog.

---

## Target folder layout (we will grow into this, step by step)

Not created yet. This is the destination so each small step has a home.

```text
client/
├── app/
│   ├── _layout.tsx              # providers + stack
│   ├── index.tsx               # menu
│   ├── cart.tsx                # cart + customer form
│   └── confirmation.tsx        # confirmation number
├── src/
│   ├── api/
│   │   ├── client.ts           # base URL + fetch helper
│   │   ├── beverages.ts
│   │   └── orders.ts
│   ├── cart/
│   │   └── cart-context.tsx    # cart state (bonus: Zustand later if we want)
│   ├── types/
│   │   └── api.ts              # Beverage, Order types matching the API
│   ├── components/             # DrinkCard, QtyStepper, ErrorBanner, …
│   └── config.ts              # API_BASE_URL
├── assets/
├── package.json
└── app.json
```

Why `src/` instead of dumping everything in `app/`? Screens stay in `app/` because Expo Router requires that. API, types, and cart logic are not screens, so they live beside it. Same idea as NestJS: controllers vs services.

---

## Small steps (one at a time)

We will stop after each step so you can read the code and run it on the phone. Do not skip ahead.

### Step 0 — Confirm both processes (now)

You already have Expo running. Also keep Nest + Docker up when we start fetching:

```powershell
# repo root
docker compose up -d
cd server
npm run start:dev
```

On the PC browser: `http://localhost:3000/api/health` and `http://localhost:3000/docs`.

### Step 1 — Delete demo clutter (optional, 5 minutes) ✅

Deleted `client/app-example`. Live app is `app/_layout.tsx` + `app/index.tsx`.

### Step 2 — Learn by changing the home screen ✅

Changed the home screen title/colors and set the stack header to “Menu”. Goal: prove the edit → phone reload loop. No API yet.

### Step 3 — API config + health check from the phone ✅

Added `src/config.ts` (LAN IP from Expo `hostUri`, not `localhost`) and `src/api/health.ts`. Home screen shows the URL plus **API OK** or the error. Nest + Docker must be running for this to succeed.

### Step 4 — Types + `GET /api/beverages` ✅

Added `src/types/api.ts` (matches Nest `BeverageResponseDto`) and `src/api/beverages.ts`. Home screen lists drink **names** in a `FlatList`, with loading / error / empty states. Sizes and prices are fetched but not shown yet (Step 5).

### Step 4b — OpenAPI + Kubb + TanStack Query (after Step 11)

Do this **after** pull-to-refresh works (Step 11), **before** README (Step 12). By then you already understand hand-written `fetch`. Kubb replaces `src/api/beverages.ts`, `src/api/orders.ts`, and the menu `useEffect` with generated TanStack Query hooks. Not required by the take-home; it is the Manulife interview talking point.

### Step 5 — Show sizes and prices ✅

Same `GET /api/beverages` payload. `DrinkCard` lists each size and price. No extra request. No cart yet.

### Step 6 — Quantity + add to cart (in memory) ✅

Pick a size, set quantity, **Add**. Cart is `useState` on the menu screen. Header shows **Cart N**. Same drink + size merges quantities (max 99). No cart screen yet (Step 8).

### Step 7 — Lift cart into Context ✅

Cart `useState` moved to `CartProvider` in the root layout. Menu (`addItem`) and header (`CartBadge`) both call `useCart()` — no prop drilling. Ready for a Cart screen in Step 8.

### Step 8 — Cart screen + live total ✅

`app/cart.tsx` reads `useCart()`. Line items, quantity, remove, live total (client-side). Header **Cart N** is a button to `/cart`. Native headers freeze Context, so the badge is refreshed with `setOptions` when the count changes.

### Step 9 — Customer form + client validation ✅

Cart checkout form: name required, phone **or** email. Errors match the Nest rules. **Place order** validates now; the POST is Step 10.

Web: `app.json` `web.output` is `single` (SPA, no SSR) so the Expo stream errors go away. Cart footer uses `flexShrink: 0` plus safe-area padding so Total is not clipped.

### Step 10 — `POST /api/orders` + confirmation screen ✅

`createOrder` posts the cart to Nest. On success, the cart is cleared and `app/confirmation.tsx` shows the server confirmation number and total. API errors (400, network) appear on the cart. Empty cart **Back to menu** is a full-width green button.

### Step 11 — Polish: pull-to-refresh, disabled submit, empty cart ✅

Pull down on the menu to refetch beverages (proves dynamic updates). Place order stays disabled while the POST is in flight. Name/email/phone live in cart context so they survive going back to the menu. Empty/confirmation **Back to menu** is centered with `maxWidth: 320` so web and phone match.

### Step 12 — README, sequence diagram, GitHub

Update root `README.md` with client run steps (Expo Go, LAN IP, both servers). Add a simple sequence diagram for order placement. Public repo as required.

### Step 13 — Tests (bonus, if time)

A few tests around cart total and the submit payload. Not a blocker for core requirements.

---

## What “production-standard” will look like (later)

We are **not** there yet. When the steps above are done, the client should have:

- Clear screens and a small `src/` layer (API / types / cart).
- No hardcoded drink list.
- Errors visible to the user.
- Types aligned with the Nest DTOs.
- Config for API URL (env or a single config file).
- README that a reviewer can follow.

We will **not** chase App Store submission, push notifications, or auth. The assignment does not ask for those.

---

## Questions (please answer before we write feature code)

1. **Screens:** Prefer **Menu → Cart/Checkout → Confirmation** (three screens), or one long scrolling page? Recommendation: three screens — easier to learn and closer to a real app.
2. **Admin in the app?** Recommendation: **no**. Use Swagger for admin. Confirm that is OK.
3. **Cart library:** Start with **React Context** (no extra package), or go straight to **Zustand** (small bonus)? Recommendation: Context first; Zustand only if you want the extra talking point.
4. **Look up an old order** by confirmation number? The API supports it. Assignment does not require it. Skip unless you want a fourth screen.
5. **Node version:** Expo 54 prefers Node `>= 20.19.4`. If `node -v` is still `20.18.0`, upgrade to **Node 24 LTS** when you can. Metro works today; it is just unsupported.

Answer these when we start Step 6–7. Step 3 does not depend on them.
