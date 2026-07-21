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

type SortValueMap = Record<string, [string | number, string | number]>;

type HistoryScore = {
  playerId?: string;
  playerName?: string;
  total?: number;
  perfectCategories?: number;
  completedCategories?: number;
  maxedCategoryIds?: string[];
  categoryScores?: {
    general?: number | null;
    pyramida?: number | null;
    hrozen?: number | null;
    postupka?: number | null;
    ctyri_dva?: number | null;
    dvojce?: number | null;
    trojce?: number | null;
  };
};

type HistoryGame = {
  id?: string | number;
  date?: string | null;
  created_at?: string | null;
  winner?: string;
  winnerScore?: number;
  winner_score?: number;
  scores?: HistoryScore[];
};

type CategoryScoreKey =
  | "general"
  | "pyramida"
  | "hrozen"
  | "postupka"
  | "ctyri_dva"
  | "dvojce"
  | "trojce";

const CATEGORY_FILTER_OPTIONS: Array<{ key: CategoryScoreKey; label: string }> = [
  { key: "general", label: "Hero" },
  { key: "pyramida", label: "Pyramida" },
  { key: "hrozen", label: "Hrozen" },
  { key: "postupka", label: "Postupka" },
  { key: "ctyri_dva", label: "Čtyři-dvě" },
  { key: "dvojce", label: "Dvojce" },
  { key: "trojce", label: "Trojce" },
];

