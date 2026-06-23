/**
 * Hero Dice - AI Player Decision Logic
 * 
 * Provides decision-making for computer players when selecting dice to lock.
 * This module is pure functional - no side effects, no state mutations.
 */

import { PlayModeResult } from "./playMode";

export type ScoreMap = {
  [playerId: string]: {
    [categoryId: string]: number;
  };
};

export type AIDecision = {
  lockedDiceIndices: number[];
  reason: string;
};

/**
 * Represents a candidate combination for AI consideration
 */
type CandidateCombination = {
  type: string;
  maxScore: number;
  currentMatchCount: number;
  totalRequired: number;
  missingCount: number;
  potentialScore: number;
  canWrite: boolean;
  relevantIndices: number[];
};

const combinationToCategoryId: Record<
  string,
  string
> = {
  "Generál": "general",
  "Pyramida": "pyramida",
  "Hrozen": "hrozen",
  "Postupka": "postupka",
  "Čtyři-dvě": "ctyri_dva",
  "Trojice": "trojce",
  "Dvojice": "dvojce",
};

/**
 * Gets the count of each die value in the dice array
 */
const getCounts = (dice: number[]): Record<number, number> => {
  const counts: Record<number, number> = {};
  dice.forEach((value) => {
    counts[value] = (counts[value] || 0) + 1;
  });
  return counts;
};

/**
 * Checks if dice contain all values from 1 to 6 (Postupka)
 */
const hasSequence = (dice: number[]): boolean => {
  const sorted = [...dice].sort((a, b) => a - b);
  return sorted.join(",") === "1,2,3,4,5,6";
};

/**
 * Finds indices of dice that match the target value
 */
const findDiceIndicesByValue = (
  dice: number[],
  value: number
): number[] => {
  return dice
    .map((d, index) => (d === value ? index : -1))
    .filter((index) => index !== -1);
};

/**
 * Finds indices of a Sequence (1,2,3,4,5,6)
 */
const findDiceIndicesForSequence = (dice: number[]): number[] => {
  // We need all 6 dice values exactly
  if (hasSequence(dice)) {
    return [0, 1, 2, 3, 4, 5];
  }
  
  // Return which ones we already have
  const needed = [1, 2, 3, 4, 5, 6];
  return needed
    .map((value) => {
      const index = dice.findIndex((d) => d === value);
      return index;
    })
    .filter((index) => index !== -1);
};

/**
 * Find the most common die value in the counts object
 */
const getMostCommonValue = (counts: Record<number, number>): number => {
  let maxCount = 0;
  let maxValue = 1;
  
  Object.entries(counts).forEach(([valueStr, count]) => {
    if (count > maxCount) {
      maxCount = count;
      maxValue = parseInt(valueStr);
    }
  });
  
  return maxValue;
};

/**
 * Sort counts entries by count descending
 */
const sortByCount = (counts: Record<number, number>) => {
  return Object.entries(counts)
    .map(([value, count]) => ({ value: parseInt(value), count }))
    .sort((a, b) => b.count - a.count);
};

/**
 * Evaluates a specific combination and returns details
 */
