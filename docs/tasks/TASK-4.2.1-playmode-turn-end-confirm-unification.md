TASK-4.2.1

Projekt: Hero Dice
Verze projektu: 4.2.1
Typ dokumentu: Task Brief
Status: Draft

---

Title
Play Mode - Sjednoceni ukonceni tahu pres potvrzovaci dialog

---

Goal
Odstranit inline stav tlacitka Hazi dalsi hrac a sjednotit vsechny cesty ukonceni tahu pres jediny potvrzovaci dialog. Predani tahu se musi provest az po potvrzeni dialogu, pri zachovani online synchronizace, AI chovani a pravidel bonusu.

---

Background
Soucasny flow obsahuje mezikrok Hazi dalsi hrac. Tento mezikrok prodluzuje ovladani, zhorsuje konzistenci UX a muze vest k predcasnemu ukonceni tahu.

Business duvod:
- zkratit prubeh tahu,
- sjednotit UX,
- odstranit redundantni klik,
- ochranit hrace pred nechtenym koncem tahu,
- zachovat online bezpecnost a pravidla hry.

---

Scope
Pouze logika Play Mode ukonceni tahu a navazujici UI stav tlacitek/dialogu.

V rozsahu:
- offline human,
- offline human vs computer,
- vsechny AI hrace,
- online play mode.

Mimo rozsah:
- zmena pravidel kombinaci,
- zmena pravidel bonusu,
- zmena datoveho modelu,
- refactoring AI strategie mimo handoff flow.

---

Files
- app/page.tsx
- docs/PLAYMODE.md
- docs/CHANGELOG.md

---

Current Technical State (as-is)
1. Inline tlacitko Hazi dalsi hrac je renderovane pri remainingRolls <= 0.
2. Ulozeni skore vola savePlayModeScore a nasledne endTurn.
3. Potvrzovaci dialog existuje pres showPlayModeResult + playModeTurnSummary.
4. Online vetev uz ma deferred handoff pattern pres pendingOnlineHandoffRef.
5. Offline vetev aktualne prepina hrace primo v endTurn.
6. AI turn flow vola stejnou endTurn orchestraci jako human flow.

---

Target Technical State (to-be)
1. Inline stav Hazi dalsi hrac bude odstranen jako samostatny UI stav.
2. Po zapsani skore se otevre jednotny potvrzovaci dialog ukonceni tahu.
3. Po vycerpani hodu bez zapisu skore se otevre stejny potvrzovaci dialog.
4. Predani tahu probehne az po potvrzeni dialogu.
5. AI bude pouzivat stejnou cestu a potvrzeni provede interne automaticky.
6. Online potvrzeni smi provest pouze aktualni hrac.

---

Implementation Plan (minimal architecture change)
1. Konsolidovat handoff na jedinou commit cestu
- endTurn pouze pripravi turn summary + pending handoff data.
- Realne predani tahu provede jedna funkce potvrzeni (existing handler).

2. Odebrat inline Hazi dalsi hrac v Play Mode panelu
- Pri remainingRolls <= 0 nesmi vzniknout samostatne inline tlacitko.
- Hlavni ovladaci vrstva zustane bez handoff tlacitka.

3. Jednotny trigger dialogu
- Save flow: po uspesnem save otevrit turn-end dialog.
- No-score flow: po remainingRolls <= 0 otevrit turn-end dialog.

4. AI auto-confirm
- Pokud je na tahu computer player, po vytvoreni turn summary potvrdit interni cestou bez uzivatelske akce.
- Pouzit stejnou potvrzovaci funkci jako human (zadna bypass vetev).

5. Online guardy
- Potvrzeni pouze pro isCurrentPlayer.
- Zachovat turnVersion/runtimeRevision ochrany.
- Zachovat pendingOnlineHandoffRef pattern a poradi updateOnlineState.

6. UX/consistency cleanup
- Nechat jeden modal pro Další hráč potvrzeni.
- Odstranit nebo sjednotit duplicity modal renderu, pokud vedou ke dvema odlisnym vetvim.

---

Allowed Changes
- Uprava podminek renderu tlacitek v Play Mode panelu.
- Uprava endTurn orchestrace pro deferred handoff i offline.
- Uprava potvrzovaciho handleru pro jednotny commit tahu.
- Doplneni AI auto-confirm triggeru navazaneho na stejnou commit cestu.
- Drobne UI textove sjednoceni dialogu (bez zmeny pravidel).
- Aktualizace dokumentace a changelogu.

