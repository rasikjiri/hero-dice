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
  candidateOrder: number;
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
  safeLockedDiceIndices: number[];
  lockValues: number[];
  lockValueSum: number;
  lockMinValue: number;
  expectedNextTurnValue: number;
  evaluationBreakdown: {
    writeBonus: number;
    rewriteImprovementBonus: number;
    categoryBonus: number;
    completionBonus: number;
    potentialBonus: number;
    rollPressure: number;
    phaseAdjustment: number;
  };
  evaluationScore: number;
};

type CandidateAuditEntry = {
  candidateOrder: number;
  type: CombinationType;
  stage:
    | "evaluate-rejected"
    | "safe-rejected"
    | "direction-rejected"
    | "accepted";
  evaluationScore?: number;
  currentMatchCount?: number;
  missingCount?: number;
  relevantIndices?: number[];
  safeLockedDiceIndices?: number[];
  lockValues?: number[];
  evaluationBreakdown?: CandidateCombination["evaluationBreakdown"];
  expectedNextTurnValue?: number;
};

type PhasePolicy = {
  minTemplateMatchCount: number;
  minRelevantIndices: number;
  minSequenceDistinct: number;
  strongProgressMatch: number;
  strongProgressScore: number;
  maxMissingWithoutStrong: number;
  allowStrategicGeneralSingleton: boolean;
  strategicGeneralSingletonMinValue: number;
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
  allowSingletons: boolean,
  allowStrategicGeneralSingleton: boolean,
  strategicGeneralSingletonMinValue: number
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

  if (
    allowStrategicGeneralSingleton &&
    targetType === "Generál" &&
    normalized.length === 1
  ) {
    const onlyIndex = normalized[0];
    if (
      dice[onlyIndex] >=
      strategicGeneralSingletonMinValue
    ) {
      return normalized;
    }
  }

  // Sequence strategy is safe only for a completed 1-6 sequence.
  if (targetType === "Postupka") {
    if (hasSequence(dice)) {
      return normalized;
    }

    const lockedValues = normalized.map(
      (index) => dice[index]
    );
    const uniqueValues = new Set(lockedValues);

    // Partial sequence lock is valid only when keeping distinct values.
    if (uniqueValues.size !== lockedValues.length) {
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

  // For non-sequence strategies, keep only duplicate contributors.
  // Low-value single locks create noisy turns and weak direction.
  return normalized.filter((index) => {
    const value = dice[index];
    return (
      (proposedValueCounts[value] || 0) >= 2
    );
  });
};

const hasStrategicDirection = (
  dice: number[],
  candidate: CandidateCombination,
  phasePolicy: PhasePolicy
): boolean => {
  const safeLocks =
    candidate.safeLockedDiceIndices;

  if (
    safeLocks.length <
    phasePolicy.minRelevantIndices
  ) {
    return false;
  }

  if (candidate.type === "Postupka") {
    const distinctValues = new Set(
      safeLocks.map((index) => dice[index])
    ).size;

    return (
      candidate.isComplete ||
      distinctValues >=
        phasePolicy.minSequenceDistinct
    );
  }

  if (candidate.type === "Generál") {
    if (candidate.currentMatchCount >= 2) {
      return true;
    }

    if (
      phasePolicy.allowStrategicGeneralSingleton &&
      safeLocks.length === 1
    ) {
      return (
        dice[safeLocks[0]] >=
        phasePolicy.strategicGeneralSingletonMinValue
      );
    }

    return false;
  }

  if (
    candidate.type === "Dvojice" ||
    candidate.type === "Trojice" ||
    candidate.type === "Čtyři-dvě"
  ) {
    return candidate.currentMatchCount >= 2;
  }

  if (
    candidate.type === "Pyramida" ||
    candidate.type === "Hrozen"
  ) {
    return candidate.currentMatchCount >= 3;
  }

  return true;
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
  candidateOrder: number,
  dice: number[],
  combinationType: CombinationType,
  existingScore: number | undefined,
  allowRewrite: boolean,
  availableCategoryCount: number,
  minTemplateMatchCount: number,
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
    bestTemplate.currentMatchCount <
    minTemplateMatchCount
  ) {
    return null;
  }

  const isComplete =
    bestTemplate.missingCount === 0;

  if (
    (combinationType === "Pyramida" ||
      combinationType === "Hrozen") &&
    !isComplete
  ) {
    return null;
  }

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

  let phaseAdjustment = 0;

  if (availableCategoryCount >= 6) {
    if (bestTemplate.currentMatchCount <= 2) {
      phaseAdjustment -= 55;
    }
  } else if (availableCategoryCount <= 2) {
    // Late game: prefer taking a real direction over repeated noChange.
    if (bestTemplate.currentMatchCount <= 2) {
      phaseAdjustment += 40;
    }

    if (
      combinationType === "Generál" &&
      bestTemplate.currentMatchCount >= 1
    ) {
      phaseAdjustment += 75;
    }
  }

  if (
    combinationType === "Postupka" &&
    bestTemplate.currentMatchCount >= 4
  ) {
    phaseAdjustment += 140;
  }

  const evaluationScore =
    writeBonus +
    rewriteImprovementBonus +
    categoryBonus +
    absoluteScoreSignal * 5 +
    completionBonus +
    potentialBonus +
    rollPressure +
    phaseAdjustment;

  return {
    candidateOrder,
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
    safeLockedDiceIndices: [],
    lockValues: [],
    lockValueSum: 0,
    lockMinValue: 0,
    expectedNextTurnValue:
      bestTemplate.projectedScore,
    evaluationBreakdown: {
      writeBonus,
      rewriteImprovementBonus,
      categoryBonus,
      completionBonus,
      potentialBonus,
      rollPressure,
      phaseAdjustment,
    },
    evaluationScore,
  };
};

const getAvailableCategoryCount = (
  playerScores: Record<string, number>,
  allowRewrite: boolean
): number => {
  return combinationTypes.reduce(
    (count, combType) => {
      const categoryId =
        combinationToCategoryId[combType];
      const existingScore =
        playerScores[categoryId];

      if (existingScore === undefined) {
        return count + 1;
      }

      if (!allowRewrite) {
        return count;
      }

      if (
        combinationMaxScore[combType] >
        existingScore
      ) {
        return count + 1;
      }

      return count;
    },
    0
  );
};

const getPhasePolicy = (
  availableCategoryCount: number
): PhasePolicy => {
  if (availableCategoryCount >= 6) {
    return {
      minTemplateMatchCount: 2,
      minRelevantIndices: 2,
      minSequenceDistinct: 4,
      strongProgressMatch: 3,
      strongProgressScore: 24,
      maxMissingWithoutStrong: 2,
      allowStrategicGeneralSingleton: false,
      strategicGeneralSingletonMinValue: 5,
    };
  }

  if (availableCategoryCount >= 3) {
    return {
      minTemplateMatchCount: 2,
      minRelevantIndices: 2,
      minSequenceDistinct: 4,
      strongProgressMatch: 2,
      strongProgressScore: 18,
      maxMissingWithoutStrong: 3,
      allowStrategicGeneralSingleton: false,
      strategicGeneralSingletonMinValue: 5,
    };
  }

  return {
    minTemplateMatchCount: 1,
    minRelevantIndices: 1,
    minSequenceDistinct: 3,
    strongProgressMatch: 1,
    strongProgressScore: 12,
    maxMissingWithoutStrong: 5,
    allowStrategicGeneralSingleton: true,
    strategicGeneralSingletonMinValue: 5,
  };
};

const shouldDebugAIDecision =
  process.env.NODE_ENV !== "production";

const getCandidateStrategicStrength = (
  candidate: CandidateCombination
): number => {
  const completeBonus = candidate.isComplete
    ? 900
    : 0;

  return (
    completeBonus +
    combinationPriority[candidate.type] * 140 +
    candidate.currentMatchCount * 55 -
    candidate.missingCount * 30
  );
};

const compareCandidatesByPolicy = (
  a: CandidateCombination,
  b: CandidateCombination
): number => {
  const closeScoreWindow = 35;
  const isCloseQuality =
    Math.abs(
      a.evaluationScore - b.evaluationScore
    ) <= closeScoreWindow;

  if (isCloseQuality) {
    const strengthDiff =
      getCandidateStrategicStrength(b) -
      getCandidateStrategicStrength(a);
    if (strengthDiff !== 0) {
      return strengthDiff;
    }

    const lockCountDiff =
      b.safeLockedDiceIndices.length -
      a.safeLockedDiceIndices.length;
    if (lockCountDiff !== 0) {
      return lockCountDiff;
    }

    const expectedTurnDiff =
      b.expectedNextTurnValue -
      a.expectedNextTurnValue;
    if (expectedTurnDiff !== 0) {
      return expectedTurnDiff;
    }

    const lockValueSumDiff =
      b.lockValueSum - a.lockValueSum;
    if (lockValueSumDiff !== 0) {
      return lockValueSumDiff;
    }

    const lockMinDiff =
      b.lockMinValue - a.lockMinValue;
    if (lockMinDiff !== 0) {
      return lockMinDiff;
    }
  }

  if (a.evaluationScore !== b.evaluationScore) {
    return b.evaluationScore - a.evaluationScore;
  }

  if (
    a.absoluteScoreSignal !==
    b.absoluteScoreSignal
  ) {
    return (
      b.absoluteScoreSignal -
      a.absoluteScoreSignal
    );
  }

  if (
    a.currentMatchCount !==
    b.currentMatchCount
  ) {
    return (
      b.currentMatchCount -
      a.currentMatchCount
    );
  }

  if (a.lockValueSum !== b.lockValueSum) {
    return b.lockValueSum - a.lockValueSum;
  }

  if (a.lockMinValue !== b.lockMinValue) {
    return b.lockMinValue - a.lockMinValue;
  }

  const aKey = `${a.type}:${a.safeLockedDiceIndices.join(",")}`;
  const bKey = `${b.type}:${b.safeLockedDiceIndices.join(",")}`;
  return bKey.localeCompare(aKey);
};

const explainWhyWinnerBeats = (
  winner: CandidateCombination,
  loser: CandidateCombination
): string => {
  const closeScoreWindow = 35;
  const isCloseQuality =
    Math.abs(
      winner.evaluationScore -
        loser.evaluationScore
    ) <= closeScoreWindow;

  if (isCloseQuality) {
    const winnerStrength =
      getCandidateStrategicStrength(winner);
    const loserStrength =
      getCandidateStrategicStrength(loser);

    if (winnerStrength !== loserStrength) {
      return "higher strategic strength";
    }

    if (
      winner.safeLockedDiceIndices.length !==
      loser.safeLockedDiceIndices.length
    ) {
      return "more locked dice";
    }

    if (
      winner.expectedNextTurnValue !==
      loser.expectedNextTurnValue
    ) {
      return "higher expected next-turn value";
    }

    if (winner.lockValueSum !== loser.lockValueSum) {
      return "higher lock value sum";
    }

    if (winner.lockMinValue !== loser.lockMinValue) {
      return "higher minimum lock value";
    }
  }

  if (winner.evaluationScore !== loser.evaluationScore) {
    return "higher evaluation score";
  }

  if (
    winner.absoluteScoreSignal !==
    loser.absoluteScoreSignal
  ) {
    return "higher absolute score signal";
  }

  if (
    winner.currentMatchCount !==
    loser.currentMatchCount
  ) {
    return "higher match count";
  }

  return "deterministic key tie-break";
};

const logAIDecisionAudit = (
  dice: number[],
  remainingRolls: number | undefined,
  auditEntries: CandidateAuditEntry[],
  selected:
    | CandidateCombination
    | null,
  finalLockedDiceIndices: number[],
  rankedCandidates: CandidateCombination[]
) => {
  if (!shouldDebugAIDecision) {
    return;
  }

  console.debug("[AI Decision Audit]", {
    dice,
    remainingRolls,
    candidates: auditEntries,
    rankedCandidates: rankedCandidates.map(
      (candidate) => ({
        candidateOrder:
          candidate.candidateOrder,
        type: candidate.type,
        evaluationScore:
          candidate.evaluationScore,
        currentMatchCount:
          candidate.currentMatchCount,
        missingCount:
          candidate.missingCount,
        lockValues:
          candidate.lockValues,
        safeLockedDiceIndices:
          candidate.safeLockedDiceIndices,
        expectedNextTurnValue:
          candidate.expectedNextTurnValue,
        evaluationBreakdown:
          candidate.evaluationBreakdown,
      })
    ),
    winnerReasons: selected
      ? rankedCandidates
          .slice(1)
          .map((candidate) => ({
            againstType: candidate.type,
            reason: explainWhyWinnerBeats(
              selected,
              candidate
            ),
          }))
      : [],
    selectedCandidate: selected
      ? {
          candidateOrder:
            selected.candidateOrder,
          type: selected.type,
          evaluationScore:
            selected.evaluationScore,
          currentMatchCount:
            selected.currentMatchCount,
          missingCount:
            selected.missingCount,
          lockValues:
            selected.lockValues,
          relevantIndices:
            selected.relevantIndices,
          safeLockedDiceIndices:
            selected.safeLockedDiceIndices,
          expectedNextTurnValue:
            selected.expectedNextTurnValue,
          evaluationBreakdown:
            selected.evaluationBreakdown,
        }
      : null,
    finalLockedDiceIndices,
  });
};

const chooseBestStructuralCandidate = (
  candidates: CandidateCombination[],
  minSequenceDistinct: number
): CandidateCombination | null => {
  const structural = candidates.filter(
    (candidate) => {
      if (
        candidate.type === "Postupka"
      ) {
        return (
          candidate.safeLockedDiceIndices
            .length >= minSequenceDistinct
        );
      }

      return (
        candidate.safeLockedDiceIndices
          .length >= 2
      );
    }
  );

  if (structural.length === 0) {
    return null;
  }

  structural.sort(compareCandidatesByPolicy);

  return structural[0];
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
  const availableCategoryCount =
    getAvailableCategoryCount(
      playerScores,
      playModeAllowRewrite
    );
  const phasePolicy = getPhasePolicy(
    availableCategoryCount
  );

  // Evaluate all combinations
  const candidates: CandidateCombination[] = [];
  const candidateAudit: CandidateAuditEntry[] =
    [];

  for (const [candidateOrder, combType] of combinationTypes.entries()) {
    const categoryId =
      combinationToCategoryId[combType];

    const existingScore =
      categoryId !== undefined
        ? playerScores[categoryId]
        : undefined;

    const evaluated = evaluateCombination(
      candidateOrder,
      currentDice,
      combType,
      existingScore,
      playModeAllowRewrite,
      availableCategoryCount,
      phasePolicy.minTemplateMatchCount,
      remainingRolls
    );

    if (!evaluated || !evaluated.canWrite) {
      candidateAudit.push({
        candidateOrder,
        type: combType,
        stage: "evaluate-rejected",
      });
      continue;
    }

    const safeLockedDiceIndices =
      filterSafeLocks(
        currentDice,
        evaluated.relevantIndices,
        evaluated.type,
        evaluated.isComplete,
        phasePolicy.allowStrategicGeneralSingleton,
        phasePolicy.strategicGeneralSingletonMinValue
      );

    if (safeLockedDiceIndices.length === 0) {
      candidateAudit.push({
        candidateOrder,
        type: combType,
        stage: "safe-rejected",
        evaluationScore:
          evaluated.evaluationScore,
        currentMatchCount:
          evaluated.currentMatchCount,
        missingCount:
          evaluated.missingCount,
        relevantIndices:
          evaluated.relevantIndices,
        safeLockedDiceIndices,
        lockValues:
          safeLockedDiceIndices.map(
            (index) => currentDice[index]
          ),
        expectedNextTurnValue:
          evaluated.expectedNextTurnValue,
        evaluationBreakdown:
          evaluated.evaluationBreakdown,
      });
      continue;
    }

    const lockValues = safeLockedDiceIndices.map(
      (index) => currentDice[index]
    );
    const lockValueSum = lockValues.reduce(
      (sum, value) => sum + value,
      0
    );

    const candidateWithLocks = {
      ...evaluated,
      safeLockedDiceIndices,
      lockValues,
      lockValueSum,
      lockMinValue:
        lockValues.length > 0
          ? Math.min(...lockValues)
          : 0,
    };

    if (
      !hasStrategicDirection(
        currentDice,
        candidateWithLocks,
        phasePolicy
      )
    ) {
      candidateAudit.push({
        candidateOrder,
        type: combType,
        stage: "direction-rejected",
        evaluationScore:
          candidateWithLocks.evaluationScore,
        currentMatchCount:
          candidateWithLocks.currentMatchCount,
        missingCount:
          candidateWithLocks.missingCount,
        relevantIndices:
          candidateWithLocks.relevantIndices,
        safeLockedDiceIndices:
          candidateWithLocks.safeLockedDiceIndices,
        lockValues:
          candidateWithLocks.lockValues,
        expectedNextTurnValue:
          candidateWithLocks.expectedNextTurnValue,
        evaluationBreakdown:
          candidateWithLocks.evaluationBreakdown,
      });
      continue;
    }

    candidateAudit.push({
      candidateOrder,
      type: combType,
      stage: "accepted",
      evaluationScore:
        candidateWithLocks.evaluationScore,
      currentMatchCount:
        candidateWithLocks.currentMatchCount,
      missingCount:
        candidateWithLocks.missingCount,
      relevantIndices:
        candidateWithLocks.relevantIndices,
      safeLockedDiceIndices:
        candidateWithLocks.safeLockedDiceIndices,
      lockValues:
        candidateWithLocks.lockValues,
      expectedNextTurnValue:
        candidateWithLocks.expectedNextTurnValue,
      evaluationBreakdown:
        candidateWithLocks.evaluationBreakdown,
    });

    candidates.push(candidateWithLocks);
  }

  // If no writable combinations, return empty (roll everything)
  if (candidates.length === 0) {
    logAIDecisionAudit(
      currentDice,
      remainingRolls,
      candidateAudit,
      null,
      [],
      []
    );

    return {
      lockedDiceIndices: [],
      reason: "noChange: no safe opportunity",
    };
  }

  // Opportunistic: pick best by stable multi-criteria policy.
  candidates.sort(compareCandidatesByPolicy);

  let best = candidates[0];

  const isEarlyTurnSingleton =
    (remainingRolls ?? 0) >= 4 &&
    best.safeLockedDiceIndices.length === 1;

  if (isEarlyTurnSingleton) {
    const structuralCandidate =
      chooseBestStructuralCandidate(
        candidates,
        phasePolicy.minSequenceDistinct
      );

    if (structuralCandidate) {
      best = structuralCandidate;
    } else {
      logAIDecisionAudit(
        currentDice,
        remainingRolls,
        candidateAudit,
        null,
        [],
        candidates
      );

      return {
        lockedDiceIndices: [],
        reason:
          "noChange: singleton blocked by early-turn policy",
      };
    }
  }

  const hasStrongProgressCandidate =
    best.currentMatchCount >=
      phasePolicy.strongProgressMatch &&
    best.absoluteScoreSignal >=
      phasePolicy.strongProgressScore;

  const hasStrongSequenceDirection =
    best.type === "Postupka" &&
    best.safeLockedDiceIndices.length >=
      phasePolicy.minSequenceDistinct;

  const bestLockDistinctValues =
    new Set(
      best.safeLockedDiceIndices.map(
        (index) => currentDice[index]
      )
    ).size;

  const hasStrongGroupedDirection =
    best.safeLockedDiceIndices.length >= 3 &&
    bestLockDistinctValues === 1;

  // No-lock safety: if candidate quality is too weak, reroll all.
  if (
    (best.missingCount >
      phasePolicy.maxMissingWithoutStrong &&
      !hasStrongProgressCandidate &&
      !hasStrongSequenceDirection &&
      !hasStrongGroupedDirection) ||
    best.safeLockedDiceIndices.length <
      phasePolicy.minRelevantIndices
  ) {
    logAIDecisionAudit(
      currentDice,
      remainingRolls,
      candidateAudit,
      best,
      [],
      candidates
    );

    return {
      lockedDiceIndices: [],
      reason: "noChange: opportunity too weak",
    };
  }

  logAIDecisionAudit(
    currentDice,
    remainingRolls,
    candidateAudit,
    best,
    best.safeLockedDiceIndices,
    candidates
  );

  return {
    lockedDiceIndices:
      best.safeLockedDiceIndices,
    reason: `Opportunistic ${best.type} (eval ${Math.round(best.evaluationScore)}, missing ${best.missingCount}, ${best.writeState}, available ${availableCategoryCount})`,
  };
}
