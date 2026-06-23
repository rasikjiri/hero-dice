# ANALYSIS: AI Player Decision Logic

**Projekt:** Hero Dice v3.3  
**Typ dokumentu:** Technická analýza  
**Status:** DRAFT - Ready for Review  
**Datum:** 2026-06-23  

---

## 1. PŘEHLED NALEZENÝCH SOUBORŮ A FUNKCÍ

### 1.1 Hlavní soubory
- **app/page.tsx** - Hlavní orchestrátor, obsahuje veškerou herní logiku
- **app/lib/playMode.ts** - Detekce kombinací
- **docs/PLAYMODE.md** - Pravidla hry
- **docs/ARCHITECTURE.md** - Architektura systému

### 1.2 Klíčové funkce

| Funkce | Soubor | Řádek | Popis |
|--------|--------|-------|-------|
| `detectCombination()` | playMode.ts | 21 | Detektuje nejlepší kombinaci z kostek |
| `toggleDiceLock()` | page.tsx | 1383 | Označuje/odznačuje jednotlivé kostky |
| `rollAllDice()` | page.tsx | 2383 | Animuje a provede hod |
| `savePlayModeScore()` | page.tsx | 1977 | Uloží skóre hráče do tabulky |
| `endTurn()` | page.tsx | 2071 | Předá tah dalšímu hráči |
| Computer auto-save | page.tsx | 2185-2298 | useEffect - auto-uloží skóre |
| Computer auto-roll | page.tsx | 2480-2581 | useEffect - auto-hází kostkami |

### 1.3 Datové struktury

```typescript
// Stav kostek
playModeDice: number[] = [1, 1, 1, 1, 1, 1]           // Aktuální hodnoty
lockedDice: boolean[] = [false, ...]                  // Označené kostky (výběr)
confirmedLockedDice: boolean[] = [false, ...]        // Potvrzené zamčené (před hodem)

// Skóre
scores: ScoreMap = {
  [playerId]: {
    [categoryId]: score
  }
}

// Hráči
computerPlayers = [
  { id: "computer_1", name: "Computer Peppa" },
  { id: "computer_2", name: "Computer Rocky" },
  { id: "computer_3", name: "Computer Lucky" }
]
```

---

## 2. POPIS AKTUÁLNÍHO FLOW COMPUTER TAHU

### 2.1 Kryzí automatických systémů

Computer hráč v současné verzi používá **dva paralelní automatické systémy**:

#### Systém 1: Auto-Hod (useEffect @ line 2480)
```
Podmínky:
  IF isComputerPlayer
  AND hasRolledDice === false
  AND existuje validní kombinace v kostkách
  THEN: Čekej 500ms → rollAllDice()
```

**Chování:**
- Čeká, dokud počítač nemá platnou kombinaci
- Když ji objeví, automaticky hází
- Umožňuje tak "blind rolling" - hody bez cíle

#### Systém 2: Auto-Uložení (useEffect @ line 2185)
```
Podmínky:
  IF isComputerPlayer
  AND currentCombination existuje
  AND kombinace je zapsatelná (nová nebo lepší než stará)
  THEN: Automaticky setScores() a showPlayModeResult = true
```

**Chování:**
- Po každém hodu detektuje nejlepší kombinaci
- Pokud je zapsatelná, automaticky ji uloží
- Zobrazí modální okno s výsledkem
- Hráč stiskne "Další hráč" → endTurn() → switch na dalšího hráče

### 2.2 Klíčový problém: Žádná detekce kostek

**Aktuální situace:**
1. Computer hod: `rollAllDice()` → ALL kostky se přeházejí
2. Detect: `detectCombination()` → najde nejlepší kombinaci z VŠECH kostek
3. Save: Uloží skóre a pokračuje

**Chybí:**
- Žádné označení kostek (`lockedDice = false`)
- Žádné zamčení (`confirmedLockedDice = false`)
- Žádné cílené rozhodování, co zachovat/hodit

**Důsledek:**
- Computer ignoruje strategie - hází VŠECHNY kostky každý tah
- Je velmi neúspěšný v kombinacích vyžadujících postupné budování (Postupka, Trojice)

---

## 3. POPIS: KDE SE VYHODNOCUJÍ KOMBINACE

### 3.1 Detekce kombinací