const ACTIVE_FILTER_CLASS = "border-green-400 bg-green-500 text-black";
const FUN_NAV_BUTTON_CLASS =
  "rounded-xl border border-purple-400/70 bg-purple-600 px-5 py-3 font-black text-white transition hover:scale-[1.02] hover:bg-purple-500 hover:brightness-110";

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
              (score: HistoryScore) =>
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

  const [expandedGameId, setExpandedGameId] = useState<string | number | null>(null);

  const [combinationCategoryFilters, setCombinationCategoryFilters] =
    useState<CategoryScoreKey[]>([]);

  const [combinationSortMetric, setCombinationSortMetric] =
    useState<"avg" | "max" | "count" | "perfects">("avg");

  const toggleMultiValue = <T,>(
    currentValues: T[],
    nextValue: T,
    setValues: (values: T[]) => void,
  ) => {
    setValues(
      currentValues.includes(nextValue)
        ? currentValues.filter((value) => value !== nextValue)
        : [...currentValues, nextValue],
    );
  };

  const resolvePlayerDisplayName = (
    playerId?: string,
    fallbackName?: string,
  ) => {
    const existingPlayer = (players || []).find((player) => player.id === playerId);

    if (existingPlayer) {
      return existingPlayer.name;
    }

    if (fallbackName && fallbackName.trim().length > 0) {
      return fallbackName;
    }

    return playerId || fallbackName || "Bez jména";
  };

  const getPlayedAt = (game: HistoryGame) => {
    const rawDate = game.created_at || game.date;

    if (!rawDate) {
      return "Bez data";
    }

    const parsedDate = new Date(rawDate);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Bez data";
    }

    return parsedDate.toLocaleString("cs-CZ");
  };

  const getWinnerScore = (game: HistoryGame) =>
    Number(game.winner_score ?? game.winnerScore ?? 0) || 0;

  const getSortedScores = (game: HistoryGame) => {
    if (!Array.isArray(game.scores)) {
      return [];
    }

    return game.scores
      .filter((score) => Boolean(score && score.playerId))
      .map((score, index) => ({
        ...score,
        total: Number(score.total) || 0,
        perfectCategories: Number(score.perfectCategories) || 0,
        originalIndex: index,
      }))
      .sort((a, b) => {
        if (b.total !== a.total) {
          return b.total - a.total;
        }

        if (b.perfectCategories !== a.perfectCategories) {
          return b.perfectCategories - a.perfectCategories;
        }

        return a.originalIndex - b.originalIndex;
      });
  };

  const getGameTitle = (game: HistoryGame) => {
    const sortedScores = getSortedScores(game);

    if (sortedScores.length === 0) {
      return {
        winnerName: resolvePlayerDisplayName(game.winner),
        opponents: [] as string[],
      };
    }

    const winnerEntry = game.winner
      ? sortedScores.find((score) => score.playerId === game.winner)
      : sortedScores[0];
    const winnerName = resolvePlayerDisplayName(game.winner, winnerEntry?.playerName);

    const opponents = sortedScores
      .filter((score) => score.playerId !== game.winner)
      .map((score) => resolvePlayerDisplayName(score.playerId, score.playerName));

    return {
      winnerName,
      opponents,
    };
  };

  const getCategoryBreakdownItems = (score: HistoryScore) => {
    const categoryScores = score.categoryScores;

    if (!categoryScores) {
      return [];
    }

    const categoryOrder: Array<{ key: keyof NonNullable<HistoryScore["categoryScores"]>; label: string }> = [
      { key: "general", label: "Hero" },
      { key: "pyramida", label: "Pyramida" },
      { key: "hrozen", label: "Hrozen" },
      { key: "postupka", label: "Postupka" },
      { key: "ctyri_dva", label: "Čtyři-dvě" },
      { key: "dvojce", label: "Dvojce" },
      { key: "trojce", label: "Trojce" },
    ];

    return categoryOrder.map((category) => {
      const value = categoryScores[category.key];
      const hasValue = typeof value === "number";
      const isPerfect = Array.isArray(score.maxedCategoryIds)
        ? score.maxedCategoryIds.includes(category.key)
        : false;

      return {
        key: category.key,
        label: category.label,
        value: hasValue ? value : null,
        isPerfect,
      };
    });
  };

  const historyGames = games as HistoryGame[];
  const visibleExpandedGameId = historyGames.some(
    (game, index) => (game.id ?? index) === expandedGameId,
  )
    ? expandedGameId
    : null;

  const combinationStatsRows = (() => {
    type CombinationAggregate = {
      playerId: string;
      playerName: string;
      categoryKey: CategoryScoreKey;
      categoryLabel: string;
      sum: number;
      count: number;
      max: number;
      perfects: number;
    };

    const aggregates = new Map<string, CombinationAggregate>();

    historyGames.forEach((game) => {
      if (!Array.isArray(game.scores)) {
        return;
      }

      game.scores.forEach((score) => {
        if (!score.playerId) {
          return;
        }

        const existingPlayerName =
          (players || []).find((player) => player.id === score.playerId)?.name ||
          score.playerName ||
          score.playerId;

        CATEGORY_FILTER_OPTIONS.forEach((category) => {
          const mapKey = `${score.playerId}:${category.key}`;
          const value = score.categoryScores?.[category.key];
          const isPerfect = Array.isArray(score.maxedCategoryIds)
            ? score.maxedCategoryIds.includes(category.key)
            : false;

          const current =
            aggregates.get(mapKey) || {
              playerId: score.playerId as string,
              playerName: existingPlayerName,
              categoryKey: category.key,
              categoryLabel: category.label,
              sum: 0,
              count: 0,
              max: 0,
              perfects: 0,
            };

          if (typeof value === "number") {
            current.sum += value;
            current.count += 1;
            current.max = Math.max(current.max, value);
          }

          if (isPerfect) {
            current.perfects += 1;
          }

          aggregates.set(mapKey, current);
        });
      });
    });

    let rows = Array.from(aggregates.values()).filter((row) => row.count > 0);

    if (combinationCategoryFilters.length > 0) {
      rows = rows.filter((row) => combinationCategoryFilters.includes(row.categoryKey));
    }

    return rows
      .map((row) => ({
        ...row,
        avg: Math.round((row.sum / row.count) * 10) / 10,
      }))
      .sort((a, b) => {
        const metricValueA =
          combinationSortMetric === "avg"
            ? a.avg
            : combinationSortMetric === "max"
              ? a.max
              : combinationSortMetric === "count"
                ? a.count
                : a.perfects;

        const metricValueB =
          combinationSortMetric === "avg"
            ? b.avg
            : combinationSortMetric === "max"
              ? b.max
              : combinationSortMetric === "count"
                ? b.count
                : b.perfects;

        if (metricValueB !== metricValueA) {
          return metricValueB - metricValueA;
        }

        if (a.playerName !== b.playerName) {
          return a.playerName.localeCompare(b.playerName);
        }

        return a.categoryLabel.localeCompare(b.categoryLabel);
      });
  })();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 p-6 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-start justify-between gap-4">
  <div>
    <h2 className="text-5xl font-black text-green-400">
      Ligové hry
    </h2>

    <div className="mt-2 text-sm text-zinc-300">
      Pravidla ligy: 4 hody • bez přepisování • bonus pouze Hero (+2 hody)
    </div>
  </div>

  <div className="flex gap-3">
    <button
  onClick={onOpenFunGames}
  
      className={FUN_NAV_BUTTON_CLASS}
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
        <div className="mb-8 overflow-x-auto rounded-2xl border border-zinc-700 bg-zinc-900">
          <div className="p-6">
            <h3 className="text-3xl font-bold text-green-400">
              Statistiky ({games.length} her)
            </h3>
          </div>

          <table className="w-full">
            <thead className="bg-zinc-800">
              <tr>
                <th
  onClick={() =>
    handleSort("name")
  }
  className="cursor-pointer p-4 text-left text-green-300"
