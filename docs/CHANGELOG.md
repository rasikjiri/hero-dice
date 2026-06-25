CHANGELOG  
  
**Projekt:** Hero Dice  
  
**Verze projektu:** 2.6  
  
**Typ dokumentu:** Historie změn  
  
**Status:** Active  
  
---  
  
# Účel dokumentu  
  
Tento dokument slouží jako oficiální historie vývoje projektu Hero Dice.  
  
Obsahuje chronologický přehled všech dokončených změn projektu.  
  
Každý zápis představuje uzavřenou vývojovou etapu.  
  
Historie projektu se nikdy nepřepisuje.  
  
Nové změny se vždy pouze přidávají na konec dokumentu.  
  
---  
  
# Pravidla vedení historie  
  
Každé dokončené vývojové vlákno končí vytvořením nového záznamu.  
  
Každý záznam musí obsahovat:  
  
- Verzi  
- Datum  
- Riziko  
- Změněné soubory  
- Popis změn  
- Důvod změny  
- Dopad změny  
- Poznámky (volitelné)  
  
---  
  
# Šablona zápisu  
  
```text  
Verze:  
  
Datum:  
  
Riziko:  
LOW / MEDIUM / HIGH  
  
Změněné soubory:  
*  
  
Popis:  
  
Důvod:  
  
Dopad:  
  
Poznámky:  
```  
  
---  
  
# Pravidla zápisu  
  
Každý zápis musí splňovat následující pravidla.  
  
## Přidávání  
  
Nové záznamy se vždy přidávají na konec dokumentu.  
  
Nikdy se nevkládají mezi starší verze.  
  
---  
  
## Úpravy historie  
  
Historické záznamy se nepřepisují.  
  
Výjimkou jsou pouze:  
  
- opravy překlepů,  
- oprava formátování.  
  
Obsah změn se nikdy zpětně neupravuje.  
  
---  
  
## Rozsah zápisu  
  
Do CHANGELOG.md patří pouze změny dokončené a otestované.  
  
Nezapisují se:  
  
- rozpracované změny,  
- návrhy,  
- experimentální úpravy.  
  
---  
  
## Riziko  
  
Každý zápis obsahuje odhad rizika.  
  
Používají se tři úrovně.  
  
### LOW  
  
Bezpečná změna.  
  
Bez dopadu na ostatní části projektu.  
  
---  
  
### MEDIUM  
  
Změna zasahuje více částí projektu.  
  
Vyžaduje běžné otestování.  
  
---  
  
### HIGH  
  
Významná změna architektury nebo herní logiky.  
  
Vyžaduje důkladné testování.  
  
---  
  
# Co zapisovat  
  
Do historie změn patří například:  
  
- nové funkce,  
- opravy chyb,  
- UX změny,  
- databázové změny,  
- změny Play Mode,  
- změny statistik,  
- změny dokumentace,  
- změny architektury.  
  
---  
  
# Co nezapisovat  
  
Do historie změn nepatří například:  
  
- neúspěšné pokusy,  
- pracovní poznámky,  
- brainstorming,  
- rozpracované návrhy,  
- interní diskuse.  
  
---  
  
# Vazba na dokumentaci  
  
Pokud změna ovlivňuje:  
  
- architekturu,  
- databázi,  
- Play Mode,  
- workflow,  
- AI,  
- pravidla projektu,  
  
musí být současně aktualizována odpovídající dokumentace.  
  
---  
  
# Zdroj pravdy  
  
CHANGELOG.md není zdrojem pravdy.  
  
Slouží pouze jako historický přehled vývoje.  
  
V případě rozporu platí pořadí:  
  
1. Zdrojový kód  
2. Dokumentace  
3. CHANGELOG.md  
  
---  
  
# Historie projektu  
  
Veškeré historické záznamy vytvořené během vývoje Hero Dice zůstávají zachovány.  
  
Na tento úvod bezprostředně navazuje kompletní historie verzí projektu.  
  
Od tohoto místa pokračuje původní obsah CHANGELOG.md bez jakýchkoliv úprav.  
  
---  
  
==============================================================================  
ZA TUTO ČÁRU PONECH PŮVODNÍ HISTORII ZMĚN BEZE ZMĚN  
==============================================================================  
  
