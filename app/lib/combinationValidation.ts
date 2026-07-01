import {
  detectCombination,
  type PlayModeResult,
} from "./playMode";

export type PlayModeCategoryId =
  | "general"
  | "pyramida"
  | "hrozen"
  | "postupka"
  | "ctyri_dva"
  | "trojce"
  | "dvojce";

export const playModeCategoryMap: Record<
  string,
  PlayModeCategoryId
> = {
  Generál: "general",
  Pyramida: "pyramida",
  Hrozen: "hrozen",
  Postupka: "postupka",
  "Čtyři-dvě": "ctyri_dva",
  Trojice: "trojce",
  Dvojice: "dvojce",
};

export type CandidateValidationResult = {
  candidateDice: number[];
  candidateCombinationFromGameValidator: PlayModeResult | null;
  candidateCombinationCategoryId: PlayModeCategoryId | null;
  rejectedBecauseNoCombination: boolean;
  rejectedBecauseIncompatibleWithFixedLocks: boolean;
  rejectedBecauseFullLockWithoutValidCombination: boolean;
  selectedCandidateValidationResult:
    | "accepted"
    | "risk"
    | "rejected";
  validationReason: string;
};

export type DetectedCombinationWriteState = {
  detectedCombination: PlayModeResult | null;
  detectedCombinationCategoryId: PlayModeCategoryId | null;
  detectedCombinationWritable: boolean;
  detectedCombinationRejectedReason: string | null;
};

const combinationMaxScore: Record<
  PlayModeCategoryId,
  number
> = {
  general: 36,
  pyramida: 32,
  hrozen: 28,
  postupka: 21,
  ctyri_dva: 34,
  trojce: 33,
  dvojce: 30,
};

const normalizeFixedLocks = (
  fixedLocks: boolean[]
): boolean[] =>
  fixedLocks.length === 6
    ? [...fixedLocks]
    : [
        false,
        false,
        false,
        false,
        false,
        false,
      ];

export const mergeWithFixedLocks = (
  lockMask: boolean[],
  fixedLocks: boolean[]
): boolean[] => {
  const normalizedLockMask =
    lockMask.length === 6
      ? [...lockMask]
      : [
          false,
          false,
          false,
          false,
          false,
          false,
        ];
  const normalizedFixedLocks = normalizeFixedLocks(
    fixedLocks
  );

  return normalizedFixedLocks.map(
    (isFixed, index) =>
      isFixed || normalizedLockMask[index]
  );
};

export const canTargetCategoryWorkWithFixedLocks = (
  targetCategory: string | null,
  dice: number[],
  fixedLocks: boolean[]
) => {
  if (!targetCategory) {
    return true;
  }

  const normalizedFixedLocks = normalizeFixedLocks(
    fixedLocks
  );

  if (!normalizedFixedLocks.some(Boolean)) {
    return true;
  }

  const openIndices = normalizedFixedLocks
    .map((isFixed, index) =>
      isFixed ? -1 : index
    )
    .filter((index) => index >= 0);

  const candidateDice = [...dice];

  const matchesTarget = () => {
    const result = detectCombination(candidateDice);

    if (!result) {
      return false;
    }

    return (
      playModeCategoryMap[result.combination] ===
      targetCategory
    );
  };

  if (matchesTarget()) {
    return true;
  }

  const canComplete = (position: number): boolean => {
    if (position >= openIndices.length) {
      return matchesTarget();
    }

    const diceIndex = openIndices[position];

    for (let value = 1; value <= 6; value += 1) {
      candidateDice[diceIndex] = value;

      if (canComplete(position + 1)) {
        return true;
      }
    }

    return false;
  };

  return canComplete(0);
};