>
  Hráč ↕
</th>

                <th
  onClick={() =>
    handleSort("wins")
  }
  className="cursor-pointer p-4 text-center text-green-300"
>
  Výhry ↕
</th>

                <th
  onClick={() =>
    handleSort(
      "bestScore"
    )
  }
  className="cursor-pointer p-4 text-center text-green-300"
>
  Nejlepší skóre ↕
</th>

                <th
  onClick={() =>
    handleSort("games")
  }
  className="cursor-pointer p-4 text-center text-green-300"
>
  Počet her ↕
</th>

                <th
  onClick={() =>
    handleSort(
      "average"
    )
  }
  className="cursor-pointer p-4 text-center text-green-300"
>
  Průměrné skóre ↕
</th>

                <th
  onClick={() =>
    handleSort(
      "perfects"
    )
  }
  className="cursor-pointer p-4 text-center text-green-300"
>
  Perfektní kategorie ↕
</th>

                <th
  onClick={() =>
    handleSort(
      "averagePerfects"
    )
  }
  className="cursor-pointer p-4 text-center text-green-300"
>
  Průměr perfektních ↕
</th>
              </tr>
            </thead>

            <tbody>
              {[...playersWithGames]
  .sort((a, b) => {
    const aId = a.id || "";
    const bId = b.id || "";

    const aGames =
      games.filter((game) =>
        Array.isArray(
          game.scores
        )
          ? game.scores.some(
                (p: HistoryScore) =>
                p.playerId ===
                aId
            )
          : false
      ).length;

    const bGames =
      games.filter((game) =>
        Array.isArray(
          game.scores
        )
          ? game.scores.some(
                (p: HistoryScore) =>
                p.playerId ===
                bId
            )
          : false
      ).length;

    const values: SortValueMap = {
      name: [
        a.name || "",
        b.name || "",
      ],

      wins: [
        getPlayerWins(aId),
        getPlayerWins(bId),
      ],

      bestScore: [
        getBestScore(aId),
        getBestScore(bId),
      ],

      games: [
        aGames,
        bGames,
      ],

      average: [
        getAverageScore(aId),
        getAverageScore(bId),
      ],

      perfects: [
        getPerfectCategories(
          aId
        ),
        getPerfectCategories(
          bId
        ),
      ],

      averagePerfects: [
        getAveragePerfects(
          aId
        ),
        getAveragePerfects(
          bId
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
        "string" &&
      typeof bValue ===
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

    const numericA =
      Number(aValue);
    const numericB =
      Number(bValue);

    return sortDirection ===
      "asc"
      ? numericA - numericB
      : numericB - numericA;
  })
  .map(
  (player) => {
                const playerId =
                  player.id || "";
                const playerGames =
                  games.filter((game) =>
                    Array.isArray(
                      game.scores
                    )
                      ? game.scores.some(
                            (p: HistoryScore) =>
                            p.playerId ===
                            playerId
                        )
                      : false
                  ).length;

                return (
                  <tr
                    key={playerId}
                    className="border-t border-zinc-700"
                  >
                    <td className="p-4 text-xl font-bold">
  {(players || []).find(
    (p) =>
      p.id === playerId
  )?.name || playerId}
</td>

                    <td className="p-4 text-center text-green-300">
                      {getPlayerWins(
                        playerId
                      )}
                    </td>

                    <td className="p-4 text-center text-green-300">
                      {getBestScore(
                        playerId
                      )}
                    </td>

                    <td className="p-4 text-center text-green-300">
                      {playerGames}
                    </td>

                    <td className="p-4 text-center text-green-300">
                      {getAverageScore(
                        playerId
                      )}
                    </td>

                    <td className="p-4 text-center text-green-300">
                      {getPerfectCategories(
                        playerId
                      )}
                    </td>

                    <td className="p-4 text-center text-green-300">
                      {getAveragePerfects(
                        playerId
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="border-t border-zinc-700 p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h4 className="text-2xl font-black text-green-400">
                Statistika kombinací
              </h4>

              <div className="flex flex-wrap gap-2">
                {[
                  { key: "avg", label: "Řadit: Průměr" },
                  { key: "max", label: "Řadit: Maximum" },
                  { key: "count", label: "Řadit: Počet zápisů" },
                  { key: "perfects", label: "Řadit: Perfektní" },
                ].map((option) => {
                  const isActive = combinationSortMetric === option.key;

                  return (
                    <button
                      key={option.key}
                      onClick={() =>
                        setCombinationSortMetric(
                          option.key as "avg" | "max" | "count" | "perfects",
                        )
                      }
                      className={
                        "rounded-xl border px-3 py-2 text-xs font-black transition " +
                        (isActive
                          ? ACTIVE_FILTER_CLASS
                          : "border-zinc-600 bg-zinc-800 text-zinc-200 hover:bg-zinc-700")
                      }
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
              {CATEGORY_FILTER_OPTIONS.map((category) => {
                const isActive = combinationCategoryFilters.includes(category.key);

                return (
                  <button
                    key={category.key}
                    onClick={() =>
                      toggleMultiValue(
                        combinationCategoryFilters,
                        category.key,
                        setCombinationCategoryFilters,
                      )
                    }
                    className={
                      "rounded-xl border px-3 py-2 text-sm font-bold transition " +
                      (isActive
                        ? ACTIVE_FILTER_CLASS
                        : "border-zinc-600 bg-zinc-800 text-zinc-200 hover:bg-zinc-700")
                    }
                  >
                    {category.label}
                  </button>
                );
              })}
            </div>

            <div className="overflow-x-auto rounded-xl border border-zinc-700">
              <table className="w-full min-w-[760px]">
                <thead className="bg-zinc-800">
                  <tr>
                    <th className="p-3 text-left text-xs uppercase tracking-wide text-green-300">
                      Hráč
                    </th>

                    <th className="p-3 text-left text-xs uppercase tracking-wide text-green-300">
                      Kombinace
                    </th>

                    <th className="p-3 text-center text-xs uppercase tracking-wide text-green-300">
                      Průměr
                    </th>

                    <th className="p-3 text-center text-xs uppercase tracking-wide text-green-300">
                      Maximum
                    </th>

                    <th className="p-3 text-center text-xs uppercase tracking-wide text-green-300">
                      Počet zápisů
                    </th>

                    <th className="p-3 text-center text-xs uppercase tracking-wide text-green-300">
                      Perfektní zásahy
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {combinationStatsRows.length === 0 ? (
                    <tr>
                      <td className="p-4 text-center text-zinc-400" colSpan={6}>
                        Žádná kombinace neodpovídá aktuálním filtrům.
                      </td>
                    </tr>
                  ) : (
                    combinationStatsRows.map((row) => (
                      <tr
                        key={`${row.playerId}-${row.categoryKey}`}
                        className="border-t border-zinc-700"
                      >
                        <td className="p-3 font-bold text-white">
                          {row.playerName}
                        </td>

                        <td className="p-3 text-zinc-200">
                          {row.categoryLabel}
                        </td>

                        <td className="p-3 text-center text-green-300">
                          {row.avg}
                        </td>

                        <td className="p-3 text-center text-zinc-100">
                          {row.max}
                        </td>

                        <td className="p-3 text-center text-zinc-200">
                          {row.count}
                        </td>

                        <td className="p-3 text-center text-yellow-300">
                          {row.perfects}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* GAME HISTORY */}
        <div className="rounded-2xl border border-zinc-700 bg-zinc-900 p-6">
          <h3 className="mb-6 text-3xl font-bold text-green-400">
            Historie her
          </h3>

          <div className="space-y-4">
            {historyGames
              .slice()
              .reverse()
              .map((game, index) => {
                const sortedScores = getSortedScores(game);
                const gameTitle = getGameTitle(game);
                const winnerScore = getWinnerScore(game);
                const currentGameId = game.id ?? index;
                const isExpanded = visibleExpandedGameId === currentGameId;

                return (
                  <div
                    key={String(currentGameId)}
                    className="rounded-xl border border-zinc-700 bg-zinc-800 p-5"
                  >
                    <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="text-2xl font-bold">
                          <span className="text-yellow-400">🏆 {gameTitle.winnerName}</span>

                          {gameTitle.opponents.map((opponentName) => (
                            <span
                              key={String(currentGameId) + "-opponent-" + opponentName}
                              className="text-green-300"
                            >
                              {" "}vs {opponentName}
                            </span>
                          ))}
                        </div>

                        <div className="mt-1 text-zinc-400">
                          {getPlayedAt(game)}
                        </div>

                        <div className="mt-2 text-sm text-zinc-200">
                          <strong>Vítězné skóre:</strong> {winnerScore}
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          setExpandedGameId((current) =>
                            current === currentGameId ? null : currentGameId,
                          )
                        }
                        className="rounded-xl border border-zinc-600 bg-zinc-900 px-4 py-2 text-sm font-black text-white transition hover:scale-[1.02] hover:brightness-110"
                      >
                        {isExpanded ? "Sbalit detail" : "Rozbalit detail"}
                      </button>
                    </div>

                    <div className={isExpanded ? "space-y-2" : "hidden space-y-2"}>
                      {sortedScores.length === 0 ? (
                        <div className="rounded-lg bg-zinc-900 p-3 text-sm text-zinc-400">
                          Chybí výsledky hráčů.
                        </div>
                      ) : (
                        sortedScores.map((score, scoreIndex) => {
                          const topScore = sortedScores[0]?.total ?? 0;
                          const topScoreCount = sortedScores.filter((entry) => entry.total === topScore).length;
                          const isWinner = Boolean(game.winner && score.playerId === game.winner);
                          const isTopScore = score.total === topScore;
                          const isDraw = !game.winner && isTopScore && topScoreCount > 1;

                          return (
                            <div
                              key={String(currentGameId) + "-" + String(score.playerId ?? scoreIndex)}
                              className={"rounded-lg p-3 " + (isWinner || isTopScore ? "border border-yellow-400/40 bg-yellow-500/10" : "bg-zinc-900")}
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div className="font-bold text-white">
                                  #{scoreIndex + 1} {resolvePlayerDisplayName(score.playerId, score.playerName)}
                                </div>

                                {isWinner && (
                                  <span className="rounded-full bg-yellow-500 px-2 py-1 text-xs font-black text-black">
                                    Vítěz
                                  </span>
                                )}

                                {!isWinner && isDraw && (
                                  <span className="rounded-full bg-zinc-600 px-2 py-1 text-xs font-black text-white">
                                    Remíza
                                  </span>
                                )}
                              </div>

                              <div className="text-sm text-zinc-400">
                                Skóre: {score.total} | Perfektní kategorie: {score.perfectCategories}
                              </div>

                              {getCategoryBreakdownItems(score).length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                                  {getCategoryBreakdownItems(score).map((item) => (
                                    <span
                                      key={item.key}
                                      className={
                                        "rounded-md border px-2 py-1 " +
                                        (item.isPerfect
                                          ? "border-yellow-400/60 bg-yellow-500/20 text-yellow-200"
                                          : "border-zinc-600 bg-zinc-800 text-zinc-300")
                                      }
                                    >
                                      {item.label}: {item.value ?? "-"}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })
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