(vlož sem celý původní obsah CHANGELOG.md)  

---

Verze:
2.6

Datum:
2026-06-20

Riziko:
MEDIUM

Změněné soubory:
* app/page.tsx
* supabase/migrations/20260620_saved_games_add_online_metadata.sql
* supabase/migrations/20260620_saved_games_add_playmode_runtime.sql

Popis:
- Implementován základ Online Lobby workflow (Host/Client módy, claim hráče, readiness synchronizace).
- Přidána synchronizace runtime stavu Online PlayMode a stabilizována realtime propagace.
- Rozšířen save model o online metadata: game_mode a online_session_id.
- Offline PlayMode save/load nově ukládá a obnovuje kompletní runtime stav (hráč na tahu, kostky, locky, zbývající hody, bonus stav, rozběhnutý tah).
- Herní lifecycle byl sjednocen do toku Home -> New Game -> Player Selection -> PlayMode Setup -> Game Mode -> Offline/Online větev.

Důvod:
- Zajistit spolehlivý základ pro online hraní a online save.
- Odstranit neúplné obnovení rozehraných offline her.
- Připravit architekturu na pokračování Online Resume ve verzi 2.7.

Dopad:
- Offline rozehraná hra po načtení pokračuje přesně z uloženého runtime stavu.
- Online a offline save jsou jednoznačně rozlišené.
- Online PlayMode má stabilnější průběh díky lepší synchronizaci lobby a runtime stavu.

Poznámky:
- Online Resume je částečně implementované.
- Do v2.7 je naplánováno: reconnect všech hráčů po loadu online save, dokončení lobby resume flow, host/client resume synchronizace.

---

## v2.7.005

### Fixed

- Stabilized selectedPlayers as the single Source of Truth.
- Player selection is now invalidated after every playerCount change.
- Removed stale selectedPlayers usage during online session creation.
- Removed unsafe local selectedPlayers fallbacks in online synchronization.
- Fixed online resume flow to reconnect to the existing online session.
- Resume now restores realtime synchronization with the active online session.
- Online lobby now reflects the shared remote state after loading a saved online game.
- Fixed host/client visibility after resuming saved online games.
- Prevented readiness reset during online resume.

---

## v2.8 – Computer / AI Player

### Added

- Přidána možnost hrát offline PlayMode s Computer hráčem.
- Computer hráči jsou definovaní v kódu jako pevný číselník tří hráčů.
- Výsledky Computer hráčů jsou součástí Fun Games, Fun Statistics a Fun Leaderboards.

### Changed

- Hra s Computer hráčem se vždy ukládá jako Fun Game.
- Ruční zápis do scoreboardu je při hře s Computer hráčem zamčený stejně jako v online režimu.

### Notes

- Computer AI zapisuje skóre pouze podle aktuálně zobrazených kostek.
- Computer AI je zatím reaktivní, nikoliv strategická.

---

## Hero Dice v2.9

### Added

- Zobrazení typu hry (Online / Offline) ve Scoreboardu.
- Zobrazení typu hry (Online / Offline) v horním panelu Play Mode.
- Online Chat dostupný pouze během online hry.
- Sbalitelný pravý chat panel.
- Realtime komunikace mezi hráči.
- Diagnostika Supabase chyb při komunikaci s chatem.

### Changed

- Upraven layout Play Mode pro desktop s integrovaným chat panelem.
- Zachována kompatibilita mobilního zobrazení.

### Database

- Přidána tabulka game_messages.
- Přidány RLS policies.
- Přidány INSERT/SELECT oprávnění.
- Přidána realtime publication.

### Fixed

- Opraveno odesílání zpráv do online chatu.
- Opraveno načítání zpráv po vytvoření databázové tabulky.
- Opraveno zarovnání chat panelu vůči Play Mode.

---

## v3.0.2 – UI sjednocení a finální doladění

### Changed

- Sjednocen vizuální styl hlavních navigačních tlačítek MENU napříč aplikací.
- Upraven vzhled tlačítka MENU na Home page, Nastavení hry a Scoreboardu.
- Vylepšen hover efekt hlavních navigačních tlačítek.
- Upraven vzhled tlačítka Nastavit hru při zachování původního gradientu.
- Sjednocen vzhled tlačítka Play Mode se stylem hlavních akčních tlačítek.

