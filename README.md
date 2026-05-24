<<<<<<< HEAD
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
=======
# Distributed Systems - Jerry E-Commerce Platform

Një platformë dyqani online (E-Commerce) e thjeshtë dhe intuitive që u mundëson përdoruesve të eksplorojnë produkte të ndryshme në mënyrë të lehtë dhe të organizuar. Ky projekt është zhvilluar në kuadër të lëndës **Sistemet e Shpërndara (Distributed Systems)**, duke synuar të ofrojë një eksperiencë të shpejtë dhe të këndshme blerjeje.

---

## 🚀 Karakteristikat Kryesore (Features)

* **Eksplorimi i Produkteve:** Navigim i thjeshtë dhe i organizuar i produkteve sipas kategorive.
* **Arkitekturë e Shpërndarë:** Ndërtuar me parimet e sistemeve të shpërndara për të siguruar disponueshmëri dhe performancë të lartë.
* **Ndërfaqe Intuitive (UI/UX):** Eksperiencë përdoruesi e pastër, e shpejtë dhe moderne.
* **Menaxhimi i Shportës:** Mundësi për të shtuar, modifikuar dhe hequr produkte nga shporta në kohë reale.

---

## 🛠️ Teknologzitë e Përdorura (Tech Stack)

Projekti bazohet në teknologjitë moderne për zhvillimin e aplikacioneve të shpërndara dhe të shkallëzueshme:

* **Backend:** Node.js / Typescript
* **Frontend:** React.js / Typescript
* **Database:** PostgreSQL

---

## 💻 Konfigurimi dhe Instalimi (Setup & Installation)

Ndiqni hapat e mëposhtëm për të klonuar, konfiguruar dhe ekzekutuar projektin në mjedisin tuaj lokal:

### 1. Klonimi i Repozitorit
git clone [https://github.com/lorikagajs/Distributed_Systems_Jerry.git](https://github.com/lorikagajs/Distributed_Systems_Jerry.git)
cd Distributed_Systems_Jerry

# Navigoni te direktoria e backend-it
cd backend

# Instaloni të gjitha varësitë e nevojshme (dependencies)
npm install

# Krijoni skedarin e konfigurimit të mjedisit (.env)
# Ndryshoni vlerat sipas konfigurimit tuaj lokal (Porta, Lidhja me Databazën, etj.)
cp .env.example .env

# Nisni serverin në mjedisin e zhvillimit (Development Mode)
npm run dev

# Ose nisni serverin në mjedisin e prodhimit (Production Mode)
npm start

# Navigoni te direktoria e frontend-it
cd ../frontend

# Instaloni varësitë e nevojshme për ndërfaqen
npm install

# Nisni aplikacionin e frontend-it
npm start
>>>>>>> 92a3d75f410de3d6b3277942d48de6734ce69824
