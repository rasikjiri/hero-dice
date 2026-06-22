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
