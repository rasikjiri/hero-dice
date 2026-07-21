PLATFORM_ARCHITECTURE

**Projekt:** Hero Dice

**Verze projektu:** 4.5

**Typ dokumentu:** Platformová architektura (dlouhodobý rámec)

**Status:** Active

---

# Účel dokumentu

Tento dokument vymezuje dlouhodobý architektonický rámec budoucí online a mobilní platformy Hero Dice.

Dokument popisuje pouze platformovou vrstvu.

Herní pravidla, herní logika a pravidla Play Mode jsou popsány v ostatní projektové dokumentaci.

Nejde o technickou specifikaci implementace.

---

# Cíle platformy

Dlouhodobé cíle platformy jsou:

- podpora mobilní aplikace,
- vytvoření stabilní online infrastruktury,
- multiplatformní použitelnost,
- škálovatelnost při růstu počtu uživatelů a služeb,
- bezpečnost platformních služeb,
- jednoduchá rozšiřitelnost bez narušení stávajícího jádra Hero Dice.

---

# Architektonické principy

Platforma je navržena podle následujících principů:

- důsledné oddělení platformy od herní logiky,
- modulární architektura s jasně vymezenými odpovědnostmi,
- API-first přístup pro komunikaci mezi vrstvami,
- backend jako samostatná platformní vrstva,
- možnost budoucího rozšíření bez zásahu do jádra Hero Dice.

---

# Hlavní části platformy

Plánované oblasti platformy zahrnují zejména:

- autentizaci uživatelů,
- správu profilů,
- lobby,
- online místnosti,
- multiplayer služby,
- synchronizaci her,
- realtime komunikaci,
- cloudová úložiště,
- notifikace,
- administraci platformy.

Tento přehled je záměrně koncepční a neobsahuje implementační detaily.

---

# Integrace Hero Dice

Pro integraci se platformou platí:

- Hero Dice je referenční implementací platformy, nikoli platformou samotnou,
- Hero Dice zůstává samostatným herním jádrem,
- platforma poskytuje pouze platformní služby,
- komunikace probíhá přes jasně definovaná rozhraní,
- platforma neobsahuje vlastní herní pravidla.

Stejná platforma je do budoucna otevřená i pro další aplikace nebo hry bez vazby na Hero Dice.

Integrace nesmí měnit základní herní logiku Hero Dice bez samostatného architektonického schválení.

---

# Budoucí rozšiřitelnost

Možné směry dalšího rozvoje zahrnují například:

- AI hráče,
- ligy,
- kluby,
- turnaje,
- statistiky,
- cloudové ukládání,
- synchronizaci mezi zařízeními,
- další mobilní platformy.

Nejde o závazný seznam.

---

# Omezení dokumentu

Tento dokument:

- nenavrhuje databázové schéma,
- nenavrhuje konkrétní API,
- neobsahuje implementační detaily,
- nemění architekturu stávajícího Hero Dice,
- nemění herní pravidla.

Slouží jako dlouhodobý architektonický rámec pro budoucí platformu.

---

# Souvislosti s ostatní dokumentací

Tento dokument navazuje zejména na:

- README.md
- CONSTITUTION.md
- docs/PROJECT_CONTEXT.md
- docs/ARCHITECTURE.md
- ROADMAP_NEXT.md

---

# Závěr

PLATFORM_ARCHITECTURE.md stanovuje směr platformové vrstvy pro budoucí online a mobilní rozvoj projektu Hero Dice.

Dokument chrání oddělení platformy od herní logiky a podporuje dlouhodobě stabilní rozšiřování projektu.
