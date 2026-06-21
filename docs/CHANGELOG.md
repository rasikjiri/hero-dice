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
