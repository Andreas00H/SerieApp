# Skapa er drömapp

Dom sista två veckorna ska ni bygga en egen app i React Native med Expo. Välj något ni själva skulle vilja använda eller ta en av idéerna nedan. Appen ska ha inloggning, en egen backend och en databas. Backend ska vara deployad.

Jobba 2–3 personer per grupp. Ni ska presentera er app för klassen på workshopen den 3:e november.

## Måndags-uppgift: planera er idé

Välj en huvudfunktion och högst två mindre funktioner till er första version. Håll det enkelt och få hela flödet att fungera innan ni bygger mer.

Skriv en kort plan i README och skicka den till mig på Slack senast kl 13 på måndag eftermiddag.

- Appens namn, vem den är till för och vad användaren ska kunna göra.
- Vad ni bygger nu och vad som får vänta.
- En enkel skiss av skärmarna och vilken data som ska sparas för varje användare.
- Teknik, var backend ska köras och hur ni fördelar arbetet.

## Hur ni klarar uppgiften

### Appen

1. Använd Expo Router och ha minst tre skärmar utöver registrering och inloggning, till exempel lista, detaljsida och formulär.
2. Användaren ska kunna skapa, läsa, uppdatera och ta bort minst en typ av innehåll. Allt ska gå via er egen backend och sparas i databasen.
3. Visa laddning, tomma listor, felmeddelanden och när något sparas eller tas bort. Kontrollera formulärens värden som skickas till backend och se till att appen går att använda med tangentbordet öppet.
4. Testa huvudflödet på Android eller iOS, på en telefon eller i en emulator/simulator. Knappar och texter ska vara tydliga på mobil.

### Backend och databas

1. Bygg ett eget API, gärna med Node.js och Express. Ni får återanvända kurskod som ni förstår och kan förklara.
2. Användaren ska kunna registrera sig, logga in och logga ut. Visa ett begripligt fel vid felaktig inloggning.
3. Kontrollera inloggning och behörighet i backend, exempelvis med JWT.
4. Hasha lösenorden med exempelvis bcrypt. Skicka aldrig tillbaka lösenord eller hashvärden i API-svar. Validera inkommande data i backend och använd lämpliga HTTP-statuskoder vid fel.
5. Spara användare och appens innehåll i en databas, exempelvis MySQL eller PostgreSQL.
6. Data ska finnas kvar efter att appen stängts, efter ny inloggning och efter omstart eller ny deployment av backend.

### Deployment

1. Backend ska ha en publik HTTPS-adress. Både backend och databas ska fungera när era datorer är avstängda. Appen ska använda den deployade backendmiljön vid redovisningen.
2. Lägg hemligheter i backendens miljövariabler (.env-filen), aldrig i mobilappen eller Git.
3. Deployment ska använda CI/CD med github actions som kollar tester och som använder docker.

## Förslag på appar

Alla förslag ska uppfylla kraven ovan. Extrafunktionerna är frivilliga.

| App              | Börja med                                                                                                   | Om ni hinner                                            |
| ---------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Spelkväll        | Planera spelkvällar med datum, spel, deltagarnamn och resultat. Visa kommande och tidigare kvällar.         | Låt andra användare anmäla sig.                         |
| Film-app         | Spara filmer och serier med genre och status. Redigera listan, markera sedda och slumpa något att titta på. | Filtrera slumpningen efter genre eller tillgänglig tid. |
| Kylskåpsroulette | Spara ingredienser och egna maträtter. Ändra mängder, ta bort det som är slut och sök efter maträtter.      | Matcha maträtter mot det som finns hemma.               |
| Plantering       | Spara växter med namn, skötselråd och senaste vattning. Redigera och visa vilka som behöver vatten härnäst. | Bilder eller lokala påminnelser.                        |
| Second Hand      | Samla loppisfynd eller saker du letar efter, med kategori, budget och status. Sök och filtrera.             | Bilder och en översikt över vad fynden kostat.          |
| Konsertminnen    | Spara kommande och tidigare konserter med artist, datum, plats och anteckningar.                            | Betyg och en årssammanställning.                        |
| Studieplanering  | Skapa studieuppdrag med tidsmål och status. Kör en enkel timer och spara avslutade fokuspass.               | Veckostatistik eller poäng.                             |

Egna idéer går också bra! Vill ni bygga ett spel behöver användaren kunna skapa, läsa, ändra och ta bort exempelvis egna quiz eller banor. Bara ett sparat highscore räcker inte.

## Så lägger ni upp arbetet

Vecka 1: Bestäm idén, skapa repo och bygg inloggning, databas och huvudfunktion. Försök deploya redan dag 2–3.

Vecka 2: Gör klart tester och README och förbered redovisningen till sista dagen.

- Använd ett gemensamt GitHub-repo, eller separata repon för app och backend med länkar mellan dem.
- Ha en enkel uppgiftstavla med Att göra, Pågår och Klart och stäm av kort varje dag.
- Använd branches och pull requests. Låt en gruppmedlem läsa ändringarna innan ni mergar.
- Alla ska skriva kod och arbeta med både app och backend, gärna tillsammans. Alla ska kunna förklara ett flöde från appen till databasen och tillbaka.

Börja med manuellt inmatad data. AI, externa API:er, kartor, bilder, pushnotiser och chatt kan ni lägga till när grunden fungerar.

## Krav för VG

För VG ska alla grundkrav vara uppfyllda och följande delar vara med:

- En färdig extrafunktion från appförslagen ovan, eller en egen som ni stämt av med mig. Den ska fungera i appen och visas på redovisningen.
- Automatiska backendtester som täcker att skapa, läsa, uppdatera och ta bort innehåll, ogiltig indata, anrop utan inloggning och försök att komma åt någon annans privata data. För delat innehåll testar ni motsvarande behörighetsgränser.
- GitHub Actions som kör testerna vid push och pull request. Den senaste körningen ska vara grön vid inlämning.
