TASK 3.5 - AI 2.0

Projekt: Hero Dice
Verze projektu: 3.5 (analysis)
Typ dokumentu: Analyticky navrh / Decision Architecture Spec
Status: Proposed
Datum: 2026-06-25
Priorita: Vysoka

---

## TASK ID

TASK 3.5 - AI 2.0

---

## Title

AI 2.0 - Strategicky navrh rozhodovaci architektury tahu

---

## Goal

Definovat cilovou architekturu rozhodovani AI hrace (AI 2.0) tak, aby bylo planovani, exekuce a ukonceni tahu rizene jednotnym orchestratorim modelem.

Tento dokument je pouze analyza/specifikace a nesmi menit runtime chovani.

---

## Background

Aktualni AI flow v Play Mode je funkcni, ale architektonicky fragmentovane mezi vice useEffect vrstvami v app/page.tsx. AI plan vznika oddelene od exekuce hodu a oddelene od auto-save rozhodnuti. To vytvari stavove okna, kde se muze rozjet odchylka mezi puvodnim zamerem AI a tim, co se realne zapise nebo kdy se tah realne ukonci.

Cilem AI 2.0 neni v prvni fazi menit heuristiky kombinaci, ale sjednotit ridici tok tahu do jedne orchestrace.

---

## Scope

In scope:
- analyza soucasneho AI decision flow
- identifikace architektonickych slabin
- navrh AI 2.0 decision architektury
- rollout plan po fazich A-E
- definice migracnich rizik a acceptance kriterii

Out of scope:
- implementace zmen v runtime
- zmena hernich pravidel/scoringu
- zmena UI/audio behavioru
- DB schema zmeny

---

## Current State (AS-IS)

### 1) Kde vznika AI plan

AI plan vznika v decision useEffect v app/page.tsx:
- app/page.tsx:2411-2514
- volani makeAIDecision(playModeDice, currentCombination, scores, playerId, playModeAllowRewrite, remainingRolls)

Samotna rozhodovaci heuristika je v:
- app/lib/aiPlayer.ts:1073-1349 (makeAIDecision)
- app/lib/aiPlayer.ts:483-747 (evaluateCombination)
- app/lib/aiPlayer.ts:749-793 (phase policy)

Poznamka:
- decision contract vraci pouze lockedDiceIndices + reason (app/lib/aiPlayer.ts:16-19), nikoliv explicitni target category ani finalni akci save/end_turn.

### 2) Kde se plan vykonava

Exekuce planu probiha oddelene:
- aplikace lock masky po makeAIDecision v app/page.tsx:2482-2508
- samotny hod kostek v rollAllDice() v app/page.tsx:2724-2838
- auto-roll scheduling v samostatnem useEffect v app/page.tsx:2840-2990

Dulezite:
- planovani a exekuce nejsou sjednoceny v jednom transakcne pojatem kontroleru tahu.

### 3) Kde dochazi k sanitizaci locku

Sanitizace lock masky je mimo AI modul, v app/page.tsx:
- sanitizeComputerLockMask definice: app/page.tsx:1669-1721
- pouziti po AI decision: app/page.tsx:2497-2508
- rollback/sanitize v auto-roll flow: app/page.tsx:2875-2908

Dulezite:
- sanitizace je mimo rozhodovaci funkci makeAIDecision, tedy existuje dvojita odpovednost za validitu locku.

### 4) Kde dochazi k zapisu skore

Skore se zapisuje ve dvou oddelenych cestach:
- manual save funkce savePlayModeScore: app/page.tsx:2183-2264
- AI auto-save useEffect: app/page.tsx:2525-2641

U AI auto-save je zapis primy setScores(...) + setShowPlayModeResult(true), tedy mimo savePlayModeScore contract.

### 5) Proc je soucasny stav architektonicky rizikovy