### Improved

- Sjednocen vzhled dialogových oken.
- Upraveno rozmístění prvků v modalech.
- Zarovnán zavírací křížek v dialogu Ukončit hru.
- Zachovány významové barvy akčních tlačítek.

---

## v3.0.3 – Oprava zobrazení typu uložené hry

### Fixed

- Opraveno určování typu hry v dialogu Načíst hru.
- Offline hra proti počítači je nově správně označena jako Fun hra.
- Sjednoceno mapování štítků typu hry s Play Mode a Scoreboardem.
- Opravena barevnost štítků Fun hra a Ligová hra.

---

## v3.0.4 – Korekce UI po uživatelském testování

### Changed

- Odstraněn žlutý rámeček hlavního bloku Nastavení nová hra.
- Vrácen původní vzhled hlavního konfiguračního panelu.

### Refined

- Odstraněna plasticita malých akčních tlačítek v administraci hráčů.
- Odstraněna plasticita malých akčních tlačítek v dialogu Načíst hru.
- Odstraněny šedé rámečky z malých potvrzovacích tlačítek.
- Zachovány hover animace a významové barvy tlačítek.

---

## v3.0.5 – Stabilizace zvukového systému

### Fixed

- Opraveno falešné přehrávání zvuku **No Combination** po zápisu skóre a při změně herního stavu.
- Upravena logika přehrávání zvuků tak, aby se nespouštěly opakovaně při přepočtu stavu.

### Improved

- Optimalizováno načítání zvuků pro mobilní zařízení.
- Odstraněn zbytečný cache-busting u audio souborů.
- Přidán preload nejčastěji používaných zvuků po první uživatelské interakci.
- Snížena latence přehrávání zvukových efektů na mobilních zařízeních.

---

## v3.0.6 – Ochrana proti duplicitnímu zápisu dokončených her

### Added

- Přidán identifikátor `game_id` do ukládání dokončených her.
- Připravena SQL migrace pro rozšíření tabulek `games` a `fun_games` (soubor: `supabase/migrations/20260622_add_game_id_to_stats.sql`).
- Nový UI modal pro informování uživatele o pokusu opětovného zápisu duplikátu.
- Nový state `showDuplicateGameMessage` pro správu zobrazování hlášky.

### Fixed

- Přidána kontrola duplicit před zápisem dokončené hry do statistik.
- Zabráněno opakovanému zápisu stejné uložené hry do tabulek `games` a `fun_games`.
- Zachována správnost statistik i při opětovném načtení již dříve uložené hry.
- Funkce `saveFinishedGame()` nyní vrací boolean pro indikaci úspěchu/duplikátu.
- Funkce `saveFunGame()` nyní vrací boolean pro indikaci úspěchu/duplikátu.
- Typ `FinishedGame` rozšířen o volitelné pole `gameId?: string`.

### Improved

- Uživatel je při pokusu o opětovný zápis stejné hry informován hláškou: _"Tato hra již byla dříve do statistik zapsána. Výsledek nebyl uložen znovu."_
- Celebration (confetti, zvuk) se spouští pouze při úspěšném zápisu, nikoliv při duplikátu.
- Zachováno standardní dokončení hry bez vzniku duplicitních statistických záznamů.
- Backward compatibility: staré záznamy bez `game_id` zůstávají funkční a viditelné.

### Changed

- Upravena logika obou tlačítek v modálu **Blížíte se ke konci hry** (Ligová hra / Fun hra) pro kontrolu duplikátů.
- Auto-save flow při `endTurn` nyní kontroluje success status z obou funkcí.
- Celebration timeout logika zachovává funkčnost pouze pro úspěšné zápisy.

### Notes

- SQL migrace je připravena v souboru `supabase/migrations/20260622_add_game_id_to_stats.sql` a musí být ručně spuštěna v Supabase SQL editoru.
- Po spuštění migrace budou nové hry automaticky zaznamenávat `game_id` bez dopadu na staré záznamy.
- Duplikát-check funguje na úrovni databázového dotazu (supabase `.select().eq()`), nikoliv aplikační logiky.

---