**Funkce:** `detectCombination()` @ playMode.ts:21
```typescript
export const detectCombination = (dice: number[]): PlayModeResult | null => {
  // Seřadí kostky
  const sortedDice = [...dice].sort((a, b) => a - b);
  
  // Počítá výskyty: {6: 1, 5: 2, ...}
  const counts = getCounts(sortedDice);
  
  // Detektuje v tomto pořadí:
  // 1. Generál (6x stejné)
  // 2. Pyramida/Hrozen (3-2-1 v pořadí)
  // 3. Postupka (1-6)
  // 4. Čtyři-dvě (4x + 2x)
  // 5. Trojice (3x + 3x)
  // 6. Dvojice (2x + 2x + 2x)
  
  return { combination: string, score: number } | null;
}
```

**Volání:**
- Line 2223: `const currentCombination = detectCombination(playModeDice)`
- Používá VŠECHNY kostky (včetně zamčených)
- Žádná filtrování na základě `lockedDice`

### 3.2 Kdy se detekce spouští

1. **Po hodu** - Line 2393: `setHasRolledDice(true)`
2. **V render-time** - Line 2221: `useMemo` derivujeme `currentCombination`
3. **V auto-systémech** - Oba useEffects checují `currentCombination`

### 3.3 Detekovaná kombinace

```typescript
currentCombination = {
  combination: "Generál" | "Pyramida" | "Hrozen" | "Postupka" | 
              "Čtyři-dvě" | "Trojice" | "Dvojice" | null,
  score: 21  // Součet všech kostek
}
```

**Priorita (od nejlepší):**
1. Generál (všechna stejná) → max 36
2. Pyramida/Hrozen (3-2-1 v pořadí)
3. Postupka (1-6) → vždy 21
4. Čtyři-dvě
5. Trojice
6. Dvojice

---

## 4. OVĚŘENÍ: LOGIKA PRO OZNAČOVÁNÍ KOSTEK (HUMAN)

### 4.1 Lidský hráč - flow

```
Hráč klikne na kostku → toggleDiceLock(index)
  ↓
  Aktualizuj: lockedDice[index] = !lockedDice[index]
  ↓
  Kostka se zvýrazní žlutě (bg-yellow-400)
  ↓
  Hráč klikne "Hodit"
  ↓
  rollAllDice() zachová zamčené kostky, ostatní se hází
  ↓
  Nový hod se vyhodnotí → detectCombination()
  ↓
  Hráč uloží skóre → savePlayModeScore()
```

### 4.2 Funkce toggleDiceLock() - detailně

```typescript
const toggleDiceLock = (index: number) => {
  // Kontroly
  if (!hasRolledDice || isRolling) return;
  if (confirmedLockedDice[index]) return;  // Nelze zrušit zamčené z hodu
  
  // Pro general bonus: musí být všechny kostky stejné
  if (bonusUsed && playModeBonusMode === "general-only") {
    const clickedValue = playModeDice[index];
    if (selectedGeneralValue !== null && clickedValue !== selectedGeneralValue) return;
  }
  
  // Flip
  setLockedDice(prev => {
    const updated = [...prev];
    updated[index] = !updated[index];
    return updated;
  });
};
```

**Dostupné:** pouze pro:
- Human hráče
- Po hodu (hasRolledDice = true)
- Během hry (isOnlineGame || isCurrentPlayer)
- NE při rollingu

### 4.3 Vizuální feedback

```html
<!-- Zamčená kostka -->
<button className="bg-yellow-400 border-yellow-400">
  <img src="/dice/6.png" />
</button>

<!-- Odemčená kostka -->
<button className="bg-white border-black">
  <img src="/dice/3.png" />
</button>
```

### 4.4 Uložení skóre - savePlayModeScore()

```typescript
const savePlayModeScore = () => {
  // Kontroly
  if (!currentCombination) return true;
  
  // Ověř, že kombinace není už zapsaná
  if (existingScore !== undefined && !playModeAllowRewrite) {
    alert("Tato kombinace je již zapsána...");
    return false;
  }
  
  // Ulož skóre
  setScores(prev => ({
    ...prev,
    [playerId]: {
      ...prev[playerId],
      [categoryId]: currentCombination.score
    }
  }));
  
  return true;
};
```

**KLÍČOVÁ POZOROVÁNÍ:**
- Uzel pracuje s `lockedDice` pouze pro UI (zvýraznění)
- `detectCombination()` pracuje s `playModeDice` - VŠEMI kostkami
- Lidský výběr (lockedDice) neovlivňuje detekci - pouze příští hod
- AI prozatím NE - nejsou zvoleny žádné kostky

