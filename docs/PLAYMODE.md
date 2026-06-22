PLAYMODE  
  
**Projekt:** Hero Dice  
  
**Verze projektu:** 3.1  
  
**Typ dokumentu:** Herní systém – Play Mode  
  
**Status:** Active  
  
---  
  
# Účel dokumentu  
  
Tento dokument popisuje kompletní fungování systému Play Mode v projektu Hero Dice.  
  
Je určen jako referenční dokument pro:  
  
- vývojáře,  
- AI agenty,  
- budoucí rozšiřování projektu.  
  
Obsahuje pouze pravidla a logiku Play Mode.  
  
Technická implementace je popsána v ARCHITECTURE.md.  
  
---  
  
# Co je Play Mode  
  
Play Mode představuje hlavní herní systém Hero Dice.  
  
Řídí celý průběh hry od prvního hodu až po dokončení poslední kombinace.  
  
Play Mode zajišťuje:  
  
- průběh jednotlivých tahů,  
- házení kostkami,  
- zamykání kostek,  
- detekci kombinací,  
- zapisování skóre,  
- správu bonusů,  
- střídání hráčů,  
- dokončení hry.  
  
---  
  
# Zahájení hry  
  
Každá nová hra začíná obrazovkou **Play Mode Setup**.  
  
Před spuštěním hry se nastavuje:  
  
- počet hodů,  
- přepisování skóre,  
- typ bonusu,  
- počet bonusových hodů.  
  
Po potvrzení konfigurace je vytvořena nová hra.  
  
---  
  
# Typy her  
  
Hero Dice rozlišuje tři herní režimy.

## Ligová hra

Ligová hra používá oficiální konfiguraci.

Výsledky jsou ukládány do tabulky **games**.

Používají se pro:

- statistiky,
- historii,
- leaderboard.

---

## Fun hra

Každá konfigurace odlišná od ligových pravidel je považována za Fun hru.

Výsledky jsou ukládány výhradně do tabulky **fun_games**.

Fun hry nikdy neovlivňují ligové statistiky.

---

## Hra s počítačem

Je-li mezi vybranými hráči alespoň jeden počítač, hra se automaticky stává hrou s počítačem.

Charakteristika hry s počítačem:

- režim je vždy **offline**,
- bonusová mechanika je **vypnutá**,
- Play Mode nastavení je **zjednodušeno** pouze na relevantní volby,
- AI hráč používá **reálné hody kostkami**,
- výsledky jsou ukládány jako **Fun hra**.

AI hráč v současné verzi:

- nevybírá kostky,
- nepoužívá bonus,
- nepoužívá pokročilou strategii.

Funkci AI lze v budoucích verzích rozšiřovat bez ovlivnění klasických her.
  
# Průběh tahu  
  
Tah hráče se skládá z několika kroků.  
  
1. Začátek tahu  
2. První hod  
3. Výběr kostek  
4. Další hod  
5. Vyhodnocení kombinace  
6. Zápis skóre nebo ukončení tahu  
7. Předání tahu dalšímu hráči  
  
---  
  
# Kostky  
  
Každý hod používá šest kostek.  
  
Kostky lze mezi jednotlivými hody zamykat.  
  
Zamčené kostky se při dalším hodu nepřehazují.  
  
Nezamčené kostky se přegenerují.  
  
---  
  
# Animace hodu  
  
Play Mode obsahuje animovaný hod kostkami.  
  
Během animace:  
  
- nelze měnit výběr kostek,  
- nezobrazuje se průběžná kombinace,  
- zamčené kostky zůstávají zachovány.  
  
Po dokončení animace je provedeno finální vyhodnocení hodu.  
  
---  
  
# Detekce kombinace  
  
Po každém dokončeném hodu je provedena detekce nejlepší kombinace.  
  
Vyhodnocení respektuje:  
  
- aktuální hodnoty kostek,  
- zamčené kostky,  
- nastavení hry.  
  
Detekovaná kombinace je zobrazena hráči.  
  
---  
  
# Aktuální kombinace  
  
Horní panel Play Mode vždy zobrazuje:  
  
- aktuálního hráče,  
- typ hry,  
- aktuální kombinaci.  
  
Pokud není nalezena žádná kombinace, zobrazí se odpovídající informace.  
  
---  
  
# Hody  
  
Počet hodů je nastavitelný.  
  
Konfigurace je součástí Play Mode Setup.  
  
Ligová hra používá standardní počet hodů.  
  
Fun hra umožňuje vlastní nastavení.  
  
---  
  
# Přepisování skóre  
  
Play Mode může pracovat ve dvou režimech.  
  
## Bez přepisování  
  
Jednou zapsaná kombinace již nemůže být změněna.  
  
---  
  
## S přepisováním  
  
Zapsaná kombinace může být přepsána pouze vyšším výsledkem.  
  
Stejné nebo nižší skóre není možné zapsat.  
  
---  
  
# Bonus  
  
Play Mode podporuje bonusový systém.  
  
Aktivace bonusu závisí na konfiguraci hry.  
  
**Poznámka:** V hře s počítačem je bonus systém vypnutý. Tlačítko Bonus je deaktivováno a nedostupné pro všechny hráče, včetně lidských.

