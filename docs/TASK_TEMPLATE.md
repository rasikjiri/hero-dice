TASK_TEMPLATE  
  
**Projekt:** Hero Dice  
  
**Verze projektu:** 2.6  
  
**Typ dokumentu:** Task Brief Template  
  
**Status:** Active  
  
---  
  
# Účel dokumentu  
  
Tento dokument definuje jednotnou šablonu zadávání úkolů pro AI Agenta.  
  
Každý úkol musí být formulován jako **Task Brief**.  
  
Task Brief představuje jednoznačné zadání práce.  
  
Jeho cílem je minimalizovat nedorozumění, zabránit nechtěným změnám a zajistit konzistentní způsob vývoje.  
  
---  
  
# Struktura Task Brief  
  
Každý úkol používá následující strukturu.  
  
---  
  
## TASK ID  
  
Jednoznačný identifikátor úkolu.  
  
Příklad:  
  
```text  
TASK-001  
```  
  
---  
  
## Title  
  
Krátký název úkolu.  
  
Příklad:  
  
```text  
Page.tsx Code Cleanup – Phase 1  
```  
  
---  

## Typ úlohy

Volitelné pole pro rychlé zařazení zadání.

Doporučené typy:

- Implementační úloha
- Oprava chyby
- Architektonická analýza
- Dokumentační úloha
- Online Platform Foundation

---  
  
## Goal  
  
Jednou nebo dvěma větami popsat cíl.  
  
Například:  
  
```text  
Provést organizační úklid souboru page.tsx bez změny logiky.  
```  
  
---  
  
## Background  
  
Krátký kontext.  
  
Proč změna vzniká.  
  
Jaký problém řeší.  
  
---  
  
## Scope  
  
Přesně určit rozsah práce.  
  
Například:  
  
```text  
Pouze page.tsx  
  
Žádné jiné soubory.  
```  
  
---  
  
## Files  
  
Vypsat soubory.  
  
Například:  
  
```text  
app/page.tsx  
```  
  
---  
  
## Allowed Changes  
  
Vypsat povolené změny.  
  
Například:  
  
- sjednocení odsazení  
- organizace komentářů  
- vytvoření sekcí  
- odstranění vizuálního chaosu  
  
---  
  
## Forbidden Changes  
  
Vypsat zakázané změny.  
  
Například:  
  
- změna logiky  
- refaktoring  
- přejmenování funkcí  
- nové proměnné  
- nové databázové sloupce  
- přesuny funkcí  
  
---  
  
## Constraints  
  
Závazná pravidla.  
  
Například:  
  
- zachovat 100 % funkčnosti  
- zachovat kompatibilitu  
- minimální zásah  
- žádné vedlejší změny  
  
---  
  
## Acceptance Criteria  
  
Jak poznáme, že je úkol hotový.  
  
Například:  
  
- aplikace se zkompiluje  
- nevzniknou nové chyby  
- logika zůstane beze změny  
- změny jsou pouze organizační  
  
---  
  
## Testing  
  
Jak má Agent ověřit změnu.  
  
Například:  
  
- TypeScript bez chyb  
- ESLint bez nových chyb  
- Build úspěšný  
  
---  
  
## Documentation  
  
Určit, zda je potřeba aktualizovat dokumentaci.  
  
Například:  
  
```text  
Ne  
  
nebo  
  
Ano  
  
PLAYMODE.md  
  
CHANGELOG.md  
```  
  
---  
  
## Risk  
  
Vyhodnocení rizika.  
  
Používá se:  
  
LOW  
  
MEDIUM  
  
HIGH  
  
---  
  
## Expected Output  
  
Co má Agent vrátit.  
  
Například:  
  
- seznam změněných souborů  
- stručný popis změn  
- potvrzení úspěšné kompilace  
- upozornění na případné problémy  
  
---  
  
# Task Brief Workflow  
  
Každý úkol probíhá podle stejného procesu.  
  
```text  
Nápad  
  
↓  
  
Analýza  
  
↓  
  
Task Brief  
  
↓  
  
Externí AI Agent  
  
↓  
  
Test  
  
↓  
  
Code Review  
  
↓  
  
Dokumentace  
  
↓  
  
CHANGELOG  
  
↓  
  
Commit  
  
↓  
  
Hotovo  
```  
  
---  
  
# Pravidla  
  
Task Brief musí být:  
  
- jednoznačný,  
- stručný,  
- technicky přesný,  
- bez domněnek,  
- bez zbytečných vysvětlení.  
  
Agent nesmí dostat nejednoznačné zadání.  
  
---  
  
# Závěr  
  
Task Brief je jediný způsob zadávání práce AI Agentovi v projektu Hero Dice.  
  
Každý nový úkol musí být vytvořen podle této šablony.  
  
Používání jednotné struktury zajišťuje konzistentní vývoj, vyšší kvalitu implementace a minimalizaci rizika chyb.  
