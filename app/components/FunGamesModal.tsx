"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

type Props = {
  players: {
    id: string;
    name: string;
    active: boolean;
  }[];

  onClose: () => void;
};

type PlayerStats = {
  wins: number;
  bestScore: number;
  games: number;
  totalScore: number;
  perfectCategories: number;
};

export default function FunGamesModal({
  players,
  onClose,
}: Props) {
  const [games, setGames] =
    useState<any[]>([]);

  const [playerFilter, setPlayerFilter] =
    useState("all");

  const [rollFilter, setRollFilter] =
    useState("all");

  const [
    rewriteFilter,
    setRewriteFilter,
  ] = useState("all");

  const [bonusFilter, setBonusFilter] =
    useState("all");

  const [
    bonusRollsFilter,
    setBonusRollsFilter,
  ] = useState("all");

  const [sortKey, setSortKey] =
    useState("bestScore");

  const [sortDirection, setSortDirection] =
    useState<"asc" | "desc">(
      "desc"
    );

  useEffect(() => {
    const loadGames =
      async () => {
        const {
          data,
          error,
        } = await supabase
          .from("fun_games")
          .select("*")
          .order("created_at", {
            ascending: true,
          });

        if (error) {
          console.error(
            "Fun games load error:",
            error
          );

          return;
        }

        setGames(data || []);
      };

    loadGames();
  }, []);

  const handleSort = (
    key: string
  ) => {
    if (sortKey === key) {
      setSortDirection(
        sortDirection === "asc"
          ? "desc"
          : "asc"
      );
    } else {
      setSortKey(key);
      setSortDirection("desc");
    }
  };

  const filteredGames =
    useMemo(() => {
      return games.filter(
        (game) => {
          if (
            playerFilter !==
            "all"
          ) {
            const playerFound =
              Array.isArray(
                game.scores
              ) &&
              game.scores.some(
                (score: any) =>
                  score.playerId ===
                  playerFilter
              );

            if (!playerFound) {
              return false;
            }
          }

          if (
            rollFilter !==
              "all" &&
            Number(
              game.roll_count
            ) !==
              Number(
                rollFilter
              )
          ) {
            return false;
          }

          if (
            rewriteFilter !==
            "all"
          ) {
            const expected =
              rewriteFilter ===
              "true";

            if (
              game.rewrite_enabled !==
              expected
            ) {
              return false;
            }
          }

          if (
            bonusFilter ===
              "general-only" &&
            game.bonus_mode !==
              "general-only"
          ) {
            return false;
          }

          if (
            bonusFilter ===
              "bonus-all" &&
            game.bonus_mode !==
              "all"
          ) {
            return false;
          }

          if (
            bonusRollsFilter !==
              "all" &&
            Number(
              game.bonus_rolls
            ) !==
              Number(
                bonusRollsFilter
              )
          ) {
            return false;
          }

          return true;
        }
      );
    }, [
      games,
      playerFilter,
      rollFilter,
      rewriteFilter,
      bonusFilter,
      bonusRollsFilter,
    ]);

  const mostPlayedConfig =
    useMemo(() => {
      const configs =
        new Map<
          string,
          {
            count: number;
            rollCount: number;
            rewrite: boolean;
            bonusMode: string;
            bonusRolls: number;
          }
        >();

      games.forEach(
        (game) => {
          const key = [
            game.roll_count,
            game.rewrite_enabled,
            game.bonus_mode,
            game.bonus_rolls,
          ].join("|");

          const current =
            configs.get(key) || {
              count: 0,
              rollCount:
                game.roll_count,
              rewrite:
                game.rewrite_enabled,
              bonusMode:
                game.bonus_mode,
              bonusRolls:
                game.bonus_rolls,
            };

          current.count++;

          configs.set(
            key,
            current
          );
        }
      );

      return Array.from(
        configs.values()
      ).sort(
        (a, b) =>
          b.count - a.count
      )[0];
    }, [games]);

  const playerStats =
    useMemo(() => {
      const stats =
        new Map<
          string,
          PlayerStats
        >();

      filteredGames.forEach(
        (game) => {
          if (
            !Array.isArray(
              game.scores
            )
          ) {
            return;
          }

          game.scores.forEach(
            (score: any) => {
              const current =
                stats.get(
                  score.playerId
                ) || {
                  wins: 0,
                  bestScore: 0,
                  games: 0,
                  totalScore: 0,
                  perfectCategories:
                    0,
                };

              current.games++;

              current.totalScore +=
                score.total || 0;

              current.perfectCategories +=
                score.perfectCategories ||
                0;

              current.bestScore =
                Math.max(
                  current.bestScore,
                  score.total || 0
                );

              if (
                game.winner ===
                score.playerId
              ) {
                current.wins++;
              }

              stats.set(
                score.playerId,
                current
              );
            }
          );
        }
      );

      return stats;
    }, [filteredGames]);

  const playersWithGames =
    Array.from(
      playerStats.keys()
    ).map((playerId) => {
      const existingPlayer =
        (players || []).find(
          (p) =>
            p.id === playerId
        );

      return {
        id: playerId,
        name:
          existingPlayer?.name ||
          playerId,
      };
    });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 p-6 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-5xl font-black text-yellow-400">
            Fun hry
          </h2>

          <button
            onClick={onClose}
            className="rounded-xl bg-red-600 px-5 py-3 font-bold hover:bg-red-500"
          >
            Zavřít
          </button>
        </div>

        <div className="mb-8 rounded-2xl border border-zinc-700 bg-zinc-900 p-6">
          <div className="grid gap-4 md:grid-cols-5">
            <div>
              <label className="mb-2 block text-sm font-bold text-zinc-400">
                Hráč
              </label>

              <select
                value={
                  playerFilter
                }
                onChange={(e) =>
                  setPlayerFilter(
                    e.target.value
                  )
                }
                className="w-full rounded-xl bg-zinc-800 p-3"
              >
                <option value="all">
                  Všichni
                </option>

                {players.map(
                  (player) => (
                    <option
                      key={
                        player.id
                      }
                      value={
                        player.id
                      }
                    >
                      {player.name}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-zinc-400">
                Počet hodů
              </label>

              <select
                value={rollFilter}
                onChange={(e) =>
                  setRollFilter(
                    e.target.value
                  )
                }
                className="w-full rounded-xl bg-zinc-800 p-3"
              >
                <option value="all">
                  Všechny
                </option>

                {[1, 2, 3, 4, 5, 6, 7].map(
                  (value) => (
                    <option
                      key={value}
                      value={value}
                    >
                      {value}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-zinc-400">
                Přepisování
              </label>

              <select
                value={
                  rewriteFilter
                }
                onChange={(e) =>
                  setRewriteFilter(
                    e.target.value
                  )
                }
                className="w-full rounded-xl bg-zinc-800 p-3"
              >
                <option value="all">
                  Všechny
                </option>

                <option value="true">
                  Ano
                </option>

                <option value="false">
                  Ne
                </option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-zinc-400">
                Bonus
              </label>

              <select
                value={
                  bonusFilter
                }
                onChange={(e) =>
                  setBonusFilter(
                    e.target.value
                  )
                }
                className="w-full rounded-xl bg-zinc-800 p-3"
              >
                <option value="all">
                  Všechny
                </option>

                <option value="general-only">
                  Pouze Hero
                </option>

                <option value="bonus-all">
                  Všechny kombinace
                </option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-zinc-400">
                Bonusové hody
              </label>

              <select
                value={
                  bonusRollsFilter
                }
                onChange={(e) =>
                  setBonusRollsFilter(
                    e.target.value
                  )
                }
                className="w-full rounded-xl bg-zinc-800 p-3"
              >
                <option value="all">
                  Všechny
                </option>

                {[1,2,3,4,5,6,7,8,9,10].map(
                  (value) => (
                    <option
                      key={value}
                      value={value}
                    >
                      {value}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>
        </div>

        {mostPlayedConfig && (
          <div className="mb-8 rounded-2xl border border-zinc-700 bg-zinc-900 p-6">
            <h3 className="mb-4 text-2xl font-bold">
              Nejhranější konfigurace
            </h3>

            <div className="grid gap-3 md:grid-cols-5">
              <div>
                {mostPlayedConfig.rollCount} hodů
              </div>

              <div>
                {mostPlayedConfig.rewrite
                  ? "Přepisování ANO"
                  : "Přepisování NE"}
              </div>

              <div>
                {mostPlayedConfig.bonusMode ===
                "all"
                  ? "Všechny kombinace"
                  : "Pouze Hero"}
              </div>

              <div>
                Bonusové hody:{" "}
                {
                  mostPlayedConfig.bonusRolls
                }
              </div>

              <div>
                Odehráno:{" "}
                {
                  mostPlayedConfig.count
                }
              </div>
            </div>
          </div>
        )}
<div className="mb-14 overflow-x-auto rounded-2xl border border-zinc-700 bg-zinc-900">
          <div className="p-6">
            <h3 className="text-3xl font-bold">
              Statistiky (
              {
                filteredGames.length
              }{" "}
              her)
            </h3>
          </div>

          <table className="w-full">
            <thead className="bg-zinc-800">
              <tr>
                <th
                  onClick={() =>
                    handleSort(
                      "name"
                    )
                  }
                  className="cursor-pointer p-4 text-left"
                >
                  Hráč ↕
                </th>

                <th
                  onClick={() =>
                    handleSort(
                      "wins"
                    )
                  }
                  className="cursor-pointer p-4 text-center"
                >
                  Výhry ↕
                </th>

                <th
                  onClick={() =>
                    handleSort(
                      "bestScore"
                    )
                  }
                  className="cursor-pointer p-4 text-center"
                >
                  Nejlepší skóre ↕
                </th>

                <th
                  onClick={() =>
                    handleSort(
                      "games"
                    )
                  }
                  className="cursor-pointer p-4 text-center"
                >
                  Počet her ↕
                </th>

                <th
                  onClick={() =>
                    handleSort(
                      "average"
                    )
                  }
                  className="cursor-pointer p-4 text-center"
                >
                  Průměrné skóre ↕
                </th>

                <th
                  onClick={() =>
                    handleSort(
                      "perfects"
                    )
                  }
                  className="cursor-pointer p-4 text-center"
                >
                  Perfektní kategorie ↕
                </th>

                <th
                  onClick={() =>
                    handleSort(
                      "averagePerfects"
                    )
                  }
                  className="cursor-pointer p-4 text-center"
                >
                  Průměr perfektních ↕
                </th>
              </tr>
            </thead>

            <tbody>
              {[...playersWithGames]
                .sort((a, b) => {
                  const aStats =
                    playerStats.get(
                      a.id
                    )!;

                  const bStats =
                    playerStats.get(
                      b.id
                    )!;

                  const values: any =
                    {
                      name: [
                        a.name,
                        b.name,
                      ],

                      wins: [
                        aStats.wins,
                        bStats.wins,
                      ],

                      bestScore: [
                        aStats.bestScore,
                        bStats.bestScore,
                      ],

                      games: [
                        aStats.games,
                        bStats.games,
                      ],

                      average: [
                        Math.round(
                          aStats.totalScore /
                            aStats.games
                        ),
                        Math.round(
                          bStats.totalScore /
                            bStats.games
                        ),
                      ],

                      perfects: [
                        aStats.perfectCategories,
                        bStats.perfectCategories,
                      ],

                      averagePerfects:
                        [
                          Math.round(
                            aStats.perfectCategories /
                              aStats.games
                          ),
                          Math.round(
                            bStats.perfectCategories /
                              bStats.games
                          ),
                        ],
                    };

                  const [
                    aValue,
                    bValue,
                  ] =
                    values[
                      sortKey
                    ];

                  if (
                    typeof aValue ===
                    "string"
                  ) {
                    return sortDirection ===
                      "asc"
                      ? aValue.localeCompare(
                          bValue
                        )
                      : bValue.localeCompare(
                          aValue
                        );
                  }

                  return sortDirection ===
                    "asc"
                    ? aValue -
                        bValue
                    : bValue -
                        aValue;
                })
                .map((player) => {
                  const stats =
                    playerStats.get(
                      player.id
                    )!;

                  return (
                    <tr
                      key={
                        player.id
                      }
                      className="border-t border-zinc-700"
                    >
                      <td className="p-4 text-xl font-bold">
                        {player.name}
                      </td>

                      <td className="p-4 text-center text-yellow-400">
                        {
                          stats.wins
                        }
                      </td>

                      <td className="p-4 text-center text-yellow-400">
                        {
                          stats.bestScore
                        }
                      </td>

                      <td className="p-4 text-center text-yellow-400">
                        {
                          stats.games
                        }
                      </td>

                      <td className="p-4 text-center text-yellow-400">
                        {Math.round(
                          stats.totalScore /
                            stats.games
                        )}
                      </td>

                      <td className="p-4 text-center text-yellow-400">
                        {
                          stats.perfectCategories
                        }
                      </td>

                      <td className="p-4 text-center text-yellow-400">
                        {Math.round(
                          stats.perfectCategories /
                            stats.games
                        )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        <div className="rounded-2xl border border-zinc-700 bg-zinc-900 p-6">
  <h3 className="mb-6 text-3xl font-bold">
    Historie her
  </h3>

  <div className="space-y-4">
    {filteredGames
      .slice()
      .reverse()
      .map((game, index) => {
        const winnerScoreEntry = Array.isArray(game.scores)
          ? game.scores.find((score: any) => score.playerId === game.winner)
          : undefined;

        const winnerName =
          (players || []).find(
            (p) =>
              p.id ===
              game.winner
          )?.name ||
          winnerScoreEntry?.playerId ||
          game.winner;

        return (
          <div
            key={index}
            className="rounded-xl border border-zinc-700 bg-zinc-800 p-5"
          >
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div className="text-2xl font-bold text-yellow-400">
                🏆 {winnerName}
              </div>

              <div className="text-zinc-400">
                {new Date(
                  game.date
                ).toLocaleString(
                  "cs-CZ"
                )}
              </div>
            </div>

            <div className="mb-2">
              <strong>
                Vítězné skóre:
              </strong>{" "}
              {game.winner_score}
            </div>

            <div className="mb-4 flex flex-wrap gap-2 text-sm">
              <span className="rounded-lg bg-zinc-900 px-3 py-1">
                🎲 {game.roll_count} hodů
              </span>

              <span className="rounded-lg bg-zinc-900 px-3 py-1">
                ✏️{" "}
                {game.rewrite_enabled
                  ? "Přepisování ANO"
                  : "Přepisování NE"}
              </span>

              <span className="rounded-lg bg-zinc-900 px-3 py-1">
                🎁{" "}
                {game.bonus_mode ===
                "all"
                  ? "Všechny kombinace"
                  : "Pouze Hero"}
              </span>

              <span className="rounded-lg bg-zinc-900 px-3 py-1">
                ➕ Bonusové hody:{" "}
                {game.bonus_rolls}
              </span>
            </div>

            <div className="space-y-2">
              {Array.isArray(
                game.scores
              ) &&
                game.scores.map(
                  (
                    score: any,
                    idx: number
                  ) => {
                    const playerName =
                      (players || []).find(
                        (p) =>
                          p.id ===
                          score.playerId
                      )?.name ||
                      score.playerId;

                    return (
                      <div
                        key={idx}
                        className="rounded-lg bg-zinc-900 p-3"
                      >
                        <div className="font-bold">
                          {playerName}
                        </div>

                        <div className="text-sm text-zinc-400">
                          Skóre:{" "}
                          {score.total}
                          {" | "}
                          Perfektní kategorie:{" "}
                          {
                            score.perfectCategories
                          }
                        </div>
                      </div>
                    );
                  }
                )}
            </div>
          </div>
        );
      })}
  </div>
</div>
      </div>
    </div>
  );
}