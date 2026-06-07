import { players } from "./players";

import { supabase } from "../lib/supabase";

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

export const saveFinishedGame =
  async (
    game: FinishedGame
  ) => {
    const games =
      getFinishedGames();

    games.push(game);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(games)
    );

    await supabase
      .from("games")
      .insert([
        {
          winner: game.winner,
          winner_score:
            game.winnerScore,
          players: game.players,
          scores: game.scores,
        },
      ]);
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
    let bestValue = 0;

    players.forEach((player) => {
      const wins =
        getPlayerWins(
          player.id
        );

      if (wins > bestValue) {
        bestValue = wins;
      }
    });

    const bestPlayers =
      players
        .filter(
          (player) =>
            getPlayerWins(
              player.id
            ) === bestValue
        )
        .slice(0, 2)
        .map(
          (player) =>
            player.name
        );

    return {
      name:
        bestPlayers.join(
          ", "
        ) || "-",
      value: bestValue,
    };
  };

export const getTopPlayerByScore =
  () => {
    let bestValue = 0;

    players.forEach((player) => {
      const score =
        getBestScore(
          player.id
        );

      if (score > bestValue) {
        bestValue = score;
      }
    });

    const bestPlayers =
      players
        .filter(
          (player) =>
            getBestScore(
              player.id
            ) === bestValue
        )
        .slice(0, 2)
        .map(
          (player) =>
            player.name
        );

    return {
      name:
        bestPlayers.join(
          ", "
        ) || "-",
      value: bestValue,
    };
  };

export const getTopPlayerByAverage =
  () => {
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
      }
    });

    const bestPlayers =
      players
        .filter(
          (player) =>
            getAverageScore(
              player.id
            ) === bestValue
        )
        .slice(0, 2)
        .map(
          (player) =>
            player.name
        );

    return {
      name:
        bestPlayers.join(
          ", "
        ) || "-",
      value: bestValue,
    };
  };

export const getTopPlayerByGamesPlayed =
  () => {
    let bestValue = 0;

    players.forEach((player) => {
      const gamesPlayed =
        getFinishedGames().filter(
          (game) =>
            game.scores.find(
              (p) =>
                p.playerId ===
                player.id
            ) !== undefined
        ).length;

      if (
        gamesPlayed > bestValue
      ) {
        bestValue =
          gamesPlayed;
      }
    });

    const bestPlayers =
      players
        .filter((player) => {
          const gamesPlayed =
            getFinishedGames().filter(
              (game) =>
                game.scores.find(
                  (p) =>
                    p.playerId ===
                    player.id
                ) !== undefined
            ).length;

          return (
            gamesPlayed ===
            bestValue
          );
        })
        .slice(0, 2)
        .map(
          (player) =>
            player.name
        );

    return {
      name:
        bestPlayers.join(
          ", "
        ) || "-",
      value: bestValue,
    };
  };

export const getTopPlayerByPerfects =
  () => {
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
      }
    });

    const bestPlayers =
      players
        .filter(
          (player) =>
            getPerfectCategories(
              player.id
            ) === bestValue
        )
        .slice(0, 2)
        .map(
          (player) =>
            player.name
        );

    return {
      name:
        bestPlayers.join(
          ", "
        ) || "-",
      value: bestValue,
    };
  };

export const getTopPlayerByAveragePerfects =
  () => {
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
      }
    });

    const bestPlayers =
      players
        .filter(
          (player) =>
            getAveragePerfects(
              player.id
            ) === bestValue
        )
        .slice(0, 2)
        .map(
          (player) =>
            player.name
        );

    return {
      name:
        bestPlayers.join(
          ", "
        ) || "-",
      value: bestValue,
    };
  };
export const syncGamesFromSupabase =
  async () => {
    const { data, error } =
      await supabase
        .from("games")
        .select("*")
        .order("created_at", {
          ascending: true,
        });

    if (error || !data) {
      console.error(
        "Supabase sync error",
        error
      );

      return;
    }

    const formattedGames =
      data.map((game) => ({
        date:
          game.created_at ||
          new Date().toISOString(),

        winner: game.winner,

        winnerScore:
          game.winner_score,

        players:
          game.players || [],

        scores:
          game.scores || [],
      }));

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        formattedGames
      )
    );
  };
  