- Plan, lock sanitizace, auto-roll a score write jsou oddelene mechanismy.
- Chybi jeden zdroj pravdy pro AI intent v ramci celeho tahu.
- Chybi explicitni target category v decision contractu, tedy nelze tvrde validovat konzistenci mezi planem a zapisem.
- Chybi centralni final validation gate pred score write.
- Krok showPlayModeResult + endTurn zavisi na UI flow, ne na jednotnem AI turn state machine.

---

## Identifikovane Slabiny

### 1) Split mezi planovanim a exekuci

- AI planuje v jednom useEffect, ale hod provadi jiny useEffect a score write dalsi useEffect.
- To zvysuje riziko stale-state situaci mezi kroky (dice, locks, remainingRolls, currentCombination).

### 2) Nesoulad target kombinace vs realne zapsana kombinace

- makeAIDecision vraci lock masku, ne target category.
- currentCombination se vyhodnocuje z aktualnich kostek mimo AI plan contract.
- Save tedy muze reflektovat detekovany okamzity stav, ne explicitni puvodni strategicky cil AI.

### 3) Nedostatecny re-plan po kazdem hodu (z pohledu orchestrace)

- Re-plan sice existuje efektove, ale neni formalizovan jako jediny loop v ramci AI turn controlleru.
- Chybi explicitni krokova smycka PLAN -> EXECUTE -> OBSERVE -> REPLAN az do terminalni akce save/end_turn.

### 4) Slaby risk model dle remaining rolls

- remainingRolls vstupuje do evaluace (rollPressure), ale neni oddelen explicitni risk policy vrstva.
- Chybi jednotne risk level rozhodnuti, ktere by ovlivnovalo volbu akcniho typu (roll/save/end_turn) konzistentne.

### 5) Rizika zamykani kostek

- Sanitizace locku je mimo AI modul a muze upravit vysledek AI planu ex post.
- Confirmed lock / working lock jsou spravovany napric vice useEffect cestami.

### 6) Dopady na audio, zaseknuti tahu a nedokonceni tahu

- Audio guardy a turn flow guardy jsou navazane na currentCombination/showPlayModeResult stavove podminky.
- Pri fragmentovanem toku muze vznikat side-effect drift (napr. audio blokace, predcasne/no-save vetve, nebo tah cekajici na UI krok mimo centralni AI controller).

---

## Navrh AI 2.0 Architektury (TO-BE)

### Princip

Zavest AI Turn Controller jako jednotny orchestrator celeho AI tahu. Ten bude jedinym mistem, kde AI:
- planuje,
- vykonava akci,
- validuje vysledek,
- rozhoduje o dalsim kroku,
- finalizuje tah.

### AI Decision Contract (explicitni)

Navrhovany konceptualni kontrakt:
- targetCategory: string | null
- lockMask: boolean[6]
- action: roll | save | end_turn
- confidence: number (0-1)
- riskLevel: low | medium | high
- reason: string
- audit: strukturovane metadata rozhodnuti

Poznamka: Toto je navrh architektury, ne implementacni instrukce.

### Re-plan loop

Kazdy AI tah bezi v jednotnem loopu:
1. Observe state (dice, locks, remainingRolls, scores)
2. Plan decision (kontrakt vyse)
3. Validate decision (syntakticka + semanticka validace)
4. Execute action (roll/save/end_turn)
5. Re-observe and re-plan po kazdem hodu
6. Exit on terminal action (save nebo end_turn)

### Final validation pred ulozenim skore

Pred save musi probehnout finalni kontrola:
- targetCategory z planu je validni a write-eligible
- detekovana kombinace je kompatibilni s targetCategory policy
- rewrite policy je splnena
- pokud validace neprojde, pouzit fallback (neprovadet blind save)

### Fallback mechanismy

- Fallback 1: invalid lock mask -> normalized safe mask
- Fallback 2: invalid save candidate -> roll nebo end_turn podle risk policy
- Fallback 3: repeated no-progress stavy -> controlled end_turn
- Fallback 4: guard proti nekonecnemu loopu (max steps per turn)

### Audit log rozhodovani

