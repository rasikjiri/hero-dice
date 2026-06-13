export type PlayModeResult = {
  combination: string;
  score: number;
};

const getCounts = (
  dice: number[]
) => {
  const counts: Record<
    number,
    number
  > = {};

  dice.forEach((value) => {
    counts[value] =
      (counts[value] || 0) + 1;
  });

  return counts;
};

export const detectCombination = (
  dice: number[]
): PlayModeResult | null => {
  const sortedDice = [
    ...dice,
  ].sort((a, b) => a - b);

  const score =
    sortedDice.reduce(
      (sum, value) =>
        sum + value,
      0
    );

  const counts =
    getCounts(sortedDice);

  const values =
    Object.values(counts).sort(
      (a, b) => b - a
    );

const groupedValues =
  Object.entries(counts)
    .map(
      ([value, count]) => ({
        value:
          Number(value),
        count,
      })
    )
    .sort(
      (a, b) =>
        b.count - a.count
    );

  // GENERÁL
  if (values[0] === 6) {
    return {
      combination:
        "Generál",
      score,
    };
  }

  // PYRAMIDA / HROZEN
if (
  groupedValues.length ===
  3 &&
  groupedValues[0].count ===
    3 &&
  groupedValues[1].count ===
    2 &&
  groupedValues[2].count ===
    1
) {
  const triple =
    groupedValues[0].value;

  const pair =
    groupedValues[1].value;

  const single =
    groupedValues[2].value;

  // PYRAMIDA
  if (
    triple > pair &&
    pair > single
  ) {
    return {
      combination:
        "Pyramida",
      score,
    };
  }

  // HROZEN
  if (
    triple < pair &&
    pair < single
  ) {
    return {
      combination:
        "Hrozen",
      score,
    };
  }
}

  // POSTUPKA
  if (
    sortedDice.join(",") ===
    "1,2,3,4,5,6"
  ) {
    return {
      combination:
        "Postupka",
      score,
    };
  }

  // Čtyři-dvě
  if (
    values[0] === 4 &&
    values[1] === 2
  ) {
    return {
      combination: "Čtyři-dvě",
      score,
    };
  }

  // TROJICE
  if (
    values[0] === 3 &&
    values[1] === 3
  ) {
    return {
      combination:
        "Trojice",
      score,
    };
  }

  // DVOJICE
  if (
    values[0] === 2 &&
    values[1] === 2 &&
    values[2] === 2
  ) {
    return {
      combination:
        "Dvojice",
      score,
    };
  }

  return null;
};