---

## 5. NÁVRH MÍSTA PRO AI DECISION MODUL

### 5.1 Možnosti umístění

#### OPTION A: Samostatná funkce v lib (DOPORUČENÁ)

```typescript
// app/lib/aiPlayer.ts (NOVÝ SOUBOR)
export function decideAIDiceSelection(
  currentDice: number[],
  scores: ScoreMap,
  playerId: string,
  playModeAllowRewrite: boolean
): AIDecision {
  return {
    lockedDiceIndices: [0, 2, 4],  // Které kostky zamknout
    reasoning: "Čeká se na Postupku"
  }
}
```

**Výhody:**
- Oddělená logika
- Testovatelná
- Budoucí rozšiřování (Easy/Hard)
- Bez vlivu na page.tsx

**Umístění v architektuře:**
```
components/
data/
lib/
  ├── playMode.ts         (existující)
  ├── aiPlayer.ts         (NOVÝ - AI decision logic)
  ├── supabase.ts         (existující)
  └── onlineSession.ts    (existující)
```

#### OPTION B: Přidání do playMode.ts

- Méně ideální - smíchá game detection s AI rozhodováním
- Možné, ale horší maintainability

#### OPTION C: Inline v page.tsx

- VŮBEC NE - page.tsx je již přetížen (9000+ řádků)

### 5.2 Předpokládaný interface

```typescript
// app/lib/aiPlayer.ts

export type AIDecision = {
  lockedDiceIndices: number[];  // [0, 2, 4] = zamkni kostky na indexech
  reason: string;               // Debugovací info
};

export function makeAIDecision(
  currentDice: number[],                    // [3, 6, 6, 1, 5, 2]
  currentCombination: PlayModeResult | null, // Detekovaná kombinace
  scores: ScoreMap,                         // Všechna dosavadní skóre
  playerId: string,                         // "computer_1"
  playModeAllowRewrite: boolean              // Lze přepisovat?
): AIDecision {
  
  // Logika zde
  
  return {
    lockedDiceIndices: [],
    reason: ""
  };
}
```

### 5.3 Integrace do stávajícího flow

**Umístění: Nový useEffect po detectCombination**

```typescript
// page.tsx - v sekci "10. AI PLAYER"

useEffect(() => {
  if (!gameStarted || !hasStartedPlayMode) return;
  if (!isComputerPlayerId(currentPlayPlayerId)) return;
  if (!hasRolledDice || isRolling) return;
  if (isOnlineGame) return;  // Jen pro offline
  
  // Zavolej AI rozhodnutí
  const decision = makeAIDecision(
    playModeDice,
    currentCombination,
    scores,
    currentPlayPlayerId,
    playModeAllowRewrite
  );
  
  // Aplikuj rozhodnutí
  setLockedDice(newLockedState);
  
  // Zapamatuj si, aby se znova nespustilo
  lastAIDecisionRef.current = turnMarker;
  
}, [hasRolledDice, currentCombination, ...]);
```

---

## 6. NÁVRH MINIMÁLNÍ IMPLEMENTACE

### 6.1 Algoritmus (pseudokód)

```
FUNKCE makeAIDecision(kostky, detekovanáKombinace, skóre, hráč):
  
  // KROK 1: Najdi všechny MOŽNÉ kombinace
  kandidáty = []
  PRO každou kombinaci v seznamu kombinací:
    IF kombinace je v kostkách (alespoň částečně):
      kandidáty.přidej({
        type: kombinace,
        potřebKostek: počet_chybějících_kostek,
        skóre: potenciální_skóre
      })
  
  // KROK 2: Filtruj psátelné kombinace
  psátelné = []
  PRO každou kandidáta:
    IF kombinace není v skóre hráče:
      psátelné.přidej(kandidáta)
    JINAK IF playModeAllowRewrite AND skóre > existující_skóre:
      psátelné.přidej(kandidáta)
  
  // KROK 3: Zvol nejslibnější
  IF psátelné je prázdné:
    VRAŤ: žádné kostky zamknuty  // Hod všechno
  
  nejBližší = psátelné.seřaď(
    primárně: potřebKostek (vzestupně),    // Nejblíže k dokončení
    sekundárně: skóre (sestupně)            // Vyšší skóre vítězí
  )[0]
  
  // KROK 4: Identifikuj kostky pro zamčení
  zamkniKostky = identifikuj_kostky_pro_kombinaci(
    kostky,
    nejBližší.type
  )
  
  VRAŤ: { lockedDiceIndices: zamkniKostky }
```

