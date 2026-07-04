"use client";
import { useState } from "react";

import {
  getFinishedGames,
  getPlayerWins,
  getBestScore,
  getAverageScore,
  getPerfectCategories,
  getAveragePerfects,
} from "../data/statistics";

type Props = {
  players: {
    id: string;
    name: string;
    active: boolean;
  }[];

  onClose: () => void;

  onOpenFunGames: () => void;
};

export default function StatisticsModal({
  players,
  onClose,
  onOpenFunGames,
}: Props) {
  const games = getFinishedGames();

const [sortKey, setSortKey] =
  useState("bestScore");

const [sortDirection, setSortDirection] =
  useState<"asc" | "desc">(
    "desc"
  );

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

const playersWithGames =
  Array.from(
    new Set(
      games.flatMap((game) =>
        Array.isArray(
          game.scores
        )
          ? game.scores.map(
              (score: any) =>
                score.playerId
            )
          : []
      )
    )
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
      active: true,
    };
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 p-6 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
  <h2 className="text-5xl font-black text-yellow-400">
    Statistiky
  </h2>

  <div className="flex gap-3">
    <button
  onClick={onOpenFunGames}
  
      className="rounded-xl border border-zinc-600 bg-purple-600 px-5 py-3 font-bold text-white transition hover:scale-[1.02] hover:brightness-110"
    >
      Fun hry
    </button>

    <button
      onClick={onClose}
      className="rounded-xl border border-zinc-600 bg-red-600 px-5 py-3 font-bold text-white transition hover:scale-[1.02] hover:brightness-110"
    >
      Zavřít
    </button>
  </div>
</div>

        {/* PLAYER STATS */}
        <div className="mb-14 overflow-x-auto rounded-2xl border border-zinc-700 bg-zinc-900">
          <table className="w-full">
            <thead className="bg-zinc-800">
              <tr>
                <th
  onClick={() =>
    handleSort("name")
  }
  className="cursor-pointer p-4 text-left"
>
  Hráč ↕
</th>

                <th
  onClick={() =>
    handleSort("wins")
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
    handleSort("games")
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
    const aGames =
      games.filter((game) =>
        Array.isArray(
          game.scores
        )
          ? game.scores.some(
              (p: any) =>
                p.playerId ===
                a.id
            )
          : false
      ).length;

    const bGames =
      games.filter((game) =>
        Array.isArray(
          game.scores
        )
          ? game.scores.some(
              (p: any) =>
                p.playerId ===
                b.id
            )
          : false
      ).length;

    const values: any = {
      name: [
        a.name,
        b.name,
      ],

      wins: [
        getPlayerWins(a.id),
        getPlayerWins(b.id),
      ],

      bestScore: [
        getBestScore(a.id),
        getBestScore(b.id),
      ],

      games: [
        aGames,
        bGames,
      ],

      average: [
        getAverageScore(a.id),
        getAverageScore(b.id),
      ],

      perfects: [
        getPerfectCategories(
          a.id
        ),
        getPerfectCategories(
          b.id
        ),
      ],

      averagePerfects: [
        getAveragePerfects(
          a.id
        ),
        getAveragePerfects(
          b.id
        ),
      ],
    };

    const [
      aValue,
      bValue,
    ] =
      values[sortKey];

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
      ? aValue - bValue
      : bValue - aValue;
  })
  .map(
  (player) => {
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
  {(players || []).find(
    (p) =>
      p.id === player.id
  )?.name || player.id}
</td>

                    <td className="p-4 text-center text-yellow-400">
                      {getPlayerWins(
                        player.id
                      )}
                    </td>

                    <td className="p-4 text-center text-yellow-400">
                      {getBestScore(
                        player.id
                      )}
                    </td>

                    <td className="p-4 text-center text-yellow-400">
                      {playerGames}
                    </td>

                    <td className="p-4 text-center text-yellow-400">
                      {getAverageScore(
                        player.id
                      )}
                    </td>

                    <td className="p-4 text-center text-yellow-400">
                      {getPerfectCategories(
                        player.id
                      )}
                    </td>

                    <td className="p-4 text-center text-yellow-400">
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
                const winnerScoreEntry = Array.isArray(game.scores)
                  ? game.scores.find((score: any) => score.playerId === game.winner)
                  : undefined;

                const winnerName =
  winnerScoreEntry?.playerName ||
  (players || []).find(
    (p) =>
      p.id ===
      game.winner
  )?.name ||
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
  score.playerName ||
  (players || []).find(
    (p) =>
      p.id ===
      score.playerId
  )?.name ||
  score.playerId;

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