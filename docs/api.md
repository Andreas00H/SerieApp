# API-kontrakt

Bas-URL: `EXPO_PUBLIC_API_URL` i `mobile/.env` (t.ex. `https://din-server.sslip.io`).
Alla svar är JSON. Alla fel har formen `{ "error": "meddelande på svenska" }`.

Inloggningskrav: skicka `Authorization: Bearer <token>` på allt utom
register/login/health.

## Auth

### POST /api/auth/register

```json
{ "email": "nya@serieapp.se", "password": "minst8tecken" }
```

`201` → `{ "user": { "id": 1, "email": "nya@serieapp.se" } }`
`400` ogiltig indata · `409` e-posten finns redan

### POST /api/auth/login

Samma body som register. `200` → `{ "token": "...", "user": { "id": 1, "email": "..." } }`
`401` fel e-post eller lösenord (samma meddelande för båda)

### GET /api/auth/me

`200` → `{ "user": { "id": 1, "email": "..." } }` · `401` utan/ogiltigt token

## Titlar (kräver inloggning)

Titelfält: `name` (1–120 tecken, krävs), `kind` (`movie` | `series`, krävs),
`status` (`unwatched` | `watching` | `watched`, default `unwatched`),
`genre` (valfri, ≤60), `runtimeMinutes` (valfri, positivt heltal),
`externalId` + `imageUrl` (sätts av TVmaze-sök).

### GET /api/titles

`200` → `{ "titles": [ { ...titel, userId }, ... ] }` – bara egna titlar, nyaste först.

### POST /api/titles

```json
{ "name": "Breaking Bad", "kind": "series", "genre": "Drama", "status": "unwatched", "runtimeMinutes": 45, "externalId": 169, "imageUrl": "https://..." }
```

`201` → `{ "title": { ... } }` · `400` valideringsfel

### GET /api/titles/:id

`200` → `{ "title": { ... } }` · `404` finns inte **eller** tillhör annan användare

### PUT /api/titles/:id

Samma body som POST (namn och kind krävs). `200` → `{ "title": { ... } }` · `404` · `400`

### DELETE /api/titles/:id

`204` tomt svar · `404`

### GET /api/titles/random?genre=drama&maxRuntime=120

Båda filter är valfria. `200` → `{ "title": { ... } }` · `404` ingen matchning · `400` ogiltigt filter
Svarar aldrig med annans titlar. Titlar utan speltid hoppas över när
`maxRuntime` sätts.

## TVmaze-proxy (kräver inloggning)

### GET /api/tvmaze/search?q=breaking

Söker serier i TVmaze och returnerar förminskade träffar (max 10 min cache):

```json
{ "results": [ { "externalId": 169, "name": "Breaking Bad", "genres": ["Drama","Crime"], "runtimeMinutes": 45, "imageUrl": "https://...", "premiered": "2008-01-20", "summary": "..." } ] }
```

`400` utan `q` · `502` om TVmaze inte svarar. Data från TVmaze, CC BY-SA –
kreditera i appen.
