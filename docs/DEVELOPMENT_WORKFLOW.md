DEVELOPMENT_WORKFLOW  
  
**Projekt:** Hero Dice  
  
**Verze projektu:** 2.6  
  
**Typ dokumentu:** Vývojový proces  
  
**Status:** Active  
  
---  
  
# Účel dokumentu  
  
Tento dokument definuje jednotný postup vývoje projektu Hero Dice.  
  
Je závazný pro všechny osoby i AI agenty podílející se na vývoji projektu.  
  
Jeho cílem je zajistit:  
  
- stabilní vývoj,  
- minimální riziko regresí,  
- jednotný způsob práce,  
- kvalitní dokumentaci,  
- dlouhodobou udržitelnost projektu.  
  
---  
  
# Základní princip  
  
Každá změna projektu musí projít stejným vývojovým procesem.  
  
Žádný krok nesmí být bezdůvodně přeskočen.  
  
---  
  
# Standardní workflow  
  
Každá změna probíhá v tomto pořadí:  
  
```text  
1. Analýza  
  
↓  
  
2. Návrh řešení  
  
↓  
  
3. Schválení  
  
↓  
  
4. Implementace  
  
↓  
  
5. Testování  
  
↓  
  
6. Aktualizace dokumentace  
  
↓  
  
7. Zápis do CHANGELOG.md  
```  
  
---  

# Workflow s externími AI nástroji

Při spolupráci s externími AI nástroji se používá následující rozdělení odpovědností:

1. Hero Dice Architect vytváří analýzu a TASK BRIEF.
2. Externí AI Agent provádí implementaci podle schváleného zadání.
3. Product Owner implementaci testuje.
4. Hero Dice Architect provádí architektonickou kontrolu.
5. Dokumentace a CHANGELOG se aktualizují až po schválení.

Tento postup je závazný pro všechny změny realizované přes Externího AI Agenta.

---  
  
# 1. Analýza  
  
Každá změna začíná analýzou.  
  
Je nutné určit:  
  
- co je potřeba změnit,  
- proč je změna potřebná,  
- které soubory budou ovlivněny,  
- jaké může mít změna vedlejší dopady,  
- jaké existují možné varianty řešení.  
  
V této fázi se ještě nepíše žádný kód.  
  
---  
  
# 2. Návrh řešení  
  
Po analýze následuje návrh řešení.  
  
Návrh obsahuje:  
  
- popis změny,  
- rozsah změny,  
- očekávaný přínos,  
- možné riziko,  
- ovlivněné soubory.  
  
Pokud existuje více řešení, preferuje se varianta s nejnižším rizikem.  
  
---  
  
# 3. Schválení  
  
Implementace začíná až po schválení návrhu.  
  
Bez schválení se:  
  
- nemění logika,  
- neupravuje databáze,  
- nepřidávají nové funkce,  
- neprovádí refaktoring.  
  
---  
  
# 4. Implementace  
  
Implementace řeší pouze schválený problém.  
  
Platí následující pravidla:  
  
- minimální rozsah změn,  
- žádné nevyžádané úpravy,  
- zachování zpětné kompatibility,  
- zachování čitelnosti kódu.  
  
Každá změna musí být snadno dohledatelná.  
  
---  
  
# 5. Testování  
  
Po implementaci následuje ověření funkčnosti.  
  
Kontroluje se zejména:  
  
- správná funkčnost nové změny,  
- zachování původní funkcionality,  
- absence regresí,  
- správné chování na podporovaných zařízeních.  
  
Bez úspěšného otestování není změna dokončena.  
  
---  
  
# 6. Aktualizace dokumentace  
  
Pokud změna ovlivňuje:  
  
- architekturu,  
- databázi,  
- Play Mode,  
- pravidla,  
- workflow,  
- AI,  
- projektový kontext,  
  
musí být aktualizována odpovídající dokumentace.  
  
Dokumentace je součástí implementace.  
  
---  
  
# 7. CHANGELOG  
  
Každá dokončená změna musí být zapsána do CHANGELOG.md.  
  
Používá se jednotný formát:  
  
- Verze  
- Datum  
- Riziko  
- Změněné soubory  
- Popis  
- Důvod  
- Dopad  
- Poznámky  
  
---  
  
# Práce s AI  
  
AI je pomocník při vývoji.  
  
Externí AI Agent:  
  
- analyzuje,  
- navrhuje,  
- implementuje až po schválení,  
- nikdy nevytváří vlastní domněnky.  
  
Pokud není možné jednoznačně určit správné řešení, AI požádá o rozhodnutí vlastníka projektu.  
  
---  
  
# Práce se zdrojovým kódem  
  
Při úpravách zdrojového kódu platí:  
  
- zachovat stávající logiku,  
- zachovat kompatibilitu,  
- neprovádět refaktoring bez schválení,  
- neprovádět kosmetické změny nesouvisející se zadáním.  
  
---  
  
# Práce s databází  
  
Jakákoliv změna databáze musí být:  
  
- schválena,  
- zdokumentována,  
- zpětně kompatibilní,  
- bezpečná.  
  
---  
  
# Práce s dokumentací  
  
Dokumentace musí vždy odpovídat aktuálnímu stavu projektu.  
  
Každá změna dokumentace musí být:  
  
- srozumitelná,  
- aktuální,  
- konzistentní s ostatními dokumenty.  
  
---  
  
# Priority při rozhodování  
  
Pokud existuje více možných řešení, používá se následující pořadí priorit:  
  
1. Stabilita  
2. Bezpečnost změny  
3. UX  
4. Správnost dat  
5. Nové funkce  
6. Architektonická čistota  
  
---  
  
# Kdy změnu odmítnout  
  
Změna se neprovede, pokud:  
  
- není dostatek informací,  
- představuje nepřiměřené riziko,  
- porušuje CONSTITUTION.md,  
- porušuje KNOWN_RULES.md,  
- není jednoznačně definováno zadání.  
  
---  
  
# Definice dokončené změny  
  
Změna je dokončena pouze tehdy, pokud:  
  
- implementace je hotová,  
- změna je otestována,  
- dokumentace je aktualizována,  
- CHANGELOG obsahuje nový záznam,  
- vlastník projektu změnu schválil.  
  
Teprve poté lze změnu považovat za uzavřenou.  
  
---  
  
# Souvislosti s ostatní dokumentací  
  
Tento dokument doplňuje:  
  
- CONSTITUTION.md  
- PROJECT_CONTEXT.md  
- ARCHITECTURE.md  
- DATABASE.md  
- PLAYMODE.md  
- KNOWN_RULES.md  
- AI_GUIDE.md  
- CHANGELOG.md  
  
---  
  
# Závěr  
  
DEVELOPMENT_WORKFLOW.md definuje jednotný způsob vývoje Hero Dice.  
  
Dodržování tohoto postupu zajišťuje dlouhodobou stabilitu projektu, kvalitní dokumentaci a bezpečný rozvoj aplikace.  
  
Každý nový vývojář nebo AI agent je povinen se tímto dokumentem řídit před zahájením jakékoliv práce na projektu.  
