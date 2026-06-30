# ANALYSIS: AI Deadlock - previousTargetCategory Usage Diagnosis

**Datum**: 2026-06-30  
**Typ**: DIAGNOSTIKA (bez implementace)  
**Status**: ✅ Hotovo  

---

## OTÁZKA

Používá AI `previousTargetCategory` pouze jako preference při výběru nejlepšího kandidáta, nebo tím omenzuje samotné vytváření kandidátů a tím blokuje možnost změnit strategii během kola?

## ODPOVĚĎ

**`previousTargetCategory` je POUZE preference při rankingu kandidátů. NEOMEZUJE candidate generation.**

Všichni kandidáti se generují pro VŠECHNY legální cíle nezávisle na `previousTargetCategory`.

### Důkaz

#### 1. Candidate Generation - nezávislé na previousTargetCategory

**Lokace**: [app/lib/aiPlayer.ts](app/lib/aiPlayer.ts#L3446-L3550)

Řádek 3446 - inicializace:
```typescript
let candidates: CandidateCombination[] = [];
```

Řádky 3451-3550 - generování:
```typescript
for (const [candidateOrder, combType] of combinationTypes.entries()) {
  const categoryId = combinationToCategoryId[combType];
  
  // Kontrola availableTargetCategories
  if (!availableTargetCategories.includes(categoryId)) {
    continue; // Skip, není legální
  }
  
  // Evaluace kombinace
  const evaluated = evaluateCombination(...);
  
  // Pokud je valido, přidá se do candidates
  if (evaluated && evaluated.canWrite) {
    // Generuj kandidáta
    candidates.push({ type: combType, ... });
  }
}
```

**Klíčový fakt**: Smyčka prochází VŠECHNY `combinationTypes` bez ohledu na `previousTargetCategory`.
`previousTargetCategory` se v tomto kódu NEPOUŽÍVÁ NIKDE.

#### 2. previousTargetCategory - pouze v rankingu

**Lokace**: [app/lib/aiPlayer.ts](app/lib/aiPlayer.ts#L4854-L4859)

```typescript
const previousPlanCandidate =
  previousTargetCategory
    ? candidates.find(
        (candidate) =>
          combinationToCategoryId[candidate.type] === previousTargetCategory
      ) ?? null
    : null;
```

Operace:
- Hledá se v EXISTUJÍCÍM poli `candidates`
- Pokud existuje kandidát s `previousTargetCategory`, uloží se jako `previousPlanCandidate`
- Pokud neexistuje, vrátí se `null`

To je **preference - ranking hint**, ne filtr candidate generation.

#### 3. Ranking logika - pivot rozhodnutí

**Lokace**: [app/lib/aiPlayer.ts](app/lib/aiPlayer.ts#L4900-L4950)

```typescript
if (previousPlanCandidate && 
    combinationToCategoryId[previousPlanCandidate.type] !== 
    combinationToCategoryId[best.type]) {
  
  // Porovnání skóre
  const currentPlanValue = previousPlanCandidate.strategyScore;
  const alternativePlanValue = best.strategyScore;
  
  // Rozhodnutí: zůstat u starého nebo přejít na nový?
  if (pivotAccepted) {
    // Přejdi na best
  } else {
    best = previousPlanCandidate;
  }
}
```

To je **strategické rozhodnutí**, nikoliv omezení.

---

## KDE SE AI BLOKUJE?

Deadlock **NENÍ** v candidate generation ani v rankingu.
Deadlock je v **controller flow po zamítnutí rozhodnutí**.

### Kritická chyba - app/page.tsx řádky 4054-4130

```typescript
if (rejectedBecauseInvalidCandidate && remainingRolls > 0) {
  if (!areLockMasksEqual(lockedDice, fallbackWorkingOnlyMask)) {
    setLockedDice(fallbackWorkingOnlyMask);
    
    logAITurnAudit({
      event: "working-replan-before-roll",
      ...
    });
    
    return;  // ← VRÁTÍ SE PŘED AKTUALIZACÍ previousTargetCategory!
  }
}

// Tato část se NEVYKONÁ
if (action === "roll") {
  aiControllerPreviousTargetCategoryRef.current = effectiveTargetCategory;
}
```

### Deadlock Sekvence

1. **KOLO 1**: AI vytvoří high-value builder, uloží targetCategory
   - makeAIDecision vrátí decision s targetCategory = "Pyramida"
   - Řádky 4036-4040: nastaví se `previousTargetCategory = "Pyramida"`
   - AI rolluje

2. **KOLO 2**: Nové dice, starý previousTargetCategory
   - makeAIDecision vrátí nevalidní decision (targetCategory = null nebo invalid)
   - rejectedBecauseInvalidCandidate = true
   - Řádky 4054-4130 se spustí a vrátí se (return!)
   - **previousTargetCategory se neaktualizuje - zůstane "Pyramida"**
   - Effect se znovu spustí (kvůli setLockedDice)

3. **KOLO 2b** (re-run effect):
   - makeAIDecision se volá znovu s `previousTargetCategory = "Pyramida"`
   - Hledá se kandidát pro Pyramidu v candidates
   - **ALE Pyramida je stále nevalidní!**
   - Vrátí opět invalid decision
   - previousTargetCategory se znova neaktualizuje

4. **KOLO 3+**: Smyčka pokračuje
   - previousTargetCategory = "Pyramida" (není resetnutý)
   - makeAIDecision vrátí invalid decision
   - Smyčka se opakuje

---

## PODROBNÁ ANALÝZA

### Jak makeAIDecision pracuje?

1. **Generování**: Vytvoří se VŠICHNI kandidáti pro legální cíle
   ```
   candidates = [Dvojice, Trojice, Postupka, Pyramida, Hrozen, ...]
   ```

2. **Ranking**: Najde se nejlepší a previousPlan
   ```
   best = findBest(candidates)
   previousPlanCandidate = candidates.find(c => c.type === "Pyramida")
   ```

3. **Pivot**: Rozhodnutí zůstat u previousPlan nebo jít na best
   ```
   if (previousPlanCandidate && best !== previousPlanCandidate) {
     if (shouldPivot()) {
       // Zůstanu u previousPlan
       best = previousPlanCandidate;
     }
   }
   ```

4. **Vrácení**: Vrátí `best` kandidáta
   ```
   decision.targetCategory = combinationToCategoryId[best.type]
   ```

### Příklad: Kdy se vrací invalid decision?

**Scénář A**: previousPlanCandidate je v candidates, ale nelegální
- Řádky 5030-5038: Pokud `detectedCombinationBlocksPlan` a previousPlanCandidate je legální, vyměníme
- Ale pokud previousPlanCandidate je NEVIDITELNÝ v candidates (nelze ho postavit), vrátí se best
- Pokud best je také nevalidní, vrátí se invalid decision

**Scénář B**: previousPlanCandidate není v candidates
- Řádek 4860: `previousPlanCandidate = null`
- Pokračuje se s best
- Pokud best je invalid, vrátí se invalid decision

### Proč se deadlock zacykluje?

**Příčina**: Řádky 4054-4130 se vrací PŘED aktualizací previousTargetCategory

```typescript
// NESPUŠTĚNO - vrátili jsme se dříve!
if (action === "roll") {
  aiControllerPreviousTargetCategoryRef.current = effectiveTargetCategory;
}
```

**Důsledek**:
- Effect se znovu spustí (kvůli setLockedDice)
- previousTargetCategory zůstane OLD value
- makeAIDecision bude OPĚT hledat starý target
- Vrátí OPĚT invalid decision
- Smyčka se opakuje

---

## CODE LOCATIONS

### Where previousTargetCategory is READ:

1. **app/lib/aiPlayer.ts:3281-3283** - Extraction from strategyContext
2. **app/lib/aiPlayer.ts:4854** - Find previousPlanCandidate in candidates array

### Where previousTargetCategory is SET:

1. **app/page.tsx:4036-4040** - Set aiControllerPreviousTargetCategoryRef.current
   - `if (action === "roll")`: set to effectiveTargetCategory
   - `else`: set to null

### Where previousTargetCategory is NOT RESET (BUG):

**app/page.tsx:4054-4130** - Handler pro rejectedBecauseInvalidCandidate
- Řádka 4130: `return;` se provede
- Řádky 4036-4040 se NEVYKONAJÍ
- previousTargetCategory zůstane OLD value

---

## ZÁVĚR

### Otázka: Blokuje previousTargetCategory candidate generation?

**NE. previousTargetCategory je POUZE ranking preference.**

Všichni kandidáti se vždy generují pro všechny legální cíle.

### Kde je deadlock?

**V app/page.tsx řádcích 4054-4130**

Když se decision zamítne, řádky 4036-4040 se NEVYKONAJÍ, a `previousTargetCategory` zůstane na staré hodnotě.

### Proč se AI nemůže přeplan?

Nikoliv proto, že by se candidate generation blokoval. Ale protože:
1. previousTargetCategory se neresetnuje
2. V dalším volání makeAIDecision se opět hledá starý target
3. Starý target je stále nevalidní
4. Vrátí se invalid decision znovu
5. Smyčka se opakuje

### Fix (budoucí - bez implementace):

Řádka 4130 by měla resetovat previousTargetCategory:

```typescript
if (rejectedBecauseInvalidCandidate && remainingRolls > 0) {
  if (!areLockMasksEqual(lockedDice, fallbackWorkingOnlyMask)) {
    setLockedDice(fallbackWorkingOnlyMask);
    
    // ADD THIS:
    aiControllerPreviousTargetCategoryRef.current = null;
    
    logAITurnAudit(...);
    return;
  }
}
```

Pak by v dalším volání makeAIDecision:
- previousPlanCandidate = null
- Všichni kandidáti by se řadili objektivně
- AI by se mohla přeplaovat bez deadlocku
