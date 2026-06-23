# AI Flow Analysis: Two Issues

## ISSUE #1: Empty AI Decision Stopping Auto-Roll

### What Happens
When `makeAIDecision()` returns `{ lockedDiceIndices: [], reason: "..." }`:
- AI Decision Effect sets all lockedDice to false
- Auto-Roll should continue rolling (remainingRolls > 0)
- **BUT** auto-roll stops even with remaining rolls

### State Trace
```
Step 1: AI Decision Effect (line 2195)
├─ makeAIDecision() returns empty: { lockedDiceIndices: [], reason: "..." }
├─ newLockedDice = [false, false, false, false, false, false]
└─ setLockedDice(newLockedDice)

Step 2: Auto-Turn Effect (line 2274)
├─ Checks !currentCombination = true
├─ For computer player:
│  ├─ if (remainingRolls <= 0) → endTurn() [ONLY if 0 rolls left]
│  └─ else → setHasRolledDice(false)
├─ PROBLEM: Auto-Turn MISSING remainingRolls in dependencies! (line 2407)
│  Dependencies: [..., currentCombination, selectedPlayers, ... ]
│  MISSING:      remainingRolls ❌
└─ Result: When remainingRolls changes, auto-turn may NOT re-run

Step 3: Auto-Roll Effect (line 2580)
├─ Guard checks:
│  ├─ if (remainingRolls <= 0) return; ← BLOCKS when 0 rolls
│  ├─ if (!hasWritableCombination) continue
│  └─ if (hasRolledDice) return;
├─ If all guards pass: rollAllDice() scheduled 500ms later
└─ Problem: After roll completes:
   ├─ rollAllDice() calls setRemainingRolls(prev => prev - 1)
   ├─ remainingRolls changes from 1 to 0
   ├─ Auto-turn DOESN'T re-run (no dependency)
   └─ Auto-roll DOES re-run BUT sees remainingRolls <= 0 → returns

Result: BLOCKED STATE
├─ remainingRolls: 0
├─ hasRolledDice: false (from auto-turn's last setHasRolledDice(false))
├─ currentCombination: null
└─ Auto-roll cannot trigger next roll
```

### Root Cause
**Auto-Turn Effect Missing `remainingRolls` Dependency**

Line 2407:
```typescript
}, [
  isOnlineGame,
  gameStarted,
  hasStartedPlayMode,
  gameFinished,
  showPlayModeResult,
  currentCombination,
  selectedPlayers,
  currentPlayPlayerIndex,
  scores,
  playModeAllowRewrite,
  playModeCategoryMap,
  // ❌ remainingRolls NOT included
]);
```

**Consequence:**
- When `remainingRolls` changes from 1 → 0, auto-turn doesn't re-run
- The check `else if (remainingRolls <= 0) { endTurn() }` never executes at the right time
- Auto-roll blocks (guard: remainingRolls <= 0)
- Turn gets stuck

### Current Code (Line 2313-2321)
```typescript
if (!currentCombination) {
  if (!isComputerPlayerId(playerId)) {
    setRemainingRolls(0);
  } else if (remainingRolls <= 0) {
    // Computer player out of rolls with no combination - auto-end turn
    lastComputerAutoTurnRef.current = turnMarker;
    endTurn();
    return;
  }
  setHasRolledDice(false);
  return;
}
```

**This code SHOULD work IF:**
- Auto-turn re-runs when remainingRolls changes
- But it won't because remainingRolls is NOT in dependencies

---

## ISSUE #2: Missing End-Turn UI Confirmation

### What Happens
When computer turn ends without a valid combination:
- `endTurn()` is called (line 2313-2316)
- No `showPlayModeResult` modal appears
- Next player's turn starts silently

### Current Result Modal Condition (Line 8124)
```typescript
{showPlayModeResult &&
currentCombination && (
  <div className="...">
    {/* Modal renders combination: {currentCombination.combination} */}
  </div>
)}
```

**Problem:** Modal requires BOTH conditions:
- `showPlayModeResult = true`
- `currentCombination != null`

When computer runs out of rolls with NO valid combination:
- `showPlayModeResult` stays **false** (never set)
- `currentCombination` is **null**
- Modal doesn't render ✗

### Current endTurn() Implementation (Line 2065-2099)
```typescript
const endTurn = async () => {
  // Reset sound flag for new player
  setNoCombinationSoundPlayed(false);

  // ... online sync code ...

  setCurrentPlayPlayerIndex(nextPlayer);
  setPlayModeDice(nextPlayModeDice);
  setLockedDice(nextLockedDice);
  setConfirmedLockedDice(nextConfirmedLockedDice);
  setRemainingRolls(playModeRolls);
  setBonusUsed(false);
  setHasRolledDice(false);
  setSelectedGeneralValue(null);
  // ❌ setShowPlayModeResult(true) is NOT called
};
```

