# Hero Dice v3.3
## AI Player - Current State

### Stav verze
Verze 3.3 je uzavrena.
Vyvojove vlakno bylo zamereno vyhradne na stabilizaci rozhodovaci logiky AI pri vyberu kostek.

### Co je hotovo ve v3.3
- zavedena fazova AI politika podle zaplneni vlastniho scoreboardu
- sjednocena evaluace kandidatu a jejich uzamceni
- zprisnena validace strategickych kandidatu
- pridana podpora rozpracovane postupky
- rozsiren handling partial combinations
- upraven fallback: AI radeji no-change nez strategicky spatny lock
- zachovana flexibilita v pozdni fazi hry (General a podobne cile)
- vyrazne snizeny situace bez akce a vetsina zaseku auto-rozhodovani

### Vysledek
AI je ve verzi 3.3 vyrazne stabilnejsi a hratelnejsi nez ve verzi 3.2.

### Known Issues presunute do v3.4
1. Bias ke kombinaci 1 + 5
AI ma stale tendenci preferovat locky obsahujici hodnotu 1 (casto 1 + 5), i kdyz muze existovat strategicky vyhodnejsi varianta.

2. Nedostatecne zohledneni pravdepodobnosti budouciho vyvoje
AI nekdy preferuje okamzitou cestu k cilove kombinaci (napr. smer k Pyramide) pred pokracovanim ve sbiru vysoke hodnoty, i kdyz ta muze mit vyssi pravdepodobnost a potencial.

### Poznamka pro dalsi iteraci
Verze 3.4 se ma zamerit na odstraneni biasu a na hlubsi pravdepodobnostni vrstvu rozhodovani (value-aware expected outcome model).