### 6.2 Implementace - identifikace kombinací

```typescript
// Co už v kostkách máme?
// Generál: všechna stejná? → zamkni všechny
// Postupka: máme 1,2,3,4,5,6? → zamkni všechny
// Trojice: máme něco 3x? → zamkni ty 3
// Pyramida/Hrozen: máme 3-2-1 v pořadí? → zamkni ty
```

**Pseudokód - Detekce:** 
```typescript
function findLockedIndicesForCombination(dice, targetCombination) {
  switch (targetCombination) {
    case "Generál":
      // Najdi nejčastější hodnotu, zamkni všechny její výskyty
      const counts = getCounts(dice);
      const mostCommon = Object.keys(counts).sort(
        (a, b) => counts[b] - counts[a]
      )[0];
      return dice.map((d, i) => d === parseInt(mostCommon) ? i : -1)
                 .filter(i => i !== -1);
    
    case "Postupka":
      // Jsou všechny hodnoty 1-6? Zamkni všechny
      const hasAll = [1,2,3,4,5,6].every(n => dice.includes(n));
      return hasAll ? [0,1,2,3,4,5] : [];
    
    case "Trojice":
      // Najdi něco 3x a zamkni ty
      ...
  }
}
```

### 6.3 Chování AI v praxi

**Příklad 1: Aktuální hod [3, 6, 6, 1, 5, 2]**
```
Detekce: žádná kombinace

Kandidáti:
  - Generál: chybí 4 stejné (má 2x 6, potřebuje 4)
  - Postupka: chybí 2 kostky (má 1,2,3,5,6)

Psátelné: obě

Nejbližší: Postupka (potřebuje 2 kostky)

Zamkni: [2, 4] → zachov 6, 5

Efekt: Příští hod se háží [?, 6, ?, 1, 5, 2]
       Šance na 3,4 pro Postupku
```

**Příklad 2: Aktuální hod [6, 6, 6, 1, 5, 2], Generál už zapsaný**
```
Detekace: Generál (skóre 27)

Psátelné (bez přepisu): Trojice (3x 6)

Nejbližší: Trojice (má 3x 6, je hotové)

Zamkni: [0, 1, 2] → zachov 6,6,6

Efekt: Příští hod se háží [6, 6, 6, ?, ?, ?]
       Zajímá nás lepší Trojice (více kostek)
```

### 6.4 Nevykonávat nyní - budoucí rozšíření

```typescript
// NEIMPLEMENTOVAT (zatím)
// Příklady pro budoucnost:

// Easy AI: Nejjednodušší heuristika
// Hard AI: Pokročilá probabilita
// Medium AI: Něco uprostřed

// Zatím: Základní algoritmus bez volby obtížnosti
```

---

## 7. VYHODNOCENÍ RIZIK

### 7.1 Riziko 1: Přepsání skóre

**Popis:** AI by mohla omylem přepsat lepší skóre horším

**Pravděpodobnost:** NÍZKÁ  
**Závažnost:** VYSOKÁ  
**Mitigation:**
- AI kontroluje `existingScore` přesně jako human
- `savePlayModeScore()` má stejné kontroly pro AI i human
- Nelze přepsat bez `playModeAllowRewrite = true`

**BEZPEČNÉ:** ✅ Stávající kód to chrání

---

### 7.2 Riziko 2: Zvýšený počet základních hodů

**Popis:** AI by mohla hodit déle/více než je limit

**Pravděpodobnost:** NÍZKA  
**Závažnost:** STŘEDNÍ  
**Mitigation:**
- Nepměňujeme `rollAllDice()` ani `remainingRolls` logiku
- AI jen "označuje" kostky (lockedDice)
- Počet hodů řídí existující mechanika (`remainingRolls >= 0`)
- V prvním tahu: AI bez rollu → OK

**BEZPEČNÉ:** ✅ Není změna v hod-mechanice

---

### 7.3 Riziko 3: Přepínání hráčů

**Popis:** AI by mohla zablokovat switch na dalšího hráče

**Pravděpodobnost:** NÍZKA  
**Závažnost:** VYSOKÁ  
**Mitigation:**
- `endTurn()` je nezávislý na AI rozhodnutí
- `setShowPlayModeResult(true)` se spouští stejně pro AI i human
- Flow: AI uloží → modal → "Další hráč" → endTurn() → switch

