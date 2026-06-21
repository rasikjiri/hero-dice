ROLES  
  
**Projekt:** Hero Dice  
  
**Verze projektu:** 2.6  
  
**Typ dokumentu:** Development Roles  
  
**Status:** Active  
  
---  
  
# Účel dokumentu  
  
Tento dokument definuje role používané při vývoji projektu Hero Dice.  
  
Každá role má přesně vymezené odpovědnosti.  
  
Oddělení rolí zajišťuje stabilní, přehledný a bezpečný vývoj.  
  
---  
  
# Vývojové role  
  
Projekt Hero Dice používá tři hlavní role.  
  
```text  
Product Owner  
        │  
        ▼  
Hero Dice Architect  
        │  
        ▼  
     TASK BRIEF  
        │  
        ▼  
      AI Agent  
        │  
        ▼  
      Testování  
        │  
        ▼  
Hero Dice Architect  
        │  
        ▼  
CHANGELOG + Dokumentace  
```  
  
---  
  
# Product Owner  
  
Odpovědnost:  
  
- určuje vizi projektu,  
- stanovuje priority,  
- zadává nové požadavky,  
- testuje implementaci,  
- schvaluje dokončené změny.  
  
Product Owner nerozhoduje o technické architektuře.  
  
---  
  
# Hero Dice Architect  
  
Odpovědnost:  
  
- analyzuje požadavky,  
- navrhuje řešení,  
- chrání architekturu projektu,  
- vytváří TASK BRIEF,  
- provádí architektonickou kontrolu,  
- navrhuje změny dokumentace,  
- připravuje zápisy do CHANGELOG.md.  
  
Hero Dice Architect standardně neimplementuje změny přímo ve zdrojovém kódu.  
  
---  
  
# AI Agent  
  
Odpovědnost:  
  
- implementuje TASK BRIEF,  
- upravuje zdrojový kód,  
- dodržuje dokumentaci projektu,  
- provádí základní technickou kontrolu (build, lint),  
- vrací přehled provedených změn.  
  
AI Agent nerozhoduje o architektuře ani o prioritách projektu.  
  
---  
  
# Základní pravidla  
  
Každá změna prochází stejným procesem:  
  
1. Product Owner definuje požadavek.  
2. Hero Dice Architect provede analýzu.  
3. Hero Dice Architect vytvoří TASK BRIEF.  
4. AI Agent provede implementaci.  
5. Product Owner změnu otestuje.  
6. Hero Dice Architect provede kontrolu výsledku.  
7. Aktualizuje se dokumentace.  
8. Přidá se záznam do CHANGELOG.md.  
  
---  
  
# Hlavní princip  
  
Každá role má vlastní odpovědnost.  
  
Role se vzájemně nepřekrývají.  
  
To zajišťuje dlouhodobě stabilní a předvídatelný vývoj projektu Hero Dice.  
  
---  
  
# Souvislosti  
  
Tento dokument doplňuje:  
  
- CONSTITUTION.md  
- DEVELOPMENT_WORKFLOW.md  
- AI_GUIDE.md  
- TASK_TEMPLATE.md  
  
---  
  
# Závěr  
  
Jasně definované role jsou základem efektivního vývoje projektu Hero Dice.  
  
Dodržování tohoto modelu umožňuje oddělit rozhodování, implementaci a kontrolu kvality.  
