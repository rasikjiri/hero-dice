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

// Allowed single-die locks (game-rule dependent scoring singles).
const singleScoringValues = new Set([1, 5]);

type CombinationType =
  | "Generál"
  | "Pyramida"
  | "Hrozen"
  | "Postupka"
  | "Čtyři-dvě"
  | "Trojice"
  | "Dvojice";

type TemplateRequirement = {
  value: number;
  count: number;
};

type CombinationTemplate = {
  requirements: TemplateRequirement[];
  templateScore: number;
};

type CandidateCombination = {
  type: CombinationType;
  currentMatchCount: number;
  totalRequired: number;
  missingCount: number;
  isComplete: boolean;
  projectedScore: number;
  absoluteScoreSignal: number;
  maxPossibleScore: number;
  canWrite: boolean;
  writeState: "free" | "rewrite";
  rewriteGainSignal: number;
  relevantIndices: number[];
  evaluationScore: number;
};

const combinationToCategoryId: Record<
  CombinationType,
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

const combinationTypes: CombinationType[] = [
  "Generál",
  "Pyramida",
  "Hrozen",
  "Postupka",
  "Čtyři-dvě",
  "Trojice",
  "Dvojice",
];

const combinationPriority: Record<
  CombinationType,
  number
> = {
  "Generál": 7,
  "Pyramida": 6,
  "Hrozen": 6,
  "Postupka": 5,
  "Čtyři-dvě": 4,
  "Trojice": 3,
  "Dvojice": 2,
};

const combinationMaxScore: Record<
  CombinationType,
  number
> = {
  "Generál": 36,
  "Pyramida": 32,
  "Hrozen": 28,
  "Postupka": 21,
  "Čtyři-dvě": 34,
  "Trojice": 33,
  "Dvojice": 30,
};

/**
 * Checks if dice contain all values from 1 to 6 (Postupka)
 */
const hasSequence = (dice: number[]): boolean => {
  const sorted = [...dice].sort((a, b) => a - b);
  return sorted.join(",") === "1,2,3,4,5,6";
};

const getIndicesByValue = (
  dice: number[]
): Record<number, number[]> => {
  const byValue: Record<number, number[]> = {};

  dice.forEach((value, index) => {
    if (!byValue[value]) {
      byValue[value] = [];
    }
    byValue[value].push(index);
  });

  return byValue;
};

const uniqueSortedIndices = (
  indices: number[]
): number[] =>
  Array.from(new Set(indices)).sort(
    (a, b) => a - b
  );

const filterSafeLocks = (
  dice: number[],
  proposedIndices: number[],
  targetType: CombinationType,
  allowSingletons: boolean
): number[] => {
  const normalized = uniqueSortedIndices(
    proposedIndices
  ).filter(
    (index) => index >= 0 && index < 6
  );

  if (normalized.length === 0) {
    return [];
  }

  if (allowSingletons) {
    return normalized;
  }

  // Sequence strategy is safe only for a completed 1-6 sequence.
  if (targetType === "Postupka") {
    if (!hasSequence(dice)) {
      return [];
    }

    return normalized;
  }

  const proposedValueCounts: Record<number, number> = {};

  normalized.forEach((index) => {
    const value = dice[index];
    proposedValueCounts[value] =
      (proposedValueCounts[value] || 0) + 1;
  });

  // For non-sequence strategies, keep only duplicate contributors
  // or explicitly scoreable single values (1, 5).
  return normalized.filter((index) => {
    const value = dice[index];

    if (singleScoringValues.has(value)) {
      return true;
    }

    return (
      (proposedValueCounts[value] || 0) >= 2
    );
  });
};

const getProjectedScore = (
  templateScore: number,
  currentMatchCount: number,
  totalRequired: number
): number => {
  const missing = totalRequired - currentMatchCount;
  if (missing <= 0) {
    return templateScore;
  }

  // Keep projections conservative while still rewarding growth potential.
  return templateScore - missing * 1.5;
};

