AI_GUIDE  
  
**Projekt:** Hero Dice  
  
**Verze projektu:** 3.1  
  
**Typ dokumentu:** Pravidla práce AI  
  
**Status:** Active  
  
---  
  
# Účel dokumentu  
  
Tento dokument definuje způsob práce všech AI nástrojů zapojených do vývoje projektu Hero Dice.  
  
Platí pro všechny AI asistenty bez ohledu na poskytovatele nebo vývojové prostředí.  

V projektové dokumentaci se pro implementační roli používá obecný pojem Externí AI Agent.  
  
Cílem dokumentu je zajistit jednotný způsob práce všech AI agentů nad projektem Hero Dice.  
  
---  
  
# Povinné dokumenty  
  
Před zahájením práce je AI povinna seznámit se s následující dokumentací.  
  
1. CONSTITUTION.md  
2. README.md  
3. PROJECT_CONTEXT.md  
4. ARCHITECTURE.md  
5. DATABASE.md  
6. PLAYMODE.md  
7. KNOWN_RULES.md  
8. DEVELOPMENT_WORKFLOW.md  
9. CHANGELOG.md  
  
Bez znalosti této dokumentace nesmí AI navrhovat architektonické změny projektu.  
  
---  
  
# Zdroj pravdy  
  
Pořadí zdrojů pravdy:  
  
1. Aktuální zdrojový kód  
2. Projektová dokumentace  
3. CHANGELOG.md  
  
Pokud vznikne rozpor mezi dokumentací a implementací, rozhodující je vždy aktuální zdrojový kód.  
  
AI nikdy nesmí vytvářet vlastní domněnky.  
  
---  
  
# Standardní pracovní postup  
  
Každý požadavek řeší AI podle následujícího postupu.  
  
1. Analýza  
2. Návrh řešení  
3. Schválení  
4. Implementace  
5. Testování  
6. Aktualizace dokumentace  
7. Zápis do CHANGELOG.md  
  
Žádný krok nesmí být přeskočen.  

---

# Pravidla pro Externího AI Agenta

Externí AI Agent je povinen dodržet následující pravidla:

- nepřepisovat herní logiku Hero Dice,
- nevymýšlet nová pravidla hry,
- neměnit architekturu bez explicitního zadání,
- první etapa představuje pouze vytvoření Online Platform Foundation,
- testovací mock herní relace slouží pouze jako technické ověření,
- skutečná integrace Hero Dice bude řešena až v další etapě.

---  
  
---  
  
# Analýza  
  
AI nejprve analyzuje zadání.  
  
Musí určit:  
  
- cíl změny,  
- rozsah změny,  
- dotčené soubory,  
- možné vedlejší dopady,  
- úroveň rizika.  
  
Analýza předchází každé implementaci.  
  
---  
  
# Návrh řešení  
  
Po analýze AI navrhne řešení.  
  
Pokud existuje více variant, doporučí variantu s nejnižším rizikem.  
  
Návrh musí být stručný, věcný a technicky odůvodněný.  
  
---  
  
# Implementace  
  
Implementace řeší pouze schválený problém.  
  
Platí následující pravidla:  
  
- minimální zásah,  
- žádné vedlejší úpravy,  
- žádné kosmetické změny mimo zadání,  
- zachování zpětné kompatibility,  
- zachování čitelnosti kódu.  
  
---  
  
# page.tsx  
  
Soubor page.tsx je hlavním orchestrátorem projektu.  
  
Při jeho úpravách AI:  
  
- zachovává strukturu souboru,  
- používá existující sekce,  
- nevytváří duplicitní logiku,  
- nepřesouvá funkce bez schválení,  
- neprovádí refaktoring.  
  
Pokud je plánován větší úklid souboru, probíhá samostatně mimo běžný vývoj.  
  
---  
  
# Refaktoring  
  
Refaktoring není standardní součástí práce AI.  
  
Je povolen pouze pokud:  
  
- byl výslovně schválen,  
- řeší konkrétní problém,  
- nebo je součástí samostatné úlohy.  
  
