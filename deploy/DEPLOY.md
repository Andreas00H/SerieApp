# Deployment – VPS med Docker Compose + Caddy

Backend och databas kör på en VPS i Docker och är nåbara på en publik
HTTPS-adress. GitHub Actions bygger backend-imaget och kan deploya automatiskt
till VPS:en vid varje push till `main`.

## Arkitektur

```
Internet ──> Caddy (80/443, automatisk HTTPS)
                └── reverse proxy ──> api (Express, port 3000 i nätverket)
                                          └── db (PostgreSQL 16)
```

- `caddy/`: ingress, HTTPS-certifikat via Let's Encrypt automatiskt
- `api`: backend-imaget från GHCR, byggt av CI
- `db`: PostgreSQL med volymen `pgdata`, så data finns kvar efter omstart

## Förutsättningar

- En VPS (t.ex. Ubuntu 24.04) med Docker och Docker Compose-plugin installerat
- En domän eller wildcard-DNS som pekar på VPS:ens IP
  (snabbt under utveckling: `https://<ip>.sslip.io`, se `.env.example` i `mobile/`)

## Installera på VPS

```bash
# 1. Installera Docker (Ubuntu)
curl -fsSL https://get.docker.com | sh

# 2. Skapa projektmappen och kopiera deploy-filerna dit
sudo mkdir -p /opt/serieapp/deploy
# ladda upp deploy/Caddyfile och deploy/docker-compose.yml

# 3. Skapa .env med hemligheterna – ALDRIG i Git
cd /opt/serieapp/deploy
cat > .env <<'EOF'
DOMAIN=example.sslip.io
POSTGRES_PASSWORD=<längd slumpat lösenord>
JWT_SECRET=<längd slumpat hemlig nyckel>
BACKEND_IMAGE=ghcr.io/<användare>/<repo>/backend:latest
EOF
chmod 600 .env
```

`BACKEND_IMAGE` pekar på det image som CI bygger och pushar till GHCR vid varje
push till `main`. Logga in på GHCR på VPS:en om repot är privat:

```bash
echo <GITHUB_PAT> | docker login ghcr.io -u <användare> --password-stdin
```

## Starta

```bash
cd /opt/serieapp/deploy
docker compose pull api          # hämta backend-imaget
docker compose up -d             # starta db + api + caddy
docker compose run --rm api npx prisma migrate deploy   # kör migrationer
docker compose logs -f caddy     # följ HTTPS-utfärdningen
```

Caddy sköter certifikat automatiskt via HTTP-01/ACME, så port 80 och 443 måste
vara öppna i brandväggen. Sedan svarar API:t på `https://<DOMAIN>/api/...`.

## Verifiera

```bash
curl https://<DOMAIN>/api/health          # eller annan enkel route
docker compose ps                          # alla tre tjänster ska vara Up
docker compose exec db pg_isready -U serieapp
```

## Uppdatering (manuell)

```bash
cd /opt/serieapp/deploy
docker compose pull api
docker compose run --rm api npx prisma migrate deploy
docker compose up -d api
```

## Automatisk deploy från GitHub Actions

Ett deploy-jobb i `.github/workflows/ci.yml` kör efter `docker`-jobbet vid varje
push till `main` (om miljövariablerna är satta i repots inställningar):
`ssh` in på VPS:en och gör samma steg som under *Uppdatering*.

Konfigurera under **Settings → Secrets and variables → Actions**:

| Namn          | Typ      | Innehåll                             |
| ------------- | -------- | ------------------------------------ |
| `DEPLOY_HOST` | Variable | VPS:ens IP eller hostname            |
| `DEPLOY_USER` | Variable | SSH-användare                        |
| `DEPLOY_SSH_KEY` | Secret | Privat SSH-nyckel med åtkomst till VPS |

Sätt upp motsvarande publika nyckel i VPS:ens `authorized_keys`.

## Data och säkerhet

- Databasdata ligger i Docker-volymen `pgdata` och finns kvar efter omstart
  av backend, ny inloggning och omdeploy.
- Hemligheterna (`POSTGRES_PASSWORD`, `JWT_SECRET`) läses från `.env` på
  VPS:en – de finns aldrig i mobilappen eller i Git.
- `docker compose down` tar inte bort volymerna; lägg till `-v` bara om du
  medvetet vill radera datan.