const getTemplatesForCombination = (
  combinationType: CombinationType
): CombinationTemplate[] => {
  switch (combinationType) {
    case "Generál":
      return Array.from({ length: 6 }, (_, idx) => {
        const value = idx + 1;
        return {
          requirements: [{ value, count: 6 }],
          templateScore: value * 6,
        };
      });

    case "Postupka":
      return [
        {
          requirements: [1, 2, 3, 4, 5, 6].map((value) => ({
            value,
            count: 1,
          })),
          templateScore: 21,
        },
      ];

    case "Čtyři-dvě": {
      const templates: CombinationTemplate[] = [];
      for (let four = 1; four <= 6; four += 1) {
        for (let two = 1; two <= 6; two += 1) {
          if (two === four) {
            continue;
          }
          templates.push({
            requirements: [
              { value: four, count: 4 },
              { value: two, count: 2 },
            ],
            templateScore: four * 4 + two * 2,
          });
        }
      }
      return templates;
    }

    case "Trojice": {
      const templates: CombinationTemplate[] = [];
      for (let first = 1; first <= 6; first += 1) {
        for (let second = first + 1; second <= 6; second += 1) {
          templates.push({
            requirements: [
              { value: first, count: 3 },
              { value: second, count: 3 },
            ],
            templateScore: first * 3 + second * 3,
          });
        }
      }
      return templates;
    }

    case "Dvojice": {
      const templates: CombinationTemplate[] = [];
      for (let first = 1; first <= 6; first += 1) {
        for (
          let second = first + 1;
          second <= 6;
          second += 1
        ) {
          for (
            let third = second + 1;
            third <= 6;
            third += 1
          ) {
            templates.push({
              requirements: [
                { value: first, count: 2 },
                { value: second, count: 2 },
                { value: third, count: 2 },
              ],
              templateScore:
                first * 2 + second * 2 + third * 2,
            });
          }
        }
      }
      return templates;
    }

    case "Pyramida": {
      const templates: CombinationTemplate[] = [];
      for (let triple = 1; triple <= 6; triple += 1) {
        for (let pair = 1; pair <= 6; pair += 1) {
          for (let single = 1; single <= 6; single += 1) {
            if (
              triple === pair ||
              pair === single ||
              triple === single
            ) {
              continue;
            }
            if (!(triple > pair && pair > single)) {
              continue;
            }

            templates.push({
              requirements: [
                { value: triple, count: 3 },
                { value: pair, count: 2 },
                { value: single, count: 1 },
              ],
              templateScore:
                triple * 3 + pair * 2 + single,
            });
          }
        }
      }
      return templates;
    }

    case "Hrozen": {
      const templates: CombinationTemplate[] = [];
      for (let triple = 1; triple <= 6; triple += 1) {
        for (let pair = 1; pair <= 6; pair += 1) {
          for (let single = 1; single <= 6; single += 1) {
            if (
              triple === pair ||
              pair === single ||
              triple === single
            ) {
              continue;
            }
            if (!(triple < pair && pair < single)) {
              continue;
            }

            templates.push({
              requirements: [
                { value: triple, count: 3 },
                { value: pair, count: 2 },
                { value: single, count: 1 },
              ],
              templateScore:
                triple * 3 + pair * 2 + single,
            });
          }
        }
      }
      return templates;
    }

    default:
      return [];
  }
};