AI nikdy sama nenavrhuje rozsáhlý refaktoring během běžné implementace.  
  
---  
  
# Databáze  
  
AI nesmí bez schválení:  
  
- vytvářet nové tabulky,  
- vytvářet nové sloupce,  
- měnit databázové vazby,  
- měnit strukturu uložených dat.  
  
Každá databázová změna musí být zdokumentována.  
  
---  
  
# Play Mode  
  
Play Mode je nejdůležitější část projektu.  
  
Při jeho úpravách AI musí zachovat:  
  
- herní pravidla,  
- kompatibilitu uložených her,  
- kompatibilitu statistik,  
- kompatibilitu databáze.  
  
Každá změna musí být minimální.  

---

# Online Resume a Lobby

Při opravách online lobby nebo resume vždy nejprve ověřit:

- onlineSessionId,
- realtime subscription,
- game_state,
- Source of Truth.

Nikdy nepoužívat lokální React state jako náhradu za chybějící remote data.
  
---  
  
# Statistiky  
  
AI nesmí měnit logiku statistik bez schválení.  
  
Musí být zachováno oddělení:  
  
- ligových statistik,  
- Fun statistik.  
  
Historická data nesmí být změnou poškozena.  
  
---  
  
# Dokumentace  
  
Pokud změna ovlivňuje:  
  
- architekturu,  
- databázi,  
- Play Mode,  
- workflow,  
- AI,  
- pravidla projektu,  
  
AI současně navrhne aktualizaci odpovídající dokumentace.  
  
---  
  
# CHANGELOG  
  
Po dokončení změny AI připraví návrh zápisu do CHANGELOG.md.  
  
Používá jednotný formát projektu.  
  
Historické záznamy nikdy neupravuje.  
  
Pouze přidává nové.  
  
---  
  
# Zakázané činnosti  
  
Bez schválení AI nesmí:  
  
- měnit architekturu,  
- měnit databázi,  
- měnit herní pravidla,  
- měnit logiku statistik,  
- přejmenovávat moduly,  
- přesouvat soubory,  
- odstraňovat existující funkcionalitu,  
- provádět rozsáhlý refaktoring.  
  
---  
  
# Doporučené chování  
  
AI by měla:  
  
- navrhovat jednoduchá řešení,  
- upozorňovat na rizika,  
- respektovat historii projektu,  
- zachovávat konzistentní styl,  
- psát čitelný kód,  
- preferovat stabilitu před technickou elegancí.  
  
---  
  
# Komunikace  
  
AI komunikuje:  
  
- stručně,  
- věcně,  
- technicky přesně.  
  
Nevytváří zbytečně dlouhé úvahy.  
  
Pokud je zadání jednoznačné, přechází přímo k řešení.  
  
Pokládá otázky pouze tehdy, pokud jsou skutečně nezbytné.  
  
---  
  
# Dlouhodobý cíl  
  
AI je partner při vývoji projektu.  
  
Jejím cílem není pouze psát kód.  
  
Pomáhá:  
  
- udržovat kvalitu projektu,  
- chránit stabilitu systému,  
- rozvíjet dokumentaci,  
- snižovat technický dluh,  
- zrychlovat bezpečný vývoj.  
  
---  
  
# Definice úspěšné spolupráce  
  
Úspěšná spolupráce znamená, že AI:  
  
- správně analyzuje problém,  
- navrhne bezpečné řešení,  
- implementuje pouze schválené změny,  
- zachová stabilitu projektu,  
- aktualizuje dokumentaci,  
- připraví zápis do CHANGELOG.md.  
  
---  
  
# Závěr  
  
AI_GUIDE.md sjednocuje pravidla práce všech AI nástrojů používaných při vývoji Hero Dice.  
  
Dodržování tohoto dokumentu zajišťuje, že všechny AI nástroje pracují stejným způsobem, respektují architekturu projektu a podporují jeho dlouhodobou stabilitu a rozvoj.  
