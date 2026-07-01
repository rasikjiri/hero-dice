# ANALYSIS: AI Strategic Model - Legal Paths vs Local Patterns

**Datum**: 2026-06-30  
**Typ**: DEEP DIAGNOSTIC (bez implementace)  
**Otázka**: Používá AI skutečný model budoucích legálních cest, nebo pouze hodnotí aktuální lokální patterny?

---

## ODPOVĚĎ

**AI POUŽÍVÁ PŘEDEVŠÍM LOKÁLNÍ PATTERNY S MINIMÁLNÍM MODELEM BUDOUCÍCH LEGÁLNÍCH CEST.**

Strategie se zaměřuje na:
- Lokální vysokohodnotové kostky (6, 5, 4)
- Okamžité doplnění chybějících templátů
- Heuristiky místo skutečné simulace

Nikoliv na:
- Reálné budoucí legální cesty
- Ověření, zda lock neblokuje ostatní možnosti
- Průběžný build s garantí zápisu

---

## 1. ✗ LOKÁLNÍ PATTERNY - HIGH-VALUE BUILDERS

### Kde se generují?

**File**: `app/lib/aiPlayer.ts`  
**Lines**: 1164-1300

```typescript
const HIGH_VALUE_BUILDER_PATTERNS: number[][] = [
  [6],
  [5],
  [4],
  [6, 5],
  [6, 4],
  [5, 4],
  [6, 5, 4],
];
```

**Mechanika**:
- Hledají se konkrétní hodnoty (6, 5, 4) v aktuálních dice
- Negenerizují se pro budoucí hody
- Aplikují se mechanicky, bez kontextu legálních cest

### Příklad - SELHÁNÍ

**Scénář**: Dice = [1, 2, 3, 4, 5, 6], previousTarget = "Postupka"

1. **HIGH_VALUE_BUILDER NAJDE**: [6, 5, 4] (tři vysoké kostky)
2. **LOCK**: [F, F, F, T, T, T] (uzamčí se 4, 5, 6)
3. **CÍLA**: Pyramida (vysokohodnotový builder)

**ALE**:
- Původní cíl "Postupka" STÁLE v `availableTargetCategories`
- Se zbývajícími dicemi [1, 2, 3] **nelze** tvořit Postupku
- Pyramida potřebuje pattern [AAA, AAA, AA, AA, AA] nebo [AAAAA, BB, CC]
- Se zbytkem [1, 2, 3] **nelze** tvořit Pyramidu

**VÝSLEDEK**: AI je UVĚZNĚNA v Pyramidě se zámky [4, 5, 6] a zbytkem [1, 2, 3]

---

## 2. ✗ BUDOUCÍ LEGÁLNÍ CESTY - HEURISTIKY MÍSTO SIMULACE

### Kde se "počítají"?

**File**: `app/lib/aiPlayer.ts`  
**Lines**: 769-850 (`evaluateOpenOptionsForLock`)

```typescript
const completionChance = Number(
  Math.max(
    0,
    Math.min(1, currentProgress / 6)
  ).toFixed(2)
);

const remainingRollsFit =
  typeof remainingRolls === "number"
    ? Math.max(
        0,
        remainingRolls -
          Math.max(0, missingPattern.length - 1)
      )
    : 0;

const optionScore =
  combinationPriority[combType] * 28 +
  template.templateScore * 4 +
  currentProgress * 24 +
  completionChance * 90 +
  remainingRollsFit * 18 +
  scoreContextModifier;
```

### PROBLÉM: Čistě heuristické

**Co se počítá**:
- `completionChance = currentProgress / 6` ← VELMI ZJEDNODUŠENO
  - Pokud máme 2 z 6, chance = 0.33 (33%)
  - Ale reálně: s 2 zbývajícími hody, chance ≠ 33%
  
- `remainingRollsFit = remainingRolls - Math.max(0, missingPattern.length - 1)` ← HEURISTIKA
  - Pokud chybí 3 kostky a zbývají 2 hody: `remainingRollsFit = 2 - 2 = 0`
  - Ale může existovat cesta, která se udělá v 2 hodech (např. se štěstím)

