PROJECT_CONTEXT  
  
**Projekt:** Hero Dice  
  
**Verze projektu:** 3.1  
  
**Typ dokumentu:** Projektový kontext  
  
**Status:** Active  
  
---  
  
# Účel dokumentu  
  
Tento dokument popisuje projekt Hero Dice z pohledu jeho účelu, cílů, filozofie a dlouhodobé vize.  
  
Neslouží jako technická dokumentace.  
  
Neobsahuje implementační detaily, databázovou strukturu ani architekturu systému.  
  
Jeho cílem je vysvětlit, proč projekt vznikl, jaké problémy řeší a jakým směrem se dlouhodobě vyvíjí.  
  
---  
  
# Co je Hero Dice  
  
Hero Dice je webová aplikace určená pro hraní, správu a dlouhodobé vyhodnocování vlastní varianty hry Generál.  
  
Projekt kombinuje:  
  
- evidenci hráčů,  
- samotné hraní,  
- ukládání rozehraných her,  
- dlouhodobé statistiky,  
- historii odehraných her,  
- správu herních režimů,  
- cloudové funkce,  
- postupně rozšiřovaný ekosystém doprovodných funkcí.  
  
Nejde pouze o zapisování výsledků.  
  
Cílem je vytvořit kompletní herní systém.  
  
---  
  
# Vznik projektu  
  
Projekt vznikl z potřeby nahradit papírové zapisování výsledků moderní aplikací.  
  
Postupně se z jednoduchého zapisování skóre stal samostatný software s vlastním vývojem, architekturou a dlouhodobou vizí.  
  
Každá nová funkce byla přidávána s ohledem na zachování jednoduchosti používání.  
  
Projekt je vyvíjen evolučně.  
  
Nejde o jednorázovou aplikaci, ale o dlouhodobě rozvíjený systém.  
  
---  
  
# Cíle projektu  
  
Hlavní cíle Hero Dice jsou:  
  
- umožnit pohodlné hraní Hero Dice,  
- odstranit papírové zapisování,  
- uchovávat historii her,  
- poskytovat dlouhodobé statistiky,  
- umožnit pokračování rozehraných her,  
- podporovat více herních režimů,  
- umožnit budoucí online hraní,  
- zachovat jednoduché ovládání.  
  
Každá nová funkce musí podporovat některý z těchto cílů.  
  
---  
  
# Cíloví uživatelé  
  
Projekt je určen především pro:  
  
- rodiny,  
- přátele,  
- pravidelné hráče Hero Dice,  
- menší herní skupiny.  
  
Aplikace je navržena tak, aby ji bylo možné používat bez technických znalostí.  
  
Jednoduchost používání má vyšší prioritu než množství funkcí.  
  
---  
  
# Filozofie projektu  
  
Hero Dice staví na několika základních principech.  
  
## Stabilita  
  
Nové funkce nikdy nesmí ohrozit stávající funkčnost.  
  
## Přehlednost  
  
Projekt musí být dlouhodobě srozumitelný.  
  
To platí jak pro uživatelské rozhraní, tak pro zdrojový kód.  
  
## Dlouhodobá udržitelnost  
  
Projekt je navržen jako dlouhodobě rozvíjený software.  
  
Každá změna se posuzuje i z pohledu budoucí údržby.  
  
## Evoluční vývoj  
  
Projekt nevzniká jednorázově.  
  
Rozvíjí se postupně.  
  
Každá nová verze staví na stabilním základu předchozí verze.  
  
---  
  
# Základní principy vývoje  
  
Při návrhu nových funkcí platí následující pravidla:  
  
- nejprve zachovat funkčnost,  
- následně zlepšovat UX,  
- až poté rozšiřovat možnosti aplikace.  
  
Technická čistota nikdy nesmí být důvodem ke zbytečným změnám.  
  
Projekt preferuje minimální zásahy.  
  
---  
  
# Dlouhodobá vize  
  
Dlouhodobým cílem Hero Dice je vytvořit kompletní platformu pro hraní Hero Dice.  
  
Do této vize patří zejména:  
  
- stabilní lokální hraní,  
- cloudová synchronizace,  
- online hraní,  
- rozšířené statistiky,  
- nové herní režimy,  
- AI podpora,  
- dlouhodobé ukládání dat,  
- jednoduchá správa hráčů,  
- kvalitní dokumentace.  
  
Ne všechny funkce musí být implementovány okamžitě.  
  
Každá nová verze projektu by však měla přibližovat aplikaci této vizi.  
  
---  
  
# Rozsah projektu  
  
Hero Dice není univerzální herní platforma.  
  
Projekt je zaměřen výhradně na Hero Dice a související funkce.  
  
Veškerý vývoj musí podporovat hlavní účel projektu.  
  
Funkce, které nesouvisí s hlavním zaměřením projektu, se nepřidávají.  
  
---  
  
# Priorita kvality  
  
Každá nová verze projektu musí být kvalitnější než předchozí.  
  
Kvalita je hodnocena podle:  
  
- stability,  
- přehlednosti,  
- správnosti dat,  
- jednoduchosti používání,  
- udržovatelnosti zdrojového kódu,  
- kvality dokumentace.  
  
Počet nových funkcí není hlavním měřítkem kvality projektu.  
  
---  
  
# Definice úspěchu  
  
Projekt je považován za úspěšný, pokud:  
  
- je stabilní,  
- je snadno použitelný,  
- uchovává správná data,  
- umožňuje dlouhodobé hraní,  
- lze jej bezpečně rozvíjet,  
- dokumentace odpovídá implementaci,  
- nový vývoj nezhoršuje stávající funkčnost.  
  
---  
  
# Souvislosti s ostatní dokumentací  
  
Tento dokument popisuje pouze projektový kontext.  
  
Navazující dokumenty:  
  
- ARCHITECTURE.md — architektura projektu  
- DATABASE.md — databázová struktura  
- PLAYMODE.md — pravidla a logika Play Mode  
- KNOWN_RULES.md — závazná vývojová pravidla  
- DEVELOPMENT_WORKFLOW.md — proces vývoje  
- AI_GUIDE.md — pravidla práce AI  
- CHANGELOG.md — historie verzí  
  
---  

# Aktuální status (konec v2.6)

Projekt dokončil první stabilní architekturu Online PlayMode.

Aktuální stav:

- Offline PlayMode je funkčně dokončen.
- Offline Save/Load obnovuje kompletní runtime stav hry.
- Online Lobby je provozně funkční.
- Claim hráčů a synchronizace readiness jsou implementované.
- Synchronizace online runtime stavu je výrazně stabilizovaná.

Zbývající milník:

- Online Resume lifecycle.

Tento milník je hlavním cílem verze 2.7.

---

# Cíle verze 2.7

Primary objective:

- Dokončit Online Resume lifecycle.

Scope:

- reconnect
- lobby resume
- ownership restoration
- host/client synchronization

Pravidlo prioritizace:

- Do dokončení Online Resume lifecycle se nepřidávají žádné nové gameplay funkce.

---
  
# Závěr  
  
Hero Dice je dlouhodobý projekt zaměřený na vytvoření stabilní, přehledné a kvalitní aplikace pro hraní Hero Dice.  
  
Každé budoucí rozhodnutí by mělo být v souladu s tímto dokumentem a s dokumentem CONSTITUTION.md.  
