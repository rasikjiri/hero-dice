# Hero Dice AI Debug Workflow

## Účel

Tento dokument definuje standardní postup při ladění AI hráče.

Od verze 3.7 je každá oprava AI založena na auditních datech, nikoliv na odhadu chování.

---

## Základní princip

Nejdříve zjistit proč AI rozhodla.

Teprve potom měnit logiku.

Nikdy opačně.

---

## Používané audity

### 1. Turn Audit

Storage:

heroDiceTempAiTurnAudit

Obsahuje:

- průběh controlleru
- guardy
- lock masky
- save/roll/end turn rozhodnutí
- fallbacky
- orchestrace tahu

Slouží k analýze:

- proč AI provedla konkrétní akci
- proč byla akce zablokována
- proč skončil tah

---

### 2. Decision Audit

Storage:

heroDiceTempAiDecisionAudit

Obsahuje:

- všechny kandidáty
- rejected důvody
- selected candidate
- strategy score
- evaluation
- finální lock mask

Slouží k analýze:

- proč AI zvolila právě tuto kombinaci
- proč odmítla ostatní možnosti
- jak proběhlo strategické hodnocení

---

## Standardní workflow

1. Objeví se bug.

2. Neprovádět okamžitou úpravu kódu.

3. Vyexportovat oba audity.

4. Najít první okamžik, kde se AI rozhodla chybně.

5. Určit vrstvu:

- Controller
- Save Guard
- Strategy
- Candidate Selection
- Lock Validation
- Roll Execution

6. Navrhnout jedinou hypotézu.

7. Provést jedinou změnu.

8. Ověřit změnu na stejném scénáři.

9. Porovnat audit před a po.

10. Pokud se bug odstranil a nevznikla regrese, task je dokončen.

---

## Pravidlo jedné hypotézy

Jeden bug = jedna hypotéza = jedna změna = jedno ověření

---

## Zakázané postupy

Neprovádět současně změny:

- strategy
- guardů
- timeoutů
- locking systému

Nepřepisovat AI "preventivně".

Nepřidávat heuristiky bez důkazu z auditů.

---

## Stabilizační fáze

Během stabilizace:

- debug logy zůstávají aktivní pouze v development režimu
- audit se nemaže ručně
- každá oprava musí být auditovatelná

---

## Cíl

Každý bug musí být reprodukovatelný.

Každá oprava musí být doložitelná.

Každá změna musí být minimální.

Stabilita AI má vždy přednost před novými heuristikami.
