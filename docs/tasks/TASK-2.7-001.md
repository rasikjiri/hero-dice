TASK 2.7-001

Projekt: Hero Dice
Verze projektu: 2.7 (planning)
Typ dokumentu: Task Brief
Status: Proposed

---

## TASK ID

TASK 2.7-001

---

## Title

Complete Online Resume Lifecycle

---

## Goal

Umoznit prerusenym online hram pokracovat presne z mista, kde byly ulozeny/preruseny, bez zmen gameplay logiky.

---

## Background

Online PlayMode foundation je ve v2.6 stabilizovana, ale Online Resume lifecycle je pouze castecne implementovany.
Pro stabilni v2.7 je nutne dokoncit navazani klientu po loadu online save, obnovu lobby stavu, obnovu vlastnictvi hracu a synchronizovane pokracovani host/client vetve.

---

## Scope

- load online save
- reconnect players
- restore lobby
- restore ownership
- continue existing PlayMode

Out of scope:

- gameplay changes
- scoring
- statistics
- UI redesign

---

## Files

Primarni:
- app/page.tsx
- app/lib/onlineSession.ts

Sekundarni (jen pokud bude nutne pro konzistenci):
- docs/PLAYMODE.md
- docs/ARCHITECTURE.md
- docs/CHANGELOG.md

---

## Allowed Changes

- resume flow logika v online vetvi
- reconnect a ownership restoration logika
- lobby resume gating a navazani realtime callbacku
- robustni host/client synchronizace pri continue
- bezpecne stale/echo guard upravy pouze pro resume vetve

---

## Forbidden Changes

- zmeny hernich pravidel
- zmeny vypoctu score
- zmeny statistik
- redesign UI
- pridani novych gameplay funkci mimo resume scope

---

## Constraints

- zachovat 100 % kompatibilitu offline vetve
- nemenit behavior beznych online her, ktere nejsou v resume flow
- minimalni zasah mimo resume lifecycle
- preferovat explicitni guardy proti stale snapshotum
- nevytvaret vedlejsi zmeny mimo scope

---

## Acceptance Criteria

- Host nacte online save a zustane v online lobby resume rezimu.
- Klient se po joinu spolehlive pripoji do stejne resume lobby.
- Ownership hracu se obnovi konzistentne mezi hostem a klientem.
- Tlacitko continue/start je enabled pouze pri splneni readiness pro vsechny selected players.
- Po continue oba klienti prejdou do stejne rozehrane online hry.
- Stav hry (turn, dice, locks, remaining rolls, bonus flags) zustane konzistentni mezi host/client.
- Klient nezustane viset v lobby po host continue.

---

## Testing

- TypeScript: bez novych chyb
- ESLint: bez novych chyb
- Runtime smoke scenar:
  1) host load online save
  2) reconnect + claim host
  3) client join + claim
  4) host continue
  5) oba v identickem PlayMode stavu
- Overeni stale/echo guardu pri resume update burstech

---

## Documentation

Ano

- docs/PROJECT_CONTEXT.md (stav milniku)
- docs/CHANGELOG.md (po dokonceni implementace)

---

## Risk

MEDIUM

---

## Expected Output

- seznam zmenenych souboru
- strucny popis implementace resume lifecycle
- potvrzeni uspesnych kontrol (TS/lint/runtime smoke)
- otevrene body, pokud neco zustane mimo scope