const evaluateCombination = (
  dice: number[],
  combinationType: CombinationType,
  existingScore: number | undefined,
  allowRewrite: boolean,
  remainingRolls?: number
): CandidateCombination | null => {
  const byValue = getIndicesByValue(dice);
  const templates = getTemplatesForCombination(
    combinationType
  );

  if (templates.length === 0) {
    return null;
  }

  let bestTemplate:
    | {
        relevantIndices: number[];
        currentMatchCount: number;
        missingCount: number;
        templateScore: number;
        projectedScore: number;
      }
    | undefined;

  templates.forEach((template) => {
    let currentMatchCount = 0;
    const relevantIndices: number[] = [];

    template.requirements.forEach(
      ({ value, count }) => {
        const matchingIndices =
          byValue[value] || [];
        const matchedCount = Math.min(
          matchingIndices.length,
          count
        );

        currentMatchCount += matchedCount;
        relevantIndices.push(
          ...matchingIndices.slice(0, matchedCount)
        );
      }
    );

    const missingCount = 6 - currentMatchCount;
    const projectedScore = getProjectedScore(
      template.templateScore,
      currentMatchCount,
      6
    );

    if (
      !bestTemplate ||
      currentMatchCount >
        bestTemplate.currentMatchCount ||
      (currentMatchCount ===
        bestTemplate.currentMatchCount &&
        projectedScore >
          bestTemplate.projectedScore)
    ) {
      bestTemplate = {
        relevantIndices,
        currentMatchCount,
        missingCount,
        templateScore: template.templateScore,
        projectedScore,
      };
    }
  });

  if (!bestTemplate) {
    return null;
  }

  if (
    combinationType === "Postupka" &&
    bestTemplate.missingCount > 0
  ) {
    return null;
  }

  // Avoid weak early commitments that produce random single locks.
  if (bestTemplate.currentMatchCount < 2) {
    return null;
  }

  const isComplete =
    bestTemplate.missingCount === 0;
  const absoluteScoreSignal = isComplete
    ? dice.reduce((sum, value) => sum + value, 0)
    : bestTemplate.projectedScore;
  const maxPossibleScore =
    combinationMaxScore[combinationType];

  let canWrite = true;
  let writeState: "free" | "rewrite" =
    "free";
  let rewriteGainSignal = 0;

  if (existingScore !== undefined) {
    if (!allowRewrite) {
      canWrite = false;
    } else {
      writeState = "rewrite";

      if (maxPossibleScore <= existingScore) {
        canWrite = false;
      } else {
        rewriteGainSignal =
          absoluteScoreSignal - existingScore;
        if (isComplete && rewriteGainSignal <= 0) {
          canWrite = false;
        }
      }
    }
  }

  if (!canWrite) {
    return null;
  }

  const progressRatio =
    bestTemplate.currentMatchCount / 6;
  const writeBonus =
    writeState === "free" ? 220 : 130;
  const rewriteImprovementBonus =
    writeState === "rewrite"
      ? Math.max(0, rewriteGainSignal) * 8
      : 0;
  const categoryBonus =
    combinationPriority[combinationType] * 25;
  const completionBonus = isComplete
    ? 120
    : progressRatio * 70;
  const potentialBonus =
    Math.max(
      0,
      maxPossibleScore - absoluteScoreSignal
    ) * 1.2;

  let rollPressure = 0;
  if (typeof remainingRolls === "number") {
    if (remainingRolls <= 1) {
      rollPressure = isComplete
        ? 80
        : -bestTemplate.missingCount * 28;
    } else {
      rollPressure =
        bestTemplate.missingCount <= 2 ? 15 : 0;
    }
  }

  const evaluationScore =
    writeBonus +
    rewriteImprovementBonus +
    categoryBonus +
    absoluteScoreSignal * 5 +
    completionBonus +
    potentialBonus +
    rollPressure;

  return {
    type: combinationType,
    currentMatchCount:
      bestTemplate.currentMatchCount,
    totalRequired: 6,
    missingCount: bestTemplate.missingCount,
    isComplete,
    projectedScore:
      bestTemplate.projectedScore,
    absoluteScoreSignal,
    maxPossibleScore,
    canWrite,
    writeState,
    rewriteGainSignal,
    relevantIndices:
      bestTemplate.relevantIndices,
    evaluationScore,
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
  playModeAllowRewrite: boolean,
  remainingRolls?: number
): AIDecision {
  // Guard: validate inputs
  if (!currentDice || currentDice.length !== 6 || !playerId) {
    return {
      lockedDiceIndices: [],
      reason: "Invalid input",
    };
  }

  const playerScores = scores[playerId] || {};

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
      playModeAllowRewrite,
      remainingRolls
    );

    if (evaluated && evaluated.canWrite) {
      candidates.push(evaluated);
    }
  }

  // If no writable combinations, return empty (roll everything)
  if (candidates.length === 0) {
    return {
      lockedDiceIndices: [],
      reason: "noChange: no safe opportunity",
    };
  }

  // Opportunistic: pick the highest evaluated opportunity from current board state.
  candidates.sort((a, b) => {
    if (a.evaluationScore !== b.evaluationScore) {
      return b.evaluationScore - a.evaluationScore;
    }
    if (a.absoluteScoreSignal !== b.absoluteScoreSignal) {
      return b.absoluteScoreSignal - a.absoluteScoreSignal;
    }
    return b.currentMatchCount - a.currentMatchCount;
  });

  const best = candidates[0];

  const hasStrongProgressCandidate =
    best.currentMatchCount >= 3 &&
    best.absoluteScoreSignal >= 24;

  // No-lock safety: if candidate quality is too weak, reroll all.
  if (
    (best.missingCount > 2 &&
      !hasStrongProgressCandidate) ||
    best.relevantIndices.length < 2
  ) {
    return {
      lockedDiceIndices: [],
      reason: "noChange: opportunity too weak",
    };
  }

  const safeLockedDiceIndices =
    filterSafeLocks(
      currentDice,
      best.relevantIndices,
      best.type,
      best.isComplete
    );

  if (safeLockedDiceIndices.length === 0) {
    return {
      lockedDiceIndices: [],
      reason:
        "noChange: no safe lock candidates",
    };
  }

  return {
    lockedDiceIndices:
      safeLockedDiceIndices,
    reason: `Opportunistic ${best.type} (eval ${Math.round(best.evaluationScore)}, missing ${best.missingCount}, ${best.writeState})`,
  };
}