**BEZPEČNÉ:** ✅ Není změna v end-turn logice

---

### 7.4 Riziko 4: Scoreboard a statistiky

**Popis:** AI by mohla způsobit nesprávná skóre v tabulce

**Pravděpodobnost:** NÍZKA  
**Závažnost:** VYSOKÁ  
**Mitigation:**
- AI skóre jde do `scores[playerId][categoryId]`
- Tato data se uloží do `fun_games` (nikoliv `league_games`)
- Hra s počítačem je vždy Fun hra (bez vlivu na ranking)
- Statistiky počítačových her nejsou zahrnuty v leaderboards

**BEZPEČNÉ:** ✅ Separace game_mode ochraňuje statistiky

---

### 7.5 Riziko 5: Automatické ukončení tahu

**Popis:** AI by mohla ukončit tah dřív, než je nutné

**Pravděpodobnost:** NÍZKA  
**Závažnost:** NÍZKÁ  
**Mitigation:**
- AI pouze označuje kostky (`lockedDice`)
- Hod se spouští existujícím auto-roll useEffect
- Auto-save useEffect zůstává beze změny
- AI neovlivňuje `remainingRolls` nebo načasování

**BEZPEČNÉ:** ✅ Časování zůstává stejné

---

### 7.6 Riziko 6: Nekonečná smyčka v useEffect

**Popis:** AI useEffect by mohla spustit nekonečné re-render

**Pravděpodobnost:** STŘEDNÍ  
**Závažnost:** VYSOKÁ  
**Mitigation:**
- Patterns jako `lastComputerAutoRollRef` zabraňují re-spouštění
- Marker: `${playerId}:${currentPlayPlayerIndex}:${localTurnVersionRef.current}`
- Jednou za tah se AI decision spustí, pak se zastaví

**BEZPEČNÉ:** ✅ Už používáme pattern, jen zkopírovat

---

### 7.7 Riziko 7: Online režim

**Popis:** AI v online hře by mohla přímo komunikovat bez synchronizace

**Pravděpodobnost:** NÍZKA  
**Závažnost:** VYSOKÁ  
**Mitigation:**
- AI je **OFFLINE ONLY** - počítač v online se nepoužívá
- Kontrola: `if (isOnlineGame) return;`
- Pravidlo: Computer player → offline automaticky

**BEZPEČNÉ:** ✅ Hardware constraint řeší to

---

## 8. DOPORUČENÍ: JE BEZPEČNÉ POKRAČOVAT?

### ✅ **ANALÝZA: SCHVÁLENO PRO IMPLEMENTACI**

**Zákázání:**
1. Stávající mechanika (detekce, skóre, počet hodů) zůstává **nedotčena**
2. AI pouze **přidává** označení kostek, nic nemění
3. Stávající `lockedDice` logika je již připravena
4. Všechna rizika jsou **zmírňovatelná** bez architektonických změn

**Minimální rozsah:**
- Nový soubor: `app/lib/aiPlayer.ts` (~150 řádků)
- Nový useEffect: `app/page.tsx` (~40 řádků)
- Nový ref: `lastAIDecisionRef` (2 řádky)
- Bez změn v existujícím kódu

**Testování:**
- Unit test: `makeAIDecision()` s různými daty
- Integration test: Computer vs Human
- Manual test: Hra s počítačem, ověř korektní tah

### ⚠️ **PODMÍNKY:**

1. **Striktně offline** - AI jen pro offline hry
2. **Bez datové migrace** - Fun games zůstávají jako jsou
3. **Bez rozšíření pravidel** - Kombinace stejné
4. **Bez obtížností** - Jen jeden algoritmus
5. **Bez změny skóre logiky** - `savePlayModeScore()` se nechá

### 🎯 **DOPORUČENÁ ÚPRAVA BRIEFU:**

```markdown
# Implementation Task: AI Dice Selection (Phase 1)

## Scope
- Create app/lib/aiPlayer.ts with makeAIDecision()
- Add AI decision useEffect to page.tsx (section 10. AI PLAYER)
- Add decision-making logic per proposed algorithm

## Constraints
- Offline only (computer player)
- No database changes
- No rule changes
- No difficulty levels yet
- No scoring changes

## Success Criteria
- Computer player selects dice strategically
- Closer combinations are prioritized
- Higher potential scores are preferred when equal distance
- Game flow unchanged
- Statistics unaffected

## Acceptance
- Computer AI completes turn with dice selection visible
- Human vs Computer remains playable
- No regression in league games or statistics
```