### The Gap
**When should UI confirm end-of-turn?**

Current flow for computer with no combination:
```
1. remainingRolls: 0, currentCombination: null, hasRolledDice: false
2. Auto-turn effect detects: !currentCombination && remainingRolls <= 0
3. Calls endTurn()
4. endTurn() moves to next player
5. No confirmation modal shown ❌
```

**Expected flow:**
```
1. remainingRolls: 0, currentCombination: null, hasRolledDice: false
2. Auto-turn effect detects: !currentCombination && remainingRolls <= 0
3. Should set showPlayModeResult = true (OR)
4. Modal should display: "No valid combination - turn ends"
5. After brief display, move to next player
```

### Modal Requirement
Current modal renders:
```typescript
<div className="...">
  <div className="...">Zapsaný výsledek hodu</div>
  <div className="...text-4xl...">
    {currentCombination.combination}  ← WOULD CRASH if null
  </div>
  <div>Hráč: {playerName}</div>
  <div>Bodů: {currentCombination.score}</div>  ← WOULD CRASH if null
</div>
```

If modal is shown with `currentCombination = null`, it crashes trying to access `.combination` and `.score`.

---

## SUMMARY: What's Broken & Why

### Issue #1 Root Cause
| Component | Problem |
|-----------|---------|
| Auto-Turn Effect | Missing `remainingRolls` dependency (line 2407) |
| Impact | Can't detect when remainingRolls becomes 0 |
| Result | Auto-roll blocks with remainingRolls <= 0 guard |
| Status | Partially implemented - endTurn() call exists but never triggers |

### Issue #2 Root Cause
| Component | Problem |
|-----------|---------|
| endTurn() Function | Doesn't set `showPlayModeResult = true` |
| Result Modal | Requires `currentCombination != null` to render |
| Impact | No UI feedback when turn ends with no valid combination |
| Status | Flow goes straight to next player with no confirmation |

---

## Code Locations Needing Fixes

### Fix #1: Auto-Turn Effect Dependencies
**File:** [app/page.tsx](app/page.tsx#L2407)  
**Current:** Missing `remainingRolls`  
**Action:** Add `remainingRolls` to dependency array

```typescript
}, [
  isOnlineGame,
  gameStarted,
  hasStartedPlayMode,
  gameFinished,
  showPlayModeResult,
  currentCombination,
  selectedPlayers,
  currentPlayPlayerIndex,
  scores,
  playModeAllowRewrite,
  playModeCategoryMap,
  remainingRolls,  // ← ADD THIS
]);
```

### Fix #2: endTurn() Sets showPlayModeResult
**File:** [app/page.tsx](app/page.tsx#L2065-L2099)  
**Current:** Doesn't call `setShowPlayModeResult(true)`  
**Action:** Call setShowPlayModeResult(true) before ending turn
OR make modal handle null currentCombination

### Fix #3: Result Modal Handles No-Combination Case
**File:** [app/page.tsx](app/page.tsx#L8124)  
**Current:** Requires `currentCombination != null` to render  
**Action:** Either:
- A) Show different modal content when `currentCombination = null`
- B) Only show modal if combination exists

---

## Proper Flow (After Fixes)

### Scenario: Computer ends turn with no valid combination

```
Turn State: remainingRolls: 0, currentCombination: null, hasRolledDice: false

1. Auto-Turn Effect Runs (dependencies change)
   ├─ Sees: !currentCombination = true
   ├─ Sees: remainingRolls <= 0 = true  ← NOW DETECTS (with added dependency)
   ├─ Computer player path:
   │  └─ endTurn() called
   └─ setShowPlayModeResult(true)  ← NEEDED

2. Result Modal Triggers
   ├─ showPlayModeResult = true
   ├─ currentCombination = null
   └─ Display: "No valid combination" OR show confirmation
      Then: Auto-close or wait for next player acknowledgement

3. Continue to Next Player
   └─ currentPlayPlayerIndex moved to next
```

### Scenario: Computer continues rolling (remainingRolls > 0)

```
Turn State: remainingRolls: 3, currentCombination: null, hasRolledDice: false

1. Auto-Turn Effect Runs
   ├─ Sees: !currentCombination = true
   ├─ Sees: remainingRolls <= 0 = false
   ├─ setHasRolledDice(false)
   └─ Returns (no endTurn)

2. Auto-Roll Effect Runs
   ├─ hasRolledDice = false ✓
   ├─ remainingRolls > 0 ✓
   ├─ no writable combination ✓
   └─ rollAllDice() scheduled → rolls after 500ms

3. Loop continues for each roll
```

