DATABASE  
  
**Projekt:** Hero Dice  
  
**Verze projektu:** 2.6  
  
**Typ dokumentu:** Databázová dokumentace  
  
**Status:** Active  
  
---  
  
# Účel dokumentu  
  
Tento dokument popisuje databázovou vrstvu projektu Hero Dice.  
  
Obsahuje přehled databázových tabulek, jejich účel, vzájemné vazby a pravidla pro práci s daty.  
  
Neobsahuje implementaci databázových dotazů ani logiku aplikace.  
  
---  
  
# Databázová platforma  
  
Hero Dice využívá databázi **Supabase (PostgreSQL)**.  
  
Veškerá komunikace s databází probíhá prostřednictvím modulu:  
  
```text  
app/lib/supabase.ts  
```  
  
Aplikační komponenty nikdy nekomunikují s databází přímo.  
  
---  
  
# Filozofie databáze  
  
Databáze Hero Dice je navržena podle následujících principů:  
  
- jednoduchá struktura,  
- minimální duplicita dat,  
- dlouhodobá rozšiřitelnost,  
- zpětná kompatibilita,  
- oddělení ligových a Fun her,  
- bezpečné ukládání rozehraných her.  
  
---  
  
# Přehled databázových tabulek  
  
Projekt využívá následující hlavní tabulky.  
  
## players  
  
Obsahuje seznam všech hráčů.  
  
U každého hráče jsou ukládány informace potřebné pro hru a statistiky.  
  
Použití:  
  
- výběr hráčů  
- administrace hráčů  
- statistiky  
- historie her  
  
---  
  
## games  
  
Obsahuje výsledky dokončených ligových her.  
  
Do této tabulky se ukládají pouze hry odpovídající ligovým pravidlům.  
  
Slouží jako zdroj dat pro:  
  
- statistiky  
- historii ligových her  
- leaderboard  
  
---  
  
## fun_games  
  
Obsahuje výsledky dokončených Fun her.  
  
Fun hry jsou od ligových statistik zcela odděleny.  
  
Tabulka slouží pro:  
  
- statistiky Fun her  
- historii Fun her  
- analýzu konfigurací Play Mode  
  
---  
  
## saved_games  
  
Obsahuje rozehrané hry.  
  
Ukládá:  
  
- aktuální scoreboard,  
- pořadí hráčů,  
- průběh hry,  
- konfiguraci Play Mode,  
- stav rozehrané hry,  
- metadata režimu hry (`game_mode`) a volitelně `online_session_id` pro odlišení offline a online save.  
  
Po načtení uložené hry je aplikace schopna pokračovat přesně od okamžiku uložení.  
  
---  
  
# Oddělení dat  
  
Projekt důsledně odděluje:  
  
- ligové hry,  
- Fun hry,  
- rozehrané hry.  
  
Jednotlivé tabulky se vzájemně nemíchají.  
  
To umožňuje:  
  
- přesnější statistiky,  
- jednodušší rozšíření systému,  
- bezpečnější vývoj.  
  
---  
  
# Play Mode konfigurace  
  
Součástí ukládání rozehrané hry je také konfigurace Play Mode.  
  
Ukládají se například:  
  
- aktivní Play Mode,  
- počet hodů,  
- přepisování skóre,  
- bonusový režim,  
- bonusové hody.  
  
Po obnovení hry je konfigurace obnovena automaticky.  
  
---  
  
# Historie her  
  
Dokončené hry jsou ukládány odděleně od rozehraných.  
  
Výsledky již dokončených her se nikdy neupravují.  
  
Každá hra představuje samostatný historický záznam.  
  
---  
  
# Integrita dat  
  
Při práci s databází platí následující pravidla:  
  
- neukládat duplicitní data,  
- neodstraňovat historické výsledky,  
- zachovávat konzistenci mezi tabulkami,  
- používat jednoznačné identifikátory.  
  
---  
  
# Mazání dat  
  
Mazání dat je omezeno pouze na případy, kdy je to nezbytné.  
  
Například:  
  
- odstranění uložené rozehrané hry,  
- přepsání starší verze rozehrané hry.  
  
Výsledky dokončených her se standardně nemažou.  
  
---  
  
# Statistiky  
  
Veškeré statistiky jsou počítány z databázových dat.  
  
Výpočty statistik nikdy nemění uložená data.  
  
Statistiky představují pouze analytickou vrstvu.  
  
---  
  
# Budoucí rozšíření  
  
Architektura databáze je připravena na další rozvoj.  
  
Předpokládané oblasti rozšíření:  
  
- Online Mode  
- rozšířené statistiky  
- nové herní režimy  
- detailnější historie her  
- analytické přehledy  
  
Nové funkce by měly pokud možno využívat existující databázovou strukturu.  
  
---  
  
# Bezpečnost  
  
Přístup k databázi je řízen prostřednictvím Supabase.  
  
Databázová pravidla (RLS) určují oprávnění jednotlivých operací.  
  
Klientská aplikace nesmí tato pravidla obcházet.  
  
---  
  
# Zásady změn databáze  
  
Jakákoliv změna databázové struktury musí splňovat následující podmínky:  
  
- musí být zdůvodněná,  
- musí být zpětně kompatibilní,  
- nesmí poškodit existující data,  
- musí být zaznamenána v CHANGELOG.md,  
- musí být promítnuta do této dokumentace.  
  
---  
  
# Souvislosti s ostatní dokumentací  
  
Tento dokument popisuje pouze databázovou vrstvu projektu.  
  
Navazující dokumenty:  
  
- PROJECT_CONTEXT.md  
- ARCHITECTURE.md  
- PLAYMODE.md  
- KNOWN_RULES.md  
- DEVELOPMENT_WORKFLOW.md  
- AI_GUIDE.md  
  
---  
  
# Závěr  
  
Databázová vrstva Hero Dice je navržena jako stabilní základ projektu.  
  
Její hlavními cíli jsou:  
  
- bezpečné ukládání dat,  
- správné oddělení jednotlivých typů her,  
- dlouhodobá rozšiřitelnost,  
- zachování integrity dat,  
- podpora budoucího vývoje bez narušení stávající funkčnosti.  