---

## PŘÍLOHA A: Mapování kombinací na prioritu

```javascript
const COMBINATIONS_BY_PRIORITY = [
  {
    type: "Generál",
    detection: dice => counts.some(c => c === 6),
    maxScore: 36,
    difficulty: 1  // Nejčastější
  },
  {
    type: "Postupka",
    detection: dice => hasSequence([1,2,3,4,5,6]),
    maxScore: 21,
    difficulty: 3
  },
  {
    type: "Pyramida",
    detection: dice => pyramid_check(),
    maxScore: 21,
    difficulty: 2
  },
  {
    type: "Hrozen",
    detection: dice => icecone_check(),
    maxScore: 21,
    difficulty: 2
  },
  {
    type: "Čtyři-dvě",
    detection: dice => counts.includes(4) && counts.includes(2),
    maxScore: 30,
    difficulty: 1
  },
  {
    type: "Trojice",
    detection: dice => counts.filter(c => c === 3).length === 2,
    maxScore: 30,
    difficulty: 1
  },
  {
    type: "Dvojice",
    detection: dice => counts.filter(c => c === 2).length === 3,
    maxScore: 24,
    difficulty: 1
  }
];
```

---

## PŘÍLOHA B: Pseudokód finální implementace

```typescript
// app/lib/aiPlayer.ts

export function makeAIDecision(
  currentDice: number[],
  currentCombination: PlayModeResult | null,
  scores: ScoreMap,
  playerId: string,
  playModeAllowRewrite: boolean
): AIDecision {
  
  // 1. Generuj kandidáty
  const candidates = generateCandidates(currentDice, scores, playerId, playModeAllowRewrite);
  
  // 2. Pokud nic není psátelné, vrať prázdné (hod všechno)
  if (candidates.length === 0) {
    return { lockedDiceIndices: [], reason: "Žádná psátelná kombinace, hod všechno" };
  }
  
  // 3. Seřaď podle strategie
  const sorted = candidates.sort((a, b) => {
    // Primárně: méně chybějících kostek
    if (a.missingCount !== b.missingCount) {
      return a.missingCount - b.missingCount;
    }
    // Sekundárně: vyšší skóre
    return b.potentialScore - a.potentialScore;
  });
  
  // 4. Vyber nejlepší
  const best = sorted[0];
  
  // 5. Identifikuj kostky
  const indices = findDiceIndicesForCombination(currentDice, best.type);
  
  return {
    lockedDiceIndices: indices,
    reason: `Míř na ${best.type} (${best.missingCount} chybí)`
  };
}

function generateCandidates(dice, scores, playerId, allowRewrite) {
  // Pro každou kombinaci:
  // - Je již zapsaná?
  // - Dá se přepsat?
  // - Jak blízko ji máme?
  // - Jaké je potenciální skóre?
}

function findDiceIndicesForCombination(dice, combinationType) {
  // Vrať indexy kostek, které jsou relevantní pro kombinaci
  // Např. pro Generál: všechny indexy stejné hodnoty
}
```

---

## SHRNUTÍ

**Co bylo zjištěno:**
- ✅ Jasná architektura pro přidání AI
- ✅ Stávající `lockedDice` mechanika připravená na AI
- ✅ Dvě paralelní auto-systémy (roll + save)
- ✅ Žádné požadavky na DB změny
- ✅ Minimální rizika s jasnou mitigací

**Kde se AI decision umístí:**
- 📁 Nový soubor: `app/lib/aiPlayer.ts`
- 🔄 Nový useEffect v `app/page.tsx` sekce 10

**Minimální algoritmus:**
- Najdi kandidáty
- Filtruj psátelné
- Zvol nejbližší (pak vyšší skóre)
- Zamkni relevantní kostky

**Rizika:**
- ✅ Všechna zmírňovatelná
- ✅ Bez architektonických změn
- ✅ Bez dopadu na statistiky/ranking
- ✅ Bez datové migrace

**Doporučení:**
### 🟢 **BEZPEČNĚ POKRAČOVAT S IMPLEMENTAČNÍM TASK BRIEFEM**

Analýza je hotova. Implementace může začít s jasným scope a minimálním rizikem.

---

**Interní poznámka:** Tato analýza následuje AI_GUIDE.md postup (Analýza → Návrh → Schválení → Implementace).
