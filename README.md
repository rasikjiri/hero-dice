README  
  
**Projekt:** Hero Dice  
  
**Verze projektu:** 3.1  
  
**Typ dokumentu:** Vstupní dokumentace  
  
**Status:** Active  
  
---  
  
# Hero Dice  
  
Hero Dice je dlouhodobě vyvíjená webová aplikace pro hraní, zapisování a vyhodnocování vlastní varianty hry Generál.  
  
Projekt vznikl jako rodinná aplikace a je vyvíjen s důrazem na jednoduchost, stabilitu a dlouhodobou udržitelnost.  
  
Hero Dice není komerční produkt ani demonstrační aplikace.  
  
Veškerý vývoj je podřízen zachování funkčnosti a kvalitě projektu.  
  
---  
  
# Účel projektu  
  
Hlavním cílem projektu je vytvořit moderní aplikaci umožňující:  
  
- správu hráčů,  
- hraní klasické hry Hero Dice,  
- Play Mode,  
- ukládání rozehraných her,  
- dlouhodobé statistiky,  
- historii her,  
- Fun Games,  
- cloudovou synchronizaci,  
- budoucí online hraní.  
  
Projekt je navržen jako dlouhodobě rozvíjený systém.  
  
---  
  
# Filozofie projektu  
  
Vývoj Hero Dice je řízen dokumentem:  
  
**CONSTITUTION.md**  
  
Základní priority projektu jsou:  
  
1. Stabilita  
2. Uživatelská přívětivost (UX)  
3. Správnost dat  
4. Nové funkce  
5. Architektonická čistota  
  
---  
  
# Struktura dokumentace  
  
Veškerá projektová dokumentace je uložena ve složce:  
  
```text  
/docs  
```  
  
Obsah dokumentace:  
  
```text  
  
README.md  
  
CONSTITUTION.md  
  
docs/PROJECT_CONTEXT.md  
  
docs/ARCHITECTURE.md  
  
docs/DATABASE.md  
  
docs/PLAYMODE.md  
  
docs/KNOWN_RULES.md  
  
docs/CHANGELOG.md  
  
docs/DEVELOPMENT_WORKFLOW.md  
  
docs/AI_GUIDE.md  
```  
  
Každý dokument má přesně definovaný účel.  
  
Jednotlivé dokumenty se vzájemně neduplikují.  
  
---  
  
# Jak číst dokumentaci  
  
Doporučené pořadí:  
  
1. README.md  
2. CONSTITUTION.md  
3. PROJECT_CONTEXT.md  
4. ARCHITECTURE.md  
5. DATABASE.md  
6. PLAYMODE.md  
7. KNOWN_RULES.md  
8. DEVELOPMENT_WORKFLOW.md  
9. AI_GUIDE.md  
10. CHANGELOG.md  
  
---  
  
# Zdroj pravdy  
  
Pořadí zdrojů pravdy projektu:  
  
1. Zdrojový kód  
2. Projektová dokumentace  
3. Historie změn  
  
Pokud vznikne rozpor mezi dokumentací a implementací, rozhodující je vždy aktuální zdrojový kód.  
  
Dokumentace musí být následně aktualizována.  
  
---  
  
# Struktura projektu  
  
Projekt je rozdělen do několika hlavních částí.  
  
```text  
app/  
│  
├── components/  
├── data/  
├── lib/  
├── page.tsx  
  
public/  
  
docs/  
  
README.md  
  
CONSTITUTION.md  
```  
  
Každá část projektu má přesně vymezenou odpovědnost.  
  
Podrobnosti jsou popsány v dokumentu:  
  
**ARCHITECTURE.md**  
  
---  
  
# Vývoj projektu  
  
Každá změna projektu probíhá podle dokumentu:  
  
**DEVELOPMENT_WORKFLOW.md**  
  
Základní pracovní postup:  
  
```text  
Analýza  
↓  
Návrh řešení  
↓  
Schválení  
↓  
Implementace  
↓  
Testování  
↓  
Aktualizace dokumentace  
```  
  
---  
  
# AI  
  
Hero Dice je připraven pro spolupráci s AI nástroji.  
  
Pravidla jejich práce jsou popsána v:  
  
**AI_GUIDE.md**  
  
Veškeré AI nástroje jsou povinny respektovat:  
  
- CONSTITUTION.md  
- projektovou dokumentaci  
- aktuální implementaci projektu  
  
---  
  
# Dokumentace  
  
Projektová dokumentace je součástí projektu.  
  
Každá změna architektury, databáze, herních pravidel nebo vývojového procesu musí být promítnuta do příslušné dokumentace.  
  
Cílem je zajistit, aby dokumentace vždy odpovídala aktuálnímu stavu projektu.  
  
---  
  
# Stav projektu  
  
Aktuální vývoj probíhá nad verzí:  
  
**Hero Dice v2.6**  

Highlights:

- Stable Offline PlayMode
- Runtime Save/Load
- Online Lobby
- Online PlayMode synchronization
- Online game metadata

---

# Serverové proměnné pro notifikace žádostí

Pro automatické e-maily po schválení nebo zamítnutí žádosti nastav v prostředí serveru:

```env
RESEND_API_KEY=re_jEw1TMQf_3LcNEVsrgzLhVyVP4ed5Gxre
RESEND_FROM_EMAIL="Hero Dice <play@hero-dice.eu>"
```

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`

`RESEND_API_KEY` je nutný pro skutečné odesílání e-mailů.
`RESEND_FROM_EMAIL` je doporučený, ale v resetu hesla je k dispozici bezpečný fallback sender `Hero Dice <onboarding@resend.dev>`.
Bez těchto proměnných zůstane funkční ruční fallback (mailto) v admin rozhraní a reset hesla proběhne dál bez pádu, jen bez e-mailu.
Po změně `.env.local` restartuj dev server, aby se nové hodnoty načetly.
  
Projekt je aktivně vyvíjen.  

Stručná roadmapa další etapy:

- probíhá příprava Online Platform Foundation,
- vývoj mobilního základu začíná na iOS,
- Android bude následovat v další fázi,
- mobilní platforma je vyvíjena odděleně od současného Hero Dice.
  
Důraz je kladen na:  
  
- stabilitu,  
- bezpečný vývoj,  
- minimální riziko regresí,  
- dlouhodobou udržitelnost,  
- kvalitní dokumentaci.  
  
---  
  
# Závěr  
  
README.md je vstupním dokumentem projektu.  
  
Nový vývojář nebo AI agent by měl po jeho přečtení vědět:  
  
- co je Hero Dice,  
- kde najde dokumentaci,  
- jaké dokumenty číst,  
- jak probíhá vývoj,  
- kde hledat další informace.  
  
Veškeré podrobnosti jsou popsány v navazujících dokumentech projektové dokumentace.  