export const validateCandidateAgainstGameValidator = (
  targetCategory: string | null,
  dice: number[],
  fixedLocks: boolean[],
  workingLocks: boolean[]
): CandidateValidationResult => {
  const candidateDice = [...dice];
  const candidateCombinationFromGameValidator =
    detectCombination(candidateDice);
  const candidateCombinationCategoryId =
    candidateCombinationFromGameValidator
      ? playModeCategoryMap[
          candidateCombinationFromGameValidator.combination
        ] ?? null
      : null;
  const candidateCombinationIsMissing =
    candidateCombinationFromGameValidator === null;
  const incompatibleWithFixedLocks =
    !canTargetCategoryWorkWithFixedLocks(
      targetCategory,
      dice,
      fixedLocks
    );
  const fullLockWithoutValidCombination =
    workingLocks.length === 6 &&
    workingLocks.every(Boolean) &&
    candidateCombinationIsMissing;

  let selectedCandidateValidationResult:
    | "accepted"
    | "risk"
    | "rejected" = "accepted";

  if (
    incompatibleWithFixedLocks ||
    fullLockWithoutValidCombination
  ) {
    selectedCandidateValidationResult =
      "rejected";
  } else if (candidateCombinationIsMissing) {
    selectedCandidateValidationResult = "risk";
  }

  const validationReason =
    selectedCandidateValidationResult ===
    "accepted"
      ? "candidate-valid-with-game-validator"
      : selectedCandidateValidationResult === "risk"
      ? "candidate-needs-risk-acceptance-because-game-validator-reports-no-combination"
      : fullLockWithoutValidCombination
      ? "full-lock-without-valid-combination"
      : "incompatible-with-fixed-locks";

  return {
    candidateDice,
    candidateCombinationFromGameValidator,
    candidateCombinationCategoryId,
    rejectedBecauseNoCombination:
      candidateCombinationIsMissing,
    rejectedBecauseIncompatibleWithFixedLocks:
      incompatibleWithFixedLocks,
    rejectedBecauseFullLockWithoutValidCombination:
      fullLockWithoutValidCombination,
    selectedCandidateValidationResult,
    validationReason,
  };
};

export const getDetectedCombinationWriteState = (
  dice: number[],
  playerScores: Record<string, number>,
  playModeAllowRewrite: boolean
): DetectedCombinationWriteState => {
  const detectedCombination = detectCombination(dice);

  if (!detectedCombination) {
    return {
      detectedCombination: null,
      detectedCombinationCategoryId: null,
      detectedCombinationWritable: false,
      detectedCombinationRejectedReason:
        "no-combination",
    };
  }

  const detectedCombinationCategoryId =
    playModeCategoryMap[
      detectedCombination.combination
    ] ?? null;

  if (!detectedCombinationCategoryId) {
    return {
      detectedCombination,
      detectedCombinationCategoryId: null,
      detectedCombinationWritable: false,
      detectedCombinationRejectedReason:
        "unknown-category",
    };
  }

  const existingScore =
    playerScores[detectedCombinationCategoryId];

  if (
    existingScore !== undefined &&
    !playModeAllowRewrite
  ) {
    return {
      detectedCombination,
      detectedCombinationCategoryId,
      detectedCombinationWritable: false,
      detectedCombinationRejectedReason:
        "rewrite-disabled",
    };
  }

  if (
    existingScore !== undefined &&
    playModeAllowRewrite &&
    existingScore >= detectedCombination.score
  ) {
    return {
      detectedCombination,
      detectedCombinationCategoryId,
      detectedCombinationWritable: false,
      detectedCombinationRejectedReason:
        "not-better-than-existing",
    };
  }

  return {
    detectedCombination,
    detectedCombinationCategoryId,
    detectedCombinationWritable: true,
    detectedCombinationRejectedReason: null,
  };
};

export const getWritableCategoryIds = (
  playerScores: Record<string, number>,
  playModeAllowRewrite: boolean
): PlayModeCategoryId[] => {
  const result = Object.values(playModeCategoryMap).filter(
    (categoryId, index, allCategories) => {
      if (allCategories.indexOf(categoryId) !== index) {
        return false;
      }

      const existingScore = playerScores[categoryId];

      if (existingScore === undefined) {
        return true;
      }

      if (!playModeAllowRewrite) {
        return false;
      }

      return combinationMaxScore[categoryId] > existingScore;
    }
  );

  // DEBUG: Log filtered categories to localStorage
  if (typeof window !== 'undefined') {
    const logs = JSON.parse(localStorage.getItem('debugLogs') || '[]');
    logs.push({
      timestamp: new Date().toISOString(),
      function: 'getWritableCategoryIds',
      playerScores,
      playModeAllowRewrite,
      resultCategories: result,
    });
    // Keep only last 20 logs
    localStorage.setItem('debugLogs', JSON.stringify(logs.slice(-20)));
  }

  console.log('🔍 GET WRITABLE CATEGORIES:', {
    playerScores,
    playModeAllowRewrite,
    resultCategories: result,
    allCategories: Object.values(playModeCategoryMap),
  });

  return result;
};