**Co se NEPOUŽÍVÁ**:
- ❌ Skutečné simulace budoucích hodů
- ❌ Pravděpodobnostní modely (permutace, kombinace)
- ❌ Dynamické programování pro optimální cestu
- ❌ Simulace Monte Carlo

---

## 3. ✗ LOCK EVALUATION - Nevyhodnocuje se "lock kills path"

### Kde se lockuje?

**File**: `app/lib/aiPlayer.ts`  
**Lines**: 3530-3550

```typescript
const targetSpecificLockPlan =
  getTargetSpecificLocks(
    evaluated.type,
    currentDice,
    safeLockedDiceIndices
  );

const multiTargetLockedDiceIndices =
  isStructuralTarget(evaluated.type)
    ? targetSpecificLockPlan.locks
    : enrichLockForOpenStrategy(
        currentDice,
        safeLockedDiceIndices,
        evaluated.type,
        remainingRolls
      );
```

### CO CHYBÍ - Predikce "slepé cesty"

**Funkce `enrichLockForOpenStrategy`** (řádky 505-545):

```typescript
const enrichLockForOpenStrategy = (
  dice: number[],
  lockIndices: number[],
  targetType: CombinationType,
  remainingRolls: number | undefined
): number[] => {
  const normalized = uniqueSortedIndices(lockIndices);

  if ((remainingRolls ?? 0) < 2) {
    return normalized;
  }

  if (targetType === "Postupka") {
    return normalized;  // ← POSTUPKA SE NEOBOHACUJE!
  }

  const result = new Set(normalized);
  const candidates = dice
    .map((value, index) => ({
      value,
      index,
    }))
    .filter(
      ({ index, value }) =>
        !result.has(index) && value >= 4  // ← LOKÁLNĚ PŘIDÁVÁ VYSOKÉ KOSTKY
    )
    .sort((a, b) => {
      if (b.value !== a.value) {
        return b.value - a.value;
      }
      return a.index - b.index;
    });

  for (const { index } of candidates) {
    if (result.size >= 4) {
      break;
    }
    result.add(index);  // ← MECHANICKY PŘIDÁVÁ KOSTKY
  }

  return Array.from(result).sort((a, b) => a - b);
};
```

**CO SE NEDĚJE**:
- ❌ Nekontroluje se, zda přidaná costka pomůže k zápisu
- ❌ Nekontroluje se, zda zabije jiné legální cesty
- ❌ Nekontroluje se writable maximum score po přidání
- ❌ Nekontroluje se dostupnost jiných targetů

---

## 4. ✓ RANKING LOGIKA - STRATEGIE SKÓRE

### Kde se počítá strategy score?

**File**: `app/lib/aiPlayer.ts`  
**Lines**: 1953-2150 (`getCandidateStrategyScore`)

**Komponenty strategie**:

```typescript
const baseScoreValue = candidate.maxPossibleScore;  // Max skóre cíle
const expectedScoreValue = candidate.projectedScore;  // Očekávané skóre
const targetPatternBonus = ... * 48 + (isComplete ? 120 : 0);  // Za proběhlý pattern
const progressBonus = ... * 22;  // Za progress
const completionProbability = ... * 180;  // Za šanci na completition
const remainingRollsModifier = remainingRolls * (6 - missingCount) * 3;  // Za zbývající hody
const openOptionsScore = candidate.openOptionsScore ?? 0;  // ← PŘIDÁNO!
const riskModifier = endgameMode ? ... : 0;  // Za endgame
const combinationBias = combinationPriority[type] * 80;  // Bias pro typ kombinace

const total =
  baseScoreValue * 2 +
  expectedScoreValue * 8 +
  targetPatternBonus +
  progressBonus +
  completionProbability * 180 +
  remainingRollsModifier +
  fixedLocksCompatibility +
  categoryAvailability +
  scoreContextModifier +
  riskModifier +
  endgameModifier +
  rewriteModifier +
  combinationBias +
  singletonPenalty +
  oneFiveFallbackPenalty +
  lowValuePenalty +
  earlyGamePenalty +
  minimumAcceptableScorePenalty +
  openOptionsScore +  // ← SKÓRE OTEVŘENÝCH OPCÍ
  remainingRollsOpenStrategyBonus +
  tooNarrowPenalty +
  detectedCombinationModifier;
```

