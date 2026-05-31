"use client";

import { players } from "../data/players";

import {
  getFinishedGames,
  getPlayerWins,
  getBestScore,
  getAverageScore,
  getPerfectCategories,
  getAveragePerfects,
} from "../data/statistics";

type Props = {
  onClose: () => void;
};

export default function StatisticsModal({
  onClose,
}: Props) {
  const games = getFinishedGames();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 p-6 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-5xl font-black text-yellow-400">
            Statistiky
          </h2>

          <button
            onClick={onClose}
            className="rounded-xl bg-red-600 px-5 py-3 font-bold hover:bg-red-500"
          >
            Zavřít
          </button>
        </div>

        {/* PLAYER STATS */}
        <div className="mb-14 overflow-x-auto rounded-2xl border border-zinc-700 bg-zinc-900">
          <table className="w-full">
            <thead className="bg-zinc-800">
              <tr>
                <th className="p-4 text-left">
                  Hráč
                </th>

                <th className="p-4 text-center">
                  Výhry
                </th>

                <th className="p-4 text-center">
                  Nejlepší skóre
                </th>

                <th className="p-4 text-center">
                  Počet her
                </th>

                <th className="p-4 text-center">
                  Průměrné skóre
                </th>

                <th className="p-4 text-center">
                  Perfektní kategorie
                </th>

                <th className="p-4 text-center">
                  Průměr perfektních
                </th>
              </tr>
            </thead>

            <tbody>
              {players.map((player) => {
                const playerGames =
                  games.filter((game) =>
                    Array.isArray(
                      game.scores
                    )
                      ? game.scores.some(
                          (p: any) =>
                            p.playerId ===
                            player.id
                        )
                      : false
                  ).length;

                return (
                  <tr
                    key={player.id}
                    className="border-t border-zinc-700"
                  >
                    <td className="p-4 text-xl font-bold">
                      {player.name}
                    </td>

                    <td className="p-4 text-center text-green-400">
                      {getPlayerWins(
                        player.id
                      )}
                    </td>

                    <td className="p-4 text-center text-yellow-400">
                      {getBestScore(
                        player.id
                      )}
                    </td>

                    <td className="p-4 text-center">
                      {playerGames}
                    </td>

                    <td className="p-4 text-center text-blue-400">
                      {getAverageScore(
                        player.id
                      )}
                    </td>

                    <td className="p-4 text-center text-red-400">
                      {getPerfectCategories(
                        player.id
                      )}
                    </td>

                    <td className="p-4 text-center text-pink-400">
                      {getAveragePerfects(
                        player.id
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* GAME HISTORY */}
        <div className="rounded-2xl border border-zinc-700 bg-zinc-900 p-6">
          <h3 className="mb-6 text-3xl font-bold">
            Historie her
          </h3>

          <div className="space-y-4">
            {games
              .slice()
              .reverse()
              .map((game, index) => {
                const winnerName =
                  players.find(
                    (p) =>
                      p.id ===
                      game.winner
                  )?.name || "-";

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
                      {
                        game.winnerScore
                      }
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
                              players.find(
                                (
                                  p
                                ) =>
                                  p.id ===
                                  score.playerId
                              )?.name ||
                              "-";

                            return (
                              <div
                                key={
                                  idx
                                }
                                className="rounded-lg bg-zinc-900 p-3"
                              >
                                <div className="font-bold">
                                  {
                                    playerName
                                  }
                                </div>

                                <div className="text-sm text-zinc-400">
                                  Skóre:{" "}
                                  {
                                    score.total
                                  }{" "}
                                  | Perfektní
                                  kategorie:{" "}
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