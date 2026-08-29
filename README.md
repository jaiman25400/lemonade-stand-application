# Lemonade Stand Application

Digital lemonade stand: a NestJS API for beverages and orders, plus a React Native app for browsing and placing orders.

This repository keeps frontend and backend in one public repo, in separate directories (`/server` and `/client`).

## Repository structure

```text
lemonade-stand-application/
├── docker-compose.yml   # PostgreSQL
├── server/              # NestJS API (in progress)
├── client/              # React Native + Expo (not started yet)
├── README.md
└── .gitignore
```

## Prerequisites

- Node.js 20 or later (developed on Node `v20.18.0`)
- npm 11+
- Docker Desktop (for PostgreSQL)

NestJS **11** is used because it runs on Node 20. Nest CLI 12 requires Node 22+.

## Backend (`/server`)

```bash
# from the repository root — starts PostgreSQL
docker compose up -d

cd server
copy .env.example .env
npm install
npm run start:dev
```

PostgreSQL is available on **localhost:5433** (mapped from container port 5432). Port 5433 is used so a local Postgres already bound to 5432 does not conflict.

Stop the database with `docker compose down` from the repo root. Data is kept in a Docker volume unless you add `-v`.

| URL | Purpose |
| --- | --- |
| http://localhost:3000/api/health | Health check |
| http://localhost:3000/docs | Swagger UI |
| `POST /api/orders` | Place an order (server calculates total) |
| `GET /api/orders/:confirmationNumber` | Look up a confirmation |

Useful scripts:

| Script | Purpose |
| --- | --- |
| `npm run start:dev` | Watch mode for local development |
| `npm run start:prod` | Run the compiled `dist` build |
| `npm test` | Unit tests |
| `npm run test:e2e` | End-to-end tests |

## Frontend (`/client`)

Not started yet. The React Native app will be added after the API is in place.

## Current status

- [x] NestJS backend scaffolded in `/server`
- [x] Production HTTP foundation (config, validation, errors, health, Swagger)
- [x] PostgreSQL (Docker) + TypeORM connection
- [x] Beverage table + GET /api/beverages
- [x] Beverage create/update/delete
- [x] Sizes and beverage + size + price
- [x] Place order (snapshot price, server total, confirmation number)
- [ ] React Native client
