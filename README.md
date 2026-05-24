# Distributed_Systems_Jerry

Multi-tenant e-commerce app ([GitHub repo](https://github.com/lorikagajs/Distributed_Systems_Jerry)).

## Quick start

### 1. Database (Docker)

Start Docker Desktop, then:

```bash
docker compose up -d
```

Postgres: `jerry` / `jerry_secret` on `localhost:5432`, database `jerry_ecommerce`.

### 2. Backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate deploy
npm run seed
npm run start:dev
```

API: http://localhost:3000 — Swagger: http://localhost:3000/api/docs

### 3. Frontend

```bash
cd frontent
npm install
npm run dev
```

Open http://localhost:5173

`.env.development` must include:

```
VITE_USE_MOCK_DATA=false
VITE_API_URL=http://localhost:3000
```

### 4. Try a store

Seeded tenant slugs:

- `tech-store` → http://localhost:5173/tech-store
- `fashion-hub` → http://localhost:5173/fashion-hub
- `home-goods` → http://localhost:5173/home-goods
- `sports-world` → http://localhost:5173/sports-world

Register at `/tech-store/register` (password min. **8** characters).

## How frontend connects to backend

| Feature | Frontend | Backend |
|--------|----------|---------|
| Store list | `GET /tenants` | Public tenants list |
| Store config | `GET /tenants/:slug/config` | Theme + `tenantId` for auth |
| Register / login | `POST /auth/register`, `POST /auth/login` | Body includes `tenantId` |
| Products, cart, orders | `GET /products`, etc. | `?tenantId=` from `TenantContext` |

Routes use `/:tenantSlug/...` in the UI; API calls send `tenantId` as a query parameter (not `/jerry/` in the API path).
