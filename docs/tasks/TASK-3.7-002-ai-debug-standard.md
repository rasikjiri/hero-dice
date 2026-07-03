# TASK BRIEF 02 - Hero Dice v3.7
## Standard pro dalsi AI debug tasky

### CIL
Zavest pracovni standard pro dalsi opravy AI hrace tak, aby kazda zmena byla:
- mala,
- meritelna,
- overitelna pres existujici audit logy.

Tento standard je zavazny pro vsechny dalsi AI debug tasky ve stabilizacni fazi v3.7.

### ZASADY
1. Nemenit soucasne vice vrstev AI.
2. Kazdy task musi predem urcit, kterou vrstvu meni:
   - controller/orchestration,
   - save-first guard,
   - makeAIDecision strategie,
   - lock validace,
   - roll/save execution.
3. Kazdy task musi obsahovat konkretni bug scenar.
4. Kazdy task musi predem definovat ocekavanou zmenu v:
   - heroDiceTempAiTurnAudit,
   - heroDiceTempAiDecisionAudit.
5. Bez audit dukazu se zmena nepovazuje za overenou.

### POVINNY FORMAT BUDOUCIHO BUG ZADANI
Kazde zadani musi obsahovat vsechny body nize:

1. Popis viditelneho chovani.
2. Aktualni hrac / faze tahu.
3. Kostky pred rozhodnutim AI.
4. Co AI udelala.
5. Co mela udelat.
6. Relevantni vypis z Turn Audit.
7. Relevantni vypis z Decision Audit.
8. Urceni vrstvy, kde se bug pravdepodobne nachazi.
9. Navrh minimalni opravy.
10. Pass/fail kriteria.

### POVINNY WORKFLOW PRO KAZDY AI DEBUG TASK
1. Lock scope na jednu vrstvu.
2. Zapsat baseline bug scenar (pred opravou).
3. Uvest ocekavane audit eventy/reasons po oprave.
4. Udelat minimalni zmenu v kodu.
5. Overit zmenu na stejnem scenari.
6. Dolozit pred/po rozdil v obou auditech.
7. Potvrdit, ze nebyly meneny dalsi vrstvy.

### ZAKAZANE ZASAHY BEHEM STABILIZACE
- Refactoring AI flow.
- Prepis strategie AI.
- Zmeny timeout sequencing.
- Soucasne zmeny v controlleru i aiPlayer bez vyslovneho duvodu.
- Odstraneni debug/temp logu behem stabilizace.

### POVINNY VYSTUP AI AGENTA U KAZDEHO DALSICHO TASKU
1. Upravene soubory.
2. Presna rozhodovaci vetev, ktera byla zmenena.
3. Pred/po vysvetleni podle audit logu.
4. Potvrzeni, ze nebyly meneny jine vrstvy.

### MINIMALNI SABLONA (COPY/PASTE)
Pouzij tento blok pri kazdem novem AI bug tasku:

```
AI BUG TASK - v3.7 Stabilizace

1) Viditelne chovani:

2) Aktualni hrac / faze tahu:

3) Kostky pred rozhodnutim AI:

4) Co AI udelala:

5) Co mela udelat:

6) Turn Audit (relevantni vypis):

7) Decision Audit (relevantni vypis):

8) Pravdepodobna vrstva bugu (vyber 1):
- controller/orchestration
- save-first guard
- makeAIDecision strategie
- lock validace
- roll/save execution

9) Navrh minimalni opravy:

10) Ocekavana zmena v auditu po oprave:
- heroDiceTempAiTurnAudit:
- heroDiceTempAiDecisionAudit:

11) Pass/fail kriteria:
- PASS:
- FAIL:
```
