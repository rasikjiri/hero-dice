import { players } from "./players";

export type FinishedGame = {
  date: string;

  winner: string;

  winnerScore: number;

  players: string[];

  scores: {
    playerId: string;
    total: number;
    perfectCategories: number;
  }[];
};

const STORAGE_KEY = "hero-dice-games";

export const resetStatistics =
  (): void => {
    if (
      typeof window ===
      "undefined"
    ) {
      return;
    }

    localStorage.removeItem(
      STORAGE_KEY
    );
  };

export const saveFinishedGame = (
  game: FinishedGame
) => {
  const games =
    getFinishedGames();

  games.push(game);

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(games)
  );
};

export const getFinishedGames =
  (): FinishedGame[] => {
    if (
      typeof window ===
      "undefined"
    ) {
      return [];
    }

    const raw =
      localStorage.getItem(
        STORAGE_KEY
      );

    if (!raw) return [];

    try {
      const parsed =
        JSON.parse(raw);

      if (
        !Array.isArray(parsed)
      ) {
        return [];
      }

      return parsed.filter(
        (game) =>
          game &&
          Array.isArray(
            game.players
          ) &&
          Array.isArray(
            game.scores
          )
      );
    } catch {
      return [];
    }
  };

export const getPlayerWins = (
  playerId: string
): number => {
  const games =
    getFinishedGames();

  return games.filter(
    (game) =>
      game.winner === playerId
  ).length;
};

export const getBestScore = (
  playerId: string
): number => {
  const games =
    getFinishedGames();

  let best = 0;

  games.forEach((game) => {
    const playerScore =
      game.scores.find(
        (p) =>
          p.playerId === playerId
      );

    if (
      playerScore &&
      playerScore.total > best
    ) {
      best = playerScore.total;
    }
  });

  return best || 0;
};

export const getAverageScore = (
  playerId: string
): number => {
  const games =
    getFinishedGames();

  const playerGames =
    games.filter(
      (game) =>
        game.scores.find(
          (p) =>
            p.playerId === playerId
        ) !== undefined
    );

  if (
    playerGames.length === 0
  ) {
    return 0;
  }

  let total = 0;

  playerGames.forEach(
    (game) => {
      const playerScore =
        game.scores.find(
          (p) =>
            p.playerId === playerId
        );

      if (playerScore) {
        total +=
          playerScore.total;
      }
    }
  );

  return (
    Math.round(
      total /
        playerGames.length
    ) || 0
  );
};

export const getPerfectCategories =
  (
    playerId: string
  ): number => {
    const games =
      getFinishedGames();

    let totalPerfects = 0;

    games.forEach((game) => {
      const playerScore =
        game.scores.find(
          (p) =>
            p.playerId === playerId
        );

      if (playerScore) {
        totalPerfects +=
          playerScore.perfectCategories;
      }
    });

    return totalPerfects || 0;
  };

export const getAveragePerfects =
  (
    playerId: string
  ): number => {
    const games =
      getFinishedGames();

    const playerGames =
      games.filter(
        (game) =>
          game.scores.find(
            (p) =>
              p.playerId ===
              playerId
          ) !== undefined
      );

    if (
      playerGames.length === 0
    ) {
      return 0;
    }

    return (
      Math.round(
        getPerfectCategories(
          playerId
        ) /
          playerGames.length
      ) || 0
    );
  };

export const getTopPlayerByWins =
  () => {
    let bestPlayer = "-";
    let bestValue = 0;

    players.forEach((player) => {
      const wins =
        getPlayerWins(
          player.id
        );

      if (wins > bestValue) {
        bestValue = wins;
        bestPlayer =
          player.name;
      }
    });

    return {
      name: bestPlayer,
      value: bestValue,
    };
  };

export const getTopPlayerByScore =
  () => {
    let bestPlayer = "-";
    let bestValue = 0;

    players.forEach((player) => {
      const score =
        getBestScore(
          player.id
        );

      if (score > bestValue) {
        bestValue = score;
        bestPlayer =
          player.name;
      }
    });

    return {
      name: bestPlayer,
      value: bestValue,
    };
  };

export const getTopPlayerByAverage =
  () => {
    let bestPlayer = "-";
    let bestValue = 0;

    players.forEach((player) => {
      const average =
        getAverageScore(
          player.id
        );

      if (
        average > bestValue
      ) {
        bestValue = average;
        bestPlayer =
          player.name;
      }
    });

    return {
      name: bestPlayer,
      value: bestValue,
    };
  };

export const getTopPlayerByPerfects =
  () => {
    let bestPlayer = "-";
    let bestValue = 0;

    players.forEach((player) => {
      const perfects =
        getPerfectCategories(
          player.id
        );

      if (
        perfects > bestValue
      ) {
        bestValue = perfects;
        bestPlayer =
          player.name;
      }
    });

    return {
      name: bestPlayer,
      value: bestValue,
    };
  };
export const getTopPlayerByAveragePerfects =
  () => {
    let bestPlayer = "-";
    let bestValue = 0;

    players.forEach((player) => {
      const averagePerfects =
        getAveragePerfects(
          player.id
        );

      if (
        averagePerfects >
        bestValue
      ) {
        bestValue =
          averagePerfects;

        bestPlayer =
          player.name;
      }
    });

    return {
      name: bestPlayer,
      value: bestValue,
    };
  };
