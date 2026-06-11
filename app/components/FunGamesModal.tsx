"use client";

import { useEffect, useState } from "react";
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
};

export default function FunGamesModal({
  players,
  onClose,
}: Props) {
  const [gamesCount, setGamesCount] =
    useState(0);

  const [games, setGames] =
    useState<any[]>([]);

  useEffect(() => {
    const loadGames =
      async () => {
        const {
          data,
          error,
          count,
        } = await supabase
          .from("fun_games")
          .select("*", {
            count: "exact",
          });

        if (error) {
          console.error(
            "Fun games load error:",
            error
          );

          return;
        }

        setGamesCount(
          count || 0
        );

        setGames(
          data || []
        );
      };

    loadGames();
  }, []);

  const playerStats =
    new Map<
      string,
      PlayerStats
    >();

  games.forEach((game) => {
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
          playerStats.get(
            score.playerId
          ) || {
            wins: 0,
            bestScore: 0,
            games: 0,
            totalScore: 0,
          };

        current.games++;

        current.totalScore +=
          score.total;

        current.bestScore =
          Math.max(
            current.bestScore,
            score.total
          );

        if (
          game.winner ===
          score.playerId
        ) {
          current.wins++;
        }

        playerStats.set(
          score.playerId,
          current
        );
      }
    );
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

        {/* FUN STATS */}
        <div className="mb-14 rounded-2xl border border-zinc-700 bg-zinc-900 p-6">
          <h3 className="mb-6 text-3xl font-bold">
            Statistiky ({gamesCount} her)
          </h3>

          <div className="overflow-x-auto rounded-xl border border-zinc-700">
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
                </tr>
              </thead>

              <tbody>
                {Array.from(
                  playerStats.entries()
                ).map(
                  ([
                    playerId,
                    stats,
                  ]) => (
                    <tr
                      key={playerId}
                      className="border-t border-zinc-700"
                    >
                      <td className="p-4 font-bold">
  {(players || []).find(
    (p) =>
      p.id === playerId
  )?.name ||
    playerId ||
    "-"}
</td>

                      <td className="p-4 text-center text-yellow-400">
                        {stats.wins}
                      </td>

                      <td className="p-4 text-center text-yellow-400">
                        {stats.bestScore}
                      </td>

                      <td className="p-4 text-center text-yellow-400">
                        {stats.games}
                      </td>

                      <td className="p-4 text-center text-yellow-400">
                        {Math.round(
                          stats.totalScore /
                            stats.games
                        )}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* FUN HISTORY */}
        <div className="rounded-2xl border border-zinc-700 bg-zinc-900 p-6">
          <h3 className="mb-6 text-3xl font-bold">
            Historie her
          </h3>

          <div className="rounded-xl border border-dashed border-zinc-700 p-8 text-center text-zinc-500">
            Připravujeme...
          </div>
        </div>
      </div>
    </div>
  );
}