const evaluateCombination = (
  dice: number[],
  combinationType: string,
  existingScore: number | undefined,
  allowRewrite: boolean
): CandidateCombination | null => {
  const counts = getCounts(dice);
  const values = Object.values(counts).sort((a, b) => b - a);
  const score = dice.reduce((sum, val) => sum + val, 0);

  const candidate: Partial<CandidateCombination> = {
    type: combinationType,
    potentialScore: score,
  };

  let relevantIndices: number[] = [];

  // Check each combination type
  switch (combinationType) {
    case "Generál":
      // All 6 dice the same
      if (values[0] === 6) {
        const value = getMostCommonValue(counts);
        relevantIndices = findDiceIndicesByValue(dice, value);
        candidate.currentMatchCount = 6;
        candidate.totalRequired = 6;
        candidate.missingCount = 0;
      } else {
        // Find the most common value
        const value = getMostCommonValue(counts);
        const matchCount = counts[value];

        // Avoid locking a single random die for Generál.
        if (matchCount < 2) {
          return null;
        }

        relevantIndices = findDiceIndicesByValue(dice, value);
        candidate.currentMatchCount = matchCount;
        candidate.totalRequired = 6;
        candidate.missingCount = 6 - matchCount;
      }
      break;

    case "Postupka":
      // 1,2,3,4,5,6
      if (hasSequence(dice)) {
        candidate.currentMatchCount = 6;
        candidate.totalRequired = 6;
        candidate.missingCount = 0;
        relevantIndices = [0, 1, 2, 3, 4, 5];
      } else {
        const hasValues = [1, 2, 3, 4, 5, 6].filter((v) => dice.includes(v));

        // Keep Postupka strategy only when we already have a strong base.
        if (hasValues.length < 4) {
          return null;
        }

        candidate.currentMatchCount = hasValues.length;
        candidate.totalRequired = 6;
        candidate.missingCount = 6 - hasValues.length;
        relevantIndices = findDiceIndicesForSequence(dice);
      }
      break;

    case "Čtyři-dvě":
      // 4 of one kind + 2 of another
      if (values[0] === 4 && values[1] === 2) {
        candidate.currentMatchCount = 6;
        candidate.totalRequired = 6;
        candidate.missingCount = 0;
        const sorted = sortByCount(counts);
        const four = sorted[0].value;
        const two = sorted[1].value;
        relevantIndices = [
          ...findDiceIndicesByValue(dice, four),
          ...findDiceIndicesByValue(dice, two),
        ];
      } else if (values[0] === 4) {
        // Have 4 of a kind, need a pair
        const sorted = sortByCount(counts);
        const four = sorted[0].value;
        candidate.currentMatchCount = 4;
        candidate.totalRequired = 6;
        candidate.missingCount = 2;
        relevantIndices = findDiceIndicesByValue(dice, four);
      } else if (values[0] === 3 && values[1] === 2) {
        candidate.currentMatchCount = 5;
        candidate.totalRequired = 6;
        candidate.missingCount = 1;
        const sorted = sortByCount(counts);
        const three = sorted[0].value;
        relevantIndices = findDiceIndicesByValue(dice, three);
      } else {
        return null; // Too far away
      }
      break;

    case "Trojice":
      // Two triplets (3+3)
      if (values[0] === 3 && values[1] === 3) {
        candidate.currentMatchCount = 6;
        candidate.totalRequired = 6;
        candidate.missingCount = 0;
        const sorted = sortByCount(counts);
        relevantIndices = [
          ...findDiceIndicesByValue(dice, sorted[0].value),
          ...findDiceIndicesByValue(dice, sorted[1].value),
        ];
      } else if (values[0] === 3) {
        candidate.currentMatchCount = 3;
        candidate.totalRequired = 6;
        candidate.missingCount = 3;
        const triplet = sortByCount(counts)[0].value;
        relevantIndices = findDiceIndicesByValue(dice, triplet);
      } else {
        return null; // No triplet yet
      }
      break;

    case "Dvojice":
      // Three pairs (2+2+2)
      if (values[0] === 2 && values[1] === 2 && values[2] === 2) {
        candidate.currentMatchCount = 6;
        candidate.totalRequired = 6;
        candidate.missingCount = 0;
        const sorted = sortByCount(counts);
        relevantIndices = [
          ...findDiceIndicesByValue(dice, sorted[0].value),
          ...findDiceIndicesByValue(dice, sorted[1].value),
          ...findDiceIndicesByValue(dice, sorted[2].value),
        ];
      } else if (
        values[0] === 2 &&
        values[1] === 2
      ) {
        candidate.currentMatchCount = 4;
        candidate.totalRequired = 6;
        candidate.missingCount = 2;
        const sorted = sortByCount(counts);
        relevantIndices = [
          ...findDiceIndicesByValue(dice, sorted[0].value),
          ...findDiceIndicesByValue(dice, sorted[1].value),
        ];
      } else if (values[0] === 2) {
        candidate.currentMatchCount = 2;
        candidate.totalRequired = 6;
        candidate.missingCount = 4;
        const pair = sortByCount(counts)[0].value;
        relevantIndices = findDiceIndicesByValue(dice, pair);
      } else {
        return null; // Too far away
      }
      break;

    case "Pyramida":
    case "Hrozen":
      // These require specific 3-2-1 ordering - complex to evaluate
      // For now, only consider if already complete
      if (values[0] === 3 && values[1] === 2 && values[2] === 1) {
        candidate.currentMatchCount = 6;
        candidate.totalRequired = 6;
        candidate.missingCount = 0;
        relevantIndices = [0, 1, 2, 3, 4, 5];
      } else {
        return null;
      }
      break;

    default:
      return null;
  }

  // Determine if this combination can be written
  let canWrite = true;
  if (existingScore !== undefined && !allowRewrite) {
    canWrite = false;
  } else if (
    existingScore !== undefined &&
    allowRewrite &&
    existingScore >= score
  ) {
    canWrite = false;
  }

  return {
    type: combinationType,
    maxScore: candidate.potentialScore as number,
    currentMatchCount: candidate.currentMatchCount as number,
    totalRequired: candidate.totalRequired as number,
    missingCount: candidate.missingCount as number,
    potentialScore: score,
    canWrite,
    relevantIndices,
  };
};