**Pozorování**:
- ✓ Strategy score je komplexní a multikomponentní
- ✗ ALE `openOptionsScore` je jen bonus, nepřekvapuje základní ranking
- ✗ High-value builder se může pozvednout i když vede na slepou cestu (řádky 5260-5280)

---

## 5. ✗ HIGH-VALUE BUILDER PROMOTION - LOKÁLNÍ PATTERN MŮŽE PŘEBÍT STRATEGII

### Kde se high-value builder prosazuje?

**File**: `app/lib/aiPlayer.ts`  
**Lines**: 5260-5330

```typescript
// PROMOTION #1: Pokud nejlepší kandidát nemá žádný lock
if (
  (remainingRolls ?? 0) > 0 &&
  best.safeLockedDiceIndices.length === 0 &&
  bestSeedCandidate !== null
) {
  best = bestSeedCandidate;  // ← NAHRADÍ best GLOBÁLNÍHO rankingu!
  seedPromotedBecauseNoBetterPattern = true;
  selectedHighValueBuilder = true;
  // ...
}

// PROMOTION #2: Pokud není silný progress
if (
  (remainingRolls ?? 0) > 0 &&
  (best.missingCount > phasePolicy.maxMissingWithoutStrong &&
    !hasStrongProgressCandidate &&
    !hasStrongSequenceDirection &&
    !hasStrongGroupedDirection) ||
  ((remainingRolls ?? 0) > 0 &&
    !hasAnyCompleteLegalCandidate &&
    best.safeLockedDiceIndices.length < phasePolicy.minRelevantIndices
  )
) {
  // ← MŮŽE SE NAHRADIT JINÝ KANDIDÁT
  best = bestSeedCandidate;
  // ...
}
```

### PROBLÉM

**High-value builder se prosazuje ZE:
- Žádného globálního modelu budoucích cest
- Bez ověření, zda cesta pokračuje
- Bez ověření, zda se dostane na zápis

---

## 6. ✗ POSTUPKA - PROČ NEUMÍ ZŮSTAT ČISTÁ?

### Scénář

**KOLO 1**: Dice = [1, 2, 3, 4, 5, 6], cíl = Postupka (sequence 1-6)

1. HIGH_VALUE builder lockuje [4, 5, 6]
2. Zbývá [1, 2, 3]
3. Cíl = Postupka se nezměnil!

**KOLO 2**: Nový hod. Dice = [1, 1, 2, 3, 4, 4], lockované = [4, 5, 6]

1. `evaluateOpenOptionsForLock` vidí:
   - `lockCounts` = {4: 1, 5: 1, 6: 1} (ze zamčenýchcostek)
   - Nové dice: [1, 1, 2, 3, 4, 4]
   - Total: {1: 3, 2: 1, 3: 1, 4: 3, 5: 1, 6: 1}

2. Template pro Postupka: jeden 1, jeden 2, jeden 3, jeden 4, jeden 5, jeden 6
   - Máme: 3× 1, 1× 2, 1× 3, 3× 4, 1× 5, 1× 6
   - **currentProgress = 5** (máme 1, 2, 3, 4, 5, 6 - všechno!)

3. **VÝSLEDEK**: `completionChance = 5 / 6 = 0.83` → AI myslí, že je blízko k úspěchu
4. **REALITA**: ZÁMKY [4, 5, 6] zabily možnost tvořit nové čtverce či trojice

### KDO JE VINEN?

Žádné ověřování, zda lock zachovává "legální cestu do zápisu".

---

## 7. ✓ WRITABLE MAXIMUM SAVE - ABSOLUTNÍ PRIORITA

### Kde se kontroluje?

**File**: `app/lib/aiPlayer.ts`  
**Lines**: 5026-5130 (detectedCombinationBlocksPlan)