---

Forbidden Changes
- Zmena pravidel bonus a bonus general.
- Zmena detekce kombinaci a score pravidel.
- Zmena databazovych tabulek/sloupcu.
- Zmena realtime schema nebo migration.
- Refactoring aiPlayer strategy jadra mimo handoff orchestration.
- Zmena save/load contractu ulozenych her mimo nezbytne navaznosti.

---

Constraints
- Zachovat 100 procent hernich pravidel.
- Zachovat kompatibilitu online synchronizace.
- Zachovat kompatibilitu AI behavior (bez deadlocku, bez skipu tahu).
- Minimalni zasah do architektury: prednostne app/page.tsx.
- Zadny destructive zasah do existujicich dat.

---

Acceptance Criteria
1. Inline Hazi dalsi hrac se nikde nezobrazi po zapsani skore.
2. Inline Hazi dalsi hrac se nikde nezobrazi po vycerpani hodu bez zapisu.
3. V obou scenarich se otevre jednotny potvrzovaci dialog ukonceni tahu.
4. Predani tahu se provede az po potvrzeni dialogu.
5. AI potvrdi stejnou cestou interni automatickou akci.
6. Online potvrzeni muze provest pouze aktualni hrac.
7. Nevznikne regrese v bonus/bonus general pravidlech.
8. Nevznikne regrese v online handoff a synchronizaci stavu.
9. Human guard: pokud remainingRolls <= 0 a human hrac muze jeste legalne pouzit Bonus nebo Bonus General, nesmi byt nabidnuto ukonceni tahu (ani dialog, ani inline handoff).
10. Human guard: turn-end potvrzovaci dialog lze otevrit az tehdy, kdy:
 - bonus byl v aktualnim tahu vyuzit,
 - nebo jsou bonus akce pro hrace legalne nedostupne (bonus tlacitka disabled podle pravidel).

---

Testing
Manual matrix:

A) Offline Human vs Human
- Save score -> dialog -> confirm -> next player
- No score, remainingRolls 0 -> dialog -> confirm -> next player
- Bonus aktivni -> overit, ze neni predcasny konec tahu mimo pravidla
- remainingRolls 0 + bonus legalne dostupny -> zadny turn-end dialog, hrac musi nejdriv bonus pouzit
- po vyuziti bonusu nebo pri legalne disabled bonusu -> turn-end dialog povolen

B) Offline Human vs Computer
- Human save/no-score flow dle A
- Computer save flow -> auto-confirm -> plynuly prechod
- Computer no-score flow -> auto-confirm -> plynuly prechod
- Human bonus guard musi fungovat stejne jako v offline human vs human

C) Computer AI scenarios
- Bez kombinace, remainingRolls klesne na 0 -> auto-confirm handoff
- Se save kandidatem -> save -> auto-confirm handoff
- Bez deadlocku mezi showPlayModeResult a AI effect

D) Online
- Aktualni hrac potvrdi dialog -> handoff sync na druhe zarizeni
- Neaktualni hrac nema moznost potvrzeni
- Bez regresi turnVersion/runtimeRevision guardu

Build checks:
- npm run lint
- npm run build

---

Risks
- Medium: race condition mezi modal confirm a online update.
- Medium: AI effect muze opakovane triggerovat confirm bez guardu.
- Low: zmena UX muze odhalit skryte zavislosti na inline tlacitku.

Mitigation:
- Pouzit existujici pendingOnlineHandoffRef guard.
- V AI pridat explicitni one-shot guard pro auto-confirm v ramci tahu.
- Otestovat stale/echo scenare ve dvou klientech.

---

Recommended Implementation Order
1. Sjednotit endTurn na deferred handoff model pro vsechny rezimy.
2. Napojit confirm handler jako jediny commit tahu.
3. Odstranit inline Hazi dalsi hrac render.
4. Pridat AI auto-confirm pres stejnou commit cestu.
5. Overit online guardy.
6. Provest lint/build + manual matrix.
7. Zapsat docs/PLAYMODE.md a docs/CHANGELOG.md.

---

Expected Output
- Seznam upravenych souboru.
- Strucny popis sjednocene handoff cesty.
- Potvrzeni splneni acceptance kriterii.
- Vysledek lint/build.
- Popis residualnich rizik (pokud zustanou).