## v3.0.7 – Oprava návaznosti AI tahu v Play Mode

### Fixed

- Opraveno chování tahu počítače v Play Mode.
- Počítač nyní automaticky zahájí hod.
- Pokud hod neobsahuje skórovací kombinaci, počítač pokračuje dalšími hody.
- AI pokračuje do vyčerpání dostupných hodů nebo do nalezení validní kombinace.
- Při nalezení validní kombinace se skóre zapíše přes existující auto-score logiku.
- Tah počítače již nezůstává zaseknutý po prvním hodu.
- Hra pokračuje dál podle stávajících pravidel bez nutnosti ručního výběru kostek.

### Notes

- Oprava nezavádí výběr kostek počítačem.
- Oprava nezavádí novou AI strategii ani obtížnosti.
- Bonus logika AI nebyla měněna.
- Scoring pravidla, UI a databáze nebyly touto opravou měněny.

---

## [3.2] - Opravy chyb

### Opraveno

#### Režim hry proti AI
- Opraveno pořadí vrstev závěrečné oslavy po dokončení hry.
- Konfety se nyní zobrazují nad oknem s výsledky stejně jako v offline a online režimu.
- Sjednoceno chování závěrečné oslavy napříč všemi herními režimy.

#### Online režim
- Opravena nestabilita při označování kostek způsobená synchronizací online stavu.
- Zabráněno přepisování lokálního výběru kostek vzdáleným (Supabase) snapshotem během tahu aktivního hráče.
- Doplněna ochrana proti aplikaci zastaralých nebo duplicitních aktualizací herního stavu.
- Zvuky **„Žádná kombinace“** a **„Maximální skóre“** se nyní přehrávají pouze po platné akci lokálního hráče.
- Zabráněno spouštění zvuků při pasivní synchronizaci online hry, obnově stavu nebo aktualizaci soupeřova tahu.
- Výrazně zvýšena stabilita a plynulost označování kostek v online hře.
- Odstraněno náhodné přehrávání zvukových efektů „Žádná kombinace“ a „Maximální skóre“.
- Opraveno opožděné přehrávání těchto zvukových efektů způsobené asynchronní synchronizací online stavu.

---

## v3.3 - Stabilizace rozhodovaci logiky AI

Datum:
2026-06-24

Riziko:
MEDIUM

Zmenene soubory:
* app/lib/aiPlayer.ts
* app/page.tsx

Popis:
- Zavedena fazova AI politika podle zaplneni vlastniho scoreboardu.
- Sjednocena evaluace kandidatu a jejich uzamceni v jedne rozhodovaci pipeline.
- Zprisnena validace strategickych kandidatu a ochrany proti nevhodnym singleton lockum.
- Pridana podpora rozpracovane postupky a rozsireny handling partial combinations.
- Upraven fallback tak, aby AI radeji zvolila no-change nez strategicky spatny lock.
- Zachovana vetsi flexibilita v pozdni fazi hry (vcetne pozdniho tlaku na silne kombinace, napr. General).
- Vyrazne snizeno mnozstvi situaci, kdy AI neprovedla zadnou akci.
- Odstranena vetsina zaseku pri automatickem rozhodovani computer tahu.

Duvod:
- Stabilizovat AI rozhodovani ve hre proti computer hraci bez zasahu do scoring pravidel.
- Zvysit hratelnost a predikovatelnost AI chovani oproti verzi 3.2.

Dopad:
- AI ve verzi 3.3 je vyrazne stabilnejsi a hratelnejsi nez ve verzi 3.2.
- Rozhodovaci tok je konzistentnejsi a mene casto konci nechtenym no-action stavem.

Poznamky:
- V ramci dlouhodobeho testovani byly identifikovany 2 otevrene strategicke problemy, ktere se presouvaji do verze 3.4:
	1) Bias ke kombinaci 1 + 5 (preference hodnoty 1 i v situacich, kde existuje vyhodnejsi varianta).
	2) Nedostatecne zohledneni pravdepodobnosti budouciho vyvoje (AI nekdy preferuje okamzitou cestu k cili pred pravdepodobne silnejsim pokracovanim).

---

## Hero Dice v3.4 - Souhrn změn

Datum:
2026-06-25

Riziko:
LOW

