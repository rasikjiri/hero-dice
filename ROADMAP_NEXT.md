ROADMAP_NEXT

**Projekt:** Hero Dice

**Verze projektu:** 4.5

**Typ dokumentu:** Dlouhodobá roadmapa

**Status:** Active

---

# Účel dokumentu

Tento dokument popisuje dlouhodobou roadmapu projektu Hero Dice.

Nejde o technickou specifikaci.

Dokument vymezuje hlavní etapy vývoje, jejich cíle a architektonické priority.

---

# Dlouhodobá vize

Hero Dice je dlouhodobě vyvíjený projekt zaměřený na kvalitní herní zážitek, stabilitu a postupně rozšiřovaný ekosystém funkcí.

Současný vývoj je rozdělen do dvou paralelních větví:

- Hero Dice 4.5,
- Hero Dice Online Platform Foundation.

Tyto větve jsou architektonicky oddělené.

---

# Plánované etapy

## Etapa 1

Dokončení Hero Dice 4.5.

Hlavní cíle:

- stabilizace aktuální verze,
- dokončení schválených úprav,
- bezpečné uzavření vývojové větve 4.5 bez regresí.

---

## Etapa 2

Hero Dice Online Platform Foundation.

Hlavní cíle:

- vytvoření samostatného základu pro budoucí mobilní a online provoz,
- návrh architektonicky oddělené platformní vrstvy,
- příprava dlouhodobě udržitelné integrační strategie.

---

## Etapa 3

Integrace Hero Dice do mobilní platformy.

Hlavní cíle:

- začlenění stávající herní logiky Hero Dice do připraveného platformního základu,
- zachování kompatibility a pravidel hry,
- řízená integrační fáze bez přepisování jádra aplikace.

---

## Etapa 4

Online multiplayer.

Hlavní cíle:

- návrh a zavedení multiplayer vrstvy,
- synchronizace průběhu hry v online režimu,
- zachování stability lokálního režimu.

---

## Etapa 5

AI hráči.

Hlavní cíle:

- rozvoj kvalitních AI soupeřů,
- férové a předvídatelně testovatelné chování,
- postupné ladění obtížnosti bez zásahu do herních pravidel.

---

## Etapa 6

Ligy.

Hlavní cíle:

- rozšíření soutěžního režimu,
- konzistentní pravidla vyhodnocení,
- dlouhodobě udržitelné statistické výstupy.

---

## Etapa 7

Kluby.

Hlavní cíle:

- podpora organizovaných skupin hráčů,
- rozšíření sociální struktury projektu,
- bezpečná správa klubových vazeb.

---

## Etapa 8

Komunitní funkce.

Hlavní cíle:

- podpora širší hráčské komunity,
- nástroje pro dlouhodobé zapojení hráčů,
- udržení jednoduchosti ovládání i při růstu funkcí.

---

# Zásady roadmapy

Platí následující zásady plánování roadmapy:

- roadmapa představuje dlouhodobou strategii projektu,
- jednotlivé etapy nejsou pevně časově závazné,
- etapy mohou probíhat paralelně,
- pořadí etap může být upraveno podle aktuálních priorit projektu,
- každá etapa podléhá architektonickému schválení,
- přesun funkcionality mezi etapami je možný pouze po schválení Hero Dice Architect,
- roadmapa je živý dokument a bude průběžně aktualizována podle vývoje projektu.

Cílem těchto zásad je zachovat maximální flexibilitu budoucího vývoje.

---

# Architektonické priority

Dlouhodobá roadmapa respektuje tyto priority:

1. Stabilita
2. Oddělení architektonických vrstev
3. Zpětná kompatibilita
4. Integrace přes jasně definovaná rozhraní
5. Rozšiřitelnost bez přepisování jádra aplikace

---

# Co není součástí aktuální verze Hero Dice

Do aktuální verze Hero Dice nepatří:

- implementace mobilní aplikace,
- implementace online multiplayeru jako dokončené funkce,
- plná integrace Hero Dice do nové platformy,
- dokončené komunitní a klubové moduly,
- finální podoba ligového ekosystému.

Tyto oblasti jsou součástí navazujících etap roadmapy.

---

# Souvislosti s ostatní dokumentací

Tento dokument navazuje zejména na:

- README.md
- CONSTITUTION.md
- docs/PROJECT_CONTEXT.md
- docs/ARCHITECTURE.md
- docs/DEVELOPMENT_WORKFLOW.md

---

# Závěr

ROADMAP_NEXT.md slouží jako strategický rámec dalšího vývoje projektu Hero Dice.

Dokument vymezuje dlouhodobé směřování projektu při zachování stability aktuální verze a architektonické samostatnosti Online Platform Foundation.
