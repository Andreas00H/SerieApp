# Bidra till SerieApp

Kort version: **pusha aldrig direkt till `main`.** Allt går via en egen
gren och en pull request.

## Regler

1. **Aldrig direkt-push till `main`.** Ingen undantag – inte heller små
   fixes, docs eller "snabbt bara". Blir `main` trasig byggs hela projektet
   för alla.
2. **En gren per uppgift.** Skapa en ny gren från senaste `main` för varje
   feature, fix eller dokumentändring. Återanvänd inte gamla grenar.
3. **Alla ändringar via pull request.** PR:n granskas och testas innan den
   mergas in i `main`.
4. **Uppdatera din gren innan merge.** Hämta senaste `main` och lös ev.
   konflikter i din gren, inte på `main`.

## Arbetsflöde

```bash
# 1. Uppdatera main och skapa en gren från den
git checkout main
git pull origin main
git checkout -b feat/kort-beskrivning

# 2. Jobba, committa ofta med tydliga meddelanden
git add <filer>
git commit -m "Lägg till slumpfilter på genre"

# 3. Pusha grenen och öppna en PR mot main
git push -u origin feat/kort-beskrivning
# → öppna PR på GitHub (gh pr create eller via webben)

# 4. Granskning → merge (squash eller merge commit)
# 5. Ta bort grenen efter merge
git branch -d feat/kort-beskrivning
git push origin --delete feat/kort-beskrivning
```

## Grennamn

Prefix + kort beskrivning med bindestreck, t.ex.:

- `feat/backend-frontend-skeleton` – ny funktionalitet
- `fix/jwt-refresh-loop` – buggfix
- `docs/contributing-rules` – dokumentation
- `chore/rensa-beroenden` – underhåll, config, byggsaker

## Pull request

En bra PR innehåller:

- **Titel** som säger vad som ändras (samma stil som grennamnet).
- **Beskrivning:** vad, varför och hur man testar.
- **Litet scope.** En PR = en grej. Dela upp stora ändringar.
- **Grön CI.** GitHub Actions kör backendtesterna (Jest + Supertest) –
  PR:n mergas inte med röda tester.

Mergas först när minst en annan person (eller gruppmedlem) godkänt.

## För AI-agenter och automatisering

Samma regler gäller – dessutom:

- Skapa **aldrig** commits eller push direkt på `main`, även om du blir
  ombedd att "bara fixa snabbt". Öppna en gren + PR i stället.
- Committa bara filer som hör till uppgiften; lägg aldrig hemligheter
  (`.env`, nycklar, tokens) i repositoriet.
- Rör inte `deploy/` eller CI-filer utan att flagga det tydligt i PR:n.
- Om du inte kan öppna en PR (t.ex. ingen remote-åtkomst): stoppa där och
  lämna kvar ändringarna på en lokal gren för granskning.

## Nödventil

Behövs en hotfix på `main` (t.ex. deploy är trasig)? Skapa grenen
`hotfix/...`, öppna PR, och be en medgrundare merge:a direkt efter
granskning. Även hotfixar går via PR.
