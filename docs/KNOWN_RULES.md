KNOWN_RULES  
  
**Projekt:** Hero Dice  
  
**Verze projektu:** 2.6  
  
**Typ dokumentu:** Závazná pravidla vývoje  
  
**Status:** Active  
  
---  
  
# Účel dokumentu  
  
Tento dokument obsahuje závazná pravidla, která musí být dodržována při vývoji projektu Hero Dice.  
  
Neobsahuje architekturu, databázi ani pravidla hry.  
  
Jeho cílem je zajistit jednotný způsob vývoje, minimalizovat riziko regresí a zachovat dlouhodobou stabilitu projektu.  
  
---  
  
# Základní pravidlo  
  
Stabilita projektu má vždy nejvyšší prioritu.  
  
Každá změna musí být navržena tak, aby zachovala stávající funkčnost.  
  
---  
  
# Priority projektu  
  
Veškerý vývoj se řídí následujícím pořadím priorit:  
  
1. Stabilita  
2. Uživatelská přívětivost (UX)  
3. Správnost dat a statistik  
4. Nové funkce  
5. Architektonická čistota  
  
---  
  
# Minimální zásah  
  
Každá změna řeší pouze schválený problém.  
  
Bez:  
  
- nevyžádaného refaktoringu,  
- kosmetických změn nesouvisejících se zadáním,  
- přejmenovávání funkcí bez důvodu,  
- přesunů logiky bez schválení.  
  
---  
  
# Analýza před implementací  
  
Každá změna začíná analýzou.  
  
Před implementací je nutné určit:  
  
- které soubory budou změněny,  
- jaké části systému budou ovlivněny,  
- možné riziko změny.  
  
---  
  
# Návrh řešení  
  
Po analýze následuje návrh řešení.  
  
Pokud existuje více možností, preferuje se řešení s nejnižším rizikem.  
  
---  
  
# Implementace  
  
Implementace musí být:  
  
- co nejmenší,  
- přehledná,  
- snadno dohledatelná,  
- zpětně kompatibilní.  
  
Řeší pouze schválené zadání.  
  
---  
  
# Refaktoring  
  
Refaktoring není běžnou součástí vývoje.  
  
Je povolen pouze pokud:  
  
- byl výslovně požadován,  
- řeší konkrétní problém,  
- nebo je nezbytnou součástí schválené změny.  
  
---  
  
# page.tsx  
  
Soubor page.tsx je hlavním orchestrátorem aplikace.  
  
Při jeho úpravách platí:  
  
- neměnit logiku bez schválení,  
- zachovávat přehlednou strukturu,  
- používat logické sekce,  
- zachovávat orientační komentáře,  
- minimalizovat rozsah změn.  
  
---  
  
# Databáze  
  
Nikdy nevytvářet:  
  
- nové tabulky,  
- nové sloupce,  
- nové vazby,  
  
bez předchozího schválení.  
  
Každá změna databáze musí být zdokumentována.  
  
---  
  
# Statistiky  
  
Při úpravách statistik platí:  
  
- neměnit historická data,  
- zachovat kompatibilitu výpočtů,  
- oddělovat ligové a Fun statistiky,  
- neměnit logiku ukládání výsledků bez schválení.  
  
---  
  
# Play Mode  
  
Při úpravách Play Mode platí:  
  
- zachovat herní pravidla,  
- zachovat kompatibilitu uložených her,  
- zachovat kompatibilitu statistik,  
- zachovat kompatibilitu konfigurací.  
  
---  
  
# Uložené hry  
  
Každá změna musí respektovat:  
  
- načítání rozehraných her,  
- ukládání konfigurace Play Mode,  
- zpětnou kompatibilitu starších uložených her.  

---

# Online Resume

- saved_games nejsou Source of Truth pro aktivní online hru.
- Source of Truth je vždy online session + game_state.
- Načtení uložené online hry musí vždy obnovit realtime synchronizaci.
- Resume online hry nesmí fungovat pouze z lokálního snapshotu.
  
---  
  
# Dokumentace  
  
Každá změna ovlivňující:  
  
- architekturu,  
- databázi,  
- Play Mode,  
- workflow,  
- AI,  
  
musí být promítnuta do odpovídající dokumentace.  
  
---  
  
# CHANGELOG  
  
Každé dokončené vlákno končí zápisem do:  
  
CHANGELOG.md  
  
Používá se jednotný formát:  
  
- Verze  
- Datum  
- Riziko  
- Změněné soubory  
- Popis  
- Důvod  
- Dopad  
- Poznámky  
  
Historie se nikdy nepřepisuje.  
  
Pouze se přidávají nové záznamy.  
  
---  
  
# Zakázané činnosti  
  
Bez výslovného schválení není dovoleno:  
  
- refaktorovat projekt,  
- měnit databázovou strukturu,  
- měnit pravidla hry,  
- měnit logiku statistik,  
- měnit logiku ukládání her,  
- přejmenovávat soubory,  
- přesouvat moduly,  
- odstraňovat existující funkcionalitu.  
  
---  
  
# Povolené činnosti  
  
Bez dalšího schválení lze:  
  
- opravovat chyby,  
- zlepšovat UX,  
- opravovat překlepy,  
- doplňovat dokumentaci,  
- optimalizovat kód v rámci schválené změny.  
  
---  
  
# Definice úspěšné změny  
  
Úspěšná změna splňuje všechny následující podmínky:  
  
- zachová funkčnost,  
- neobsahuje regresi,  
- řeší pouze schválený problém,  
- má minimální rozsah,  
- je přehledná,  
- je zdokumentovaná,  
- je zapsána v CHANGELOG.md.  
  
---  
  
# Souvislosti s ostatní dokumentací  
  
Tento dokument doplňuje:  
  
- CONSTITUTION.md  
- ARCHITECTURE.md  
- DATABASE.md  
- PLAYMODE.md  
- DEVELOPMENT_WORKFLOW.md  
- AI_GUIDE.md  
  
V případě rozporu má vždy přednost:  
  
1. CONSTITUTION.md  
2. Zdrojový kód  
3. Ostatní dokumentace  
  
---  
  
# Závěr  
  
KNOWN_RULES.md představuje soubor závazných pravidel vývoje projektu Hero Dice.  
  
Jeho cílem je zajistit dlouhodobou stabilitu, jednotný způsob práce a minimalizaci rizik při dalším rozvoji projektu.  
