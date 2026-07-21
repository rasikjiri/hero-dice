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

type SortValueMap = Record<string, [string | number, string | number]>;

type PlayerStats = {
  wins: number;
  bestScore: number;
  games: number;
  totalScore: number;
  perfectCategories: number;
};

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
  winner_score?: number;
  roll_count?: number;
  rewrite_enabled?: boolean;
  bonus_mode?: string;
  bonus_rolls?: number;
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

const ACTIVE_FILTER_CLASS = "border-purple-500 bg-purple-600 text-white";
const ACTIVE_CHIP_CLASS =
  "rounded-full border border-purple-500/50 bg-purple-600/20 px-3 py-1 text-sm font-bold text-purple-100 transition hover:border-purple-400 hover:bg-purple-600/30";

export default function FunGamesModal({
  players,
  onClose,
}: Props) {
  const [games, setGames] =
    useState<HistoryGame[]>([]);

  const [playerFilters, setPlayerFilters] = useState<string[]>([]);

  const [rollFilters, setRollFilters] = useState<number[]>([]);

  const [rewriteFilters, setRewriteFilters] = useState<boolean[]>([]);

  const [bonusFilters, setBonusFilters] = useState<Array<"general-only" | "all">>([]);

  const [bonusRollsFilters, setBonusRollsFilters] = useState<number[]>([]);

  const [combinationCategoryFilters, setCombinationCategoryFilters] = useState<CategoryScoreKey[]>([]);

  const [combinationSortMetric, setCombinationSortMetric] =
    useState<"avg" | "max" | "count" | "perfects">("avg");

  const [sortKey, setSortKey] =
    useState("bestScore");

  const [sortDirection, setSortDirection] =
    useState<"asc" | "desc">(
      "desc"
    );

  const [expandedGameId, setExpandedGameId] = useState<string | number | null>(null);

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

  const clearAllFilters = () => {
    setPlayerFilters([]);
    setRollFilters([]);
    setRewriteFilters([]);
    setBonusFilters([]);
    setBonusRollsFilters([]);
    setCombinationCategoryFilters([]);
  };

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
          if (playerFilters.length > 0) {
            const playerFound =
              Array.isArray(game.scores) &&
              game.scores.some((score: HistoryScore) =>
                typeof score.playerId === "string" && playerFilters.includes(score.playerId),
              );

            if (!playerFound) {
              return false;
            }
          }

          if (rollFilters.length > 0) {
            const rollCount = Number(game.roll_count);

            if (!rollFilters.includes(rollCount)) {
              return false;
            }
          }

          if (rewriteFilters.length > 0) {
            const rewriteEnabled = Boolean(game.rewrite_enabled);

            if (!rewriteFilters.includes(rewriteEnabled)) {
              return false;
            }
          }

          if (bonusFilters.length > 0) {
            const bonusMode = game.bonus_mode === "all" ? "all" : "general-only";

            if (!bonusFilters.includes(bonusMode)) {
              return false;
            }
          }

          if (bonusRollsFilters.length > 0) {
            const bonusRolls = Number(game.bonus_rolls);

            if (!bonusRollsFilters.includes(bonusRolls)) {
              return false;
            }
          }

          return true;
        }
      );
    }, [
      games,
      playerFilters,
      rollFilters,
      rewriteFilters,
      bonusFilters,
      bonusRollsFilters,
    ]);

  const rollOptions = useMemo(
    () =>
      Array.from(
        new Set(
          games
            .map((game) => Number(game.roll_count))
            .filter((value) => Number.isFinite(value)),
        ),
      ).sort((a, b) => a - b),
    [games],
  );

  const bonusRollOptions = useMemo(
    () =>
      Array.from(
        new Set(
          games
            .map((game) => Number(game.bonus_rolls))
            .filter((value) => Number.isFinite(value)),
        ),
      ).sort((a, b) => a - b),
    [games],
  );

  const filterChipItems = [
    ...playerFilters.map((playerId) => ({
      key: `player-${playerId}`,
      label: `Hráč: ${(players || []).find((player) => player.id === playerId)?.name || playerId}`,
      onRemove: () => setPlayerFilters((current) => current.filter((value) => value !== playerId)),
    })),
    ...rollFilters.map((rollCount) => ({
      key: `roll-${rollCount}`,
      label: `${rollCount} hodů`,
      onRemove: () => setRollFilters((current) => current.filter((value) => value !== rollCount)),
    })),
    ...rewriteFilters.map((rewrite) => ({
      key: `rewrite-${rewrite ? "yes" : "no"}`,
      label: rewrite ? "Přepisování: ANO" : "Přepisování: NE",
      onRemove: () => setRewriteFilters((current) => current.filter((value) => value !== rewrite)),
    })),
    ...bonusFilters.map((bonusMode) => ({
      key: `bonus-${bonusMode}`,
      label: bonusMode === "all" ? "Bonus: Všechny kombinace" : "Bonus: Pouze Hero",
      onRemove: () => setBonusFilters((current) => current.filter((value) => value !== bonusMode)),
    })),
    ...bonusRollsFilters.map((rolls) => ({
      key: `bonus-rolls-${rolls}`,
      label: `Bonusové hody: ${rolls}`,
      onRemove: () =>
        setBonusRollsFilters((current) => current.filter((value) => value !== rolls)),
    })),
  ];

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
          const normalizedRollCount = Number(game.roll_count ?? 0);
          const normalizedRewriteEnabled = Boolean(game.rewrite_enabled);
          const normalizedBonusMode = game.bonus_mode ?? "general-only";
          const normalizedBonusRolls = Number(game.bonus_rolls ?? 0);

          const key = [
            normalizedRollCount,
            normalizedRewriteEnabled,
            normalizedBonusMode,
            normalizedBonusRolls,
          ].join("|");

          const current =
            configs.get(key) || {
              count: 0,
              rollCount: normalizedRollCount,
              rewrite: normalizedRewriteEnabled,
              bonusMode: normalizedBonusMode,
              bonusRolls: normalizedBonusRolls,
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
    Number(game.winner_score ?? 0) || 0;

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

  const historyGames = filteredGames as HistoryGame[];
  const visibleExpandedGameId = historyGames.some(
    (game, index) => (game.id ?? index) === expandedGameId,
  )
    ? expandedGameId
    : null;

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
            (score: HistoryScore) => {
              if (!score.playerId) {
                return;
              }

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

  const combinationStatsRows = useMemo(() => {
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

    filteredGames.forEach((game) => {
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
  }, [filteredGames, players, combinationCategoryFilters, combinationSortMetric]);

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
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-5xl font-black text-purple-400">
              Fun hry
            </h2>

            {mostPlayedConfig && (
              <div className="mt-2 text-sm text-zinc-300">
                Nejhranější konfigurace: {mostPlayedConfig.rollCount} hodů • {mostPlayedConfig.rewrite ? "Přepisování ANO" : "Přepisování NE"} • {mostPlayedConfig.bonusMode === "all" ? "Všechny kombinace" : "Pouze Hero"} • Bonusové hody {mostPlayedConfig.bonusRolls} • Odehráno {mostPlayedConfig.count}x
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="rounded-xl bg-red-600 px-5 py-3 font-bold hover:bg-red-500"
          >
            Zavřít
          </button>
        </div>

        <div className="mb-6 rounded-2xl border border-zinc-700 bg-zinc-900 p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-2xl font-black text-purple-400">
              Filtry historie
            </h3>

            <button
              onClick={clearAllFilters}
              className="rounded-xl border border-zinc-600 bg-zinc-800 px-4 py-2 text-sm font-black text-white transition hover:brightness-110"
            >
              Vymazat vše
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <div>
              <div className="mb-2 text-xs font-black uppercase tracking-wide text-zinc-400">
                Hráči
              </div>

              <div className="flex flex-wrap gap-2">
                {(players || []).map((player) => {
                  const isActive = playerFilters.includes(player.id);

                  return (
                    <button
                      key={player.id}
                      onClick={() =>
                        toggleMultiValue(playerFilters, player.id, setPlayerFilters)
                      }
                      className={
                        "rounded-xl border px-3 py-2 text-sm font-bold transition " +
                        (isActive
                          ? ACTIVE_FILTER_CLASS
                          : "border-zinc-600 bg-zinc-800 text-zinc-200 hover:bg-zinc-700")
                      }
                    >
                      {player.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="mb-2 text-xs font-black uppercase tracking-wide text-zinc-400">
                Počet hodů
              </div>

              <div className="flex flex-wrap gap-2">
                {rollOptions.map((value) => {
                  const isActive = rollFilters.includes(value);

                  return (
                    <button
                      key={value}
                      onClick={() => toggleMultiValue(rollFilters, value, setRollFilters)}
                      className={
                        "rounded-xl border px-3 py-2 text-sm font-bold transition " +
                        (isActive
                          ? ACTIVE_FILTER_CLASS
                          : "border-zinc-600 bg-zinc-800 text-zinc-200 hover:bg-zinc-700")
                      }
                    >
                      {value}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="mb-2 text-xs font-black uppercase tracking-wide text-zinc-400">
                Přepisování
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  { label: "Ano", value: true },
                  { label: "Ne", value: false },
                ].map((item) => {
                  const isActive = rewriteFilters.includes(item.value);

                  return (
                    <button
                      key={item.label}
                      onClick={() =>
                        toggleMultiValue(rewriteFilters, item.value, setRewriteFilters)
                      }
                      className={
                        "rounded-xl border px-3 py-2 text-sm font-bold transition " +
                        (isActive
                          ? ACTIVE_FILTER_CLASS
                          : "border-zinc-600 bg-zinc-800 text-zinc-200 hover:bg-zinc-700")
                      }
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="mb-2 text-xs font-black uppercase tracking-wide text-zinc-400">
                Bonus režim
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  { label: "Pouze Hero", value: "general-only" as const },
                  { label: "Všechny kombinace", value: "all" as const },
                ].map((item) => {
                  const isActive = bonusFilters.includes(item.value);

                  return (
                    <button
                      key={item.value}
                      onClick={() =>
                        toggleMultiValue(bonusFilters, item.value, setBonusFilters)
                      }
                      className={
                        "rounded-xl border px-3 py-2 text-sm font-bold transition " +
                        (isActive
                          ? ACTIVE_FILTER_CLASS
                          : "border-zinc-600 bg-zinc-800 text-zinc-200 hover:bg-zinc-700")
                      }
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="mb-2 text-xs font-black uppercase tracking-wide text-zinc-400">
                Bonusové hody
              </div>

              <div className="flex flex-wrap gap-2">
                {bonusRollOptions.map((value) => {
                  const isActive = bonusRollsFilters.includes(value);

                  return (
                    <button
                      key={value}
                      onClick={() =>
                        toggleMultiValue(
                          bonusRollsFilters,
                          value,
                          setBonusRollsFilters,
                        )
                      }
                      className={
                        "rounded-xl border px-3 py-2 text-sm font-bold transition " +
                        (isActive
                          ? ACTIVE_FILTER_CLASS
                          : "border-zinc-600 bg-zinc-800 text-zinc-200 hover:bg-zinc-700")
                      }
                    >
                      {value}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {filterChipItems.length > 0 && (
            <div className="mt-5 flex flex-wrap items-center gap-2">
              {filterChipItems.map((chip) => (
                <button
                  key={chip.key}
                  onClick={chip.onRemove}
                  className={ACTIVE_CHIP_CLASS}
                >
                  {chip.label} ✕
                </button>
              ))}
            </div>
          )}
        </div>

<div className="mb-8 overflow-x-auto rounded-2xl border border-zinc-700 bg-zinc-900">
          <div className="p-6">
            <h3 className="text-3xl font-bold text-purple-400">
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
                  className="cursor-pointer p-4 text-left text-purple-300"
                >
                  Hráč ↕
                </th>

                <th
                  onClick={() =>
                    handleSort(
                      "wins"
                    )
                  }
                  className="cursor-pointer p-4 text-center text-purple-300"
                >
                  Výhry ↕
                </th>

                <th
                  onClick={() =>
                    handleSort(
                      "bestScore"
                    )
                  }
                  className="cursor-pointer p-4 text-center text-purple-300"
                >
                  Nejlepší skóre ↕
                </th>

                <th
                  onClick={() =>
                    handleSort(
                      "games"
                    )
                  }
                  className="cursor-pointer p-4 text-center text-purple-300"
                >
                  Počet her ↕
                </th>

                <th
                  onClick={() =>
                    handleSort(
                      "average"
                    )
                  }
                  className="cursor-pointer p-4 text-center text-purple-300"
                >
                  Průměrné skóre ↕
                </th>

                <th
                  onClick={() =>
                    handleSort(
                      "perfects"
                    )
                  }
                  className="cursor-pointer p-4 text-center text-purple-300"
                >
                  Perfektní kategorie ↕
                </th>

                <th
                  onClick={() =>
                    handleSort(
                      "averagePerfects"
                    )
                  }
                  className="cursor-pointer p-4 text-center text-purple-300"
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

                  const values: SortValueMap =
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
                    ? numericA -
                        numericB
                    : numericB -
                        numericA;
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

                      <td className="p-4 text-center text-purple-300">
                        {
                          stats.wins
                        }
                      </td>

                      <td className="p-4 text-center text-purple-300">
                        {
                          stats.bestScore
                        }
                      </td>

                      <td className="p-4 text-center text-purple-300">
                        {
                          stats.games
                        }
                      </td>

                      <td className="p-4 text-center text-purple-300">
                        {Math.round(
                          stats.totalScore /
                            stats.games
                        )}
                      </td>

                      <td className="p-4 text-center text-purple-300">
                        {
                          stats.perfectCategories
                        }
                      </td>

                      <td className="p-4 text-center text-purple-300">
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

          <div className="border-t border-zinc-700 p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h4 className="text-2xl font-black text-purple-400">
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
                    <th className="p-3 text-left text-xs uppercase tracking-wide text-purple-300">
                      Hráč
                    </th>

                    <th className="p-3 text-left text-xs uppercase tracking-wide text-purple-300">
                      Kombinace
                    </th>

                    <th className="p-3 text-center text-xs uppercase tracking-wide text-purple-300">
                      Průměr
                    </th>

                    <th className="p-3 text-center text-xs uppercase tracking-wide text-purple-300">
                      Maximum
                    </th>

                    <th className="p-3 text-center text-xs uppercase tracking-wide text-purple-300">
                      Počet zápisů
                    </th>

                    <th className="p-3 text-center text-xs uppercase tracking-wide text-purple-300">
                      Perfektní zásahy
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {combinationStatsRows.length === 0 ? (
                    <tr>
                      <td
                        className="p-4 text-center text-zinc-400"
                        colSpan={6}
                      >
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

                        <td className="p-3 text-center text-purple-300">
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

        <div className="rounded-2xl border border-zinc-700 bg-zinc-900 p-6">
          <h3 className="mb-6 text-3xl font-bold text-purple-400">
            Historie her
          </h3>

          <div className="space-y-4">
            {historyGames
              .slice()
              .reverse()
              .map((game, index) => {
                const currentGameId = game.id ?? index;
                const sortedScores = getSortedScores(game);
                const gameTitle = getGameTitle(game);
                const winnerScore = getWinnerScore(game);
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
                              className="text-purple-300"
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
                          const topScoreCount = sortedScores.filter(
                            (entry) => entry.total === topScore,
                          ).length;
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