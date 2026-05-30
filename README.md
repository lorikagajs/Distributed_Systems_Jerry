# Jerry Store — Platformë E-Commerce me Shumë Dyqane

Projekt universitar për lëndën **Sistemet e Shperndara**. Platforma ofron një dyqan online me arkitekturë multi-tenant: disa dyqane të pavarura në një sistem të vetëm, me backend të ndarë, cache Redis dhe përpunim asinkron të email-eve.

---

## Si ta nisni projektin

### Kërkesat paraprake

- [Node.js](https://nodejs.org/) (v18 ose më i ri)
- [npm](https://www.npmjs.com/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (për PostgreSQL dhe Redis)

### 1. Klonimi

```bash
git clone https://github.com/lorikagajs/Distributed_Systems_Jerry.git
cd Distributed_Systems_Jerry
```

### 2. Baza e të dhënave dhe Redis (Docker)

Nisni Docker Desktop, pastaj:

```bash
docker compose up -d
```

- **PostgreSQL:** `localhost:5432` — përdoruesi `jerry`, fjalëkalimi `jerry_secret`, databaza `jerry_ecommerce`
- **Redis:** `localhost:6379` (opsional për cache dhe radhën e email-eve)

### 3. Backend (NestJS)

```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate deploy
npx prisma db seed
npm run start:dev
```

API: [http://localhost:3000](http://localhost:3000)  
Dokumentimi Swagger: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

Përditësoni `.env` sipas nevojës (JWT, SMTP për email konfirmimi porosie, Cloudinary për imazhe, etj.). Shikoni `backend/.env.example` për të gjitha variablat.

### 4. Frontend (React + Vite)

```bash
cd frontent
cp .env.example .env.development
npm install
npm run dev
```

Hapni [http://localhost:5173](http://localhost:5173)

Në `.env.development` vendosni:

```env
VITE_USE_MOCK_DATA=false
VITE_API_URL=http://localhost:3000
```

### 5. Hyrje demo (pas seed)

Fjalëkalimi për të gjithë përdoruesit e seed-it: **`useruser`**

| Dyqani | URL | Shembull klienti |
|--------|-----|------------------|
| Tech Store | [/tech-store](http://localhost:5173/tech-store) | `customer@tech-store.local` |
| Fashion Hub | [/fashion-hub](http://localhost:5173/fashion-hub) | `customer@fashion-hub.local` |
| Home & Living | [/home-goods](http://localhost:5173/home-goods) | `customer@home-goods.local` |
| Sports World | [/sports-world](http://localhost:5173/sports-world) | `customer@sports-world.local` |
| Gourmet Pantry | [/gourmet-pantry](http://localhost:5173/gourmet-pantry) | `customer@gourmet-pantry.local` |

Admin i dyqanit: email **`admin`** (i njëjti fjalëkalim `useruser`).

Faqja kryesore e zgjedhjes së dyqanit: [http://localhost:5173/](http://localhost:5173/) (**Jerry Store**).

### (Opsionale) Git hooks

Për të shmangur commit aksidental të skedarëve `.env`:

```powershell
.\scripts\setup-git-hooks.ps1
```

---

## Çfarë është ky projekt?

**Jerry Store** është një platformë e-commerce **multi-tenant**: çdo dyqan (tenant) ka katalogun, përdoruesit, porositë dhe temën e vet, ndërsa ndan të njëjtin backend dhe databazë. Përdoruesi zgjedh dyqanin në faqen kryesore, pastaj blen produkte, menaxhon shportën, vendos porosi dhe lë vlerësime — administratorët menaxhojnë produktet dhe porositë nga paneli i adminit.

Aspektet që lidhen me **sistemet e shperndara**:

- **Shumë tenantë** në një aplikacion të vetëm, me izolim logjik të të dhënave sipas `tenantId`
- **PostgreSQL** si magazinë qendrore e të dhënave (Prisma ORM)
- **Redis** për cache të produkteve dhe (opsionalisht) radhë **BullMQ** për dërgimin asinkron të email-eve të porosisë
- **API REST** me autentifikim JWT dhe dokumentim Swagger
- **Frontend** React që komunikon me backend-in përmes HTTP; mbështet edhe modalitet demo me të dhëna mock

Funksionalitete kryesore: regjistrim/hyrje për klient dhe admin, katalog produktesh me kategori, galeri imazhesh, shportë, porosi me pagesë/dërgesë, vlerësime, listë dëshirash, email konfirmimi porosie, panel administrimi.

### Struktura e repozitorit

| Dosja | Përshkrimi |
|-------|------------|
| `backend/` | API NestJS, Prisma, seed, email, cache |
| `frontent/` | UI React (Vite, Tailwind) |
| `docker-compose.yml` | PostgreSQL + Redis lokale |
| `scripts/` | Utilitete (p.sh. git hooks) |

### Stack teknologjik

- **Backend:** NestJS, TypeScript, Prisma, PostgreSQL, Redis, BullMQ, JWT, Nodemailer, Cloudinary  
- **Frontend:** React, TypeScript, Vite, Tailwind CSS, React Router, Axios  

---

## Ekipi

| # | Emri | Roli / Kontributi |
|---|------|-------------------|
| 1 | *[Emri i anëtarit 1]* | *[p.sh. Backend, DevOps]* |
| 2 | *[Emri i anëtarit 2]* | *[p.sh. Frontend, UI]* |
| 3 | *[Emri i anëtarit 3]* | *[p.sh. Databazë, testim]* |
| 4 | *[Emri i anëtarit 4]* | *[opsional]* |

---

*Universitet — Lënda: Sistemet e Shperndara*
