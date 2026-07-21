ARCHITECTURE  
  
**Projekt:** Hero Dice  
  
**Verze projektu:** 2.6  
  
**Typ dokumentu:** Architektura systému  
  
**Status:** Active  
  
---  
  
# Účel dokumentu  
  
Tento dokument popisuje architekturu projektu Hero Dice.  
  
Je určen pro všechny vývojáře i AI agenty, kteří budou na projektu pracovat.  
  
Neobsahuje pravidla hry ani databázovou dokumentaci.  
  
Ty jsou popsány v samostatných dokumentech.  
  
---  
  
# Architektonická filozofie  
  
Hero Dice je postaven jako modulární aplikace.  
  
Jednotlivé části projektu mají přesně definovanou odpovědnost.  
  
Každý modul řeší pouze svou oblast.  
  
Architektura projektu je navržena s důrazem na:  
  
- jednoduchost,  
- přehlednost,  
- minimální provázanost,  
- dlouhodobou udržitelnost,  
- bezpečný vývoj.  
  
---  
  
# Architektura aplikace  
  
Projekt je rozdělen do několika hlavních vrstev.  
  
```text  
UI  
  
↓  
  
page.tsx  
  
↓  
  
Components  
Data  
Lib  
  
↓  
  
Supabase  
  
↓  
  
Databáze  
```  
  
Každá vrstva má přesně vymezenou odpovědnost.  
  
---  
  
# page.tsx  
  
Soubor **page.tsx** je hlavním orchestrátorem celé aplikace.  
  
Obsahuje řízení průběhu hry, správu stavů aplikace a propojení všech ostatních modulů.  
  
page.tsx není určen pro implementaci obecné logiky.  
  
Specializovaná logika je postupně přesouvána do samostatných modulů.  
  
page.tsx zejména:  
  
- řídí průběh hry,  
- propojuje komponenty,  
- spravuje React State,  
- komunikuje s databází prostřednictvím knihoven,  
- zobrazuje jednotlivé obrazovky aplikace.  
  
---  
  
# Components  
  
Složka **components** obsahuje samostatné uživatelské komponenty.  
  
Každá komponenta řeší vlastní část uživatelského rozhraní.  
  
Například:  
  
- StatisticsModal  
- FunGamesModal  
- HelpModal  
  
Komponenty nesmí obsahovat logiku celé aplikace.  
  
---  
  
# Data  
  
Složka **data** obsahuje sdílená data projektu.  
  
Například:  
  
- herní kategorie,  
- statistické funkce,  
- seznam hráčů,  
- další datové struktury.  
  
Data vrstva neobsahuje UI.  
  
---  
  
# Lib  
  
Složka **lib** obsahuje sdílenou aplikační logiku.  
  
Například:  
  
- Play Mode,  
- Supabase,  
- Online Session,  
- další pomocné knihovny.  
  
Lib vrstva nesmí obsahovat React komponenty.  
  
---  
  
# Public  
  
Složka **public** obsahuje statické prostředky projektu.  
  
Například:  
  
- grafiku kostek,  
- zvukové efekty,  
- obrázky,  
- ikony.  
  
Veškeré assety jsou odděleny od aplikační logiky.  
  
---  
  
# Dokumentace  
  
Složka **docs** obsahuje projektovou dokumentaci.  
  
Dokumentace není součástí implementace.  
  
Její úlohou je popisovat projekt.  
  
---  
  
# Databáze  
  
Hero Dice využívá databázi Supabase.  
  
Komunikace s databází je centralizována.  
  
UI nikdy nekomunikuje přímo s databází.  
  
Veškerá databázová komunikace probíhá prostřednictvím sdílených modulů.  
  
---  
  
# Rozdělení odpovědností  
  
## UI  
  
Zobrazení dat.  
  
Neobsahuje databázovou logiku.  
  
---  
  
## Components  
  
Opakovaně použitelné části uživatelského rozhraní.  
  
---  
  
## Data  
  
Sdílené datové struktury.  
  
---  
  
## Lib  
  
Sdílené výpočty, logika a komunikace.  
  
---  
  
## Database  
  
Perzistence dat.  
  
---  
  
# Komunikace mezi vrstvami  
  
Projekt používá jednosměrný tok odpovědností.  
  
```text  
UI  
  
↓  
  
Components  
  
↓  
  
Lib  
  
↓  
  
Supabase  
  
↓  
  
Database  
```  
  
Vyšší vrstva může používat nižší vrstvu.  
  
Nižší vrstva nikdy nesmí záviset na vyšší.  
  
---  
  
# Play Mode  
  
Play Mode představuje samostatný subsystém aplikace.  
  
Jeho pravidla jsou popsána v dokumentu:  
  
**PLAYMODE.md**  
  
Architektura Play Mode respektuje stejná pravidla jako zbytek projektu.  
  
---  
  
# Statistiky  
  
Statistiky jsou samostatným subsystémem.  
  
Jsou odděleny od herní logiky.  
  
Výpočty statistik nesmí ovlivňovat průběh hry.  
  
---  
  
# Online funkce  
  
Online funkcionalita tvoří samostatnou vrstvu systému.  
  
Je navržena tak, aby neovlivňovala lokální režim hry.  
  
Lokální hra musí být plně funkční i bez online připojení.  

---

# Source of Truth

Offline:
saved_games

Online:
online_sessions
+
game_state

saved_games slouží pouze jako vstupní bod pro obnovu onlineSessionId.

Aktivní online hra nikdy nesmí být řízena pouze daty ze saved_games.
  
---  

# Budoucí architektura platformy

Další etapa vývoje zavádí samostatnou architektonickou vrstvu Online Platform Foundation.

Tato vrstva je navržena jako oddělená platforma pro online a mobilní provoz.

Platí následující zásady:

- online platforma je samostatná architektonická vrstva,
- stávající herní logika Hero Dice zůstává oddělená,
- integrace probíhá výhradně přes jasně definovaná rozhraní,
- žádná část Hero Dice nesmí být přepisována bez architektonického schválení.

Cílem je rozšířit systém bez narušení stabilního herního jádra.

---  
  
# Rozšiřitelnost  
  
Architektura je navržena pro dlouhodobý vývoj.  
  
Nové funkce by měly být přidávány formou nových modulů.  
  
Rozšiřování page.tsx je přípustné pouze tehdy, pokud není vhodnější vytvořit samostatný modul.  
  
---  
  
# Architektonické zásady  
  
Při vývoji platí následující pravidla:  
  
- jedna odpovědnost pro každý modul,  
- minimální závislosti,  
- minimální zásahy,  
- žádné duplicitní implementace,  
- žádný nevyžádaný refaktoring,  
- zachování zpětné kompatibility.  
  
---  
  
# Souvislosti s ostatní dokumentací  
  
Tento dokument popisuje pouze architekturu projektu.  
  
Navazující dokumenty:  
  
- PROJECT_CONTEXT.md  
- DATABASE.md  
- PLAYMODE.md  
- KNOWN_RULES.md  
- DEVELOPMENT_WORKFLOW.md  
- AI_GUIDE.md  
  
---  
  
# Závěr  
  
Architektura Hero Dice je postavena na jednoduchých, jasně oddělených vrstvách.  
  
Každá nová funkce musí respektovat rozdělení odpovědností jednotlivých modulů.  
  
Cílem architektury není minimalizovat počet souborů, ale maximalizovat stabilitu, přehlednost a dlouhodobou udržovatelnost projektu.  