```typescript
const detectedCombinationBlocksPlan =
  !(
    detectedCombinationCategoryId !== null &&
    !availableTargetCategories.includes(
      detectedCombinationCategoryId
    )
  ) &&
  detectedCombination !== null &&
  !detectedCombinationWritable &&
  combinationToCategoryId[best.type] ===
    detectedCombinationCategoryId;

if (detectedCombinationBlocksPlan) {
  if (
    previousPlanCandidate &&
    combinationToCategoryId[previousPlanCandidate.type] !==
      detectedCombinationCategoryId
  ) {
    best = previousPlanCandidate;  // ← VRÁTÍ SE K PŮVODNÍMU PLÁNU
    // ...
  } else {
    return {
      targetCategory: null,
      lockMask: [F, F, F, F, F, F],  // ← PRÁZDNÝ LOCK = REROLL
      // ...
    };
  }
}
```

**✓ SPRÁVNĚ**: Pokud se detekuje kombinace, která není writable, AI ji vyhneme.

**ALE**: Toto je detekce **po** zámku, nikoliv **pred** zámkem.

---

## 8. SHRNUTÍ - MODEL "LOKÁLNÍ PATTERN FIRST"

### AI dělá:

1. **Generuje locální high-value patterny** (6, 5, 4)
2. **Hodnotí je heuristicky** (completionChance = progress / 6)
3. **Prosazuje je mechanicky** (když není lepší kandidát)
4. **Počítá "budoucí cesty"** jen jako bonus k strategy score
5. **Nekontroluje, zda lock zabíjí ostatní možnosti**
6. **Přidává kostky bez ověření zápisu**
7. **Detekuje slepé cesty až KDYŽ SE STANE** (detectedCombinationBlocksPlan)

### Co CHYBÍ - "Legal Paths First" Model

```
POTŘEBNÝ MODEL:

1. IDENTIFIKACE LEGÁLNÍCH CEST
   ├─ Které kategorie jsou v availableTargetCategories?
   ├─ Které jsou dosažitelné se zbývajícím počtem hodů?
   └─ Která je optimální cesta do zápisu?

2. LOCK EVALUATION
   ├─ Pro každý potenciální lock: jaké cesty zůstávají?
   ├─ Jaké cesty se zabijí?
   └─ Existuje alespoň jedna legální cesta do zápisu?

3. LOCK SELECTION
   ├─ Seřadit locky podle "počtu zbývajících legálních cest"
   ├─ Vybrat lock, který maximalizuje flexibilitu
   └─ Vybrat lock, který nevede na slepou cestu

4. STRATEGY OVERRIDE
   ├─ High-value pattern se použije POUZE POKUD:
   │  ├─ Vede k nejčastějšímu zápisu
   │  ├─ Neblokuje ostatní legální cesty
   │  └─ Garantuje flexibilitu
   └─ Jinak: vybrat lock s nejlepší flexibilitou

5. DYNAMIC REPLAN
   ├─ Po zámku znovu vyhodnotit legální cesty
   ├─ Pokud se cesta zabila: reset workingLocks
   └─ Pokud se objevila lepší cesta: pivot na ni
```

---

## 9. PŘÍKLAD - KDE MODEL SELHÁVÁ

### Scénář: Postupka vs High-Value Builder

**KOLO 1**:
- Dice: [1, 2, 3, 4, 5, 6]
- availableTargetCategories: [Postupka, Pyramida, Hrozen, ...]
- previousTarget: none

**AI DĚLÁ DNES**:
1. Generuje high-value builder [6, 5, 4] pro Pyramidu
2. Strategy score: Pyramida = 450, Postupka = 380
3. High-value builder se prosadí: **Vybere Pyramidu!**
4. Lock: [F, F, F, T, T, T]
5. ROLLUJE

**KOLO 2**:
- Dice: [1, 1, 1, 2, 3, 4]
- Zbývá: [1, 1, 1, 2, 3, 4] bez lockú
- openOptions = ?

**REALITA**:
- Postupka: s kostkami [1, 1, 1, 2, 3, 4] + locky [4, 5, 6] = [1, 2, 3, 4, 5, 6] ✓ MOŽNÁ
- Pyramida: s kostkami [1, 1, 1, 2, 3, 4] = nelze tvořit AAA, BBB, CC... bez 5, 6 ✗ NEMOŽNÁ
- AI se drží Pyramidy, protože previousTarget = Pyramida
- AI je uvězněna!

