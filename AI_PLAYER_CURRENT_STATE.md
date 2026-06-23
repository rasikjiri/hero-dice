# Hero Dice v3.3
## AI Player - Current State

### Co funguje
- automaticke stridani hracu
- computer auto-roll
- AI vybira kostky
- ukladani skore
- scoreboard
- offline rezim
- bez dopadu na league/statistiky

### Aktualni problem
Computer AI muze behem tahu zvolit nevhodnou strategii zamceni kostek.
V nekterych pripadech se nasledne dostane do stavu, kdy jiz nedokaze svuj tah korektne dokoncit, prestoze zbyvaji hody.

### Co bylo vyzkouseno
- pridani fallbacku do auto-roll
- manipulace s lockedDice
- manipulace s hasRolledDice

Vysledek:
vedlo k regresi,
computer prestal pokracovat jiz po prvnim hodu,
zmeny byly rollbacknuty.

### Architektonicke poznatky
- auto-roll je hlavni orchestrator computer tahu
- AI decision pouze rozhoduje o lockedDice
- scoring musi zustat oddeleny
- human flow nesmi byt ovlivnen
- online rezim nesmi byt ovlivnen

### Otevreny problem pro dalsi vlakno
Jak navrhnout AI decision tak, aby computer mohl zmenit strategii nebo nevybrat zadnou kostku, aniz by se narusil auto-roll flow.