Změněné soubory:
* app/page.tsx
* app/components/HelpModal.tsx
* app/components/FunGamesModal.tsx
* app/data/gameCategories.ts

Popis:

### v3.4.0.1 - Potvrzení klávesou Enter
- Přidáno potvrzení přihlášení klávesou Enter.
- Přidáno potvrzení ručního zadání skóre klávesou Enter.
- Omezeno pouze na přihlášení a ruční zadání skóre v offline PvP.
- Bez dopadu na online hru, hru proti počítači a Play Mode logiku.

### v3.4.0.2 - Kompletní redesign Průvodce hrou
- Kompletně přepracovaná struktura průvodce.
- Zpřesněné vysvětlení pravidel Hero Dice.
- Jasné oddělení pravidel hry, způsobů hraní, Ligové/Fun hry, statistik a ukládání her.
- Přidány přesnější popisy režimů, zápisu skóre, bonusů a FAQ.
- Zlepšena čitelnost, zkráceny texty a upraveno pořadí sekcí.

### v3.4.0.3 - Kombinace v Průvodci hrou
- Přidán interaktivní seznam kombinací.
- Přidáno otevírání existující obrázkové nápovědy přímo z průvodce.
- Opraven návrat po zavření náhledu kombinace zpět do Průvodce hrou.
- Upraven vzhled odkazů tak, aby byl klikací pouze název kombinace.

### v3.4.0.4 - Informační řádek hry
- Zpřesněno zobrazení bonusového režimu.
- Přidáno dynamické zobrazení počtu bonusových hodů podle aktuální konfigurace.
- Přidáno označení Hra proti počítači při aktivním AI hráči.
- Zachována stávající logika rozlišení Ligová/Fun hra.

### v3.4.0.5 - Branding hlavní kombinace
- Provedeno bezpečné prezentační přejmenování hlavní kombinace Generál -> Hero.
- Zachovány interní identifikátory, databázové struktury, statistiky, uložené hry i herní logika.

Důvod:
- Zvýšit kvalitu každodenního používání aplikace bez zásahu do herních pravidel a výpočtů skóre.
- Zpřehlednit pravidla, sjednotit UX a odstranit drobné nedostatky v uživatelském rozhraní.

Dopad:
- Verze 3.4 nepřináší nové herní funkce, ale výrazně zlepšuje použitelnost a orientaci hráče.
- Zachována stabilita, kompatibilita uložených dat a konzistence herních mechanismů.
- Vytvořen pevný základ pro další rozvoj v oblasti AI, herního zážitku a budoucích komunitních funkcí.

Poznámky:
- Nedošlo ke změnám herních pravidel ani výpočtů skóre.

---

## Hero Dice v3.5.0.1 - UX finále a audio

Datum:
2026-06-25

Riziko:
LOW

Změněné soubory:
* app/page.tsx
* app/globals.css
* public/sounds/playmode/turnend.mp3

Popis:
- Upraveno finální oslavné okno po dokončení hry (užší layout, přehlednější obsah, podium 1/2/3).
- Top 3 výsledky jsou nově zobrazeny jako vizuální stupně vítězů místo čistého vertikálního seznamu.
- Zachována možnost opakované oslavy klikem na trofej, konfety i stávající tlačítka navazujících akcí.
- Přidán a zapojen zvuk ukončení tahu v Play Mode včetně přepínače v nastavení zvuků.
- Drobně upravena robustnost přihlášení: porovnání vstupního kódu nyní používá `trim()` na vstupu i konfiguraci.

Důvod:
- Zlepšit čitelnost a celkový dojem z finálního výsledkového okna.
- Zpřesnit zvukovou odezvu Play Mode bez zásahu do herních pravidel.
- Omezit falešné zamítnutí přístupového kódu kvůli neviditelným mezerám.

Dopad:
- Lepší UX po dohrání partie a konzistentnější vizuální hierarchie vítězů.
- Rozšířené audio nastavení bez změny skórovací logiky.
- Stabilnější přihlášení při zachování stávajícího bezpečnostního modelu přes `NEXT_PUBLIC_APP_CODE`.

Poznámky:
- Bez změn databázového schématu.
- Bez změn výpočtu kombinací, AI rozhodování a online synchronizační logiky.