/**
 * Main AI decision function
 * 
 * @param currentDice - Array of 6 dice values [1-6]
 * @param currentCombination - Currently detected combination (if any)
 * @param scores - All player scores
 * @param playerId - Current player ID
 * @param playModeAllowRewrite - Whether rewriting is allowed
 * @returns AIDecision with locked dice indices and reasoning
 */
export function makeAIDecision(
  currentDice: number[],
  _currentCombination: PlayModeResult | null,
  scores: ScoreMap,
  playerId: string,
  playModeAllowRewrite: boolean
): AIDecision {
  // Guard: validate inputs
  if (!currentDice || currentDice.length !== 6 || !playerId) {
    return {
      lockedDiceIndices: [],
      reason: "Invalid input",
    };
  }

  const playerScores = scores[playerId] || {};

  // Combination priority order - matches detectCombination evaluation order
  const combinationTypes = [
    "Generál",
    "Pyramida",
    "Hrozen",
    "Postupka",
    "Čtyři-dvě",
    "Trojice",
    "Dvojice",
  ];

  // Evaluate all combinations
  const candidates: CandidateCombination[] = [];

  for (const combType of combinationTypes) {
    const categoryId =
      combinationToCategoryId[combType];

    const existingScore =
      categoryId !== undefined
        ? playerScores[categoryId]
        : undefined;

    const evaluated = evaluateCombination(
      currentDice,
      combType,
      existingScore,
      playModeAllowRewrite
    );

    if (evaluated && evaluated.canWrite) {
      candidates.push(evaluated);
    }
  }

  // If no writable combinations, return empty (roll everything)
  if (candidates.length === 0) {
    return {
      lockedDiceIndices: [],
      reason: "No useful lock, reroll all",
    };
  }

  // Sort candidates by strategy:
  // 1. Primary: Fewest missing dice (closest to completion)
  // 2. Secondary: Highest potential score
  candidates.sort((a, b) => {
    if (a.missingCount !== b.missingCount) {
      return a.missingCount - b.missingCount;
    }
    return b.potentialScore - a.potentialScore;
  });

  const best = candidates[0];

  // No-lock safety: if candidate quality is too weak, reroll all.
  if (
    best.missingCount > 2 ||
    best.relevantIndices.length < 2
  ) {
    return {
      lockedDiceIndices: [],
      reason: "No useful lock, reroll all",
    };
  }

  return {
    lockedDiceIndices: best.relevantIndices,
    reason: `Targeting ${best.type} (${best.missingCount} missing, potential ${best.potentialScore})`,
  };
}
