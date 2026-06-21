CONSTITUTION  
  
# Hero Dice Constitution  
  
> Ústava projektu Hero Dice  
  
---  
  
# Účel dokumentu  
  
Tento dokument definuje základní principy, pravidla a způsob vývoje projektu Hero Dice.  
  
Je nejvyšším dokumentem projektu a je závazný pro:  
  
- vlastníka projektu,  
- všechny vývojáře,  
- všechny AI agenty,  
- všechny budoucí přispěvatele.  
  
Ústava neurčuje implementační detaily jednotlivých funkcí.  
  
Jejím cílem je zajistit dlouhodobou stabilitu, konzistenci a udržitelnost projektu.  
  
---  
  
# Filozofie Hero Dice  
  
Hero Dice je dlouhodobě vyvíjený projekt.  
  
Cílem projektu není co nejrychlejší vývoj nových funkcí.  
  
Cílem projektu je vytvořit stabilní, přehlednou a dlouhodobě udržitelnou aplikaci.  
  
Každé rozhodnutí musí respektovat následující priority.  
  
1. Stabilita  
2. Uživatelská přívětivost (UX)  
3. Správnost dat a statistik  
4. Nové funkce  
5. Architektonická čistota  
  
Pokud existuje více možných řešení, vždy se volí řešení s nejnižším rizikem.  
  
Technická elegance nikdy nesmí mít vyšší prioritu než stabilita projektu.  
  
---  
  
# Zdroje pravdy  
  
Projekt používá následující pořadí zdrojů pravdy.  
  
## 1. Zdrojový kód  
  
Nejvyšší autoritou je vždy aktuální implementace projektu.  
  
Pokud je dokumentace v rozporu se zdrojovým kódem, považuje se za správný zdrojový kód.  
  
Dokumentace musí být následně aktualizována.  
  
## 2. Projektová dokumentace  
  
Projektová dokumentace popisuje architekturu, databázi, herní pravidla a způsob vývoje.  
  
Musí odpovídat aktuální implementaci.  
  
## 3. Historie změn  
  
Historie změn slouží jako přehled vývoje projektu.  
  
Nenahrazuje dokumentaci ani zdrojový kód.  
  
---  
  
# Vývojový postup  
  
Každá změna projektu probíhá podle následujícího postupu.  
  
1. Analýza  
2. Návrh řešení  
3. Schválení  
4. Implementace  
5. Otestování  
6. Aktualizace dokumentace  
  
Žádný krok nesmí být přeskočen.  
  
---  
  
# Základní pravidla vývoje  
  
Každá změna musí být:  
  
- odůvodněná,  
- minimální,  
- bezpečná,  
- snadno pochopitelná,  
- dlouhodobě udržitelná.  
  
Každá implementace řeší pouze schválený problém.  
  
Neprovádí nevyžádané změny okolního kódu.  
  
---  
  
# Refaktoring  
  
Refaktoring není cílem projektu.  
  
Refaktoring je povolen pouze pokud:  
  
- byl výslovně schválen,  
- řeší konkrétní problém,  
- je nezbytnou součástí schválené změny.  
  
Refaktoring nesmí měnit chování aplikace.  
  
---  
  
# Pravidla práce se zdrojovým kódem  
  
Při práci se zdrojovým kódem platí následující pravidla.  
  
- Neměnit funkční logiku bez schválení.  
- Neměnit názvy funkcí bez důvodu.  
- Neměnit názvy proměnných bez důvodu.  
- Nevytvářet nové struktury pouze z důvodu architektonické čistoty.  
- Zachovávat minimální rozsah změn.  
- Každá změna musí být snadno dohledatelná.  
  
---  
  
# page.tsx  
  
Soubor `page.tsx` je hlavním orchestrátorem projektu.  
  
Platí pro něj zvláštní pravidla.  
  
- Každá změna musí být minimální.  
- Organizace kódu má přednost před refaktoringem.  
- Zachovávat logické sekce.  
- Zachovávat orientační značky.  
- Neprovádět přesuny logiky bez schválení.  
  
---  
  
# Dokumentace  
  
Projektová dokumentace je součástí projektu.  
  
Nejde o volitelnou přílohu.  
  
Každá změna architektury, databáze, herních pravidel nebo vývojového postupu musí být promítnuta do dokumentace.  
  
Dokumentace musí odpovídat aktuální verzi projektu.  
  
---  
  
# AI  
  
AI agenti jsou pomocníci při vývoji.  
  
Nenahrazují rozhodnutí vlastníka projektu.  
  
AI agent:  
  
- nejprve analyzuje,  
- poté navrhne řešení,  
- čeká na schválení,  
- teprve následně implementuje.  
  
AI nesmí vytvářet vlastní domněnky.  
  
Pokud není možné jednoznačně určit správné řešení, AI požádá o rozhodnutí vlastníka projektu.  
  
---  
  
# Definice úspěšné změny  
  
Úspěšná změna splňuje všechny následující podmínky.  
  
- Zachovává funkčnost projektu.  
- Nezpůsobuje regresi.  
- Má minimální rozsah.  
- Je srozumitelná.  
- Je zdokumentovaná.  
- Je otestovaná.  
  
Teprve poté je změna považována za dokončenou.  
  
---  
  
# Závěrečné ustanovení  
  
Tato ústava je nejvyšším dokumentem projektu Hero Dice.  
  
Všechna budoucí rozhodnutí, implementace a dokumentace musí být v souladu s tímto dokumentem.  
  
Pokud vznikne rozpor mezi navrhovaným řešením a touto ústavou, přednost má vždy tato ústava.  
