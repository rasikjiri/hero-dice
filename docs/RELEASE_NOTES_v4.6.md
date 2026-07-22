RELEASE NOTES

Projekt: Hero Dice
Verze: 4.6
Status: Released (lokální etapa)

---

## Přehled
Verze 4.6 přinesla kompletní posun v oblasti administrace hráčů, žádostí a hesel. Hlavní přínos je v tom, že registrace a reset hesla jsou provozně použitelné i pro běžný rodinný režim používání aplikace, včetně e-mailových notifikací.

## Co je nové

### 1) Administrace žádostí a hráčů
- Admin sekce pokrývá workflow žádostí o registraci i reset hesla.
- U žádostí je dostupné schválení, zamítnutí i smazání zpracovaných záznamů.
- Vylepšena orientace v seznamu žádostí přes filtr: Vše / Čekající / Historie.

### 2) Automatický reset hesla
- Reset hesla je možné vyřídit automaticky bez ručního mezikroku.
- Po resetu se odesílá potvrzovací e-mail žadateli.
- V textaci e-mailu byl sjednocen rodinný tón komunikace.

### 3) Notifikační e-maily
- E-mailové šablony pro reset i schválení/zamítnutí žádosti byly upraveny do jednotného stylu.
- E-maily obsahují přehlednou identifikaci hráče včetně ID.
- Při dočasném problému s mail konfigurací je flow robustnější a nevypíná základní logiku požadavku.

### 4) Lepší uživatelské hlášky
- Chybové hlášky pro registrace/žádosti nyní používají českou diakritiku.
- Jasněji se komunikuje důvod chyby u duplicitního ID nebo e-mailu.

### 5) Opravy UX v admin panelu
- Záložka Žádosti byla upravena tak, aby méně opticky „poskakovala“ při přepínání stavu a počtu položek.

## Opravy chyb
- Opraven bug při registraci s již použitým e-mailem.
- Nově se vrací srozumitelná validační hláška místo nejasného selhání.

## Konfigurace e-mailů
Pro plnou funkčnost notifikací je potřeba:
- RESEND_API_KEY
- RESEND_FROM_EMAIL

Doporučený formát odesílatele:
RESEND_FROM_EMAIL="Hero Dice <play@hero-dice.eu>"

## Stav ověření
- Build: úspěšný.
- Manuální testy během etapy: reset hesla, registrace, notifikace, schválení/zamítnutí žádostí.

## Poznámky k provozu
- Po změně .env.local je vždy nutný restart dev serveru.
- Pokud Resend vrací 401 (API key is invalid), je potřeba vygenerovat nový klíč v Resend účtu a nahradit hodnotu v prostředí.