**CO BY SE MĚLO STÁT**:
1. LEGAL PATHS FIRST: Zjistit, že se Postupka dá v 1 hodu
2. Zjistit, že se Pyramida NE DÁ v 1 hodu
3. PIVOT: Změnit strategii na Postupku
4. Lock: [F, F, F, T, T, T] ZRUŠIT
5. Lock: [T, F, F, T, T, T] (nový lock pro Postupku)

---

## 10. IMPLEMENTAČNÍ NÁVRH - "Legal Paths First"

### Architektura (bez implementace):

```
1. PRE-LOCK EVALUATION
   └─ computeLegalPathsForLock(lock, availableTargetCategories, remainingRolls)
      ├─ Pro každou availableTargetCategory:
      │  ├─ Je to dosažitelné s tímto lockem v zbývajících hodech?
      │  └─ Pokud ne: penalizovat
      ├─ Počet zbývajících legálních cest
      └─ Vrátit "flexibility score"

2. LOCK RANKING
   └─ Seřadit locky podle flexibility
      ├─ Locky, které zabijí legální cestu: penalizovat
      ├─ Locky, které zachovávají flexibilitu: preferovat
      └─ High-value builder: POUZE POKUD se vejde

3. DYNAMIC REPLAN
   └─ Po zámku a hodu:
      ├─ Znovu spočítejte legální cesty
      ├─ Pokud se změnily: pivot
      └─ Pokud se zabila: reset workingLocks

4. STRATEGY PRIORITA
   └─ Legal Paths Model > Strategy Score > High-Value Pattern
```

### Pseudokód:

```typescript
// Nová funkce
evaluateLegalPathsForLock(
  lock: number[],
  availableTargetCategories: string[],
  currentDice: number[],
  fixedLocks: boolean[],
  remainingRolls: number | undefined
): {
  legalPathCount: number,
  achievableCategories: string[],
  blockedCategories: string[],
  flexibilityScore: number,
  guaranteedWritable: boolean
} => {
  // Pro každý availableTargetCategory:
  //   - Simulovat zbývající hody (Monte Carlo)
  //   - Spočítej, na kolika % padů se dostane na writable zápis
  //   - Počet legálních cest = count(achievable)
  // 
  // Vrátí flexibility score
}

// Úprava getCandidateStrategyScore
getCandidateStrategyScore(...) => {
  // Místo heuristiky completionChance:
  const legalPathsEval = evaluateLegalPathsForLock(
    candidate.safeLockedDiceIndices,
    availableTargetCategories,
    ...
  );
  
  if (legalPathsEval.blockedCategories.length > 0) {
    // Penalizovat, pokud se zabijí legální cesty
    strategyScore -= legalPathsEval.blockedCategories.length * 200;
  }
  
  // High-value builder pouze POKUD garantuje flexibilitu
  if (selectedHighValueBuilder && !legalPathsEval.guaranteedWritable) {
    strategyScore -= 500;  // VELKÁ PENALTA
  }
  
  return strategyScore;
}
```

---

## 11. ZÁVĚR

### Skutečný problém

**AI nemá model "legal paths first".**

Místo toho používá:
1. ✗ Lokální high-value patterny
2. ✗ Heuristické šance na completion
3. ✗ Mechanické přidávání vysokých kostek
4. ✓ Detekci slepých cest až když se stane

### Proč Postupka neumí zůstat čistá?

- High-value builder lockuje [4, 5, 6] na Pyramidu
- Zbývá [1, 2, 3] - nelze tvořit nové kombinace
- AI se drží Pyramidy, protože to byla strategie
- V dalším kole Postupka zmizí z možností

### Proč AI nemůže přeplan?

- previousTargetCategory "lepí" AI k původnímu cíli
- Globální strategy score se počítá pro všechny kandidáty jednou
- Lokální high-value pattern se prosadí bez ověření legálních cest
- Flexibilita není součástí scoring modelu

### Budoucí řešení

**"Legal Paths First, Lock Selection Second"**:
- Před zámkem: evaluuj, které legální cesty zůstávají
- Zahoď locky, které zabijí všechny zbývající cesty
- Prosazuj high-value pattern POUZE pokud zachovává flexibilitu
- Dovoluj dynamic replan během kola, pokud se legální cesty změnily

---

**Status**: ANALÝZA HOTOVA - Bez implementace
