# SerieApp

En app för att spara filmer och serier med genre och status, och slumpa fram
något att titta på när man inte kan bestämma sig. Tänk ett litet personligt
letterboxd: egen lista, egen status, och en slumpare som tar bort
valsåndesten. Skolprojekt.

## Plan (måndagsuppgiften)

**Namn, målgrupp och vad användaren kan göra.** SerieApp är för alla med en
oändlig "att se"-lista. Användaren registrerar sig och loggar in, sparar
filmer och serier med genre och status (ej sedd / tittar / sedd), redigerar
och tar bort titlar, och kan slumpa fram en titel – filtrerat på genre och
hur mycket tid man har.

**Vi bygger nu (v1):**

- Inloggning med JWT och bcrypt
- Skapa, läsa, uppdatera och ta bort titlar via eget backend + PostgreSQL
- Slumpa en titel ur listan
- Extrafunktion (VG): filtrera slumpningen på genre och max speltid
- Deployment: backend på VPS i Docker med HTTPS, CI/CD via GitHub Actions
- Bonus (om tid finns): sök serier via TVmaze och fyll i fälten automatiskt

**Får vänta:** betyg/recensioner, sociala listor och följare, egna bilder,
pushnotiser.

### Skiss av skärmarna

```
┌─────────────┐   ┌──────────────┐
│ Inloggning  │──▶│ Registrering │
└──────┬──────┘   └──────────────┘
       │
┌──────▼──────┐   ┌──────────────┐
│   Listan    │──▶│   Detaljer   │ (byt status, redigera, ta bort)
│  (start)    │   └──────────────┘
└──┬───────┬──┘
   │       │        ┌──────────────┐
   │       └───────▶│  Ny titel    │ (sök TVmaze eller mata in manuellt)
   │                └──────────────┘
┌──▼──────────┐
│   Slumpa    │ (filter: genre + max tid)
└─────────────┘
```

**Data som sparas per användare:**

- `user`: e-post, bcrypt-hashat lösenord
- `title`: namn, typ (movie/series), genre, status
  (unwatched/watching/watched), speltid i minuter, TVmaze-id (valfritt),
  bildadress (valfritt)

### Teknik, hosting och arbetsfördelning

- **Mobil:** React Native med Expo och Expo Router (TypeScript)
- **Backend:** Node.js + Express + Prisma + PostgreSQL
- **Auth:** JWT i backend, token sparas i expo-secure-store i appen
- **Hosting:** egen VPS/EC2 med Docker Compose (api + Postgres + Caddy som
  fixar automatisk HTTPS). Se `deploy/DEPLOY.md`.
- **CI/CD:** GitHub Actions kör backendtester (Jest + Supertest mot riktig
  Postgres) och bygger Docker-image till GHCR vid push till main
- **Arbetsfördelning (Akram, Andy, Ali, Chippe):** par 1 tar backend, databas
  och deploy; par 2 tar mobilappen. Paren byter uppgifter halvvägs så att
  alla rör både app och backend. Alla ska kunna förklara flödet
  app → API → databas → app.

## Så funkar det

Alla titlar sparas i databasen kopplade till den inloggade användaren. Backend
kollar behörighet så att var och en bara ser sina egna titlar. Slumpfunktionen
väljer en titel ur listan – med valfria filter på genre och max speltid.

## Kom igång

### Backend

```bash
cd backend
cp .env.example .env            # fyll i DATABASE_URL och JWT_SECRET
docker run -d --name serieapp-db \
  -e POSTGRES_USER=serieapp -e POSTGRES_PASSWORD=serieapp \
  -e POSTGRES_DB=serieapp -p 5432:5432 postgres:16-alpine
npm install
npx prisma migrate dev
npm run dev                     # lyssnar på port 3000
npm test                        # Jest + Supertest mot riktig Postgres
```

Testerna använder databasen `serieapp_test` på samma server (skapa den med
`CREATE DATABASE serieapp_test;` eller sätt `DATABASE_URL` i `backend/.env.test`).

### Mobil

```bash
cd mobile
npm install
# .env pekar på backend, byt till den deployade adressen vid redovisning
npx expo start
```

### Deployment

Se `deploy/DEPLOY.md` – VPS med Docker Compose, Caddy (HTTPS) och valfri
automatisk deploy från GitHub Actions.

## Projektstruktur

```
backend/   Express-API: auth, titles CRUD, slump, TVmaze-proxy + tester
mobile/    Expo-app: (auth) inloggning/registrering, (app) lista/detalj/slump
deploy/    docker-compose, Caddyfile och driftguide
docs/      API-kontrakt (api.md)
```

## Team

- Akram
- Andy
- Ali
- Chippe

## Krediter

Seriedata i bonusfunktionen kommer från [TVmaze](https://www.tvmaze.com/api)
(CC BY-SA).
