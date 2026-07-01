/**
 * Hero Dice - AI Player Decision Logic
 * 
 * Provides decision-making for computer players when selecting dice to lock.
 * This module is pure functional - no side effects, no state mutations.
 */

import {
  detectCombination,
  PlayModeResult,
} from "./playMode";
import {
  canTargetCategoryWorkWithFixedLocks,
  type PlayModeCategoryId,
} from "./combinationValidation";

export type ScoreMap = {
  [playerId: string]: {
    [categoryId: string]: number;
  };
};

export type AITurnAction =
  | "roll"
  | "save"
  | "end_turn";

export type AIRiskLevel =
  | "low"
  | "medium"
  | "high";

export type AIDecision = {
  targetCategory: string | null;
  lockMask: boolean[];
  lockedDiceIndices: number[];
  selectedCandidateType?: string | null;
  selectedLockMask?: boolean[];
  action: AITurnAction;
  confidence: number;
  riskLevel: AIRiskLevel;
  aiScore: number;
  bestOpponentScore: number;
  endgameMode: boolean;
  scoreDelta: number;
  aiRemainingPotential: number;
  opponentRemainingPotential: number;
  requiredScoreEstimate: number;
  opponentScore: number;
  remainingCategories: number;
  riskBecauseBehind: boolean;
  saveRejectedBecauseTooLow: boolean;
  currentPlanValue: number;
  alternativePlanValue: number;
  pivotThreshold: number;
  pivotReason: string;
  reason: string;
  fallbackReason?: string;
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
  highValueBuilderGeneratedFromSingleDie?: boolean;
  highValueBuilderGeneratedFromPattern?: boolean;
  highValueBuilderPattern?: number[];
  highValueBuilderValues?: number[];
  highValueBuilderTargetCategory?: string | null;
  highValueBuilderPromotedOverNoLock?: boolean;
  seedCandidateGenerated?: boolean;
  seedTargetCategory?: string | null;
  seedAcceptedBecauseHighValue?: boolean;
  seedAcceptedBecauseStraightProgress?: boolean;
  rejectedBecauseOnlyWaitingForPairDisabled?: boolean;
  buildProgressFromSeed?: boolean;
  seedLockApplied?: boolean;
  targetPattern?: string;
  requiredDicePattern?: string[];
  currentProgress?: number;
  completionChance?: number;
  remainingRollsFit?: number;
  lockRecommendation?: string;
  minimumAcceptableScore?: number;
  playModeRiskModifier?: number;
  scoreContextModifier?: number;
  targetScorePotential?: number;
  missingPattern?: string[];
  openOptionsScore?: number;
  openOptions?: OpenOptionSummary[];
  scoreboardFilteredOptions?: number;
  rejectedBecauseTooNarrow?: boolean;
  selectedBecauseMultiTargetPotential?: boolean;
  remainingRollsOpenStrategyBonus?: number;
  rejectedBecauseAlreadyScored?: boolean;
  rejectedBeforeStrategy?: boolean;
  categoryRejectedBecauseTooLow?: boolean;
  earlyGeneralRejected?: boolean;
  earlyGamePenalty?: number;
  rewriteAllowed?: boolean;
  diceValuePolicy?: string;
  playModeRiskProfile?: string;
  lowValuePenaltyApplied?: boolean;
  preLockViabilityChecked?: boolean;
  projectedMaxScoreFromLock?: number;
  lockRejectedBecauseBelowMinimumPotential?: boolean;
  lowTriplePenaltyApplied?: boolean;
  lowTripleAcceptedReason?: string;
  lowTripleExceptionReason?: string | null;
  structuralLowBaseRejected?: boolean;
  rejectedBecauseWeakStructuralSeed?: boolean;
  seedLockRejectedBeforeBuilderMerge?: boolean;
  structuralTargetCategory?: string | null;
  oneFiveFallbackAttempted?: boolean;
  oneFiveFallbackBlocked?: boolean;
  targetSpecificLockBuilderUsed?: string | null;
  targetProgressBeforeRoll?: number;
  targetProgressAfterRoll?: number;
  noProgressReevaluationTriggered?: boolean;
  rejectedBeforeLockBecauseNotWritable?: boolean;
  rejectedSingleValueHeuristic?: boolean;
  fallbackOneFiveEligible?: boolean;
  strategyScore?: number;
  strategyBreakdown?: StrategyScoreBreakdown;
  candidateDice?: number[];
  candidateCombinationFromGameValidator?:
    | PlayModeResult
    | null;
  candidateCombinationCategoryId?: string | null;
  rejectedBecauseNoCombination?: boolean;
  rejectedBecauseIncompatibleWithFixedLocks?: boolean;
  rejectedBecauseFullLockWithoutValidCombination?: boolean;
  selectedCandidateValidationResult?:
    | "accepted"
    | "risk"
    | "rejected";
  validationReason?: string;
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

type LegalPathsAnalysis = {
  liveTargetCategories: string[];
  deadTargetCategories: string[];
  legalPathsFlexibilityScore: number;
  lockKillsAllPaths: boolean;
  lockPreservesPrimaryPath: boolean;
  primaryPathBlocked: boolean;
  alternativePathsAvailable: boolean;
};

type StrategyScoreBreakdown = {
  baseScoreValue: number;
  expectedScoreValue: number;
  targetPatternBonus: number;
  progressBonus: number;
  completionProbability: number;
  remainingRollsModifier: number;
  fixedLocksCompatibility: number;
  categoryAvailability: number;
  scoreContextModifier: number;
  riskModifier: number;
  endgameModifier: number;
  rewriteModifier: number;
  combinationBias: number;
  singletonPenalty: number;
  oneFiveFallbackPenalty: number;
  minimumAcceptableScorePenalty: number;
  openOptionsScore: number;
  remainingRollsOpenStrategyBonus: number;
  tooNarrowPenalty: number;
  lowValuePenalty: number;
  earlyGamePenalty: number;
  detectedCombinationModifier: number;
  legalPathsFlexibilityScore: number;
};

type OpenOptionSummary = {
  type: CombinationType;
  targetCategory: string;
  targetPattern: string;
  currentProgress: number;
  completionChance: number;
  scorePotential: number;
  missingPattern: string[];
  remainingRollsFit: number;
  optionScore: number;
};

type CandidateAuditEntry = {
  candidateOrder: number;
  type: CombinationType;
  highValueBuilderGeneratedFromSingleDie?: boolean;
  highValueBuilderGeneratedFromPattern?: boolean;
  highValueBuilderPattern?: number[];
  highValueBuilderValues?: number[];
  highValueBuilderTargetCategory?: string | null;
  highValueBuilderPromotedOverNoLock?: boolean;
  seedCandidateGenerated?: boolean;
  seedTargetCategory?: string | null;
  seedAcceptedBecauseHighValue?: boolean;
  seedAcceptedBecauseStraightProgress?: boolean;
  rejectedBecauseOnlyWaitingForPairDisabled?: boolean;
  buildProgressFromSeed?: boolean;
  seedLockApplied?: boolean;
  stage:
    | "evaluate-rejected"
    | "safe-rejected"
    | "direction-rejected"
    | "validation-rejected"
    | "accepted";
  candidateDice?: number[];
  candidateCombinationFromGameValidator?:
    | PlayModeResult
    | null;
  candidateCombinationCategoryId?: string | null;
  rejectedBecauseNoCombination?: boolean;
  rejectedBecauseIncompatibleWithFixedLocks?: boolean;
  rejectedBecauseFullLockWithoutValidCombination?: boolean;
  selectedCandidateValidationResult?:
    | "accepted"
    | "risk"
    | "rejected";
  validationReason?: string;
  targetPattern?: string;
  requiredDicePattern?: string[];
  currentProgress?: number;
  completionChance?: number;
  remainingRollsFit?: number;
  lockRecommendation?: string;
  rejectedSingleValueHeuristic?: boolean;
  fallbackOneFiveEligible?: boolean;
  minimumAcceptableScore?: number;
  playModeRiskModifier?: number;
  scoreContextModifier?: number;
  targetScorePotential?: number;
  missingPattern?: string[];
  openOptionsScore?: number;
  openOptions?: OpenOptionSummary[];
  scoreboardFilteredOptions?: number;
  rejectedBecauseTooNarrow?: boolean;
  selectedBecauseMultiTargetPotential?: boolean;
  remainingRollsOpenStrategyBonus?: number;
  rejectedBecauseAlreadyScored?: boolean;
  rejectedBeforeStrategy?: boolean;
  categoryRejectedBecauseTooLow?: boolean;
  earlyGeneralRejected?: boolean;
  earlyGamePenalty?: number;
  rewriteAllowed?: boolean;
  diceValuePolicy?: string;
  playModeRiskProfile?: string;
  lowValuePenaltyApplied?: boolean;
  preLockViabilityChecked?: boolean;
  projectedMaxScoreFromLock?: number;
  lockRejectedBecauseBelowMinimumPotential?: boolean;
  lowTriplePenaltyApplied?: boolean;
  lowTripleAcceptedReason?: string;
  lowTripleExceptionReason?: string | null;
  structuralLowBaseRejected?: boolean;
  rejectedBecauseWeakStructuralSeed?: boolean;
  seedLockRejectedBeforeBuilderMerge?: boolean;
  structuralTargetCategory?: string | null;
  oneFiveFallbackAttempted?: boolean;
  oneFiveFallbackBlocked?: boolean;
  targetSpecificLockBuilderUsed?: string | null;
  targetProgressBeforeRoll?: number;
  targetProgressAfterRoll?: number;
  noProgressReevaluationTriggered?: boolean;
  rejectedBeforeLockBecauseNotWritable?: boolean;
  evaluationScore?: number;
  strategyScore?: number;
  strategyBreakdown?: StrategyScoreBreakdown;
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

const buildMissingPattern = (
  requirements: TemplateRequirement[],
  lockCounts: Record<number, number>
): string[] => {
  return requirements
    .map(({ value, count }) => {
      const missing =
        count - (lockCounts[value] || 0);
      return missing > 0
        ? `${value}x${missing}`
        : null;
    })
    .filter((entry): entry is string => entry !== null);
};

const getLockCounts = (
  dice: number[],
  lockIndices: number[]
): Record<number, number> => {
  const counts: Record<number, number> = {};

  lockIndices.forEach((index) => {
    const value = dice[index];
    counts[value] = (counts[value] || 0) + 1;
  });

  return counts;
};

const supportsTemplateWithLock = (
  lockCounts: Record<number, number>,
  requirements: TemplateRequirement[]
): boolean => {
  for (const [valueText, count] of Object.entries(lockCounts)) {
    const value = Number(valueText);
    const requirementCount =
      requirements.find(
        (requirement) =>
          requirement.value === value
      )?.count ?? 0;

    if (count > requirementCount) {
      return false;
    }
  }

  return true;
};

const enrichLockForOpenStrategy = (
  dice: number[],
  lockIndices: number[],
  targetType: CombinationType,
  remainingRolls: number | undefined
): number[] => {
  const normalized = uniqueSortedIndices(
    lockIndices
  );

  if ((remainingRolls ?? 0) < 2) {
    return normalized;
  }

  if (targetType === "Postupka") {
    return normalized;
  }

  const result = new Set(normalized);
  const candidates = dice
    .map((value, index) => ({
      value,
      index,
    }))
    .filter(
      ({ index, value }) =>
        !result.has(index) && value >= 4
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
    result.add(index);
  }

  return Array.from(result).sort(
    (a, b) => a - b
  );
};

const isStructuralTarget = (
  targetType: CombinationType
): boolean =>
  targetType === "Pyramida" ||
  targetType === "Hrozen" ||
  targetType === "Postupka";

const buildPyramidLocks = (
  dice: number[],
  lockIndices: number[]
): number[] => {
  const seed = uniqueSortedIndices(lockIndices);
  const preferred = dice
    .map((value, index) => ({ value, index }))
    .filter(({ value }) => value >= 4)
    .sort((a, b) => {
      if (b.value !== a.value) {
        return b.value - a.value;
      }
      return a.index - b.index;
    })
    .map(({ index }) => index);

  const merged = uniqueSortedIndices([
    ...seed,
    ...preferred,
  ]);

  return merged.slice(0, 5);
};

const buildHrozenLocks = (
  dice: number[],
  lockIndices: number[]
): number[] => {
  const seed = uniqueSortedIndices(lockIndices);
  const preferred = dice
    .map((value, index) => ({ value, index }))
    .filter(({ value }) => value >= 4)
    .sort((a, b) => {
      if (a.value !== b.value) {
        return a.value - b.value;
      }
      return a.index - b.index;
    })
    .map(({ index }) => index);

  const merged = uniqueSortedIndices([
    ...seed,
    ...preferred,
  ]);

  return merged.slice(0, 5);
};

const buildStraightLocks = (
  dice: number[],
  lockIndices: number[]
): number[] => {
  const valueToIndex = new Map<number, number>();

  dice.forEach((value, index) => {
    if (!valueToIndex.has(value)) {
      valueToIndex.set(value, index);
    }
  });

  const distinctValues = Array.from(
    valueToIndex.keys()
  ).sort((a, b) => a - b);

  let bestRun: number[] = [];
  let currentRun: number[] = [];

  for (const value of distinctValues) {
    if (
      currentRun.length === 0 ||
      value === currentRun[currentRun.length - 1] + 1
    ) {
      currentRun.push(value);
    } else {
      if (currentRun.length > bestRun.length) {
        bestRun = [...currentRun];
      }
      currentRun = [value];
    }
  }

  if (currentRun.length > bestRun.length) {
    bestRun = [...currentRun];
  }

  if (bestRun.length >= 2) {
    return bestRun
      .map((value) => valueToIndex.get(value))
      .filter(
        (index): index is number =>
          typeof index === "number"
      )
      .sort((a, b) => a - b);
  }

  const seed = uniqueSortedIndices(lockIndices)
    .map((index) => ({
      index,
      value: dice[index],
    }))
    .filter(({ value }) => value >= 2 && value <= 6)
    .sort((a, b) => b.value - a.value)
    .map(({ index }) => index);

  return seed.slice(0, 3);
};

const getTargetSpecificLocks = (
  targetType: CombinationType,
  dice: number[],
  lockIndices: number[]
): {
  locks: number[];
  builderUsed: string | null;
} => {
  if (targetType === "Pyramida") {
    return {
      locks: buildPyramidLocks(dice, lockIndices),
      builderUsed: "buildPyramidLocks",
    };
  }

  if (targetType === "Hrozen") {
    return {
      locks: buildHrozenLocks(dice, lockIndices),
      builderUsed: "buildHrozenLocks",
    };
  }

  if (targetType === "Postupka") {
    return {
      locks: buildStraightLocks(dice, lockIndices),
      builderUsed: "buildStraightLocks",
    };
  }

  return {
    locks: lockIndices,
    builderUsed: null,
  };
};

const evaluateOpenOptionsForLock = (
  dice: number[],
  lockIndices: number[],
  availableTargetCategories: string[],
  lockCompatibility: Record<string, boolean>,
  playerScores: Record<string, number>,
  remainingRolls: number | undefined,
  scoreContextModifier: number
): {
  openOptionsScore: number;
  openOptions: OpenOptionSummary[];
  scoreboardFilteredOptions: number;
  rejectedBecauseTooNarrow: boolean;
  selectedBecauseMultiTargetPotential: boolean;
  remainingRollsOpenStrategyBonus: number;
} => {
  const lockCounts = getLockCounts(
    dice,
    lockIndices
  );
  const openOptions: OpenOptionSummary[] = [];
  let scoreboardFilteredOptions = 0;

  for (const combType of combinationTypes) {
    const targetCategory =
      combinationToCategoryId[combType];

    if (
      !availableTargetCategories.includes(
        targetCategory
      )
    ) {
      scoreboardFilteredOptions += 1;
      continue;
    }

    if (!lockCompatibility[targetCategory]) {
      scoreboardFilteredOptions += 1;
      continue;
    }

    const templates =
      getTemplatesForCombination(combType);
    let bestOption: OpenOptionSummary | null = null;

    for (const template of templates) {
      if (
        !supportsTemplateWithLock(
          lockCounts,
          template.requirements
        )
      ) {
        continue;
      }

      const currentProgress =
        template.requirements.reduce(
          (sum, requirement) =>
            sum +
            Math.min(
              requirement.count,
              lockCounts[requirement.value] || 0
            ),
          0
        );

      const missingPattern =
        buildMissingPattern(
          template.requirements,
          lockCounts
        );

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

      const option: OpenOptionSummary = {
        type: combType,
        targetCategory,
        targetPattern: `${combType}:${template.requirements
          .map(
            (requirement) =>
              `${requirement.value}x${requirement.count}`
          )
          .join("|")}`,
        currentProgress,
        completionChance,
        scorePotential: template.templateScore,
        missingPattern,
        remainingRollsFit,
        optionScore,
      };

      if (
        bestOption === null ||
        option.optionScore > bestOption.optionScore
      ) {
        bestOption = option;
      }
    }

    if (bestOption !== null) {
      openOptions.push(bestOption);
    }
  }

  openOptions.sort(
    (a, b) => b.optionScore - a.optionScore
  );
  const topOpenOptions = openOptions.slice(0, 4);
  const remainingRollsOpenStrategyBonus =
    (remainingRolls ?? 0) >= 2
      ? topOpenOptions.length * 36
      : topOpenOptions.length * 12;
  const openOptionsScore =
    topOpenOptions.reduce(
      (sum, option) => sum + option.optionScore,
      0
    ) + remainingRollsOpenStrategyBonus;
  const rejectedBecauseTooNarrow =
    (remainingRolls ?? 0) >= 2 &&
    topOpenOptions.length <= 1;
  const selectedBecauseMultiTargetPotential =
    topOpenOptions.length >= 2;

  return {
    openOptionsScore,
    openOptions: topOpenOptions,
    scoreboardFilteredOptions,
    rejectedBecauseTooNarrow,
    selectedBecauseMultiTargetPotential,
    remainingRollsOpenStrategyBonus,
  };
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
    if (
      phasePolicy.allowStrategicGeneralSingleton &&
      safeLocks.length >= 1 &&
      candidate.lockValues.every(
        (v) => v >= phasePolicy.strategicGeneralSingletonMinValue
      )
    ) {
      return true;
    }
    return candidate.currentMatchCount >= 2;
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

const isGroupedSeedTarget = (
  targetType: CombinationType
) =>
  targetType === "Dvojice" ||
  targetType === "Trojice" ||
  targetType === "Čtyři-dvě" ||
  targetType === "Pyramida" ||
  targetType === "Hrozen";

const hasHighValueSeedPattern = (
  lockValues: number[]
) => {
  if (lockValues.length === 0) {
    return false;
  }

  const distinct = new Set(lockValues);
  const values = Array.from(distinct);
  const hasSingleHighSeed =
    lockValues.length === 1 &&
    (lockValues[0] === 6 ||
      lockValues[0] === 5 ||
      lockValues[0] === 4);

  const hasTwoValueHighSeed =
    (distinct.has(6) && distinct.has(5)) ||
    (distinct.has(6) && distinct.has(4)) ||
    (distinct.has(5) && distinct.has(4));

  const hasThreeValueHighSeed =
    distinct.has(4) &&
    distinct.has(5) &&
    distinct.has(6);

  return (
    hasSingleHighSeed ||
    hasTwoValueHighSeed ||
    hasThreeValueHighSeed ||
    values.some((value) => value >= 5)
  );
};

const getLongestConsecutiveRun = (
  values: number[]
) => {
  if (values.length === 0) {
    return 0;
  }

  const uniqueSorted = Array.from(
    new Set(values)
  ).sort((a, b) => a - b);

  let longest = 1;
  let current = 1;

  for (let index = 1; index < uniqueSorted.length; index += 1) {
    if (
      uniqueSorted[index] ===
      uniqueSorted[index - 1] + 1
    ) {
      current += 1;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }

  return longest;
};

const canBuildProgressFromSeed = (
  candidate: CandidateCombination,
  remainingRolls: number | undefined
) => {
  if ((remainingRolls ?? 0) <= 0) {
    return {
      seedAcceptedBecauseHighValue: false,
      seedAcceptedBecauseStraightProgress: false,
      buildProgressFromSeed: false,
    };
  }

  const lockValues = candidate.lockValues;
  const seedAcceptedBecauseHighValue =
    isGroupedSeedTarget(candidate.type) &&
    hasHighValueSeedPattern(lockValues);

  const seedAcceptedBecauseStraightProgress =
    candidate.type === "Postupka" &&
    getLongestConsecutiveRun(lockValues) >= 3;

  return {
    seedAcceptedBecauseHighValue,
    seedAcceptedBecauseStraightProgress,
    buildProgressFromSeed:
      seedAcceptedBecauseHighValue ||
      seedAcceptedBecauseStraightProgress,
  };
};

const getValueCounts = (
  values: number[]
) => {
  const counts: Record<number, number> = {};

  values.forEach((value) => {
    counts[value] = (counts[value] ?? 0) + 1;
  });

  return counts;
};

const isLowPairStartCandidate = (
  candidate: CandidateCombination
) => {
  if (candidate.type !== "Dvojice") {
    return false;
  }

  if (candidate.safeLockedDiceIndices.length < 2) {
    return false;
  }

  const lockValues = candidate.lockValues;
  const lowOnly =
    lockValues.length > 0 &&
    lockValues.every((value) => value <= 3);

  if (!lowOnly) {
    return false;
  }

  const counts = getValueCounts(lockValues);

  return Object.values(counts).some(
    (count) => count >= 2
  );
};

const isLowTripleStartCandidate = (
  candidate: CandidateCombination
) => {
  if (candidate.type !== "Trojice") {
    return false;
  }

  if (candidate.safeLockedDiceIndices.length < 3) {
    return false;
  }

  const lockValues = candidate.lockValues;
  const lowOnly =
    lockValues.length > 0 &&
    lockValues.every((value) => value <= 3);

  if (!lowOnly) {
    return false;
  }

  const counts = getValueCounts(lockValues);

  return Object.values(counts).some(
    (count) => count >= 3
  );
};

const isLowValueCompletionSupplementCandidate = (
  candidate: CandidateCombination
) => {
  if (candidate.isComplete) {
    return false;
  }

  if (candidate.safeLockedDiceIndices.length === 0) {
    return false;
  }

  if (
    candidate.type !== "Dvojice" &&
    candidate.type !== "Trojice" &&
    candidate.type !== "Čtyři-dvě" &&
    candidate.type !== "Postupka"
  ) {
    return false;
  }

  return candidate.lockValues.some(
    (value) => value <= 3
  );
};

const isPreferredHighValueBuilderCandidate = (
  candidate: CandidateCombination,
  availableTargetCategories: string[],
  lockCompatibility: Record<string, boolean>
) => {
  const targetCategory =
    combinationToCategoryId[candidate.type] ?? null;

  if (
    targetCategory === null ||
    !availableTargetCategories.includes(
      targetCategory
    ) ||
    !lockCompatibility[targetCategory]
  ) {
    return false;
  }

  if (candidate.safeLockedDiceIndices.length === 0) {
    return false;
  }

  const hasHighValueLocks =
    candidate.lockValues.some(
      (value) => value >= 4
    );

  if (!hasHighValueLocks) {
    return false;
  }

  return (
    !!candidate.seedAcceptedBecauseHighValue ||
    !!candidate.highValueBuilderGeneratedFromSingleDie ||
    !!candidate.highValueBuilderGeneratedFromPattern
  );
};

const selectHighValueBuilderTargetCategory = (
  availableTargetCategories: string[],
  lockCompatibility: Record<string, boolean>
) => {
  const priority = [
    "general",
    "ctyri_dva",
    "trojce",
    "dvojce",
    "pyramida",
    "hrozen",
    "postupka",
  ];

  for (const categoryId of priority) {
    if (
      availableTargetCategories.includes(
        categoryId
      ) &&
      lockCompatibility[categoryId]
    ) {
      return categoryId;
    }
  }

  return null;
};

const HIGH_VALUE_BUILDER_PATTERNS: number[][] = [
  [6],
  [5],
  [4],
  [6, 5],
  [6, 4],
  [5, 4],
  [6, 5, 4],
];

const getHighValuePatternIndices = (
  pattern: number[],
  currentDice: number[],
  fixedLocks: boolean[]
): number[] | null => {
  const used = new Set<number>();
  const indices: number[] = [];

  for (const value of pattern) {
    const index = currentDice.findIndex(
      (dieValue, dieIndex) =>
        dieValue === value &&
        !fixedLocks[dieIndex] &&
        !used.has(dieIndex)
    );

    if (index < 0) {
      return null;
    }

    used.add(index);
    indices.push(index);
  }

  return indices.sort((a, b) => a - b);
};

const createExplicitHighValueBuilderCandidates = (
  candidates: CandidateCombination[],
  currentDice: number[],
  fixedLocks: boolean[],
  remainingRolls: number | undefined,
  availableTargetCategories: string[],
  lockCompatibility: Record<string, boolean>
): CandidateCombination[] => {
  if ((remainingRolls ?? 0) <= 0) {
    return [];
  }

  const targetCategory =
    selectHighValueBuilderTargetCategory(
      availableTargetCategories,
      lockCompatibility
    );

  if (!targetCategory) {
    return [];
  }

  const baseCandidate =
    candidates.find(
      (candidate) =>
        combinationToCategoryId[
          candidate.type
        ] === targetCategory
    ) ?? null;

  if (!baseCandidate) {
    return [];
  }

  const generated: CandidateCombination[] = [];

  for (const pattern of HIGH_VALUE_BUILDER_PATTERNS) {
    const lockIndices = getHighValuePatternIndices(
      pattern,
      currentDice,
      fixedLocks
    );

    if (!lockIndices) {
      continue;
    }

    const lockValues = lockIndices.map(
      (index) => currentDice[index]
    );
    const lockValueSum = lockValues.reduce(
      (sum, value) => sum + value,
      0
    );

    generated.push({
      ...baseCandidate,
      highValueBuilderGeneratedFromSingleDie:
        pattern.length === 1,
      highValueBuilderGeneratedFromPattern: true,
      highValueBuilderPattern: [...pattern],
      highValueBuilderValues: lockValues,
      highValueBuilderTargetCategory: targetCategory,
      highValueBuilderPromotedOverNoLock: false,
      seedCandidateGenerated: true,
      seedTargetCategory: targetCategory,
      seedAcceptedBecauseHighValue: true,
      seedAcceptedBecauseStraightProgress: false,
      buildProgressFromSeed: true,
      safeLockedDiceIndices: lockIndices,
      lockValues,
      lockValueSum,
      lockMinValue:
        lockValues.length > 0
          ? Math.min(...lockValues)
          : 0,
      lockRecommendation: lockValues.join(","),
      currentProgress: lockValues.length,
      completionChance: Number(
        Math.max(
          0,
          Math.min(1, lockValues.length / 6)
        ).toFixed(2)
      ),
      remainingRollsFit: Math.max(
        0,
        (remainingRolls ?? 0) - 1
      ),
      expectedNextTurnValue: Math.max(
        baseCandidate.expectedNextTurnValue,
        lockValueSum
      ),
      validationReason:
        "high-value-pattern-builder-generated",
    });
  }

  return generated;
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
        requirements: TemplateRequirement[];
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
        requirements: template.requirements,
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
  const targetPattern = `${combinationType}:${bestTemplate.requirements
    .map(({ value, count }) => `${value}x${count}`)
    .join("|")}`;
  const requiredDicePattern =
    bestTemplate.requirements.map(
      ({ value, count }) => `${value}x${count}`
    );
  const completionChance = Number(
    Math.max(0, Math.min(1, bestTemplate.currentMatchCount / 6)).toFixed(2)
  );
  const remainingRollsFit =
    typeof remainingRolls === "number"
      ? Math.max(
          0,
          remainingRolls - Math.max(0, bestTemplate.missingCount - 1)
        )
      : 0;

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
    absoluteScoreSignal * 2 +
    completionBonus +
    potentialBonus +
    rollPressure +
    phaseAdjustment;

  return {
    candidateOrder,
    type: combinationType,
    targetPattern,
    requiredDicePattern,
    currentProgress: bestTemplate.currentMatchCount,
    completionChance,
    remainingRollsFit,
    lockRecommendation: "derive-after-validation",
    rejectedSingleValueHeuristic: false,
    fallbackOneFiveEligible: false,
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

const getProjectedMaxScoreFromLock = (
  candidate: CandidateCombination,
  remainingRolls: number | undefined
): number => {
  const unlockedSlots =
    Math.max(
      0,
      6 - candidate.safeLockedDiceIndices.length
    );

  if ((remainingRolls ?? 0) <= 0) {
    return Math.min(
      candidate.maxPossibleScore,
      candidate.absoluteScoreSignal
    );
  }

  const perSlotPotential =
    (remainingRolls ?? 0) >= 2 ? 6 : 5;

  const projected =
    candidate.lockValueSum +
    unlockedSlots * perSlotPotential;

  return Math.min(
    candidate.maxPossibleScore,
    projected
  );
};

const getMinimumAcceptableScore = (
  remainingRolls: number | undefined,
  context: MatchContext
): number =>
  Math.max(
    8,
    context.endgameMode
      ? 8
      : (remainingRolls ?? 0) >= 3
      ? 14
      : 10,
    context.riskBecauseBehind ? 10 : 0
  );

const isLowTripleBase = (
  candidate: CandidateCombination
): boolean => {
  if (
    candidate.safeLockedDiceIndices.length < 3 ||
    candidate.lockValues.length < 3
  ) {
    return false;
  }

  const counts = candidate.lockValues.reduce(
    (acc, value) => {
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    },
    {} as Record<number, number>
  );

  return Object.entries(counts).some(
    ([valueText, count]) =>
      Number(valueText) <= 3 && count >= 3
  );
};

const shouldRejectLowTriplePreLock = (
  candidate: CandidateCombination,
  projectedMaxScoreFromLock: number,
  minimumAcceptableScore: number,
  remainingRolls: number | undefined,
  context: MatchContext,
  availableCategoryCount: number
): {
  reject: boolean;
  lowTriplePenaltyApplied: boolean;
  lowTripleAcceptedReason: string;
} => {
  const lowTriple = isLowTripleBase(candidate);

  if (!lowTriple) {
    return {
      reject: false,
      lowTriplePenaltyApplied: false,
      lowTripleAcceptedReason: "not-low-triple-base",
    };
  }

  const isEarlyOrMidGame =
    !context.endgameMode &&
    availableCategoryCount >= 3;
  const hasRiskWindow =
    (remainingRolls ?? 0) >= 2;
  const lowTriplePenaltyApplied =
    isEarlyOrMidGame && hasRiskWindow;

  const lowTripleExceptionReason =
    context.endgameMode
      ? "endgame"
      : (remainingRolls ?? 0) <= 1
      ? "last-roll"
      : availableCategoryCount <= 1
      ? "no-better-legal-option"
      : null;

  if (lowTripleExceptionReason) {
    return {
      reject: false,
      lowTriplePenaltyApplied,
      lowTripleAcceptedReason: lowTripleExceptionReason,
    };
  }

  if (projectedMaxScoreFromLock < minimumAcceptableScore) {
    return {
      reject: true,
      lowTriplePenaltyApplied: true,
      lowTripleAcceptedReason:
        "rejected-below-minimum-potential",
    };
  }

  return {
    reject: false,
    lowTriplePenaltyApplied,
    lowTripleAcceptedReason:
      "accepted-meets-minimum-potential",
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

/**
 * Analyze legal paths remaining after this lock selection
 * Returns flexibility score: higher = more legal paths available
 */
const computeLegalPathsForCandidate = (
  candidate: CandidateCombination,
  availableTargetCategories: string[],
  lockCompatibility: Record<string, boolean>,
  targetType: CombinationType,
  previousTargetCategory: string | null
): LegalPathsAnalysis => {
  const candidateTargetCategory =
    combinationToCategoryId[targetType] ?? null;

  // Check which categories remain writable after this lock
  const liveTargetCategories: string[] = [];
  const deadTargetCategories: string[] = [];

  for (const categoryId of availableTargetCategories) {
    // If this lock is for structural target, check compatibility
    const isStructural =
      targetType === "Pyramida" ||
      targetType === "Hrozen" ||
      targetType === "Postupka";

    // After this lock is applied, can we still write to this category?
    if (
      isStructural &&
      categoryId !== candidateTargetCategory
    ) {
      // Structural locks (Pyramida, Hrozen, Postupka) are specific
      // Check if this category remains compatible
      if (lockCompatibility[categoryId]) {
        liveTargetCategories.push(categoryId);
      } else {
        deadTargetCategories.push(categoryId);
      }
    } else if (!isStructural) {
      // Non-structural locks are more flexible
      if (lockCompatibility[categoryId]) {
        liveTargetCategories.push(categoryId);
      } else {
        deadTargetCategories.push(categoryId);
      }
    } else {
      // Structural lock for this category - keep it alive
      liveTargetCategories.push(categoryId);
    }
  }

  const lockKillsAllPaths = liveTargetCategories.length === 0;
  const lockPreservesPrimaryPath =
    candidateTargetCategory === null ||
    liveTargetCategories.includes(candidateTargetCategory);
  const primaryPathBlocked =
    previousTargetCategory !== null &&
    deadTargetCategories.includes(previousTargetCategory);
  const alternativePathsAvailable =
    liveTargetCategories.length >= 2;

  // Flexibility score: based on number of remaining legal paths
  // Penalty if we killed the primary path
  let flexibilityScore =
    liveTargetCategories.length * 85 -
    deadTargetCategories.length * 120;

  if (primaryPathBlocked && previousTargetCategory) {
    flexibilityScore -= 180;
  }

  if (lockKillsAllPaths) {
    flexibilityScore = -500; // Critical: lock creates dead end
  }

  if (alternativePathsAvailable) {
    flexibilityScore += 60; // Bonus for flexibility
  }

  return {
    liveTargetCategories,
    deadTargetCategories,
    legalPathsFlexibilityScore: flexibilityScore,
    lockKillsAllPaths,
    lockPreservesPrimaryPath,
    primaryPathBlocked,
    alternativePathsAvailable,
  };
};

const getCandidateStrategyScore = (
  candidate: CandidateCombination,
  remainingRolls: number | undefined,
  context: MatchContext,
  playerScores: Record<string, number>,
  legalMoveContext: AILegalMoveContext,
  allowRewrite: boolean,
  previousTargetCategory: string | null = null
): {
  total: number;
  breakdown: StrategyScoreBreakdown;
} => {
  const categoryId =
    combinationToCategoryId[candidate.type];
  const existingScore =
    categoryId !== undefined
      ? playerScores[categoryId]
      : undefined;

  // Compute legal paths after this lock
  const legalPathsAnalysis =
    computeLegalPathsForCandidate(
      candidate,
      legalMoveContext.availableTargetCategories,
      legalMoveContext.lockCompatibility,
      candidate.type,
      previousTargetCategory
    );

  const baseScoreValue = candidate.maxPossibleScore;
  const expectedScoreValue =
    candidate.projectedScore;
  const targetPatternBonus =
    (candidate.currentProgress ?? candidate.currentMatchCount) * 48 +
    (candidate.isComplete ? 120 : 0);
  const progressBonus =
    (candidate.currentProgress ?? candidate.currentMatchCount) * 22;
  const completionProbability =
    candidate.completionChance ??
    Number(
      Math.max(0, Math.min(1, candidate.currentMatchCount / 6)).toFixed(2)
    );
  const remainingRollsModifier =
    typeof remainingRolls === "number"
      ? Math.max(0, remainingRolls) *
        Math.max(0, 6 - candidate.missingCount) * 3
      : 0;

  const fixedLocksCompatibility =
    candidate.safeLockedDiceIndices.length * 10 +
    (candidate.safeLockedDiceIndices.length === 6
      ? 60
      : 0);

  const categoryAvailability =
    existingScore === undefined
      ? 140
      : allowRewrite
      ? Math.max(
          0,
          candidate.maxPossibleScore - existingScore
        ) * 2 + 40
      : -120;

  const scoreContextModifier =
    (candidate.currentProgress ?? candidate.currentMatchCount) * 14 +
    candidate.safeLockedDiceIndices.length * 4 +
    (candidate.isComplete ? 70 : 0);

  const minimumAcceptableScore =
    candidate.minimumAcceptableScore ??
    getMinimumAcceptableScore(
      remainingRolls,
      context
    );

  const minimumAcceptableScorePenalty =
    candidate.absoluteScoreSignal <
      minimumAcceptableScore &&
    !context.endgameMode &&
    (remainingRolls ?? 0) >= 2
      ? -140
      : 0;

  const riskModifier = context.endgameMode
    ? candidate.isComplete
      ? 110
      : -candidate.missingCount * 24
    : context.riskBecauseBehind
    ? candidate.missingCount <= 2
      ? 60
      : -20
    : 0;

  const endgameModifier = context.endgameMode
    ? candidate.isComplete
      ? 80
      : -candidate.missingCount * 8
    : 0;

  const rewriteModifier =
    candidate.writeState === "rewrite"
      ? Math.max(0, candidate.rewriteGainSignal) * 6 +
        20
      : 0;

  const combinationBias =
    combinationPriority[candidate.type] * 80 +
    candidate.projectedScore * 6 +
    (candidate.remainingRollsFit ?? 0) * 12;

  const singletonPenalty =
    candidate.safeLockedDiceIndices.length === 1
      ? context.endgameMode || (remainingRolls ?? 0) <= 1
        ? -20
        : -150
      : 0;

  const oneFiveFallbackPenalty =
    candidate.safeLockedDiceIndices.length === 1 &&
    candidate.lockValues.length === 1 &&
    (candidate.lockValues[0] === 1 ||
      candidate.lockValues[0] === 5)
      ? context.endgameMode || (remainingRolls ?? 0) <= 1
        ? 0
        : -120
      : 0;

  const lowValuePenalty =
    candidate.lowValuePenaltyApplied
      ? candidate.playModeRiskProfile === "ambitious"
        ? -520
        : candidate.playModeRiskProfile === "balanced"
        ? -120
        : -30
      : 0;

  const earlyGamePenalty =
    candidate.earlyGamePenalty ?? 0;

  const openOptionsScore =
    candidate.openOptionsScore ?? 0;
  const remainingRollsOpenStrategyBonus =
    candidate.remainingRollsOpenStrategyBonus ?? 0;
  const tooNarrowPenalty =
    candidate.rejectedBecauseTooNarrow
      ? -180
      : 0;

  const detectedCombinationModifier =
    legalMoveContext.currentCombination &&
    combinationToCategoryId[
      legalMoveContext.currentCombination
        .combination as CombinationType
    ] === categoryId
      ? legalMoveContext.writableSaveCandidate.canSave
        ? 120
        : -260
      : 0;

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
    openOptionsScore +
    remainingRollsOpenStrategyBonus +
    tooNarrowPenalty +
    detectedCombinationModifier +
    legalPathsAnalysis.legalPathsFlexibilityScore;

  return {
    total,
    breakdown: {
      baseScoreValue,
      expectedScoreValue,
      targetPatternBonus,
      progressBonus,
      completionProbability,
      remainingRollsModifier,
      fixedLocksCompatibility,
      categoryAvailability,
      scoreContextModifier,
      riskModifier,
      endgameModifier,
      rewriteModifier,
      combinationBias,
      singletonPenalty,
      oneFiveFallbackPenalty,
      lowValuePenalty,
      earlyGamePenalty,
      minimumAcceptableScorePenalty,
      openOptionsScore,
      remainingRollsOpenStrategyBonus,
      tooNarrowPenalty,
      detectedCombinationModifier,
      legalPathsFlexibilityScore:
        legalPathsAnalysis.legalPathsFlexibilityScore,
    },
  };
};

const compareCandidatesByPolicy = (
  a: CandidateCombination,
  b: CandidateCombination
): number => {
  const strategyDiff =
    (b.strategyScore ?? b.evaluationScore) -
    (a.strategyScore ?? a.evaluationScore);

  if (strategyDiff !== 0) {
    return strategyDiff;
  }

  const closeScoreWindow = 35;
  const isCloseQuality =
    Math.abs(
      (a.strategyScore ?? a.evaluationScore) -
        (b.strategyScore ?? b.evaluationScore)
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

  if ((a.strategyScore ?? 0) !== (b.strategyScore ?? 0)) {
    return (b.strategyScore ?? 0) - (a.strategyScore ?? 0);
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
      (winner.strategyScore ??
        winner.evaluationScore) -
        (loser.strategyScore ??
          loser.evaluationScore)
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

  if (
    (winner.strategyScore ?? winner.evaluationScore) !==
    (loser.strategyScore ?? loser.evaluationScore)
  ) {
    return "higher strategy score";
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
  matchContext: MatchContext,
  auditEntries: CandidateAuditEntry[],
  selected:
    | CandidateCombination
    | null,
  finalLockedDiceIndices: number[],
  rankedCandidates: CandidateCombination[],
  extra?: Record<string, unknown>
) => {
  if (!shouldDebugAIDecision) {
    return;
  }

  console.debug("[AI Decision Audit]", {
    dice,
    remainingRolls,
    matchContext,
    candidates: auditEntries,
    generatedCombinationCandidates:
      rankedCandidates.map((candidate) => ({
        candidateOrder:
          candidate.candidateOrder,
        type: candidate.type,
        seedCandidateGenerated:
          candidate.seedCandidateGenerated,
        seedTargetCategory:
          candidate.seedTargetCategory,
        seedAcceptedBecauseHighValue:
          candidate.seedAcceptedBecauseHighValue,
        seedAcceptedBecauseStraightProgress:
          candidate.seedAcceptedBecauseStraightProgress,
        rejectedBecauseOnlyWaitingForPairDisabled:
          candidate.rejectedBecauseOnlyWaitingForPairDisabled,
        buildProgressFromSeed:
          candidate.buildProgressFromSeed,
        seedLockApplied:
          candidate.seedLockApplied,
        targetPattern:
          candidate.targetPattern,
        requiredDicePattern:
          candidate.requiredDicePattern,
        currentProgress:
          candidate.currentProgress,
        completionChance:
          candidate.completionChance,
        remainingRollsFit:
          candidate.remainingRollsFit,
        lockRecommendation:
          candidate.lockRecommendation,
        minimumAcceptableScore:
          candidate.minimumAcceptableScore,
        playModeRiskModifier:
          candidate.playModeRiskModifier,
        scoreContextModifier:
          candidate.scoreContextModifier,
        targetScorePotential:
          candidate.targetScorePotential,
        missingPattern:
          candidate.missingPattern,
        openOptionsScore:
          candidate.openOptionsScore,
        openOptions:
          candidate.openOptions,
        scoreboardFilteredOptions:
          candidate.scoreboardFilteredOptions,
        rejectedBecauseTooNarrow:
          candidate.rejectedBecauseTooNarrow,
        selectedBecauseMultiTargetPotential:
          candidate.selectedBecauseMultiTargetPotential,
        remainingRollsOpenStrategyBonus:
          candidate.remainingRollsOpenStrategyBonus,
        rejectedBeforeStrategy:
          candidate.rejectedBeforeStrategy,
        categoryRejectedBecauseTooLow:
          candidate.categoryRejectedBecauseTooLow,
        earlyGeneralRejected:
          candidate.earlyGeneralRejected,
        earlyGamePenalty:
          candidate.earlyGamePenalty,
        rejectedSingleValueHeuristic:
          candidate.rejectedSingleValueHeuristic,
        fallbackOneFiveEligible:
          candidate.fallbackOneFiveEligible,
        rejectedBecauseAlreadyScored:
          candidate.rejectedBecauseAlreadyScored,
        rewriteAllowed:
          candidate.rewriteAllowed,
        diceValuePolicy:
          candidate.diceValuePolicy,
        playModeRiskProfile:
          candidate.playModeRiskProfile,
        lowValuePenaltyApplied:
          candidate.lowValuePenaltyApplied,
        lowTripleExceptionReason:
          candidate.lowTripleExceptionReason,
        structuralLowBaseRejected:
          candidate.structuralLowBaseRejected,
        rejectedBecauseWeakStructuralSeed:
          candidate.rejectedBecauseWeakStructuralSeed,
        seedLockRejectedBeforeBuilderMerge:
          candidate.seedLockRejectedBeforeBuilderMerge,
        structuralTargetCategory:
          candidate.structuralTargetCategory,
        oneFiveFallbackAttempted:
          candidate.oneFiveFallbackAttempted,
        oneFiveFallbackBlocked:
          candidate.oneFiveFallbackBlocked,
        targetSpecificLockBuilderUsed:
          candidate.targetSpecificLockBuilderUsed,
        targetProgressBeforeRoll:
          candidate.targetProgressBeforeRoll,
        targetProgressAfterRoll:
          candidate.targetProgressAfterRoll,
        noProgressReevaluationTriggered:
          candidate.noProgressReevaluationTriggered,
        rejectedBeforeLockBecauseNotWritable:
          candidate.rejectedBeforeLockBecauseNotWritable,
        candidateDice:
          candidate.candidateDice,
        candidateCombinationFromGameValidator:
          candidate.candidateCombinationFromGameValidator,
        candidateCombinationCategoryId:
          candidate.candidateCombinationCategoryId,
        rejectedBecauseNoCombination:
          candidate.rejectedBecauseNoCombination,
        rejectedBecauseIncompatibleWithFixedLocks:
          candidate.rejectedBecauseIncompatibleWithFixedLocks,
        rejectedBecauseFullLockWithoutValidCombination:
          candidate.rejectedBecauseFullLockWithoutValidCombination,
        selectedCandidateValidationResult:
          candidate.selectedCandidateValidationResult,
        validationReason:
          candidate.validationReason,
        strategyScore:
          candidate.strategyScore,
        strategyBreakdown:
          candidate.strategyBreakdown,
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
      })),
    rankedCandidates: rankedCandidates.map(
      (candidate) => ({
        candidateOrder:
          candidate.candidateOrder,
        type: candidate.type,
        seedCandidateGenerated:
          candidate.seedCandidateGenerated,
        seedTargetCategory:
          candidate.seedTargetCategory,
        seedAcceptedBecauseHighValue:
          candidate.seedAcceptedBecauseHighValue,
        seedAcceptedBecauseStraightProgress:
          candidate.seedAcceptedBecauseStraightProgress,
        rejectedBecauseOnlyWaitingForPairDisabled:
          candidate.rejectedBecauseOnlyWaitingForPairDisabled,
        buildProgressFromSeed:
          candidate.buildProgressFromSeed,
        seedLockApplied:
          candidate.seedLockApplied,
        targetPattern:
          candidate.targetPattern,
        requiredDicePattern:
          candidate.requiredDicePattern,
        currentProgress:
          candidate.currentProgress,
        completionChance:
          candidate.completionChance,
        remainingRollsFit:
          candidate.remainingRollsFit,
        lockRecommendation:
          candidate.lockRecommendation,
        minimumAcceptableScore:
          candidate.minimumAcceptableScore,
        playModeRiskModifier:
          candidate.playModeRiskModifier,
        scoreContextModifier:
          candidate.scoreContextModifier,
        targetScorePotential:
          candidate.targetScorePotential,
        missingPattern:
          candidate.missingPattern,
        openOptionsScore:
          candidate.openOptionsScore,
        openOptions:
          candidate.openOptions,
        scoreboardFilteredOptions:
          candidate.scoreboardFilteredOptions,
        rejectedBecauseTooNarrow:
          candidate.rejectedBecauseTooNarrow,
        selectedBecauseMultiTargetPotential:
          candidate.selectedBecauseMultiTargetPotential,
        remainingRollsOpenStrategyBonus:
          candidate.remainingRollsOpenStrategyBonus,
        rejectedBeforeStrategy:
          candidate.rejectedBeforeStrategy,
        categoryRejectedBecauseTooLow:
          candidate.categoryRejectedBecauseTooLow,
        earlyGeneralRejected:
          candidate.earlyGeneralRejected,
        earlyGamePenalty:
          candidate.earlyGamePenalty,
        rejectedSingleValueHeuristic:
          candidate.rejectedSingleValueHeuristic,
        fallbackOneFiveEligible:
          candidate.fallbackOneFiveEligible,
        rejectedBecauseAlreadyScored:
          candidate.rejectedBecauseAlreadyScored,
        rewriteAllowed:
          candidate.rewriteAllowed,
        diceValuePolicy:
          candidate.diceValuePolicy,
        playModeRiskProfile:
          candidate.playModeRiskProfile,
        lowValuePenaltyApplied:
          candidate.lowValuePenaltyApplied,
        lowTripleExceptionReason:
          candidate.lowTripleExceptionReason,
        structuralLowBaseRejected:
          candidate.structuralLowBaseRejected,
        rejectedBecauseWeakStructuralSeed:
          candidate.rejectedBecauseWeakStructuralSeed,
        seedLockRejectedBeforeBuilderMerge:
          candidate.seedLockRejectedBeforeBuilderMerge,
        structuralTargetCategory:
          candidate.structuralTargetCategory,
        oneFiveFallbackAttempted:
          candidate.oneFiveFallbackAttempted,
        oneFiveFallbackBlocked:
          candidate.oneFiveFallbackBlocked,
        targetSpecificLockBuilderUsed:
          candidate.targetSpecificLockBuilderUsed,
        targetProgressBeforeRoll:
          candidate.targetProgressBeforeRoll,
        targetProgressAfterRoll:
          candidate.targetProgressAfterRoll,
        noProgressReevaluationTriggered:
          candidate.noProgressReevaluationTriggered,
        rejectedBeforeLockBecauseNotWritable:
          candidate.rejectedBeforeLockBecauseNotWritable,
        candidateDice:
          candidate.candidateDice,
        candidateCombinationFromGameValidator:
          candidate.candidateCombinationFromGameValidator,
        candidateCombinationCategoryId:
          candidate.candidateCombinationCategoryId,
        rejectedBecauseNoCombination:
          candidate.rejectedBecauseNoCombination,
        rejectedBecauseIncompatibleWithFixedLocks:
          candidate.rejectedBecauseIncompatibleWithFixedLocks,
        rejectedBecauseFullLockWithoutValidCombination:
          candidate.rejectedBecauseFullLockWithoutValidCombination,
        selectedCandidateValidationResult:
          candidate.selectedCandidateValidationResult,
        validationReason:
          candidate.validationReason,
        strategyScore:
          candidate.strategyScore,
        strategyBreakdown:
          candidate.strategyBreakdown,
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
      ...extra,
    selectedTargetPattern: selected?.targetPattern ?? null,
    rejectedSingleValueHeuristic:
      rankedCandidates.some(
        (candidate) =>
          !!candidate.rejectedSingleValueHeuristic
      ),
    rejectedBecauseBetterCombinationExists:
      selected !== null &&
      rankedCandidates.some(
        (candidate) =>
          candidate !== selected &&
          (candidate.strategyScore ??
            candidate.evaluationScore) >
            (selected.strategyScore ??
              selected.evaluationScore)
      ),
    fallbackOneFiveUsed:
      selected?.fallbackOneFiveEligible ?? false,
    fallbackOneFiveReason: selected
      ? selected.fallbackOneFiveEligible
        ? "one-five-singleton-only-as-fallback"
        : "not-used"
      : "not-selected",
    rejectedBecauseAlreadyScored:
      auditEntries.some(
        (entry) => entry.rejectedBecauseAlreadyScored
      ),
    rejectedBeforeLockBecauseAlreadyScored:
      auditEntries.some(
        (entry) => entry.rejectedBecauseAlreadyScored
      ),
    rejectedBeforeLockBecauseNotWritable:
      auditEntries.some(
        (entry) =>
          entry.rejectedBeforeLockBecauseNotWritable
      ),
    rejectedBeforeStrategy:
      auditEntries.some(
        (entry) => entry.rejectedBeforeStrategy
      ),
    earlyGeneralRejected:
      auditEntries.some(
        (entry) => entry.earlyGeneralRejected
      ),
    categoryRejectedBecauseTooLow:
      auditEntries.some(
        (entry) =>
          entry.categoryRejectedBecauseTooLow
      ),
    requiredScoreEstimate:
      matchContext.requiredScoreEstimate,
    lowValuePenaltyApplied:
      selected?.lowValuePenaltyApplied ?? false,
    selectedTargetIsWritable:
      (extra?.selectedTargetIsWritable as
        | boolean
        | undefined) ?? (selected ? true : false),
    lockBlockedBecauseTargetNotWritable:
      (extra?.lockBlockedBecauseTargetNotWritable as
        | boolean
        | undefined) ?? false,
    lowScoreRejectedButFallbackExists:
      (extra?.lowScoreRejectedButFallbackExists as
        | boolean
        | undefined) ?? false,
    lowScoreAcceptedBecauseNoBetterLegalOption:
      (extra?.lowScoreAcceptedBecauseNoBetterLegalOption as
        | boolean
        | undefined) ?? false,
    saveCandidateDetected:
      (extra?.saveCandidateDetected as
        | boolean
        | undefined) ??
      (selected?.isComplete ?? false),
    saveCandidateWritable:
      (extra?.saveCandidateWritable as
        | boolean
        | undefined) ??
      (selected
        ? selected.selectedCandidateValidationResult !==
          "rejected"
        : false),
    saveCandidateScore:
      (extra?.saveCandidateScore as
        | number
        | undefined) ??
      (selected?.absoluteScoreSignal ?? 0),
    saveBlockedReason:
      (extra?.saveBlockedReason as
        | string
        | null
        | undefined) ?? null,
    strategyFilterBlockedSave:
      (extra?.strategyFilterBlockedSave as
        | boolean
        | undefined) ?? false,
    rollbackSimplifiedPolicyUsed:
      (extra?.rollbackSimplifiedPolicyUsed as
        | boolean
        | undefined) ?? false,
    openOptionsScore:
      selected?.openOptionsScore ?? 0,
    openOptions:
      selected?.openOptions ?? [],
    scoreboardFilteredOptions:
      selected?.scoreboardFilteredOptions ?? 0,
    rejectedBecauseTooNarrow:
      selected?.rejectedBecauseTooNarrow ?? false,
    selectedBecauseMultiTargetPotential:
      selected?.selectedBecauseMultiTargetPotential ?? false,
    remainingRollsOpenStrategyBonus:
      selected?.remainingRollsOpenStrategyBonus ?? 0,
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
          seedCandidateGenerated:
            selected.seedCandidateGenerated,
          seedTargetCategory:
            selected.seedTargetCategory,
          seedAcceptedBecauseHighValue:
            selected.seedAcceptedBecauseHighValue,
          seedAcceptedBecauseStraightProgress:
            selected.seedAcceptedBecauseStraightProgress,
          rejectedBecauseOnlyWaitingForPairDisabled:
            selected.rejectedBecauseOnlyWaitingForPairDisabled,
          buildProgressFromSeed:
            selected.buildProgressFromSeed,
          seedLockApplied:
            selected.seedLockApplied,
          targetPattern: selected.targetPattern,
          requiredDicePattern:
            selected.requiredDicePattern,
          currentProgress:
            selected.currentProgress,
          completionChance:
            selected.completionChance,
          remainingRollsFit:
            selected.remainingRollsFit,
          lockRecommendation:
            selected.lockRecommendation,
          minimumAcceptableScore:
            selected.minimumAcceptableScore,
          playModeRiskModifier:
            selected.playModeRiskModifier,
          scoreContextModifier:
            selected.scoreContextModifier,
          targetScorePotential:
            selected.targetScorePotential,
          missingPattern:
            selected.missingPattern,
          openOptionsScore:
            selected.openOptionsScore,
          openOptions:
            selected.openOptions,
          scoreboardFilteredOptions:
            selected.scoreboardFilteredOptions,
          rejectedBecauseTooNarrow:
            selected.rejectedBecauseTooNarrow,
          selectedBecauseMultiTargetPotential:
            selected.selectedBecauseMultiTargetPotential,
          remainingRollsOpenStrategyBonus:
            selected.remainingRollsOpenStrategyBonus,
          rejectedBeforeStrategy:
            selected.rejectedBeforeStrategy,
          categoryRejectedBecauseTooLow:
            selected.categoryRejectedBecauseTooLow,
          earlyGeneralRejected:
            selected.earlyGeneralRejected,
          earlyGamePenalty:
            selected.earlyGamePenalty,
          rejectedSingleValueHeuristic:
            selected.rejectedSingleValueHeuristic,
          fallbackOneFiveEligible:
            selected.fallbackOneFiveEligible,
          rejectedBecauseAlreadyScored:
            selected.rejectedBecauseAlreadyScored,
          rewriteAllowed:
            selected.rewriteAllowed,
          diceValuePolicy:
            selected.diceValuePolicy,
          playModeRiskProfile:
            selected.playModeRiskProfile,
          lowValuePenaltyApplied:
            selected.lowValuePenaltyApplied,
          lowTripleExceptionReason:
            selected.lowTripleExceptionReason,
          structuralLowBaseRejected:
            selected.structuralLowBaseRejected,
          rejectedBecauseWeakStructuralSeed:
            selected.rejectedBecauseWeakStructuralSeed,
          seedLockRejectedBeforeBuilderMerge:
            selected.seedLockRejectedBeforeBuilderMerge,
          structuralTargetCategory:
            selected.structuralTargetCategory,
          oneFiveFallbackAttempted:
            selected.oneFiveFallbackAttempted,
          oneFiveFallbackBlocked:
            selected.oneFiveFallbackBlocked,
          targetSpecificLockBuilderUsed:
            selected.targetSpecificLockBuilderUsed,
          targetProgressBeforeRoll:
            selected.targetProgressBeforeRoll,
          targetProgressAfterRoll:
            selected.targetProgressAfterRoll,
          noProgressReevaluationTriggered:
            selected.noProgressReevaluationTriggered,
          rejectedBeforeLockBecauseNotWritable:
            selected.rejectedBeforeLockBecauseNotWritable,
          candidateDice:
            selected.candidateDice,
          candidateCombinationFromGameValidator:
            selected.candidateCombinationFromGameValidator,
          candidateCombinationCategoryId:
            selected.candidateCombinationCategoryId,
          rejectedBecauseNoCombination:
            selected.rejectedBecauseNoCombination,
          rejectedBecauseIncompatibleWithFixedLocks:
            selected.rejectedBecauseIncompatibleWithFixedLocks,
          rejectedBecauseFullLockWithoutValidCombination:
            selected.rejectedBecauseFullLockWithoutValidCombination,
          selectedCandidateValidationResult:
            selected.selectedCandidateValidationResult,
          validationReason:
            selected.validationReason,
          strategyScore:
            selected.strategyScore,
          strategyBreakdown:
            selected.strategyBreakdown,
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
    selectedCombinationCandidate: selected
      ? {
          type: selected.type,
          targetPattern: selected.targetPattern,
          strategyScore: selected.strategyScore,
          openOptionsScore:
            selected.openOptionsScore,
          lockRecommendation:
            selected.lockRecommendation,
        }
      : null,
    finalLockedDiceIndices,
  });
};

const toLockMask = (
  lockedDiceIndices: number[]
): boolean[] => {
  const mask = [
    false,
    false,
    false,
    false,
    false,
    false,
  ];

  lockedDiceIndices.forEach((index) => {
    if (index >= 0 && index < 6) {
      mask[index] = true;
    }
  });

  return mask;
};

const getPlayerTotalScore = (
  playerScores: Record<string, number>
) =>
  Object.values(playerScores).reduce(
    (sum, score) => sum + score,
    0
  );

const getBestOpponentScore = (
  scores: ScoreMap,
  playerId: string
) =>
  Object.entries(scores).reduce(
    (best, [candidateId, candidateScores]) => {
      if (candidateId === playerId) {
        return best;
      }

      const candidateTotal = getPlayerTotalScore(
        candidateScores
      );

      return Math.max(best, candidateTotal);
    },
    0
  );

const getRemainingPotential = (
  playerScores: Record<string, number>,
  allowRewrite: boolean
) =>
  combinationTypes.reduce((sum, combType) => {
    const categoryId =
      combinationToCategoryId[combType];
    const maxCategoryScore =
      combinationMaxScore[combType];
    const existingScore = playerScores[categoryId];

    if (existingScore === undefined) {
      return sum + maxCategoryScore;
    }

    if (!allowRewrite) {
      return sum;
    }

    return (
      sum +
      Math.max(
        0,
        maxCategoryScore - existingScore
      )
    );
  }, 0);

const getBestOpponentContext = (
  scores: ScoreMap,
  playerId: string,
  allowRewrite: boolean
) =>
  Object.entries(scores).reduce(
    (
      best,
      [candidateId, candidateScores]
    ) => {
      if (candidateId === playerId) {
        return best;
      }

      const totalScore =
        getPlayerTotalScore(candidateScores);
      const remainingPotential =
        getRemainingPotential(
          candidateScores,
          allowRewrite
        );
      const projectedTotal =
        totalScore + remainingPotential;

      return {
        bestOpponentScore: Math.max(
          best.bestOpponentScore,
          totalScore
        ),
        opponentRemainingPotential: Math.max(
          best.opponentRemainingPotential,
          remainingPotential
        ),
        bestOpponentProjectedTotal: Math.max(
          best.bestOpponentProjectedTotal,
          projectedTotal
        ),
      };
    },
    {
      bestOpponentScore: 0,
      opponentRemainingPotential: 0,
      bestOpponentProjectedTotal: 0,
    }
  );

const getUndefinedCategoryIds = (
  playerScores: Record<string, number>
) =>
  combinationTypes
    .map((combType) =>
      combinationToCategoryId[combType]
    )
    .filter(
      (categoryId) =>
        playerScores[categoryId] === undefined
    );

const getCombinationTypeByCategoryId = (
  categoryId: string
): CombinationType | null => {
  for (const combType of combinationTypes) {
    if (
      combinationToCategoryId[combType] ===
      categoryId
    ) {
      return combType;
    }
  }

  return null;
};

type MatchContext = {
  aiScore: number;
  bestOpponentScore: number;
  aiRemainingPotential: number;
  opponentRemainingPotential: number;
  endgameMode: boolean;
  scoreDelta: number;
  requiredScoreEstimate: number;
  opponentScore: number;
  remainingCategories: number;
  riskBecauseBehind: boolean;
};

type AIPivotContext = {
  previousTargetCategory: string | null;
  fixedLocks: boolean[];
  legalMoveContext: AILegalMoveContext;
};

export type WritableSaveCandidate = {
  canSave: boolean;
  fallbackReason: string | null;
  latestCombination: PlayModeResult | null;
  categoryId: string | null;
  score: number | null;
};

export type AILegalMoveContext = {
  currentCombination: PlayModeResult | null;
  writableSaveCandidate: WritableSaveCandidate;
  availableTargetCategories: string[];
  lockCompatibility: Record<string, boolean>;
  rewriteAllowed: boolean;
  fixedLocks: boolean[];
  remainingRolls?: number;
};

type AIActionDecision = {
  action: AITurnAction;
  saveRejectedBecauseTooLow: boolean;
  lowScoreRejectedButFallbackExists: boolean;
  lowScoreAcceptedBecauseNoBetterLegalOption: boolean;
  saveBlockedReason: string | null;
  strategyFilterBlockedSave: boolean;
  saveChosenOverRiskReason: string | null;
  riskChosenOverSaveReason: string | null;
};

const getPlayModeRiskProfile = (
  remainingRolls: number | undefined,
  context: MatchContext
): "ambitious" | "balanced" | "pragmatic" => {
  if (
    !context.endgameMode &&
    (remainingRolls ?? 0) >= 3
  ) {
    return "ambitious";
  }

  if (
    context.endgameMode ||
    (remainingRolls ?? 0) <= 1
  ) {
    return "pragmatic";
  }

  return "balanced";
};

const getDiceValuePolicy = (
  riskProfile: "ambitious" | "balanced" | "pragmatic"
): string => {
  if (riskProfile === "ambitious") {
    return "prefer-6-5-4-penalize-1-2-3";
  }

  if (riskProfile === "pragmatic") {
    return "accept-pragmatic-low-values";
  }

  return "high-values-preferred-balanced";
};

const toRiskLevel = (
  remainingRolls: number | undefined,
  context: MatchContext
): AIRiskLevel => {
  if (context.endgameMode && context.riskBecauseBehind) {
    return "high";
  }

  if (
    context.riskBecauseBehind &&
    (remainingRolls ?? 0) >= 2
  ) {
    return "high";
  }

  if (
    context.endgameMode &&
    context.requiredScoreEstimate > 0
  ) {
    return "medium";
  }

  if ((remainingRolls ?? 0) >= 3) {
    return "high";
  }

  if ((remainingRolls ?? 0) === 2) {
    return "medium";
  }

  return "low";
};

const toConfidence = (
  candidate: CandidateCombination
): number => {
  const raw =
    candidate.currentMatchCount / 6 +
    (candidate.isComplete ? 0.35 : 0);

  return Number(
    Math.max(0, Math.min(1, raw)).toFixed(2)
  );
};

const decideAction = (
  candidate: CandidateCombination,
  remainingRolls: number | undefined,
  context: MatchContext,
  playerScores: Record<string, number>,
  hasBetterLegalAlternative: boolean,
  isLastLegalOption: boolean
): AIActionDecision => {
  if (
    candidate.isComplete
  ) {
    return {
      action: "save",
      saveRejectedBecauseTooLow: false,
      lowScoreRejectedButFallbackExists: false,
      lowScoreAcceptedBecauseNoBetterLegalOption:
        !hasBetterLegalAlternative || isLastLegalOption,
      saveBlockedReason: null,
      strategyFilterBlockedSave: false,
      saveChosenOverRiskReason:
        !hasBetterLegalAlternative || isLastLegalOption
          ? "complete-and-no-better-legal-alternative"
          : "complete-candidate-selected-by-strategy",
      riskChosenOverSaveReason: null,
    };
  }

  return {
    action:
      (remainingRolls ?? 0) > 0
        ? "roll"
        : "end_turn",
    saveRejectedBecauseTooLow: false,
    lowScoreRejectedButFallbackExists: false,
    lowScoreAcceptedBecauseNoBetterLegalOption: false,
    saveBlockedReason: null,
    strategyFilterBlockedSave: false,
    saveChosenOverRiskReason: null,
    riskChosenOverSaveReason:
      (remainingRolls ?? 0) > 0
        ? "incomplete-candidate-reroll-for-upside"
        : "no-rolls-left-incomplete-candidate",
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
  remainingRolls?: number,
  strategyContext?: Partial<AIPivotContext>
): AIDecision {
  // Guard: validate inputs
  if (!currentDice || currentDice.length !== 6 || !playerId) {
    return {
      targetCategory: null,
      lockMask: [
        false,
        false,
        false,
        false,
        false,
        false,
      ],
      lockedDiceIndices: [],
      action: "end_turn",
      confidence: 0,
      riskLevel: "low",
      aiScore: 0,
      bestOpponentScore: 0,
      endgameMode: false,
      scoreDelta: 0,
      aiRemainingPotential: 0,
      opponentRemainingPotential: 0,
      requiredScoreEstimate: 0,
      opponentScore: 0,
      remainingCategories: 0,
      riskBecauseBehind: false,
      saveRejectedBecauseTooLow: false,
      currentPlanValue: 0,
      alternativePlanValue: 0,
      pivotThreshold: 0,
      pivotReason: "invalid-input",
      reason: "Invalid input",
      fallbackReason: "invalid-input",
    };
  }

  const fixedLocks =
    strategyContext?.fixedLocks?.length === 6
      ? [...strategyContext.fixedLocks]
      : [
          false,
          false,
          false,
          false,
          false,
          false,
        ];

  const legalMoveContext =
    strategyContext?.legalMoveContext ?? null;

  const previousTargetCategory =
    strategyContext?.previousTargetCategory ??
    null;

  if (!legalMoveContext) {
    return {
      targetCategory: null,
      lockMask: [
        false,
        false,
        false,
        false,
        false,
        false,
      ],
      lockedDiceIndices: [],
      action: (remainingRolls ?? 0) > 0 ? "roll" : "end_turn",
      confidence: 0,
      riskLevel: toRiskLevel(
        remainingRolls,
        {
          aiScore: 0,
          bestOpponentScore: 0,
          aiRemainingPotential: 0,
          opponentRemainingPotential: 0,
          endgameMode: false,
          scoreDelta: 0,
          requiredScoreEstimate: 0,
          opponentScore: 0,
          remainingCategories: 0,
          riskBecauseBehind: false,
        }
      ),
      aiScore: 0,
      bestOpponentScore: 0,
      endgameMode: false,
      scoreDelta: 0,
      aiRemainingPotential: 0,
      opponentRemainingPotential: 0,
      requiredScoreEstimate: 0,
      opponentScore: 0,
      remainingCategories: 0,
      riskBecauseBehind: false,
      saveRejectedBecauseTooLow: false,
      currentPlanValue: 0,
      alternativePlanValue: 0,
      pivotThreshold: 0,
      pivotReason: "missing-legal-move-context",
      reason: "Missing legal move context",
      fallbackReason: "missing-legal-move-context",
    };
  }

  const playerScores = scores[playerId] || {};
  const ownScore = getPlayerTotalScore(
    playerScores
  );
  const aiRemainingPotential =
    getRemainingPotential(
      playerScores,
      playModeAllowRewrite
    );

  const opponentContext =
    getBestOpponentContext(
      scores,
      playerId,
      playModeAllowRewrite
    );

  const opponentScore =
    opponentContext.bestOpponentScore;
  const bestOpponentProjectedTotal =
    opponentContext.bestOpponentProjectedTotal;

  const availableCategoryCount =
    getAvailableCategoryCount(
      playerScores,
      playModeAllowRewrite
    );

  const requiredScoreEstimate =
    availableCategoryCount > 0
      ? Math.max(
          0,
          Math.ceil(
            (bestOpponentProjectedTotal - ownScore) /
              availableCategoryCount
          )
        )
      : Math.max(
          0,
          bestOpponentProjectedTotal - ownScore
        );

  const scoreDelta = ownScore - opponentScore;

  const undefinedCategoryIds =
    getUndefinedCategoryIds(playerScores);
  const forcedEndgameCategoryId =
    undefinedCategoryIds.length === 1
      ? undefinedCategoryIds[0]
      : null;

  const matchContext: MatchContext = {
    aiScore: ownScore,
    bestOpponentScore: opponentScore,
    aiRemainingPotential,
    opponentRemainingPotential:
      opponentContext.opponentRemainingPotential,
    endgameMode: availableCategoryCount <= 2,
    scoreDelta,
    requiredScoreEstimate,
    opponentScore,
    remainingCategories: availableCategoryCount,
    riskBecauseBehind: scoreDelta < 0,
  };

  const phasePolicy = getPhasePolicy(
    availableCategoryCount
  );

  const playModeRiskProfile =
    getPlayModeRiskProfile(
      remainingRolls,
      matchContext
    );
  const diceValuePolicy =
    getDiceValuePolicy(playModeRiskProfile);

  const earlyGameWindow =
    !matchContext.endgameMode &&
    availableCategoryCount >= 3;

  const preStrategyCategoryReason =
    new Map<string, string>();

  const availableTargetCategories =
    legalMoveContext.availableTargetCategories;

  const lockCompatibility =
    legalMoveContext.lockCompatibility;

  for (const categoryId of availableTargetCategories) {
    if (!lockCompatibility[categoryId]) {
      preStrategyCategoryReason.set(
        categoryId,
        "incompatible-with-fixed-locks"
      );
    }
  }

  const auditPolicyContext = {
    availableTargetCategoriesBeforeDecision:
      availableTargetCategories,
    availableTargetCategories,
    rewriteAllowed: playModeAllowRewrite,
    diceValuePolicy,
    playModeRiskProfile,
    requiredScoreEstimate,
    strategyStartedAfterScoreAnalysis: true,
    selectedTargetAfterScoreboardFilter: null as string | null,
  };

  // Evaluate all combinations
  let candidates: CandidateCombination[] = [];
  const candidateAudit: CandidateAuditEntry[] =
    [];

  for (const [candidateOrder, combType] of combinationTypes.entries()) {
    const categoryId =
      combinationToCategoryId[combType];

    if (!availableTargetCategories.includes(categoryId)) {
      const rejectionReason =
        preStrategyCategoryReason.get(
          categoryId
        ) ?? "category-filtered-before-strategy";

      candidateAudit.push({
        candidateOrder,
        type: combType,
        stage: "evaluate-rejected",
        rejectedBeforeStrategy: true,
        rejectedBecauseAlreadyScored:
          rejectionReason ===
          "already-scored-and-rewrite-disabled",
        categoryRejectedBecauseTooLow: false,
        rewriteAllowed: playModeAllowRewrite,
        diceValuePolicy,
        playModeRiskProfile,
        validationReason: rejectionReason,
      });
      continue;
    }

    if (!lockCompatibility[categoryId]) {
      candidateAudit.push({
        candidateOrder,
        type: combType,
        stage: "direction-rejected",
        rejectedBeforeLockBecauseNotWritable: true,
        rewriteAllowed: playModeAllowRewrite,
        diceValuePolicy,
        playModeRiskProfile,
        validationReason:
          "incompatible-with-fixed-locks-before-lock",
      });
      continue;
    }

    // Pyramida/Hrozen: skip unless they are among last 2 remaining categories
    // Exception: if last <=2 categories remain, allow only if writing this score would beat opponent
    if (
      (combType === "Pyramida" || combType === "Hrozen") &&
      availableCategoryCount > 2
    ) {
      candidateAudit.push({
        candidateOrder,
        type: combType,
        stage: "evaluate-rejected",
        rejectedBeforeStrategy: true,
        rejectedBecauseAlreadyScored: false,
        categoryRejectedBecauseTooLow: false,
        rewriteAllowed: playModeAllowRewrite,
        diceValuePolicy,
        playModeRiskProfile,
        validationReason: "pyramida-hrozen-skipped-not-endgame",
      });
      continue;
    }

    if (
      (combType === "Pyramida" || combType === "Hrozen") &&
      availableCategoryCount <= 2
    ) {
      // Only allow if this score can help beat the opponent
      const candidateScore = currentDice.reduce((s, v) => s + v, 0);
      const projectedAiTotal = matchContext.aiScore + candidateScore;
      if (projectedAiTotal <= matchContext.bestOpponentScore) {
        candidateAudit.push({
          candidateOrder,
          type: combType,
          stage: "evaluate-rejected",
          rejectedBeforeStrategy: true,
          rejectedBecauseAlreadyScored: false,
          categoryRejectedBecauseTooLow: true,
          rewriteAllowed: playModeAllowRewrite,
          diceValuePolicy,
          playModeRiskProfile,
          validationReason: "pyramida-hrozen-endgame-score-insufficient-to-win",
        });
        continue;
      }
    }

    const existingScore =
      categoryId !== undefined
        ? playerScores[categoryId]
        : undefined;

    const minTemplateMatchCountForType =
      (remainingRolls ?? 0) >= 2 &&
      (combType === "Dvojice" ||
        combType === "Trojice" ||
        combType === "Čtyři-dvě" ||
        combType === "Postupka")
        ? 1
        : phasePolicy.minTemplateMatchCount;

    const evaluated = evaluateCombination(
      candidateOrder,
      currentDice,
      combType,
      existingScore,
      playModeAllowRewrite,
      availableCategoryCount,
      minTemplateMatchCountForType,
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
        evaluated.isComplete
      );

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

    if (multiTargetLockedDiceIndices.length === 0) {
      const safeRejectedCombination =
        detectCombination(currentDice);

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
          multiTargetLockedDiceIndices.map(
            (index) => currentDice[index]
          ),
        expectedNextTurnValue:
          evaluated.expectedNextTurnValue,
        evaluationBreakdown:
          evaluated.evaluationBreakdown,
        candidateDice: [...currentDice],
        candidateCombinationFromGameValidator:
          safeRejectedCombination,
        candidateCombinationCategoryId:
          safeRejectedCombination
            ? combinationToCategoryId[
                safeRejectedCombination.combination as CombinationType
              ] ?? null
            : null,
        rejectedBecauseNoCombination:
          safeRejectedCombination === null,
        rejectedBecauseIncompatibleWithFixedLocks:
          false,
        rejectedBecauseFullLockWithoutValidCombination:
          false,
        selectedCandidateValidationResult:
          safeRejectedCombination === null
            ? "risk"
            : "accepted",
        targetSpecificLockBuilderUsed:
          targetSpecificLockPlan.builderUsed,
        validationReason:
          safeRejectedCombination === null
            ? "safe-lock-rejected-because-game-validator-reports-no-combination"
            : "safe-lock-rejected-before-validation",
      });
      continue;
    }

    const lockValues = multiTargetLockedDiceIndices.map(
      (index) => currentDice[index]
    );
    const lockValueSum = lockValues.reduce(
      (sum, value) => sum + value,
      0
    );

    const candidateWithLocks = {
      ...evaluated,
      safeLockedDiceIndices:
        multiTargetLockedDiceIndices,
      lockValues,
      lockValueSum,
      lockMinValue:
        lockValues.length > 0
          ? Math.min(...lockValues)
          : 0,
    };

    const legalCombination =
      legalMoveContext.currentCombination;
    const legalCombinationCategoryId =
      legalCombination
        ? combinationToCategoryId[
            legalCombination.combination as CombinationType
          ] ?? null
        : null;
    const candidateValidation = {
      candidateDice: [...currentDice],
      candidateCombinationFromGameValidator:
        legalCombinationCategoryId === categoryId
          ? legalCombination
          : null,
      candidateCombinationCategoryId:
        legalCombinationCategoryId === categoryId
          ? categoryId
          : null,
      rejectedBecauseNoCombination:
        legalCombination === null,
      rejectedBecauseIncompatibleWithFixedLocks:
        !lockCompatibility[categoryId],
      rejectedBecauseFullLockWithoutValidCombination:
        false,
      selectedCandidateValidationResult:
        legalCombination === null
          ? "risk"
          : !lockCompatibility[categoryId]
          ? "rejected"
          : "accepted" as
          | "accepted"
          | "risk"
          | "rejected",
      validationReason:
        legalCombination === null
          ? "candidate-needs-risk-acceptance-because-game-validator-reports-no-combination"
          : !lockCompatibility[categoryId]
          ? "incompatible-with-fixed-locks"
          : "candidate-valid-with-game-validator",
    };

    const candidateWithValidation = {
      ...candidateWithLocks,
      candidateDice:
        candidateValidation.candidateDice,
      candidateCombinationFromGameValidator:
        candidateValidation.candidateCombinationFromGameValidator,
      candidateCombinationCategoryId:
        candidateValidation.candidateCombinationCategoryId,
      rejectedBecauseNoCombination:
        candidateValidation.rejectedBecauseNoCombination,
      rejectedBecauseIncompatibleWithFixedLocks:
        candidateValidation.rejectedBecauseIncompatibleWithFixedLocks,
      rejectedBecauseFullLockWithoutValidCombination:
        candidateValidation.rejectedBecauseFullLockWithoutValidCombination,
      selectedCandidateValidationResult:
        candidateValidation.selectedCandidateValidationResult,
      validationReason:
        candidateValidation.validationReason,
    };

    const minimumAcceptableScore =
      getMinimumAcceptableScore(
        remainingRolls,
        matchContext
      );

    const projectedMaxScoreFromLock =
      getProjectedMaxScoreFromLock(
        candidateWithValidation,
        remainingRolls
      );

    const lowTripleDecision =
      shouldRejectLowTriplePreLock(
        candidateWithValidation,
        projectedMaxScoreFromLock,
        minimumAcceptableScore,
        remainingRolls,
        matchContext,
        availableCategoryCount
      );

    const lockRejectedBecauseBelowMinimumPotential =
      (remainingRolls ?? 0) >= 2 &&
      projectedMaxScoreFromLock <
        minimumAcceptableScore;

    if (
      lockRejectedBecauseBelowMinimumPotential ||
      lowTripleDecision.reject
    ) {
      candidateAudit.push({
        candidateOrder,
        type: combType,
        stage: "evaluate-rejected",
        evaluationScore:
          candidateWithValidation.evaluationScore,
        currentMatchCount:
          candidateWithValidation.currentMatchCount,
        missingCount:
          candidateWithValidation.missingCount,
        safeLockedDiceIndices:
          candidateWithValidation.safeLockedDiceIndices,
        lockValues:
          candidateWithValidation.lockValues,
        expectedNextTurnValue:
          candidateWithValidation.expectedNextTurnValue,
        minimumAcceptableScore,
        preLockViabilityChecked: true,
        projectedMaxScoreFromLock,
        lockRejectedBecauseBelowMinimumPotential,
        structuralLowBaseRejected: false,
        rejectedBecauseWeakStructuralSeed: false,
        seedLockRejectedBeforeBuilderMerge: false,
        lowTriplePenaltyApplied:
          lowTripleDecision.lowTriplePenaltyApplied,
        lowTripleAcceptedReason:
          lowTripleDecision.lowTripleAcceptedReason,
        lowTripleExceptionReason:
          lowTripleDecision.lowTripleAcceptedReason,
        validationReason:
          lowTripleDecision.reject
            ? "pre-lock-low-triple-risk-rejected"
            : "pre-lock-below-minimum-potential",
      });
      continue;
    }

    const structuralLowBaseRejected =
      isStructuralTarget(candidateWithValidation.type) &&
      candidateWithValidation.safeLockedDiceIndices.length >= 3 &&
      candidateWithValidation.lockValues.every(
        (value) => value <= 3
      ) &&
      (remainingRolls ?? 0) > 1 &&
      !matchContext.endgameMode &&
      availableCategoryCount > 1;

    if (structuralLowBaseRejected) {
      candidateAudit.push({
        candidateOrder,
        type: combType,
        stage: "evaluate-rejected",
        evaluationScore:
          candidateWithValidation.evaluationScore,
        currentMatchCount:
          candidateWithValidation.currentMatchCount,
        missingCount:
          candidateWithValidation.missingCount,
        safeLockedDiceIndices:
          candidateWithValidation.safeLockedDiceIndices,
        lockValues:
          candidateWithValidation.lockValues,
        expectedNextTurnValue:
          candidateWithValidation.expectedNextTurnValue,
        minimumAcceptableScore,
        preLockViabilityChecked: true,
        projectedMaxScoreFromLock,
        structuralLowBaseRejected: true,
        rejectedBecauseWeakStructuralSeed: true,
        seedLockRejectedBeforeBuilderMerge: true,
        lowTriplePenaltyApplied:
          lowTripleDecision.lowTriplePenaltyApplied,
        lowTripleAcceptedReason:
          lowTripleDecision.lowTripleAcceptedReason,
        lowTripleExceptionReason:
          lowTripleDecision.lowTripleAcceptedReason,
        validationReason:
          "weak-structural-seed-rejected-before-builder-merge",
      });
      continue;
    }

    const playModeRiskModifier =
      (remainingRolls ?? 0) >= 3
        ? 50
        : (remainingRolls ?? 0) <= 1
        ? -30
        : 0;

    const scoreContextModifier =
      matchContext.riskBecauseBehind
        ? 35
        : matchContext.endgameMode
        ? 20
        : 0;

    const openOptionsEvaluation =
      evaluateOpenOptionsForLock(
        currentDice,
        multiTargetLockedDiceIndices,
        availableTargetCategories,
        lockCompatibility,
        playerScores,
        remainingRolls,
        scoreContextModifier
      );

    const averageLockValue =
      lockValues.length > 0
        ? lockValueSum / lockValues.length
        : 0;
    const lowValuePenaltyApplied =
      averageLockValue > 0 &&
      ((diceValuePolicy ===
        "prefer-6-5-4-penalize-1-2-3" &&
        averageLockValue < 3.5) ||
        (diceValuePolicy ===
          "high-values-preferred-balanced" &&
          averageLockValue < 3));

    const generalTargetValueForPolicy =
      candidateWithValidation.type === "Generál"
        ? Number(
            (
              candidateWithValidation.requiredDicePattern?.[0] ??
              "0x0"
            ).split("x")[0]
          )
        : 0;

    const earlyGamePenaltyForPolicy =
      candidateWithValidation.type === "Generál" &&
      earlyGameWindow &&
      (remainingRolls ?? 0) >= 2 &&
      generalTargetValueForPolicy === 4
        ? playModeRiskProfile === "ambitious"
          ? -260
          : -120
        : 0;

    const candidateWithOpenOptions = {
      ...candidateWithValidation,
      minimumAcceptableScore,
      preLockViabilityChecked: true,
      projectedMaxScoreFromLock,
      lockRejectedBecauseBelowMinimumPotential,
      playModeRiskModifier,
      scoreContextModifier,
      rewriteAllowed: playModeAllowRewrite,
      diceValuePolicy,
      playModeRiskProfile,
      lowValuePenaltyApplied,
      lowTriplePenaltyApplied:
        lowTripleDecision.lowTriplePenaltyApplied,
      lowTripleAcceptedReason:
        lowTripleDecision.lowTripleAcceptedReason,
      lowTripleExceptionReason:
        lowTripleDecision.lowTripleAcceptedReason,
      rejectedBeforeLockBecauseNotWritable: false,
      earlyGamePenalty: earlyGamePenaltyForPolicy,
      targetScorePotential:
        candidateWithValidation.maxPossibleScore,
      missingPattern:
        openOptionsEvaluation.openOptions[0]
          ?.missingPattern ?? [],
      openOptionsScore:
        openOptionsEvaluation.openOptionsScore,
      openOptions:
        openOptionsEvaluation.openOptions,
      scoreboardFilteredOptions:
        openOptionsEvaluation.scoreboardFilteredOptions,
      rejectedBecauseTooNarrow:
        openOptionsEvaluation.rejectedBecauseTooNarrow,
      selectedBecauseMultiTargetPotential:
        openOptionsEvaluation.selectedBecauseMultiTargetPotential,
      remainingRollsOpenStrategyBonus:
        openOptionsEvaluation.remainingRollsOpenStrategyBonus,
      structuralLowBaseRejected: false,
      rejectedBecauseWeakStructuralSeed: false,
      seedLockRejectedBeforeBuilderMerge: false,
    };

    const strategyScoreResult =
      getCandidateStrategyScore(
        candidateWithOpenOptions,
        remainingRolls,
        matchContext,
        playerScores,
        legalMoveContext,
        playModeAllowRewrite,
        previousTargetCategory
      );

    const candidateWithStrategy = {
      ...candidateWithOpenOptions,
      strategyScore: strategyScoreResult.total,
      strategyBreakdown: strategyScoreResult.breakdown,
    };

    const structuralTargetCategory =
      isStructuralTarget(candidateWithStrategy.type)
        ? combinationToCategoryId[
            candidateWithStrategy.type
          ] ?? null
        : null;

    const oneFiveFallbackAttempted =
      candidateWithStrategy.safeLockedDiceIndices.length === 1 &&
      candidateWithStrategy.lockValues.length === 1 &&
      (candidateWithStrategy.lockValues[0] === 1 ||
        candidateWithStrategy.lockValues[0] === 5);

    const oneFiveFallbackBlocked =
      structuralTargetCategory !== null &&
      oneFiveFallbackAttempted &&
      !(
        (remainingRolls ?? 0) <= 0 ||
        availableCategoryCount <= 1
      );

    if (oneFiveFallbackBlocked) {
      candidateAudit.push({
        candidateOrder,
        type: combType,
        stage: "evaluate-rejected",
        evaluationScore:
          candidateWithStrategy.evaluationScore,
        strategyScore:
          candidateWithStrategy.strategyScore,
        safeLockedDiceIndices:
          candidateWithStrategy.safeLockedDiceIndices,
        lockValues: candidateWithStrategy.lockValues,
        structuralTargetCategory,
        oneFiveFallbackAttempted,
        oneFiveFallbackBlocked,
        targetSpecificLockBuilderUsed:
          targetSpecificLockPlan.builderUsed,
        validationReason:
          "one-five-fallback-blocked-for-structural-target",
      });
      continue;
    }

    const oneFiveFallbackEligible =
      candidateWithStrategy.safeLockedDiceIndices.length === 1 &&
      candidateWithStrategy.lockValues.length === 1 &&
      (candidateWithStrategy.lockValues[0] === 1 ||
        candidateWithStrategy.lockValues[0] === 5) &&
      structuralTargetCategory === null &&
      ((remainingRolls ?? 0) <= 1 ||
        matchContext.endgameMode ||
        matchContext.riskBecauseBehind);

    const candidateWithTargetMetadata = {
      ...candidateWithStrategy,
      seedCandidateGenerated: true,
      seedTargetCategory: categoryId,
      currentProgress:
        candidateWithStrategy.currentProgress ??
        candidateWithStrategy.currentMatchCount,
      completionChance:
        candidateWithStrategy.completionChance ??
        Number(
          Math.max(
            0,
            Math.min(1, candidateWithStrategy.currentMatchCount / 6)
          ).toFixed(2)
        ),
      remainingRollsFit:
        candidateWithStrategy.remainingRollsFit ??
        (typeof remainingRolls === "number"
          ? Math.max(
              0,
              remainingRolls -
                Math.max(0, candidateWithStrategy.missingCount - 1)
            )
          : 0),
      lockRecommendation:
        candidateWithStrategy.safeLockedDiceIndices.length > 0
          ? candidateWithStrategy.safeLockedDiceIndices
              .map((index) => currentDice[index])
              .join(",")
          : "reroll-all",
      rejectedSingleValueHeuristic:
        candidateWithStrategy.safeLockedDiceIndices.length === 1 &&
        !oneFiveFallbackEligible,
      fallbackOneFiveEligible: oneFiveFallbackEligible,
      structuralLowBaseRejected: false,
      rejectedBecauseWeakStructuralSeed: false,
      seedLockRejectedBeforeBuilderMerge: false,
      lowTripleExceptionReason:
        candidateWithStrategy.lowTripleExceptionReason ?? null,
      structuralTargetCategory,
      oneFiveFallbackAttempted,
      oneFiveFallbackBlocked,
      targetSpecificLockBuilderUsed:
        targetSpecificLockPlan.builderUsed,
    }

    const seedProgress =
      canBuildProgressFromSeed(
        candidateWithTargetMetadata,
        remainingRolls
      );

    const candidateWithSeedMetadata = {
      ...candidateWithTargetMetadata,
      ...seedProgress,
      seedLockApplied: false,
      rejectedBecauseOnlyWaitingForPairDisabled:
        false,
    };

    const rejectsLowValueGroupedBase =
      playModeRiskProfile === "ambitious" &&
      (remainingRolls ?? 0) >= 3 &&
      candidateWithSeedMetadata.lowValuePenaltyApplied &&
      (candidateWithSeedMetadata.type === "Generál" ||
        candidateWithSeedMetadata.type === "Trojice" ||
        candidateWithSeedMetadata.type === "Dvojice") &&
      !candidateWithSeedMetadata.seedAcceptedBecauseHighValue;

    if (rejectsLowValueGroupedBase) {
      candidateAudit.push({
        candidateOrder,
        type: combType,
        stage: "evaluate-rejected",
        evaluationScore:
          candidateWithSeedMetadata.evaluationScore,
        strategyScore:
          candidateWithSeedMetadata.strategyScore,
        targetPattern:
          candidateWithSeedMetadata.targetPattern,
        lockRecommendation:
          candidateWithSeedMetadata.lockRecommendation,
        lowValuePenaltyApplied:
          candidateWithSeedMetadata.lowValuePenaltyApplied,
        rewriteAllowed:
          candidateWithSeedMetadata.rewriteAllowed,
        diceValuePolicy:
          candidateWithSeedMetadata.diceValuePolicy,
        playModeRiskProfile:
          candidateWithSeedMetadata.playModeRiskProfile,
        seedCandidateGenerated:
          candidateWithSeedMetadata.seedCandidateGenerated,
        seedTargetCategory:
          candidateWithSeedMetadata.seedTargetCategory,
        seedAcceptedBecauseHighValue:
          candidateWithSeedMetadata.seedAcceptedBecauseHighValue,
        seedAcceptedBecauseStraightProgress:
          candidateWithSeedMetadata.seedAcceptedBecauseStraightProgress,
        buildProgressFromSeed:
          candidateWithSeedMetadata.buildProgressFromSeed,
        validationReason:
          "low-value-grouped-base-rejected-in-ambitious-mode",
      });
      continue;
    }

    const keepsStrategicDirection =
      hasStrategicDirection(
        currentDice,
        candidateWithSeedMetadata,
        phasePolicy
      ) ||
      !!candidateWithSeedMetadata.buildProgressFromSeed;

    const rejectedBecauseOnlyWaitingForPairDisabled =
      !keepsStrategicDirection &&
      (remainingRolls ?? 0) >= 2 &&
      candidateWithSeedMetadata.safeLockedDiceIndices.length <= 1 &&
      isGroupedSeedTarget(
        candidateWithSeedMetadata.type
      );

    if (
      !keepsStrategicDirection
    ) {
      candidateAudit.push({
        candidateOrder,
        type: combType,
        stage: "direction-rejected",
        evaluationScore:
          candidateWithSeedMetadata.evaluationScore,
        strategyScore:
          candidateWithSeedMetadata.strategyScore,
        currentMatchCount:
          candidateWithSeedMetadata.currentMatchCount,
        missingCount:
          candidateWithSeedMetadata.missingCount,
        relevantIndices:
          candidateWithSeedMetadata.relevantIndices,
        safeLockedDiceIndices:
          candidateWithSeedMetadata.safeLockedDiceIndices,
        lockValues:
          candidateWithSeedMetadata.lockValues,
        expectedNextTurnValue:
          candidateWithSeedMetadata.expectedNextTurnValue,
        evaluationBreakdown:
          candidateWithSeedMetadata.evaluationBreakdown,
        strategyBreakdown:
          candidateWithSeedMetadata.strategyBreakdown,
        targetPattern:
          candidateWithSeedMetadata.targetPattern,
        requiredDicePattern:
          candidateWithSeedMetadata.requiredDicePattern,
        currentProgress:
          candidateWithSeedMetadata.currentProgress,
        completionChance:
          candidateWithSeedMetadata.completionChance,
        remainingRollsFit:
          candidateWithSeedMetadata.remainingRollsFit,
        lockRecommendation:
          candidateWithSeedMetadata.lockRecommendation,
        rejectedSingleValueHeuristic:
          candidateWithSeedMetadata.rejectedSingleValueHeuristic,
        fallbackOneFiveEligible:
          candidateWithSeedMetadata.fallbackOneFiveEligible,
        rewriteAllowed:
          candidateWithSeedMetadata.rewriteAllowed,
        diceValuePolicy:
          candidateWithSeedMetadata.diceValuePolicy,
        playModeRiskProfile:
          candidateWithSeedMetadata.playModeRiskProfile,
        lowValuePenaltyApplied:
          candidateWithSeedMetadata.lowValuePenaltyApplied,
        minimumAcceptableScore:
          candidateWithSeedMetadata.minimumAcceptableScore,
        playModeRiskModifier:
          candidateWithSeedMetadata.playModeRiskModifier,
        scoreContextModifier:
          candidateWithSeedMetadata.scoreContextModifier,
        targetScorePotential:
          candidateWithSeedMetadata.targetScorePotential,
        missingPattern:
          candidateWithSeedMetadata.missingPattern,
        openOptionsScore:
          candidateWithSeedMetadata.openOptionsScore,
        openOptions:
          candidateWithSeedMetadata.openOptions,
        scoreboardFilteredOptions:
          candidateWithSeedMetadata.scoreboardFilteredOptions,
        rejectedBecauseTooNarrow:
          candidateWithSeedMetadata.rejectedBecauseTooNarrow,
        selectedBecauseMultiTargetPotential:
          candidateWithSeedMetadata.selectedBecauseMultiTargetPotential,
        remainingRollsOpenStrategyBonus:
          candidateWithSeedMetadata.remainingRollsOpenStrategyBonus,
        seedCandidateGenerated:
          candidateWithSeedMetadata.seedCandidateGenerated,
        seedTargetCategory:
          candidateWithSeedMetadata.seedTargetCategory,
        seedAcceptedBecauseHighValue:
          candidateWithSeedMetadata.seedAcceptedBecauseHighValue,
        seedAcceptedBecauseStraightProgress:
          candidateWithSeedMetadata.seedAcceptedBecauseStraightProgress,
        buildProgressFromSeed:
          candidateWithSeedMetadata.buildProgressFromSeed,
        rejectedBecauseOnlyWaitingForPairDisabled,
        candidateDice:
          candidateValidation.candidateDice,
        candidateCombinationFromGameValidator:
          candidateValidation.candidateCombinationFromGameValidator,
        candidateCombinationCategoryId:
          candidateValidation.candidateCombinationCategoryId,
        rejectedBecauseNoCombination:
          candidateValidation.rejectedBecauseNoCombination,
        rejectedBecauseIncompatibleWithFixedLocks:
          candidateValidation.rejectedBecauseIncompatibleWithFixedLocks,
        rejectedBecauseFullLockWithoutValidCombination:
          candidateValidation.rejectedBecauseFullLockWithoutValidCombination,
        selectedCandidateValidationResult:
          candidateValidation.selectedCandidateValidationResult,
        validationReason:
          candidateValidation.validationReason,
      });
      continue;
    }

    if (
      candidateValidation.rejectedBecauseIncompatibleWithFixedLocks ||
      candidateValidation.rejectedBecauseFullLockWithoutValidCombination
    ) {
      candidateAudit.push({
        candidateOrder,
        type: combType,
        stage: "validation-rejected",
        evaluationScore:
          candidateWithSeedMetadata.evaluationScore,
        currentMatchCount:
          candidateWithSeedMetadata.currentMatchCount,
        strategyScore:
          candidateWithSeedMetadata.strategyScore,
        missingCount:
          candidateWithSeedMetadata.missingCount,
        relevantIndices:
          candidateWithSeedMetadata.relevantIndices,
        safeLockedDiceIndices:
          candidateWithSeedMetadata.safeLockedDiceIndices,
        lockValues:
          candidateWithSeedMetadata.lockValues,
        expectedNextTurnValue:
          candidateWithSeedMetadata.expectedNextTurnValue,
        evaluationBreakdown:
          candidateWithSeedMetadata.evaluationBreakdown,
        strategyBreakdown:
          candidateWithSeedMetadata.strategyBreakdown,
        candidateDice:
          candidateValidation.candidateDice,
        candidateCombinationFromGameValidator:
          candidateValidation.candidateCombinationFromGameValidator,
        candidateCombinationCategoryId:
          candidateValidation.candidateCombinationCategoryId,
        rejectedBecauseNoCombination:
          candidateValidation.rejectedBecauseNoCombination,
        rejectedBecauseIncompatibleWithFixedLocks:
          candidateValidation.rejectedBecauseIncompatibleWithFixedLocks,
        rejectedBecauseFullLockWithoutValidCombination:
          candidateValidation.rejectedBecauseFullLockWithoutValidCombination,
        selectedCandidateValidationResult:
          candidateValidation.selectedCandidateValidationResult,
        validationReason:
          candidateValidation.validationReason,
        rejectedBeforeLockBecauseNotWritable: true,
        targetPattern:
          candidateWithSeedMetadata.targetPattern,
        requiredDicePattern:
          candidateWithSeedMetadata.requiredDicePattern,
        currentProgress:
          candidateWithSeedMetadata.currentProgress,
        completionChance:
          candidateWithSeedMetadata.completionChance,
        remainingRollsFit:
          candidateWithSeedMetadata.remainingRollsFit,
        lockRecommendation:
          candidateWithSeedMetadata.lockRecommendation,
        rejectedSingleValueHeuristic:
          candidateWithSeedMetadata.rejectedSingleValueHeuristic,
        fallbackOneFiveEligible:
          candidateWithSeedMetadata.fallbackOneFiveEligible,
        rewriteAllowed:
          candidateWithSeedMetadata.rewriteAllowed,
        diceValuePolicy:
          candidateWithSeedMetadata.diceValuePolicy,
        playModeRiskProfile:
          candidateWithSeedMetadata.playModeRiskProfile,
        lowValuePenaltyApplied:
          candidateWithSeedMetadata.lowValuePenaltyApplied,
        minimumAcceptableScore:
          candidateWithSeedMetadata.minimumAcceptableScore,
        playModeRiskModifier:
          candidateWithSeedMetadata.playModeRiskModifier,
        scoreContextModifier:
          candidateWithSeedMetadata.scoreContextModifier,
        targetScorePotential:
          candidateWithSeedMetadata.targetScorePotential,
        missingPattern:
          candidateWithSeedMetadata.missingPattern,
        openOptionsScore:
          candidateWithSeedMetadata.openOptionsScore,
        openOptions:
          candidateWithSeedMetadata.openOptions,
        scoreboardFilteredOptions:
          candidateWithSeedMetadata.scoreboardFilteredOptions,
        rejectedBecauseTooNarrow:
          candidateWithSeedMetadata.rejectedBecauseTooNarrow,
        selectedBecauseMultiTargetPotential:
          candidateWithSeedMetadata.selectedBecauseMultiTargetPotential,
        remainingRollsOpenStrategyBonus:
          candidateWithSeedMetadata.remainingRollsOpenStrategyBonus,
        seedCandidateGenerated:
          candidateWithSeedMetadata.seedCandidateGenerated,
        seedTargetCategory:
          candidateWithSeedMetadata.seedTargetCategory,
        seedAcceptedBecauseHighValue:
          candidateWithSeedMetadata.seedAcceptedBecauseHighValue,
        seedAcceptedBecauseStraightProgress:
          candidateWithSeedMetadata.seedAcceptedBecauseStraightProgress,
        buildProgressFromSeed:
          candidateWithSeedMetadata.buildProgressFromSeed,
      });
      continue;
    }

    candidateAudit.push({
      candidateOrder,
      type: combType,
      stage: "accepted",
      evaluationScore:
        candidateWithSeedMetadata.evaluationScore,
      strategyScore:
        candidateWithSeedMetadata.strategyScore,
      currentMatchCount:
        candidateWithSeedMetadata.currentMatchCount,
      missingCount:
        candidateWithSeedMetadata.missingCount,
      relevantIndices:
        candidateWithSeedMetadata.relevantIndices,
      safeLockedDiceIndices:
        candidateWithSeedMetadata.safeLockedDiceIndices,
      lockValues:
        candidateWithSeedMetadata.lockValues,
      expectedNextTurnValue:
        candidateWithSeedMetadata.expectedNextTurnValue,
      evaluationBreakdown:
        candidateWithSeedMetadata.evaluationBreakdown,
      strategyBreakdown:
        candidateWithSeedMetadata.strategyBreakdown,
      candidateDice:
        candidateValidation.candidateDice,
      candidateCombinationFromGameValidator:
        candidateValidation.candidateCombinationFromGameValidator,
      candidateCombinationCategoryId:
        candidateValidation.candidateCombinationCategoryId,
      rejectedBecauseNoCombination:
        candidateValidation.rejectedBecauseNoCombination,
      rejectedBecauseIncompatibleWithFixedLocks:
        candidateValidation.rejectedBecauseIncompatibleWithFixedLocks,
      rejectedBecauseFullLockWithoutValidCombination:
        candidateValidation.rejectedBecauseFullLockWithoutValidCombination,
      selectedCandidateValidationResult:
        candidateValidation.selectedCandidateValidationResult,
      validationReason:
        candidateValidation.validationReason,
      targetPattern:
        candidateWithSeedMetadata.targetPattern,
      requiredDicePattern:
        candidateWithSeedMetadata.requiredDicePattern,
      currentProgress:
        candidateWithSeedMetadata.currentProgress,
      completionChance:
        candidateWithSeedMetadata.completionChance,
      remainingRollsFit:
        candidateWithSeedMetadata.remainingRollsFit,
      lockRecommendation:
        candidateWithSeedMetadata.lockRecommendation,
      rejectedSingleValueHeuristic:
        candidateWithSeedMetadata.rejectedSingleValueHeuristic,
      fallbackOneFiveEligible:
        candidateWithSeedMetadata.fallbackOneFiveEligible,
      rewriteAllowed:
        candidateWithSeedMetadata.rewriteAllowed,
      diceValuePolicy:
        candidateWithSeedMetadata.diceValuePolicy,
      playModeRiskProfile:
        candidateWithSeedMetadata.playModeRiskProfile,
      lowValuePenaltyApplied:
        candidateWithSeedMetadata.lowValuePenaltyApplied,
      minimumAcceptableScore:
        candidateWithSeedMetadata.minimumAcceptableScore,
      playModeRiskModifier:
        candidateWithSeedMetadata.playModeRiskModifier,
      scoreContextModifier:
        candidateWithSeedMetadata.scoreContextModifier,
      targetScorePotential:
        candidateWithSeedMetadata.targetScorePotential,
      missingPattern:
        candidateWithSeedMetadata.missingPattern,
      openOptionsScore:
        candidateWithSeedMetadata.openOptionsScore,
      openOptions:
        candidateWithSeedMetadata.openOptions,
      scoreboardFilteredOptions:
        candidateWithSeedMetadata.scoreboardFilteredOptions,
      rejectedBecauseTooNarrow:
        candidateWithSeedMetadata.rejectedBecauseTooNarrow,
      selectedBecauseMultiTargetPotential:
        candidateWithSeedMetadata.selectedBecauseMultiTargetPotential,
      remainingRollsOpenStrategyBonus:
        candidateWithSeedMetadata.remainingRollsOpenStrategyBonus,
      seedCandidateGenerated:
        candidateWithSeedMetadata.seedCandidateGenerated,
      seedTargetCategory:
        candidateWithSeedMetadata.seedTargetCategory,
      seedAcceptedBecauseHighValue:
        candidateWithSeedMetadata.seedAcceptedBecauseHighValue,
      seedAcceptedBecauseStraightProgress:
        candidateWithSeedMetadata.seedAcceptedBecauseStraightProgress,
      buildProgressFromSeed:
        candidateWithSeedMetadata.buildProgressFromSeed,
      seedLockApplied:
        candidateWithSeedMetadata.buildProgressFromSeed,
      rejectedBecauseOnlyWaitingForPairDisabled:
        false,
    });

    candidates.push(candidateWithSeedMetadata);
  }

  const explicitHighValueBuilderCandidates =
    createExplicitHighValueBuilderCandidates(
      candidates,
      currentDice,
      fixedLocks,
      remainingRolls,
      availableTargetCategories,
      lockCompatibility
    );

  for (const explicitBuilder of explicitHighValueBuilderCandidates) {
    const duplicateBuilder = candidates.some(
      (candidate) => {
        if (candidate.type !== explicitBuilder.type) {
          return false;
        }

        if (
          candidate.safeLockedDiceIndices.length !==
          explicitBuilder.safeLockedDiceIndices.length
        ) {
          return false;
        }

        return candidate.safeLockedDiceIndices.every(
          (index, idx) =>
            index ===
            explicitBuilder.safeLockedDiceIndices[idx]
        );
      }
    );

    if (duplicateBuilder) {
      continue;
    }

      candidateAudit.push({
        candidateOrder: explicitBuilder.candidateOrder,
        type: explicitBuilder.type,
        stage: "accepted",
        highValueBuilderGeneratedFromSingleDie:
          explicitBuilder.highValueBuilderGeneratedFromSingleDie,
        highValueBuilderGeneratedFromPattern:
          true,
        highValueBuilderPattern:
          explicitBuilder.highValueBuilderPattern,
        highValueBuilderValues:
          explicitBuilder.lockValues,
        highValueBuilderTargetCategory:
          explicitBuilder.highValueBuilderTargetCategory,
        seedCandidateGenerated:
          explicitBuilder.seedCandidateGenerated,
        seedTargetCategory:
          explicitBuilder.seedTargetCategory,
        seedAcceptedBecauseHighValue:
          explicitBuilder.seedAcceptedBecauseHighValue,
        buildProgressFromSeed:
          explicitBuilder.buildProgressFromSeed,
        safeLockedDiceIndices:
          explicitBuilder.safeLockedDiceIndices,
        lockValues: explicitBuilder.lockValues,
        strategyScore: explicitBuilder.strategyScore,
        evaluationScore: explicitBuilder.evaluationScore,
        validationReason:
          "high-value-pattern-builder-generated",
      });

      candidates.push(explicitBuilder);
  }

  const rankedHighValueBuilderCandidates =
    candidates
      .filter((candidate) =>
        isPreferredHighValueBuilderCandidate(
          candidate,
          availableTargetCategories,
          lockCompatibility
        )
      )
      .sort(compareCandidatesByPolicy);

  const bestHighValueBuilder =
    rankedHighValueBuilderCandidates.length > 0
      ? rankedHighValueBuilderCandidates[0]
      : null;

  const highValueBuilderCheckedBeforeReroll =
    (remainingRolls ?? 0) > 0;
  const highValueBuilderAvailable =
    bestHighValueBuilder !== null;
  const rerollBlockedUntilHighValueBuilderEvaluated =
    (remainingRolls ?? 0) > 0;

  const allowLowBaseException =
    (remainingRolls ?? 0) <= 1 ||
    availableCategoryCount <= 1;

  let lowPairRejectedBecauseHighValueBuilderExists =
    false;
  let lowTripleRejectedBecauseHighValueBuilderExists =
    false;
  let lowValueCompletionRejectedBeforeFinalRoll =
    false;

  if (
    bestHighValueBuilder !== null &&
    !allowLowBaseException
  ) {
    const filteredCandidates =
      candidates.filter((candidate) => {
        const lowPair =
          isLowPairStartCandidate(candidate);
        const lowTriple =
          isLowTripleStartCandidate(candidate);
        const lowValueCompletion =
          isLowValueCompletionSupplementCandidate(
            candidate
          );

        if (
          (lowPair ||
            lowTriple ||
            lowValueCompletion) &&
          !candidate.isComplete
        ) {
          if (lowPair) {
            lowPairRejectedBecauseHighValueBuilderExists =
              true;
          }

          if (lowTriple) {
            lowTripleRejectedBecauseHighValueBuilderExists =
              true;
          }

          if (lowValueCompletion) {
            lowValueCompletionRejectedBeforeFinalRoll =
              true;
          }

          candidateAudit.push({
            candidateOrder:
              candidate.candidateOrder,
            type: candidate.type,
            stage: "direction-rejected",
            seedCandidateGenerated:
              candidate.seedCandidateGenerated,
            seedTargetCategory:
              candidate.seedTargetCategory,
            seedAcceptedBecauseHighValue:
              candidate.seedAcceptedBecauseHighValue,
            seedAcceptedBecauseStraightProgress:
              candidate.seedAcceptedBecauseStraightProgress,
            buildProgressFromSeed:
              candidate.buildProgressFromSeed,
            seedLockApplied:
              candidate.seedLockApplied,
            rejectedBecauseOnlyWaitingForPairDisabled:
              true,
            validationReason: lowPair
              ? "low-pair-rejected-because-high-value-builder-exists"
              : lowTriple
              ? "low-triple-rejected-because-high-value-builder-exists"
              : lowValueCompletion
              ? "low-value-completion-rejected-before-final-roll"
              : "low-triple-rejected-because-high-value-builder-exists",
          });

          return false;
        }

        return true;
      });

    if (filteredCandidates.length > 0) {
      candidates = filteredCandidates;
    }
  }

  // If no writable combinations, return empty (roll everything)
  if (candidates.length === 0) {
    const fallbackSaveCandidate =
      legalMoveContext.writableSaveCandidate;
    const deadEndDetected = true;
    const bestLegalFallbackScore =
      fallbackSaveCandidate.canSave
        ? fallbackSaveCandidate.score
        : null;

    if (
      (remainingRolls ?? 0) <= 0 &&
      fallbackSaveCandidate.canSave &&
      fallbackSaveCandidate.categoryId &&
      availableTargetCategories.includes(
        fallbackSaveCandidate.categoryId
      )
    ) {
      logAIDecisionAudit(
        currentDice,
        remainingRolls,
        matchContext,
        candidateAudit,
        null,
        [],
        [],
        {
          ...auditPolicyContext,
          lockBlockedBecauseTargetNotWritable:
            availableTargetCategories.length === 0,
          highValueBuilderCheckedBeforeReroll,
          highValueBuilderAvailable,
          highValueBuilderAppliedBeforeReroll: false,
          rerollBlockedUntilHighValueBuilderEvaluated,
          rerollWithoutLockReason: null,
          lowValueCompletionRejectedBeforeFinalRoll,
          lowValueAllowedOnlyBecauseFinalRoll: false,
          deadEndDetected,
          bestLegalFallbackScore,
        }
      );

      return {
        targetCategory:
          fallbackSaveCandidate.categoryId,
        lockMask: [
          false,
          false,
          false,
          false,
          false,
          false,
        ],
        lockedDiceIndices: [],
        action: "save",
        confidence: 0.18,
        riskLevel: toRiskLevel(
          remainingRolls,
          matchContext
        ),
        aiScore: matchContext.aiScore,
        bestOpponentScore:
          matchContext.bestOpponentScore,
        endgameMode: matchContext.endgameMode,
        scoreDelta: matchContext.scoreDelta,
        aiRemainingPotential:
          matchContext.aiRemainingPotential,
        opponentRemainingPotential:
          matchContext.opponentRemainingPotential,
        requiredScoreEstimate:
          matchContext.requiredScoreEstimate,
        opponentScore: matchContext.opponentScore,
        remainingCategories:
          matchContext.remainingCategories,
        riskBecauseBehind:
          matchContext.riskBecauseBehind,
        saveRejectedBecauseTooLow: false,
        currentPlanValue: 0,
        alternativePlanValue: 0,
        pivotThreshold: 0,
        pivotReason: "dead-end-save-fallback",
        reason:
          "dead-end fallback: save best legal available result",
        fallbackReason: "dead-end-save-fallback",
      };
    }

    logAIDecisionAudit(
      currentDice,
      remainingRolls,
      matchContext,
      candidateAudit,
      null,
      [],
      [],
      {
        ...auditPolicyContext,
        lockBlockedBecauseTargetNotWritable:
          availableTargetCategories.length === 0,
        highValueBuilderCheckedBeforeReroll,
        highValueBuilderAvailable,
        highValueBuilderAppliedBeforeReroll: false,
        rerollBlockedUntilHighValueBuilderEvaluated,
        rerollWithoutLockReason:
          (remainingRolls ?? 0) > 0
            ? "no-legal-candidates-after-filter"
            : null,
        lowValueCompletionRejectedBeforeFinalRoll,
        lowValueAllowedOnlyBecauseFinalRoll: false,
        deadEndDetected,
        bestLegalFallbackScore,
      }
    );

    return {
      targetCategory: null,
      lockMask: [
        false,
        false,
        false,
        false,
        false,
        false,
      ],
      lockedDiceIndices: [],
      action:
        (remainingRolls ?? 0) > 0
          ? "roll"
          : "end_turn",
      confidence: 0.2,
      riskLevel: toRiskLevel(
        remainingRolls,
        matchContext
      ),
      aiScore: matchContext.aiScore,
      bestOpponentScore:
        matchContext.bestOpponentScore,
      endgameMode: matchContext.endgameMode,
      scoreDelta: matchContext.scoreDelta,
      aiRemainingPotential:
        matchContext.aiRemainingPotential,
      opponentRemainingPotential:
        matchContext.opponentRemainingPotential,
      requiredScoreEstimate:
        matchContext.requiredScoreEstimate,
      opponentScore: matchContext.opponentScore,
      remainingCategories:
        matchContext.remainingCategories,
      riskBecauseBehind:
        matchContext.riskBecauseBehind,
      saveRejectedBecauseTooLow: false,
      currentPlanValue: 0,
      alternativePlanValue: 0,
      pivotThreshold: 0,
      pivotReason: "no-candidates",
      reason: `noChange: no safe opportunity | endgame=${matchContext.endgameMode} | scoreDelta=${matchContext.scoreDelta} | required=${matchContext.requiredScoreEstimate}`,
      fallbackReason: "no-safe-opportunity",
    };
  }

  // Opportunistic: pick best target first, then derive locks from that target.
  candidates.sort(compareCandidatesByPolicy);

  let best = candidates[0];

  if ((remainingRolls ?? 0) <= 1) {
    const completeCandidates = candidates.filter(
      (candidate) => candidate.isComplete
    );

    if (completeCandidates.length > 0) {
      completeCandidates.sort(
        compareCandidatesByPolicy
      );

      const strongestComplete =
        completeCandidates[0];
      const strongestCompleteScore =
        strongestComplete.absoluteScoreSignal;
      const bestCurrentScore =
        best.absoluteScoreSignal;
      const bestCurrentMinimum =
        best.minimumAcceptableScore ?? 0;

      if (
        (remainingRolls ?? 0) <= 0 ||
        strongestCompleteScore >=
          Math.max(
            bestCurrentScore,
            bestCurrentMinimum
          )
      ) {
        best = strongestComplete;
      }
    }
  }

  const bestTargetCategory =
    combinationToCategoryId[best.type] ?? null;
  const bestTargetWritable =
    bestTargetCategory !== null &&
    availableTargetCategories.includes(
      bestTargetCategory
    );

  // CRITICAL FIX: Check if candidate's locks would block ALL available targets
  // Merge candidate's locks with fixedLocks to see what remains compatible
  let locksWouldBlockAllTargets = false;
  if (
    best.safeLockedDiceIndices &&
    best.safeLockedDiceIndices.length > 0 &&
    availableTargetCategories.length > 0
  ) {
    // Create merged locks from fixedLocks + candidate's locks
    const candidateLockMask = [
      false,
      false,
      false,
      false,
      false,
      false,
    ];
    best.safeLockedDiceIndices.forEach((index) => {
      if (index >= 0 && index < 6) {
        candidateLockMask[index] = true;
      }
    });
    
    const mergedLocks = fixedLocks.map(
      (isFixed, index) =>
        isFixed || candidateLockMask[index]
    );

    // Check if ANY available target is still compatible with merged locks
    let anyCompatibleTarget = false;
    for (const targetCategoryId of availableTargetCategories) {
      // Re-check compatibility with merged locks using the legalMoveContext
      // If the merged locks DON'T violate this target, it's still viable
      const isStillCompatible = canTargetCategoryWorkWithFixedLocks(
        targetCategoryId as PlayModeCategoryId,
        currentDice,
        mergedLocks
      );
      if (isStillCompatible) {
        anyCompatibleTarget = true;
        break;
      }
    }

    if (!anyCompatibleTarget) {
      locksWouldBlockAllTargets = true;
    }
  }

  if (!bestTargetWritable || locksWouldBlockAllTargets) {
    logAIDecisionAudit(
      currentDice,
      remainingRolls,
      matchContext,
      candidateAudit,
      best,
      [],
      candidates,
      {
        ...auditPolicyContext,
        selectedTargetAfterScoreboardFilter:
          bestTargetCategory,
        selectedTargetIsWritable: false,
        lockBlockedBecauseTargetNotWritable: true,
      }
    );

    return {
      targetCategory: null,
      lockMask: [
        false,
        false,
        false,
        false,
        false,
        false,
      ],
      lockedDiceIndices: [],
      action:
        (remainingRolls ?? 0) > 0
          ? "roll"
          : "end_turn",
      confidence: 0.2,
      riskLevel: toRiskLevel(
        remainingRolls,
        matchContext
      ),
      aiScore: matchContext.aiScore,
      bestOpponentScore:
        matchContext.bestOpponentScore,
      endgameMode: matchContext.endgameMode,
      scoreDelta: matchContext.scoreDelta,
      aiRemainingPotential:
        matchContext.aiRemainingPotential,
      opponentRemainingPotential:
        matchContext.opponentRemainingPotential,
      requiredScoreEstimate:
        matchContext.requiredScoreEstimate,
      opponentScore: matchContext.opponentScore,
      remainingCategories:
        matchContext.remainingCategories,
      riskBecauseBehind:
        matchContext.riskBecauseBehind,
      saveRejectedBecauseTooLow: false,
      currentPlanValue: 0,
      alternativePlanValue: 0,
      pivotThreshold: 0,
      pivotReason:
        "target-not-writable-blocked-before-lock",
      reason:
        "noChange: lock blocked because selected target is not writable",
      fallbackReason:
        "target-not-writable-blocked-before-lock",
    };
  }

  const previousPlanCandidate =
    previousTargetCategory
      ? candidates.find(
          (candidate) =>
            combinationToCategoryId[
              candidate.type
            ] === previousTargetCategory
        ) ?? null
      : null;

  const dynamicPivotThreshold =
    matchContext.endgameMode
      ? 12
      : matchContext.riskBecauseBehind
      ? 18
      : (remainingRolls ?? 0) <= 1
      ? 24
      : 42;

  let currentPlanValue =
    previousPlanCandidate?.strategyScore ??
    previousPlanCandidate?.evaluationScore ??
    best.strategyScore ??
    best.evaluationScore;
  let alternativePlanValue =
    best.strategyScore ?? best.evaluationScore;
  let pivotReason = "no-previous-plan";
  let pivotAccepted = false;
  let pivotRejectedReason: string | null = null;
  let openOptionsImprovedBy = 0;

  if (
    previousPlanCandidate &&
    combinationToCategoryId[
      previousPlanCandidate.type
    ] !==
      combinationToCategoryId[best.type]
  ) {
    currentPlanValue =
      previousPlanCandidate.strategyScore ??
      previousPlanCandidate.evaluationScore;
    alternativePlanValue =
      best.strategyScore ?? best.evaluationScore;

    const pivotGain =
      (best.strategyScore ?? best.evaluationScore) -
      (previousPlanCandidate.strategyScore ??
        previousPlanCandidate.evaluationScore);

    const previousOpenOptionsScore =
      previousPlanCandidate.openOptionsScore ?? 0;
    const bestOpenOptionsScore =
      best.openOptionsScore ?? 0;
    openOptionsImprovedBy =
      bestOpenOptionsScore - previousOpenOptionsScore;

    const expectedValueImprovement =
      best.expectedNextTurnValue -
      previousPlanCandidate.expectedNextTurnValue;

    const remainingRollsAllowsRisk =
      (remainingRolls ?? 0) >= 2;

    const pivotBecausePreviousWeak =
      previousPlanCandidate.missingCount >= 3 &&
      best.currentMatchCount >=
        previousPlanCandidate.currentMatchCount +
          1;

    const pivotBecauseCompletion =
      !previousPlanCandidate.isComplete &&
      best.isComplete;

    const pivotBecauseOpenOptions =
      remainingRollsAllowsRisk &&
      openOptionsImprovedBy >= 120;

    const pivotBecauseExpectedValue =
      remainingRollsAllowsRisk &&
      expectedValueImprovement >= 4;

    const pivotBecauseSequenceIsNoLongerBest =
      previousPlanCandidate.type === "Postupka" &&
      best.type !== "Postupka" &&
      (remainingRolls ?? 0) >= 1 &&
      (openOptionsImprovedBy >= 70 ||
        expectedValueImprovement >= 3 ||
        best.currentMatchCount >=
          previousPlanCandidate.currentMatchCount + 1);

    const preserveVeryGoodCompleteSave =
      previousPlanCandidate.isComplete &&
      !best.isComplete &&
      previousPlanCandidate.absoluteScoreSignal >=
        Math.floor(
          previousPlanCandidate.maxPossibleScore * 0.85
        );

    const shouldPivot =
      !preserveVeryGoodCompleteSave &&
      (pivotGain >= dynamicPivotThreshold ||
        pivotBecausePreviousWeak ||
        pivotBecauseCompletion ||
        pivotBecauseOpenOptions ||
        pivotBecauseExpectedValue ||
        pivotBecauseSequenceIsNoLongerBest);

    if (shouldPivot) {
      pivotAccepted = true;
      if (pivotGain >= dynamicPivotThreshold) {
        pivotReason =
          "alternative-evaluation-significantly-better";
      } else if (pivotBecauseCompletion) {
        pivotReason =
          "alternative-is-complete";
      } else if (pivotBecauseOpenOptions) {
        pivotReason =
          "alternative-open-options-significantly-better";
      } else if (pivotBecauseExpectedValue) {
        pivotReason =
          "alternative-expected-value-better";
      } else if (pivotBecauseSequenceIsNoLongerBest) {
        pivotReason =
          "postupka-no-longer-best-open-plan";
      } else {
        pivotReason =
          "previous-plan-low-completion-probability";
      }
    } else {
      const retainedAlternativeValue =
        best.strategyScore ?? best.evaluationScore;
      best = previousPlanCandidate;
      alternativePlanValue =
        retainedAlternativeValue;
      pivotReason = "stay-on-current-plan";
      pivotRejectedReason = preserveVeryGoodCompleteSave
        ? "preserve-very-good-complete-save"
        : "alternative-not-strong-enough";
    }
  } else if (
    previousTargetCategory &&
    !previousPlanCandidate
  ) {
    pivotReason =
      "previous-plan-unavailable-or-incompatible";
    pivotRejectedReason =
      "previous-target-not-among-legal-candidates";
  }

  const detectedCombination =
    legalMoveContext.currentCombination;
  const detectedCombinationWritable =
    legalMoveContext.writableSaveCandidate.canSave;
  const detectedCombinationRejectedReason =
    legalMoveContext.writableSaveCandidate.fallbackReason;
  const detectedCombinationCategoryId =
    detectedCombination
      ? combinationToCategoryId[
          detectedCombination.combination as CombinationType
        ] ?? null
      : null;

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
    const detectedCombinationValue =
      detectedCombination!;

    if (
      previousPlanCandidate &&
      combinationToCategoryId[
        previousPlanCandidate.type
      ] !==
        detectedCombinationCategoryId
    ) {
      best = previousPlanCandidate;
      currentPlanValue = best.evaluationScore;
      alternativePlanValue =
        detectedCombinationValue.score;
      pivotReason =
        "detected-combination-not-writable-preserve-plan";
    } else {
      logAIDecisionAudit(
        currentDice,
        remainingRolls,
        matchContext,
        candidateAudit,
        best,
        [],
        candidates,
        {
          ...auditPolicyContext,
          selectedTargetAfterScoreboardFilter:
            combinationToCategoryId[best.type] ?? null,
          detectedCombination:
            detectedCombination,
          detectedCombinationWritable:
            detectedCombinationWritable,
          detectedCombinationRejectedReason:
            detectedCombinationRejectedReason,
          previousTargetCategory,
          targetPreservedBecauseDetectedNotWritable: false,
          lockBlockedBecauseTargetNotWritable: true,
          fullLockRejectedBecauseNotWritable:
            best.safeLockedDiceIndices.length === 6,
        }
      );

      return {
        targetCategory: null,
        lockMask: [
          false,
          false,
          false,
          false,
          false,
          false,
        ],
        lockedDiceIndices: [],
        action:
          (remainingRolls ?? 0) > 0
            ? "roll"
            : "end_turn",
        confidence: 0.22,
        riskLevel: toRiskLevel(
          remainingRolls,
          matchContext
        ),
        aiScore: matchContext.aiScore,
        bestOpponentScore:
          matchContext.bestOpponentScore,
        endgameMode: matchContext.endgameMode,
        scoreDelta: matchContext.scoreDelta,
        aiRemainingPotential:
          matchContext.aiRemainingPotential,
        opponentRemainingPotential:
          matchContext.opponentRemainingPotential,
        requiredScoreEstimate:
          matchContext.requiredScoreEstimate,
        opponentScore: matchContext.opponentScore,
        remainingCategories:
          matchContext.remainingCategories,
        riskBecauseBehind:
          matchContext.riskBecauseBehind,
        saveRejectedBecauseTooLow: false,
        currentPlanValue: 0,
        alternativePlanValue: 0,
        pivotThreshold: 0,
        pivotReason:
          "detected-combination-not-writable",
        reason:
          `noChange: detected combination not writable | detected=${detectedCombination.combination} | rejectedReason=${detectedCombinationRejectedReason}`,
        fallbackReason:
          "detected-combination-not-writable",
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

  const hasAnyCompleteLegalCandidate =
    candidates.some(
      (candidate) =>
        candidate.isComplete &&
        availableTargetCategories.includes(
          combinationToCategoryId[
            candidate.type
          ]
        )
    );

  const completeWritableCandidates =
    candidates
      .filter((candidate) => {
        const categoryId =
          combinationToCategoryId[
            candidate.type
          ] ?? null;

        return (
          candidate.isComplete &&
          categoryId !== null &&
          availableTargetCategories.includes(
            categoryId
          ) &&
          lockCompatibility[categoryId]
        );
      })
      .sort(compareCandidatesByPolicy);

  const strongestCompleteWritableCandidate =
    completeWritableCandidates.length > 0
      ? completeWritableCandidates[0]
      : null;

  const hasStrongCompleteWritableSave =
    strongestCompleteWritableCandidate !== null &&
    strongestCompleteWritableCandidate.absoluteScoreSignal >=
      Math.max(
        strongestCompleteWritableCandidate.minimumAcceptableScore ??
          0,
        Math.floor(
          strongestCompleteWritableCandidate.maxPossibleScore *
            0.8
        )
      );

  const highValueBuilderCandidates =
    candidates
      .filter((candidate) =>
        isPreferredHighValueBuilderCandidate(
          candidate,
          availableTargetCategories,
          lockCompatibility
        )
      )
      .sort(compareCandidatesByPolicy);

  const bestSeedCandidate =
    highValueBuilderCandidates.length > 0
      ? highValueBuilderCandidates[0]
      : null;

  const highValueBuilderGenerated =
    highValueBuilderCandidates.length > 0;
  let highValueBuilderRejectedReason: string | null =
    null;

  const seedCandidateRank =
    bestSeedCandidate
      ? candidates.findIndex(
          (candidate) =>
            candidate === bestSeedCandidate
        ) + 1
      : null;

  const highValueBuilderRank =
    seedCandidateRank;

  const highValueBuilderGeneratedFromSingleDie =
    !!bestSeedCandidate?.highValueBuilderGeneratedFromSingleDie;
  const highValueBuilderValues =
    bestSeedCandidate?.lockValues ?? [];
  const highValueBuilderTargetCategory =
    bestSeedCandidate
      ? combinationToCategoryId[
          bestSeedCandidate.type
        ] ?? null
      : null;

  const selectedBestIsLowCompletion =
    isLowValueCompletionSupplementCandidate(best);

  const lowBaseAcceptedReason =
    allowLowBaseException
      ? (remainingRolls ?? 0) <= 1
        ? "last-roll-window"
        : availableCategoryCount <= 1
        ? "last-legal-option"
        : null
      : null;

  let seedPromotedBecauseNoBetterPattern = false;
  let selectedHighValueBuilder = false;
  let highValueBuilderAppliedBeforeReroll = false;
  let noLockRejectedBecauseHighValueBuilderExists =
    false;
  let highValueBuilderPromotedOverNoLock = false;

  // Check if high-value builder kills all legal paths before promoting
  const builderLegalPaths = bestSeedCandidate
    ? computeLegalPathsForCandidate(
        bestSeedCandidate,
        availableTargetCategories,
        lockCompatibility,
        bestSeedCandidate.type,
        previousTargetCategory
      )
    : null;

  const builderKillsAllPaths =
    builderLegalPaths?.lockKillsAllPaths ?? false;

  if (
    bestSeedCandidate !== null &&
    !allowLowBaseException &&
    !best.isComplete &&
    (selectedBestIsLowCompletion ||
      best.safeLockedDiceIndices.length === 0) &&
    !builderKillsAllPaths  // Legal paths check
  ) {
    best = bestSeedCandidate;
    seedPromotedBecauseNoBetterPattern = true;
    selectedHighValueBuilder = true;
    highValueBuilderAppliedBeforeReroll =
      (remainingRolls ?? 0) > 0;
    highValueBuilderPromotedOverNoLock = true;
  }

  if (
    (remainingRolls ?? 0) > 0 &&
    best.safeLockedDiceIndices.length === 0 &&
    bestSeedCandidate !== null &&
    !builderKillsAllPaths  // Legal paths check
  ) {
    best = bestSeedCandidate;
    seedPromotedBecauseNoBetterPattern = true;
    selectedHighValueBuilder = true;
    highValueBuilderAppliedBeforeReroll = true;
    noLockRejectedBecauseHighValueBuilderExists =
      true;
    highValueBuilderPromotedOverNoLock = true;
  }

  // No-lock safety: if candidate quality is too weak, reroll all.
  if (
    (remainingRolls ?? 0) > 0 &&
    (best.missingCount >
      phasePolicy.maxMissingWithoutStrong &&
      !hasStrongProgressCandidate &&
      !hasStrongSequenceDirection &&
      !hasStrongGroupedDirection) ||
    ((remainingRolls ?? 0) > 0 &&
      !hasAnyCompleteLegalCandidate &&
      best.safeLockedDiceIndices.length <
      phasePolicy.minRelevantIndices
    )
  ) {
      const forceImmediateStrongWritableSave =
        hasStrongCompleteWritableSave &&
        strongestCompleteWritableCandidate !== null;

      if (forceImmediateStrongWritableSave) {
        best = strongestCompleteWritableCandidate;
      }

    const canForceBuilderOverNoLock =
        !forceImmediateStrongWritableSave &&
      bestSeedCandidate !== null &&
      (remainingRolls ?? 0) > 0 &&
      !hasStrongCompleteWritableSave &&
      !builderKillsAllPaths;  // Legal paths check

      if (forceImmediateStrongWritableSave) {
        // Strong writable complete save is the only allowed override of high-value builder.
      } else if (canForceBuilderOverNoLock) {
      best = bestSeedCandidate;
      seedPromotedBecauseNoBetterPattern = true;
      selectedHighValueBuilder = true;
      highValueBuilderAppliedBeforeReroll = true;
      noLockRejectedBecauseHighValueBuilderExists =
        true;
      highValueBuilderPromotedOverNoLock = true;
    } else if (
      bestSeedCandidate !== null &&
      !hasAnyCompleteLegalCandidate &&
      (remainingRolls ?? 0) > 0
    ) {
      best = bestSeedCandidate;
      seedPromotedBecauseNoBetterPattern = true;
      selectedHighValueBuilder = true;
      highValueBuilderAppliedBeforeReroll = true;
      highValueBuilderPromotedOverNoLock = true;
    } else {
    if (
      highValueBuilderGenerated &&
      !selectedHighValueBuilder
    ) {
      highValueBuilderRejectedReason =
        hasStrongCompleteWritableSave
          ? "strong-complete-writable-save-exception"
          : "no-lock-safety-overrode-builder";
    }

    logAIDecisionAudit(
      currentDice,
      remainingRolls,
      matchContext,
      candidateAudit,
      best,
      [],
      candidates,
      {
        ...auditPolicyContext,
        selectedTargetAfterScoreboardFilter:
          combinationToCategoryId[best.type] ?? null,
        highValueBuilderCandidates:
          highValueBuilderCandidates.map(
            (candidate) => ({
              type: candidate.type,
              targetCategory:
                combinationToCategoryId[
                  candidate.type
                ] ?? null,
              lockValues: candidate.lockValues,
              strategyScore:
                candidate.strategyScore ??
                candidate.evaluationScore,
            })
          ),
        selectedHighValueBuilder: false,
        highValueBuilderGenerated,
        highValueBuilderGeneratedFromSingleDie,
        highValueBuilderValues,
        highValueBuilderTargetCategory,
        highValueBuilderPromotedOverNoLock,
        highValueBuilderRejectedReason,
        highValueBuilderRank,
        lowPairRejectedBecauseHighValueBuilderExists:
          lowPairRejectedBecauseHighValueBuilderExists,
        lowTripleRejectedBecauseHighValueBuilderExists:
          lowTripleRejectedBecauseHighValueBuilderExists,
        lowValueCompletionRejectedBeforeFinalRoll,
        lowValueAllowedOnlyBecauseFinalRoll:
          selectedBestIsLowCompletion &&
          (remainingRolls ?? 0) <= 1,
        highValueBuilderCheckedBeforeReroll,
        highValueBuilderAvailable,
        highValueBuilderAppliedBeforeReroll,
        rerollBlockedUntilHighValueBuilderEvaluated,
        rerollWithoutLockReason:
          bestSeedCandidate !== null
            ? "builder-rejected-by-no-lock-safety"
            : "opportunity-too-weak-no-high-value-builder",
        noLockRejectedBecauseHighValueBuilderExists,
        lowBaseAcceptedReason,
        seedCandidateRank,
        selectedCandidateType: null,
        selectedTargetCategory: null,
        selectedLockMask: [
          false,
          false,
          false,
          false,
          false,
          false,
        ],
        noLockSelectedOverSeed:
          bestSeedCandidate !== null,
        noLockSelectedOverSeedReason:
          bestSeedCandidate !== null
            ? "no-lock-safety-over-seed"
            : "no-high-value-builder",
        seedPromotedBecauseNoBetterPattern: false,
      }
    );

    return {
      targetCategory: null,
      lockMask: [
        false,
        false,
        false,
        false,
        false,
        false,
      ],
      lockedDiceIndices: [],
      action:
        (remainingRolls ?? 0) > 0
          ? "roll"
          : "end_turn",
      confidence: 0.3,
      riskLevel: toRiskLevel(
        remainingRolls,
        matchContext
      ),
      aiScore: matchContext.aiScore,
      bestOpponentScore:
        matchContext.bestOpponentScore,
      endgameMode: matchContext.endgameMode,
      scoreDelta: matchContext.scoreDelta,
      aiRemainingPotential:
        matchContext.aiRemainingPotential,
      opponentRemainingPotential:
        matchContext.opponentRemainingPotential,
      requiredScoreEstimate:
        matchContext.requiredScoreEstimate,
      opponentScore: matchContext.opponentScore,
      remainingCategories:
        matchContext.remainingCategories,
      riskBecauseBehind:
        matchContext.riskBecauseBehind,
      saveRejectedBecauseTooLow: false,
      currentPlanValue: 0,
      alternativePlanValue: 0,
      pivotThreshold: 0,
      pivotReason: "opportunity-too-weak",
      reason: `noChange: opportunity too weak | endgame=${matchContext.endgameMode} | scoreDelta=${matchContext.scoreDelta} | required=${matchContext.requiredScoreEstimate}`,
      fallbackReason: "opportunity-too-weak",
    };
    }
  }

  const selectedStrategyValue =
    best.strategyScore ?? best.evaluationScore;
  const hasBetterLegalAlternative =
    candidates.some(
      (candidate) =>
        candidate !== best &&
        (candidate.strategyScore ??
          candidate.evaluationScore) >
          selectedStrategyValue
    );
  const isLastLegalOption =
    candidates.length <= 1 ||
    availableTargetCategories.length <= 1;

  const actionDecision = decideAction(
    best,
    remainingRolls,
    matchContext,
    playerScores,
    hasBetterLegalAlternative,
    isLastLegalOption
  );

  if (
    highValueBuilderGenerated &&
    !selectedHighValueBuilder
  ) {
    highValueBuilderRejectedReason =
      hasStrongCompleteWritableSave &&
      best.isComplete
        ? "strong-complete-writable-save-exception"
        : "higher-ranked-legal-candidate";
  }

  const selectedTargetCategory =
    combinationToCategoryId[best.type] ?? null;
  const selectedTargetIsWritable =
    selectedTargetCategory !== null &&
    availableTargetCategories.includes(
      selectedTargetCategory
    );

  const bestAlternativeCandidate =
    candidates.find(
      (candidate) => candidate !== best
    ) ?? null;

  const targetProgressBeforeRoll =
    previousPlanCandidate?.currentProgress ??
    previousPlanCandidate?.currentMatchCount ??
    null;
  const targetProgressAfterRoll =
    best.currentProgress ?? best.currentMatchCount;
  const noProgressReevaluationTriggered =
    previousPlanCandidate !== null &&
    combinationToCategoryId[
      previousPlanCandidate.type
    ] !==
      combinationToCategoryId[best.type] &&
    targetProgressBeforeRoll !== null &&
    targetProgressAfterRoll <= targetProgressBeforeRoll;

  logAIDecisionAudit(
    currentDice,
    remainingRolls,
    matchContext,
    candidateAudit,
    best,
    best.safeLockedDiceIndices,
    candidates,
    {
      ...auditPolicyContext,
      selectedTargetAfterScoreboardFilter:
        combinationToCategoryId[best.type] ?? null,
      selectedTargetIsWritable,
      highValueBuilderCandidates:
        highValueBuilderCandidates.map(
          (candidate) => ({
            type: candidate.type,
            targetCategory:
              combinationToCategoryId[
                candidate.type
              ] ?? null,
            lockValues: candidate.lockValues,
            strategyScore:
              candidate.strategyScore ??
              candidate.evaluationScore,
          })
        ),
      selectedHighValueBuilder,
      highValueBuilderGenerated,
      highValueBuilderGeneratedFromSingleDie,
      highValueBuilderValues,
      highValueBuilderTargetCategory,
      highValueBuilderPromotedOverNoLock,
      highValueBuilderRejectedReason,
      highValueBuilderRank,
      lowPairRejectedBecauseHighValueBuilderExists:
        lowPairRejectedBecauseHighValueBuilderExists,
      lowTripleRejectedBecauseHighValueBuilderExists:
        lowTripleRejectedBecauseHighValueBuilderExists,
      lowValueCompletionRejectedBeforeFinalRoll,
      lowValueAllowedOnlyBecauseFinalRoll:
        isLowValueCompletionSupplementCandidate(best) &&
        (remainingRolls ?? 0) <= 1,
      highValueBuilderCheckedBeforeReroll,
      highValueBuilderAvailable,
      highValueBuilderAppliedBeforeReroll:
        highValueBuilderAppliedBeforeReroll ||
        ((remainingRolls ?? 0) > 0 &&
          bestSeedCandidate !== null &&
          best === bestSeedCandidate),
      rerollBlockedUntilHighValueBuilderEvaluated,
      rerollWithoutLockReason:
        actionDecision.action === "roll" &&
        best.safeLockedDiceIndices.length === 0
          ? "no-high-value-builder-with-safe-lock"
          : null,
      noLockRejectedBecauseHighValueBuilderExists,
      lowBaseAcceptedReason,
      seedCandidateRank,
      selectedCandidateType:
        selectedHighValueBuilder
          ? "high-value-builder"
          : best.type,
      selectedTargetCategory,
      selectedLockMask: toLockMask(
        best.safeLockedDiceIndices
      ),
      noLockSelectedOverSeed: false,
      noLockSelectedOverSeedReason: null,
      seedPromotedBecauseNoBetterPattern,
      saveCandidateDetected: best.isComplete,
      saveCandidateWritable:
        selectedTargetIsWritable &&
        best.selectedCandidateValidationResult !==
          "rejected",
      saveCandidateScore:
        best.absoluteScoreSignal,
      saveBlockedReason:
        actionDecision.saveBlockedReason,
      strategyFilterBlockedSave:
        actionDecision.strategyFilterBlockedSave,
      rollbackSimplifiedPolicyUsed: true,
      lowScoreRejectedButFallbackExists:
        actionDecision.lowScoreRejectedButFallbackExists,
      lowScoreAcceptedBecauseNoBetterLegalOption:
        actionDecision.lowScoreAcceptedBecauseNoBetterLegalOption,
      lockBlockedBecauseTargetNotWritable:
        !selectedTargetIsWritable,
      detectedCombination:
        detectedCombination,
      detectedCombinationWritable:
        detectedCombinationWritable,
      detectedCombinationRejectedReason:
        detectedCombinationRejectedReason,
      previousTargetCategory,
      reevaluatedAfterRoll: true,
      currentTargetScore: currentPlanValue,
      bestAlternativeTarget:
        bestAlternativeCandidate
          ? combinationToCategoryId[
              bestAlternativeCandidate.type
            ] ?? null
          : null,
      bestAlternativeScore:
        bestAlternativeCandidate
          ? bestAlternativeCandidate.strategyScore ??
            bestAlternativeCandidate.evaluationScore
          : null,
      preLockViabilityChecked:
        best.preLockViabilityChecked ?? false,
      projectedMaxScoreFromLock:
        best.projectedMaxScoreFromLock ?? null,
      minimumAcceptableScore:
        best.minimumAcceptableScore ?? null,
      lockRejectedBecauseBelowMinimumPotential:
        best.lockRejectedBecauseBelowMinimumPotential ?? false,
      lowTriplePenaltyApplied:
        best.lowTriplePenaltyApplied ?? false,
      lowTripleAcceptedReason:
        best.lowTripleAcceptedReason ?? null,
      structuralTargetCategory:
        best.structuralTargetCategory ?? null,
      oneFiveFallbackAttempted:
        best.oneFiveFallbackAttempted ?? false,
      oneFiveFallbackBlocked:
        best.oneFiveFallbackBlocked ?? false,
      targetSpecificLockBuilderUsed:
        best.targetSpecificLockBuilderUsed ?? null,
      targetProgressBeforeRoll,
      targetProgressAfterRoll,
      noProgressReevaluationTriggered,
      pivotAccepted,
      pivotRejectedReason,
      openOptionsImprovedBy,
      saveChosenOverRiskReason:
        actionDecision.saveChosenOverRiskReason,
      riskChosenOverSaveReason:
        actionDecision.riskChosenOverSaveReason,
      deadEndDetected: false,
      bestLegalFallbackScore: null,
      targetPreservedBecauseDetectedNotWritable:
        detectedCombinationBlocksPlan &&
        !!previousPlanCandidate,
      fullLockRejectedBecauseNotWritable:
        detectedCombinationBlocksPlan &&
        best.safeLockedDiceIndices.length === 6,
    }
  );

  return {
    targetCategory:
      combinationToCategoryId[best.type] ?? null,
    lockMask: toLockMask(
      best.safeLockedDiceIndices
    ),
    selectedCandidateType:
      selectedHighValueBuilder
        ? "high-value-builder"
        : best.type,
    selectedLockMask: toLockMask(
      best.safeLockedDiceIndices
    ),
    lockedDiceIndices:
      best.safeLockedDiceIndices,
    action: actionDecision.action,
    confidence: toConfidence(best),
    riskLevel: toRiskLevel(
      remainingRolls,
      matchContext
    ),
    aiScore: matchContext.aiScore,
    bestOpponentScore:
      matchContext.bestOpponentScore,
    endgameMode: matchContext.endgameMode,
    scoreDelta: matchContext.scoreDelta,
    aiRemainingPotential:
      matchContext.aiRemainingPotential,
    opponentRemainingPotential:
      matchContext.opponentRemainingPotential,
    requiredScoreEstimate:
      matchContext.requiredScoreEstimate,
    opponentScore: matchContext.opponentScore,
    remainingCategories:
      matchContext.remainingCategories,
    riskBecauseBehind:
      matchContext.riskBecauseBehind,
    saveRejectedBecauseTooLow:
      actionDecision.saveRejectedBecauseTooLow,
    currentPlanValue,
    alternativePlanValue,
    pivotThreshold: dynamicPivotThreshold,
    pivotReason,
    reason: `Target-first ${best.type} (strategy ${Math.round(best.strategyScore ?? best.evaluationScore)}, eval ${Math.round(best.evaluationScore)}, missing ${best.missingCount}, ${best.writeState}, available ${availableCategoryCount}, endgame=${matchContext.endgameMode}, delta=${matchContext.scoreDelta}, required=${matchContext.requiredScoreEstimate}, behind=${matchContext.riskBecauseBehind}, pivot=${pivotReason})`,
  };
}