Bez počítače:

- přepisování skóre.  
  
---  
  
# Bonus Generál  
  
Bonus Generál představuje speciální bonusový režim.  
  
Jeho chování závisí na typu hry.  
  
## Ligová hra  
  
Po zapsání maximálního Generála již bonus není dostupný.  
  
## Fun hra  
  
Bonus respektuje:  
  
- aktuálně zapsané skóre,  
- možnost jeho překonání,  
- nastavení přepisování.  
  
Bonus se aktivuje pouze tehdy, pokud může hráč skutečně získat lepší výsledek.  
  
---  
  
# Indikátory  
  
Play Mode obsahuje několik pomocných indikátorů.  
  
Například:  
  
- typ hry,  
- aktuální kombinace,  
- počet zbývajících hodů,  
- možnost budoucí kombinace,  
- bonus.  
  
Tyto indikátory slouží pouze jako pomoc hráči.  
  
Nemění pravidla hry.  
  
---  
  
# Zápis skóre  
  
Po nalezení kombinace může hráč:  
  
- zapsat výsledek,  
- přeskočit zápis (pokud to pravidla umožňují),  
- ukončit tah.  
  
Po zápisu je automaticky ukončen tah.  
  
---  
  
# Scoreboard  
  
Scoreboard zobrazuje:  
  
- všechny hráče,  
- všechny kategorie,  
- průběžné skóre,  
- maximální výsledky,  
- vítěze.  
  
Play Mode se Scoreboardem úzce spolupracuje.  
  
---  
  
# Uložení hry  
  
Rozehranou hru lze kdykoliv uložit.  
  
Ukládá se:  
  
- skóre,  
- pořadí hráčů,  
- konfigurace Play Mode,  
- průběh hry,  
- aktivní hráč,  
- stav Play Mode.  
  
Po načtení pokračuje hra přesně od místa uložení.  

---

# Online Resume Flow

```text
saved_game
	↓
onlineSessionId
	↓
ověření remote session
	↓
načtení remote game_state
	↓
subscribeToSession()
	↓
Lobby Sync
	↓
Claim
	↓
Ready
	↓
Start Game
```
  
---  
  
# Dokončení hry  
  
Hra končí po zapsání všech kategorií.  
  
Po dokončení proběhne:  
  
- určení vítěze,  
- uložení výsledku,  
- aktualizace statistik,  
- Winner Celebration.  
  
---  
  
# Winner Celebration  
  
Součástí Play Mode je systém oslav vítěze.  
  
Obsahuje:  
  
- Winner Modal,  
- náhodné zvuky,  
- confetti,  
- opakovatelnou oslavu kliknutím na pohár.  
  
Jedná se pouze o prezentační vrstvu.  
  
Nemění výsledky hry.  
  
---  
  
# Zvuky  
  
Play Mode obsahuje několik zvukových efektů.  
  
Například:  
  
- vítěz,  
- maximální skóre,  
- není kombinace.  
  
Jednotlivé zvuky lze zapnout nebo vypnout v nastavení.  
  
---  
  
# Nastavení  
  
Play Mode respektuje uživatelské nastavení.  
  
Například:  
  
- zvuky,  
- bonusy,  
- počet hodů,  
- přepisování.  
  
Nastavení se ukládá mezi spuštěními aplikace.  
  
---  
  
# Statistiky  
  
Po dokončení hry jsou automaticky aktualizovány statistiky.  
  
Typ hry určuje, zda budou data uložena do:  
  
- games,  
- nebo fun_games.  
  
Statistiky jsou od herní logiky odděleny.  
  
---  
  
# Bezpečnost  
  
Play Mode je navržen tak, aby:  
  
- nedocházelo ke ztrátě dat,  
- nebylo možné zapsat neplatné skóre,  
- nebylo možné porušit pravidla hry.  
  
---  
  
# Budoucí rozšíření  
  
Architektura Play Mode počítá s budoucím rozšířením.  
  
Například:  
  
- Online Mode,  
- hra proti AI,  
- nové bonusové režimy,  
- nové typy her,  
- rozšířené statistiky.  
  
Nové funkce musí zachovat zpětnou kompatibilitu.  
  
---  
  
# Zásady vývoje  
  
Při úpravách Play Mode platí:  
  
- minimální zásahy,  
- žádný refaktoring bez schválení,  
- zachování herních pravidel,  
- zachování kompatibility uložených her,  
- zachování kompatibility statistik.  
  
---  
  
# Souvislosti s ostatní dokumentací  
  
Tento dokument popisuje pouze Play Mode.  
  
Navazující dokumenty:  
  
- CONSTITUTION.md  
- PROJECT_CONTEXT.md  
- ARCHITECTURE.md  
- DATABASE.md  
- KNOWN_RULES.md  
- DEVELOPMENT_WORKFLOW.md  
- AI_GUIDE.md  
- CHANGELOG.md  
  
---  
  
# Závěr  
  
Play Mode je hlavním herním subsystémem Hero Dice.  
  
Je navržen jako stabilní, rozšiřitelný a dlouhodobě udržitelný systém.  
  
Veškeré budoucí změny musí zachovat kompatibilitu s existujícími pravidly hry, uloženými hrami a statistikami.  
