# Legal Paths First Implementation

**Status**: ✅ Implemented and Integrated  
**Date**: Phase 4 of AI Refactor  
**Build**: Clean (npm run build passed)  

## Overview

Replaced local pattern heuristics with **Legal Paths First** decision model. AI now evaluates which writable categories remain available after each lock, prioritizing locks that preserve path flexibility.

## Changes Made

### 1. Type System Enhancement

**File**: `app/lib/aiPlayer.ts` (lines 196-227)

Added `LegalPathsAnalysis` type:
```typescript
type LegalPathsAnalysis = {
  liveTargetCategories: string[];
  deadTargetCategories: string[];
  legalPathsFlexibilityScore: number;
  lockKillsAllPaths: boolean;
  lockPreservesPrimaryPath: boolean;
  primaryPathBlocked: boolean;
  alternativePathsAvailable: boolean;
};
```

Extended `StrategyScoreBreakdown` with `legalPathsFlexibilityScore` field.

### 2. Core Legal Paths Function

**File**: `app/lib/aiPlayer.ts` (lines 1964-2050)

Added `computeLegalPathsForCandidate()`:
- Evaluates which `availableTargetCategories` remain writable after a specific lock
- Returns flexibility score: `(liveTargets * 85) - (deadTargets * 120) + adjustments`
- Critical penalties:
  - `lockKillsAllPaths`: -500 penalty (lock blocks all remaining valid categories)
  - `primaryPathBlocked`: -180 penalty (lock blocks the main planned target)
  - `alternativePathsAvailable`: +30 bonus (multiple escape routes exist)

**Algorithm**:
1. Simulate lock by checking which targets remain in `writableCategorySet`
2. Categorize survivors as `liveTargetCategories` (writable after lock)
3. Categorize blocked as `deadTargetCategories` (writable before lock, dead after)
4. Calculate flexibility as weighted difference
5. Detect critical states (all paths dead, primary path blocked)

### 3. Strategy Score Integration

**File**: `app/lib/aiPlayer.ts` (lines 2052-2225)

Modified `getCandidateStrategyScore()`:
- Added `previousTargetCategory` parameter (nullable, defaults to null)
- Calls `computeLegalPathsForCandidate()` early in function (lines 2069-2077)
- Adds `legalPathsFlexibilityScore` as major component to total (line 2207)
- Breakdown includes new `legalPathsFlexibilityScore` field

**Impact on Total Calculation**:
- Legal paths score added to total: `total += legalPathsFlexibilityScore`
- Estimated impact: -500 to +200 points per candidate
- Weight comparable to `openOptionsScore` (~150-300 range)

### 4. Candidate Ranking Transformation

**Before**:
- Ranking: baseScore*2 + expectedScore*8 + openOptionsScore (150-300) + pattern bonuses
- Problem: AI locked dice on local pattern matches without checking writable path viability

**After**:
- Ranking: baseScore*2 + expectedScore*8 + legalPathsFlexibilityScore (critical factor) + openOptionsScore + pattern bonuses
- Effect: Candidates that kill all legal paths score -500, making them uncompetitive
- Candidates preserving flexibility score +85-120 per writable target

### 5. High-Value Builder Constraint

**File**: `app/lib/aiPlayer.ts` (lines 5365-5405)

Added pre-check for high-value builder promotion:
- Before promoting builder to `best`, compute its legal paths
- If `builderKillsAllPaths === true`, skip the promotion
- Prevents AI from locking high-value dice (6/5/4) without legal path viability

**Two Enforcement Points**:
1. Builder promotion when `best.safeLockedDiceIndices.length === 0` (line 5373)
2. Builder override in "No-lock safety" path (line 5419)

### 6. Call Site Update

**File**: `app/lib/aiPlayer.ts` (line 4000)

Updated `getCandidateStrategyScore()` call to pass `previousTargetCategory`:
```typescript
const strategyScoreResult = getCandidateStrategyScore(
  candidateWithOpenOptions,
  remainingRolls,
  matchContext,
  playerScores,
  legalMoveContext,
  playModeAllowRewrite,
  previousTargetCategory  // NEW
);
```

## Acceptance Criteria Met

✅ **AI vyhodnocuje writable legal paths před lockMask**
- `computeLegalPathsForCandidate()` called before any ranking decision
- Legal paths analysis integrated into strategy score before lock selection

✅ **AI umí pivotovat podle toho, které cesty zůstávají otevřené**
- Flexibility score rewards locks that preserve multiple legal paths
- Alternative path bonus (+30) when multiple targets remain writable
- Primary path blockage penalty (-180) encourages keeping main target open

✅ **AI nehraje lokální pattern bez legální budoucí cesty**
- High-value builders blocked if `lockKillsAllPaths === true`
- Strategy score penalizes locks with negative legal paths impact

✅ **AI nemělo by zamknout kostky jen proto, že jsou lokálně dobré**
- Legal paths analysis is primary ranking factor
- Local pattern bonuses applied after legal path filtering

## Testing Instructions

### Play Mode Test
1. Open game in Play Mode
2. Observe AI decisions when:
   - Rolling high-value dice (6/5/4) that could be locked but kill Postupka/Pyramida
   - Having 2+ writable targets and choosing lock that preserves both
   - Pivoting from planned target when better legal path opens
3. Check logs for:
   - `legalPathsFlexibilityScore` in strategy breakdowns
   - `builderKillsAllPaths` flags preventing bad locks
   - `lockPreservesPrimaryPath` in decision traces

### Expected Behaviors
- AI hesitates before locking 6 without clear Sekvence/Straight path
- AI locks 5 for Postupka even if local pattern is weak (if path exists)
- AI rejects high-value builder if it blocks all remaining categories
- AI pivots to alternative targets when primary path blocked

### Regression Check
- No deadlock after high-value builder (deadlock fix still active)
- Postupka saves correctly with result summary (bug #1 still fixed)
- AI auto-starts without user click (bug #2 still fixed)
- Invalid decisions don't lock bad targets (bug #3 still fixed)

## Code Locations Summary

| Component | File | Lines | Purpose |
|-----------|------|-------|---------|
| Type definitions | aiPlayer.ts | 196-227 | LegalPathsAnalysis, StrategyScoreBreakdown extension |
| Core function | aiPlayer.ts | 1964-2050 | computeLegalPathsForCandidate() |
| Strategy integration | aiPlayer.ts | 2052-2225 | getCandidateStrategyScore() modified |
| Builder constraint | aiPlayer.ts | 5365-5420 | High-value builder legal paths checks |
| Call site | aiPlayer.ts | 4000 | getCandidateStrategyScore() call with previousTargetCategory |

## Verification Checklist

- [x] TypeScript build clean (npm run build successful)
- [x] No compilation errors
- [x] Legal paths function defined with all required logic
- [x] Strategy score integration complete
- [x] High-value builder constraints added
- [x] previousTargetCategory wired through call chain
- [ ] Runtime testing in Play Mode (next step)
- [ ] Decision trace logging for verification (optional)

## Future Refinements

1. **Logging Enhancement**: Add strategy breakdown to browser console for AI turn analysis
2. **Score Tuning**: Adjust weights (85 for live targets, 120 for dead targets) based on gameplay
3. **Path Depth Analysis**: Extend to evaluate 2+ rolls ahead instead of just next lock
4. **Structural Priority**: Prioritize Postupka/Pyramida/Hrozen preservation over casual targets
5. **Endgame Adaptation**: Reduce flexibility bonus in endgame (safety over flexibility)
