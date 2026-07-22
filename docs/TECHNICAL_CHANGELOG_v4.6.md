TECHNICAL CHANGELOG

Projekt: Hero Dice
Verze: 4.6
Typ: Developer + Chatbot Handoff
Riziko: MEDIUM

---

## 1) Cíl etapy
Rozšířit a stabilizovat administrativní vrstvu aplikace bez zásahu do herní logiky:
- správa hráčů,
- registrace/reset žádosti,
- automatický reset hesla,
- notifikační e-maily,
- kvalitnější UX hlášky,
- bezpečné lokální čistky.

## 2) Změněné soubory

### Frontend
- app/page.tsx
- app/components/AdminModal.tsx
- app/lib/authSession.ts
- app/lib/czechErrorMessage.ts

### API Routes
- app/api/auth/password-reset/notify/route.ts
- app/api/admin/access-requests/notify/route.ts

### SQL migrace
- supabase/migrations/20260722_auto_approve_password_reset_request.sql
- supabase/migrations/20260722_delete_player_access_request.sql
- supabase/migrations/20260722_registration_duplicate_email_guard.sql

### Dokumentace
- README.md

## 3) Databázové změny

### 3.1 Automatické schválení resetu hesla
Migrace: 20260722_auto_approve_password_reset_request.sql
- Přidána RPC funkce submit_and_auto_approve_password_reset_request.
- Reset flow zapisuje žádost + schválení + aktualizuje heslo.
- Refresh schema cache přes notify pgrst.

### 3.2 Mazání žádostí adminem
Migrace: 20260722_delete_player_access_request.sql
- Přidána RPC delete_player_access_request.
- Kontrola aktivní admin session.
- Kontrola role admin.

### 3.3 Guard proti duplicitnímu e-mailu u registrace
Migrace: 20260722_registration_duplicate_email_guard.sql
- V submit_player_access_request doplněna kontrola:
  - e-mail již existuje v players,
  - e-mail již existuje v pending registration request.
- V process_player_access_request (approve registration) doplněna kontrola proti race condition:
  - e-mail nebyl mezitím obsazen.
- Vrací srozumitelné validační hlášky.

## 4) Aplikační logika

### 4.1 Auth flow v page.tsx
- Registrace i reset žádostí jdou přes submitAuthActionRequest.
- Reset větev používá submit_and_auto_approve_password_reset_request.
- Notifikace resetu běží přes /api/auth/password-reset/notify.

### 4.2 Admin flow v AdminModal.tsx
- Request tab obsahuje filtrování: all / pending / history.
- Akce na žádosti:
  - approve,
  - reject,
  - delete (s potvrzením).
- Při e-mailové chybě fallback komunikace přes dialog.

### 4.3 Normalizace chybových textů
- Nový shared helper: app/lib/czechErrorMessage.ts.
- Napojen v page.tsx i AdminModal.tsx.
- Převádí známé DB hlášky bez diakritiky na čitelnou češtinu.

## 5) E-mail notifikace

### 5.1 Reset hesla
Soubor: app/api/auth/password-reset/notify/route.ts
- Odeslání přes Resend.
- Upraven text na rodinný styl + identifikace hráče (ID).
- Konfigurační fallback při chybějícím RESEND_API_KEY neblokuje hlavní reset flow.

### 5.2 Schválení/zamítnutí žádosti
Soubor: app/api/admin/access-requests/notify/route.ts
- Upraven text šablon do stejného rodinného tónu.
- Sjednocena struktura zprávy s reset mailem.
- Obsahuje ID hráče.

## 6) UX a UI
- Stabilizace záložky Žádosti: menší optické poskakování mezi stavy.
- Přehlednější feedback při e-mailových chybách.
- Konzistentnější textace napříč page a admin modal.

## 7) Ověření
- Opakovaně úspěšný npm run build po jednotlivých změnách.
- Ručně ověřeno:
  - reset hesla,
  - doručení reset e-mailu,
  - registrace žádosti,
  - schválení/zamítnutí žádosti,
  - bug duplicitního e-mailu.

## 8) Známé provozní body
- Po změně .env.local je nutný restart dev serveru.
- Pokud Resend vrací 401 API key is invalid:
  - zkontrolovat, že klíč patří správnému účtu,
  - ověřit, že klíč není revokovaný,
  - vygenerovat nový klíč a restartovat server.

## 9) Bezpečnostní poznámka
- API klíče nesmí být sdíleny v commitech ani v issue/transcriptech.
- Při nechtěném zveřejnění je nutná okamžitá rotace klíče.

## 10) Doporučený navazující krok
- Přidat krátký integrační test scénáře:
  - duplicate email registration,
  - successful registration approval email,
  - successful password reset email.