Rozsirit audit z kandidatu na turn-level audit:
- vstupni stav kroku
- zvoleny plan (target/action/risk/confidence)
- vysledek exekuce
- duvod fallbacku
- finalni terminalni akce

Cil: reprodukovatelnost AI bugu bez ad hoc logovani napric useEffect vrstvami.

---

## Rollout Fazovani

### Faze A - Refactor orchestrace tahu bez zmeny heuristik

- Presunout ridici tok AI tahu pod jednotny AI Turn Controller.
- Zachovat stavajici heuristiku volby locku (bez behavior zmen).
- Cilem je odstraneni split orchestracnich useEffect zavislosti.

### Faze B - Explicitni target category + re-plan loop

- Zavest explicitni targetCategory v decision contractu.
- Formalizovat PLAN -> EXECUTE -> OBSERVE -> REPLAN loop.
- Save branch podminkovat final validation gate.

### Faze C - Risk policy podle remaining rolls

- Oddelit risk policy vrstvu od kombinacni evaluace.
- Standardizovat mapping remainingRolls -> riskLevel -> allowed actions.

### Faze D - Event-driven audio + audit logy

- Napojit audio triggery na eventy AI Turn Controlleru (ne na rozptylene stavove guardy).
- Rozsirit audit log o turn-level event timeline.

### Faze E - Stabilizacni testy + baseline porovnani

- Definovat baseline metriky pred/po (turn completion rate, no-stuck rate, save consistency).
- Pridat regresni scenare pro AI tahy s hranicnimi stavy.

---

## Rizika Migrace

- Riziko regresi v poradi side effectu (score modal, endTurn timing, audio trigger timing).
- Riziko zmeny emergentniho AI chovani pri odstraneni efektove fragmentace.
- Riziko online/offline divergence, pokud by controller nebyl striktne mode-aware.
- Riziko docasneho navyseni komplexity behem prechodoveho obdobi.

Mitigace:
- fazovany rollout A-E,
- feature-flag mindset pro controller integration,
- baseline porovnani pred kazdou fazi,
- explicitni acceptance gate mezi fazemi.

---

## Doporucene Poradi Navazujicich Implementacnich Tasku

1. TASK AI2.0-A: sjednoceni orchestrace AI tahu (bez zmen heuristik)
2. TASK AI2.0-B: rozsireni decision contractu o target/action/confidence/risk
3. TASK AI2.0-C: final validation gate pred save
4. TASK AI2.0-D: fallback policy + anti-stall guardy
5. TASK AI2.0-E: event-driven audio hook a turn-level audit timeline
6. TASK AI2.0-F: stabilizacni/regresni test pack + baseline report

Zasadni pravidlo:
- Symptomy AI bugu (audio glitch, lock mismatch, stuck turn, no-save edge case) se NEMAJI opravovat izolovane pred sjednocenim AI orchestrace (Faze A).

---

## Acceptance Criteria (pro tento dokument)

- Dokument neobsahuje implementacni zmeny runtime kodu.
- Dokument jasne oddeluje casti: soucasny stav / slabiny / cilovy navrh.
- Dokument uvadi migracni rizika.
- Dokument definuje doporucene poradi navazujicich implementacnich tasku.
- Dokument explicitne uvadi pravidlo, ze symptomy AI bugu se neopravuji izolovane pred sjednocenim orchestrace.

---

## Constraints

- Nevytvaret nove databazove struktury.
- Nemenit scoring pravidla hry.
- Nemenit UI.
- Nemenit audio implementaci.
- Nemenit app/lib/aiPlayer.ts.
- Nemenit app/page.tsx.
- Tento vystup je pouze analyticky/specifikacni dokument.

---

## Verification

- Runtime kod nebyl menen.
- Vytvoren pouze novy dokumentacni soubor v docs/tasks.

---

## Expected Output

- cesta k dokumentu
- strucny seznam sekci
- potvrzeni, ze nebyl zmenen runtime kod
