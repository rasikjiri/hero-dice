"use client";

import { useEffect, useMemo, useState } from "react";

import StatisticsModal from "./components/StatisticsModal";

import { players } from "./data/players";

import { gameCategories } from "./data/gameCategories";

import {
  saveFinishedGame,
  getTopPlayerByWins,
  getTopPlayerByAverage,
  getTopPlayerByPerfects,
  getTopPlayerByScore,
} from "./data/statistics";

type ScoreMap = {
  [playerId: string]: {
    [categoryId: string]: number;
  };
};

export default function Home() {
  const [screen, setScreen] = useState<
    "home" | "game"
  >("home");

  const [mounted, setMounted] =
    useState(false);

  const [showStatistics, setShowStatistics] =
    useState(false);

  const [showLeaveConfirm, setShowLeaveConfirm] =
    useState(false);

  const [selectedHelpImage, setSelectedHelpImage] =
    useState<string | null>(null);

  const [playerCount, setPlayerCount] =
    useState<number | "">("");

  const [selectedPlayers, setSelectedPlayers] =
    useState<string[]>([]);

  const [gameStarted, setGameStarted] =
    useState(false);

  const [gameFinished, setGameFinished] =
    useState(false);

  const [winner, setWinner] =
    useState("");

  const [winnerScore, setWinnerScore] =
    useState(0);

  const [showFinishedGame, setShowFinishedGame] =
    useState(false);

  const [scores, setScores] =
    useState<ScoreMap>({});

  const [scoreModal, setScoreModal] =
  useState<{
    playerId: string;
    playerName: string;
    categoryId: string;
    categoryName: string;
    min: number;
    max: number;
  } | null>(null);

  const [scoreInput, setScoreInput] =
    useState("");

  const [topWins, setTopWins] =
    useState({
      name: "-",
      value: 0,
    });

  const [topAverage, setTopAverage] =
    useState({
      name: "-",
      value: 0,
    });

  const [topPerfects, setTopPerfects] =
    useState({
      name: "-",
      value: 0,
    });

  const [topScore, setTopScore] =
    useState({
      name: "-",
      value: 0,
    });

  useEffect(() => {
    setMounted(true);

    setTopWins(
      getTopPlayerByWins()
    );

    setTopAverage(
      getTopPlayerByAverage()
    );

    setTopPerfects(
      getTopPlayerByPerfects()
    );

    setTopScore(
      getTopPlayerByScore()
    );
  }, []);

  const activePlayers = useMemo(() => {
    return selectedPlayers
      .map((playerId) =>
        players.find(
          (p) => p.id === playerId
        )
      )
      .filter(Boolean);
  }, [selectedPlayers]);

 const handlePlayerCountChange = (
  count: number
) => {
  setPlayerCount(count);

  setSelectedPlayers(
    (prev) => {
      const updated = [
        ...prev,
      ];

      while (
        updated.length < count
      ) {
        updated.push("");
      }

      return updated.slice(
        0,
        count
      );
    }
  );
};

  const handlePlayerChange = (
    index: number,
    value: string
  ) => {
    if (
      value !== "" &&
      selectedPlayers.includes(value)
    ) {
      alert(
        "Tento hráč už je vybraný."
      );

      return;
    }

    const updated = [...selectedPlayers];

    updated[index] = value;

    setSelectedPlayers(updated);
  };

  const openScoreModal = (
    playerId: string,
    categoryId: string,
    min: number,
    max: number
  ) => {
    if (gameFinished) return;

    const existingScore =
      scores[playerId]?.[categoryId];

    if (existingScore !== undefined) {
      alert(
        "Tato kombinace už má zadané skóre."
      );

      return;
    }

    setScoreInput(
  String(max)
);

    setScoreModal({
  playerId,

  playerName:
    players.find(
      (p) => p.id === playerId
    )?.name || "",

  categoryId,

  categoryName:
    gameCategories.find(
      (c) => c.id === categoryId
    )?.name || "",

  min,
  max,
});
};

  const saveScore = () => {
    if (!scoreModal) return;

    const parsed = Number(scoreInput);

    if (isNaN(parsed)) {
      alert("Musíš zadat číslo.");

      return;
    }

    if (
      parsed < scoreModal.min ||
      parsed > scoreModal.max
    ) {
      alert(
        `Skóre musí být mezi ${scoreModal.min} a ${scoreModal.max}.`
      );

      return;
    }

    const updatedScores = {
      ...scores,

      [scoreModal.playerId]: {
        ...scores[scoreModal.playerId],

        [scoreModal.categoryId]:
          parsed,
      },
    };

    setScores(updatedScores);

    setScoreModal(null);

    setScoreInput("");
  };

  const getPlayerTotal = (
    playerId: string
  ) => {
    return Object.values(
      scores[playerId] || {}
    ).reduce(
      (sum, value) => sum + value,
      0
    );
  };

  useEffect(() => {
    if (
      !gameStarted ||
      gameFinished
    )
      return;

    const finishedPlayer =
      selectedPlayers.find(
        (playerId) => {
          const playerScores =
            scores[playerId] || {};

          return (
            Object.keys(playerScores)
              .length ===
            gameCategories.length
          );
        }
      );

    if (!finishedPlayer) return;

    let bestPlayer = "";
    let bestScore = -1;

    const gameResults =
      selectedPlayers.map(
        (playerId) => {
          const playerScores =
            scores[playerId] || {};

          const total =
            Object.values(
              playerScores
            ).reduce(
              (sum, value) =>
                sum + value,
              0
            );

          let perfectCategories = 0;

          gameCategories.forEach(
            (category) => {
              if (
                playerScores[
                  category.id
                ] === category.max
              ) {
                perfectCategories++;
              }
            }
          );

          if (total > bestScore) {
            bestScore = total;

            bestPlayer = playerId;
          }

          return {
            playerId,
            total,
            perfectCategories,
          };
        }
      );

    const winnerName =
      players.find(
        (p) => p.id === bestPlayer
      )?.name || "";

    setWinner(winnerName);

    setWinnerScore(bestScore);

    saveFinishedGame({
      date: new Date().toISOString(),

      winner: bestPlayer,

      winnerScore: bestScore,

      players: selectedPlayers,

      scores: gameResults,
    });

    setGameFinished(true);

    setShowFinishedGame(true);
  }, [
    scores,
    gameStarted,
    gameFinished,
    selectedPlayers,
  ]);

  const canStartGame =
    playerCount !== "" &&
    selectedPlayers.length ===
      playerCount &&
    selectedPlayers.every(
      (p) => p !== ""
    );

  const startNewGame = () => {
    setPlayerCount("");

    setSelectedPlayers([]);

    setGameStarted(false);

    setGameFinished(false);

    setWinner("");

    setWinnerScore(0);

    setShowFinishedGame(false);

    setScores({});

    setScreen("game");
  };

  return (
    <main className="min-h-screen bg-[#111] p-4 text-white md:p-6">
      {/* HOME */}
      {screen === "home" && (
        <>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h1 className="hero-text-glow text-4xl font-black text-yellow-400 md:text-6xl">
              HERO DICE
            </h1>

            <button
              onClick={() =>
                setShowStatistics(true)
              }
              className="hero-button hero-button-green rounded-xl px-6 py-3 text-lg font-bold md:text-xl"
            >
              Statistiky
            </button>
          </div>

          <div className="mt-12 md:mt-16">
            <button
              onClick={startNewGame}
              className="hero-button hero-pulse rounded-2xl bg-yellow-400 px-8 py-4 text-2xl font-black text-black hover:bg-yellow-300 md:px-10 md:py-5 md:text-3xl"
            >
              ▶ Nová hra
            </button>
          </div>

          <div className="mt-16 md:mt-20">
            <h2 className="mb-8 text-3xl font-bold md:text-4xl">
              TOP HRÁČI
            </h2>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="hero-card hero-glow-green p-6">
                <div className="text-zinc-400">
                  Nejvíce výher
                </div>

                <div className="mt-2 text-3xl font-bold">
                  {mounted
                    ? topWins.name
                    : "-"}
                </div>

                <div className="text-green-400">
                  {mounted
                    ? topWins.value
                    : "-"}
                </div>
              </div>

              <div className="hero-card hero-glow-gold p-6">
                <div className="text-zinc-400">
                  Nejlepší skóre
                </div>

                <div className="mt-2 text-3xl font-bold">
                  {mounted
                    ? topScore.name
                    : "-"}
                </div>

                <div className="text-yellow-400">
                  {mounted
                    ? topScore.value
                    : "-"}
                </div>
              </div>

              <div className="hero-card hero-glow-blue p-6">
                <div className="text-zinc-400">
                  Nejlepší průměr
                </div>

                <div className="mt-2 text-3xl font-bold">
                  {mounted
                    ? topAverage.name
                    : "-"}
                </div>

                <div className="text-blue-400">
                  {mounted
                    ? topAverage.value
                    : "-"}
                </div>
              </div>

              <div className="hero-card hero-glow-red p-6">
                <div className="text-zinc-400">
                  Perfektní kategorie
                </div>

                <div className="mt-2 text-3xl font-bold">
                  {mounted
                    ? topPerfects.name
                    : "-"}
                </div>

                <div className="text-red-400">
                  {mounted
                    ? topPerfects.value
                    : "-"}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* GAME */}
      {screen === "game" && (
        <>
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h1 className="hero-text-glow text-4xl font-black text-yellow-400 md:text-5xl">
              HERO DICE
            </h1>

            <button
              onClick={() => {
                if (
                  gameStarted &&
                  !gameFinished
                ) {
                  setShowLeaveConfirm(
                    true
                  );
                } else {
                  setScreen("home");
                }
              }}
              className="hero-button rounded-xl bg-zinc-700 px-5 py-3 transition hover:bg-zinc-600"
            >
              Domů
            </button>
          </div>

          {!gameStarted && (
            <div className="hero-card hero-glow-blue mb-10 p-8">
              <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center">
                <label className="text-xl font-semibold">
                  Počet hráčů:
                </label>

                <select
                  value={playerCount}
                  onChange={(e) =>
                    handlePlayerCountChange(
                      Number(
                        e.target.value
                      )
                    )
                  }
                  className="rounded-lg border border-zinc-600 bg-zinc-900 p-3 text-white"
                >
                  <option value="">
                    Vyber počet hráčů
                  </option>

                  {[2, 3, 4, 5, 6, 7].map(
                    (count) => (
                      <option
                        key={count}
                        value={count}
                      >
                        {count}
                      </option>
                    )
                  )}
                </select>
              </div>

              {playerCount !== "" && (
                <div className="mb-8 flex flex-wrap gap-4">
                  {Array.from({
                    length: playerCount,
                  }).map((_, index) => (
                    <div key={index}>
                      <label className="mb-1 block font-semibold">
                        Hráč{" "}
                        {index + 1}
                      </label>

                      <select
                        value={
                          selectedPlayers[
                            index
                          ] || ""
                        }
                        onChange={(e) =>
                          handlePlayerChange(
                            index,
                            e.target.value
                          )
                        }
                        className="min-w-[220px] rounded-lg border border-zinc-600 bg-zinc-900 p-3 text-white"
                      >
                        <option value="">
                          Vyber hráče
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
                              {
                                player.name
                              }
                            </option>
                          )
                        )}
                      </select>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() =>
                  setGameStarted(true)
                }
                disabled={!canStartGame}
                className={`hero-button rounded-lg px-6 py-3 font-bold transition ${
                  canStartGame
                    ? "bg-yellow-400 text-black hover:bg-yellow-300"
: "cursor-not-allowed bg-gray-500 text-gray-300"
                }`}
              >
                ▶ Začít hru
              </button>
            </div>
          )}

          {gameStarted && (
            <div className="overflow-x-auto">
              <div className="hero-table inline-block min-w-full">
                <table className="border-collapse">
                  <thead>
                    <tr className="bg-green-800">
                      <th className="min-w-[240px] border border-white p-3 text-left">
                        Kombinace
                      </th>

                      <th className="min-w-[80px] border border-white p-3 text-center">
                        MIN
                      </th>

                      <th className="min-w-[80px] border border-white p-3 text-center">
                        MAX
                      </th>

                      {selectedPlayers.map(
                        (playerId, index) => (
                          <th
                            key={index}
                            className="min-w-[140px] border border-white p-3 text-center"
                          >
                            {
                              players.find(
                                (p) =>
                                  p.id ===
                                  playerId
                              )?.name
                            }
                          </th>
                        )
                      )}
                    </tr>
                  </thead>

                  <tbody>
                    {gameCategories.map(
                      (category) => (
                        <tr
                          key={category.id}
                        >
                          <td className="border border-white p-3">
                            <button
                              onClick={() =>
                                setSelectedHelpImage(
                                  `/help/${category.id}.png`
                                )
                              }
                              className="transition hover:text-yellow-300"
                            >
                              {
                                category.name
                              }
                            </button>
                          </td>

                          <td className="border border-white p-3 text-center">
                            {category.min}
                          </td>

                          <td className="border border-white p-3 text-center">
                            {category.max}
                          </td>

                          {selectedPlayers.map(
  (
    playerId,
    index
  ) => {
    const score =
      scores[
        playerId
      ]?.[
        category.id
      ];

    const isPerfect =
      score === category.max;

    return (
      <td
        key={index}
        className={`border border-white p-3 text-center text-xl font-bold transition ${
          gameFinished
            ? "cursor-default"
            : "cursor-pointer hover:bg-green-800"
        }`}
        onClick={() =>
          openScoreModal(
            playerId,
            category.id,
            category.min,
            category.max
          )
        }
      >
        <span
          className={
            isPerfect
              ? "text-red-500"
              : ""
          }
        >
          {score ?? ""}
        </span>
      </td>
    );
  }
)}
                        </tr>
                      )
                    )}

                    <tr className="bg-green-950 text-xl font-bold">
                      <td className="border border-white p-3">
                        SKÓRE
                      </td>

                      <td className="border border-white p-3"></td>

                      <td className="border border-white p-3"></td>

                      {selectedPlayers.map(
                        (
                          playerId,
                          index
                        ) => (
                          <td
                            key={index}
                            className="border border-white p-3 text-center"
                          >
                            {getPlayerTotal(
                              playerId
                            )}
                          </td>
                        )
                      )}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* SCORE MODAL */}
      {scoreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="hero-card-strong w-full max-w-[350px] p-8 text-white">
            <h2 className="mb-2 text-2xl font-bold">
  Zadat skóre
</h2>

<p className="mb-1 text-lg text-yellow-400 font-bold">
  {scoreModal.categoryName}
</p>

<p className="mb-4 text-zinc-300">
  Hráč:{" "}
  <strong>
    {scoreModal.playerName}
  </strong>
</p>

            <p className="mb-2">
              Povolené rozmezí:
              <strong>
                {" "}
                {scoreModal.min} –{" "}
                {scoreModal.max}
              </strong>
            </p>

            <input
              type="number"
              min={scoreModal.min}
              max={scoreModal.max}
              value={scoreInput}
              onChange={(e) =>
                setScoreInput(
                  e.target.value
                )
              }
              className="mb-4 w-full rounded border border-zinc-700 bg-zinc-900 p-3 text-2xl text-white"
              autoFocus
            />

            <div className="flex gap-3">
              <button
                onClick={saveScore}
                className="hero-button hero-button-green rounded px-4 py-2"
              >
                Uložit
              </button>

              <button
                onClick={() =>
                  setScoreModal(null)
                }
                className="hero-button rounded bg-zinc-700 px-4 py-2 hover:bg-zinc-600"
              >
                Zrušit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HELP IMAGE */}
      {selectedHelpImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() =>
            setSelectedHelpImage(null)
          }
        >
          <div
            className="relative"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <img
              src={selectedHelpImage}
              alt="Nápověda"
              className="max-h-[90vh] max-w-[90vw] rounded-2xl bg-white shadow-2xl"
            />

            <button
              className="hero-button hero-button-red absolute right-2 top-2 rounded-lg px-4 py-2 font-bold"
              onClick={() =>
                setSelectedHelpImage(null)
              }
            >
              Zavřít
            </button>
          </div>
        </div>
      )}

      {/* WINNER MODAL */}
      {showFinishedGame && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <div className="hero-card-strong hero-glow-gold max-w-xl p-10 text-center text-white">
            <h2 className="mb-8 text-5xl">
              🏆 Konec hry
            </h2>

            <p className="mb-3 text-3xl font-bold">
              Vítěz
            </p>

            <p className="hero-text-glow mb-6 text-5xl font-black text-yellow-400">
              {winner}
            </p>

            <p className="mb-3 text-2xl">
              Skóre:
              <strong>
                {" "}
                {winnerScore}
              </strong>{" "}
              bodů
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() =>
                  setShowFinishedGame(
                    false
                  )
                }
                className="hero-button hero-button-blue rounded-lg px-5 py-3 font-bold"
              >
                Zobrazit hru
              </button>

              <button
                onClick={() =>
                  setShowStatistics(
                    true
                  )
                }
                className="hero-button hero-button-gold rounded-lg px-5 py-3 font-bold"
              >
                Statistiky
              </button>

              <button
                onClick={
                  startNewGame
                }
                className="hero-button hero-button-red rounded-lg px-5 py-3 font-bold"
              >
                Nová hra
              </button>

              <button
                onClick={() =>
                  setScreen("home")
                }
                className="hero-button rounded-lg bg-zinc-700 px-5 py-3 font-bold hover:bg-zinc-600"
              >
                Domů
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LEAVE CONFIRM */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <div className="hero-card-strong w-full max-w-[420px] p-8 text-center text-white">
            <h2 className="mb-6 text-3xl font-black">
              Opravdu ukončit hru?
            </h2>

            <p className="mb-8 text-zinc-400">
              Rozehraná hra nebude uložena.
            </p>

            <div className="flex justify-center gap-4">
              <button
                onClick={() =>
                  setShowLeaveConfirm(
                    false
                  )
                }
                className="hero-button hero-button-green rounded-lg px-5 py-3 font-bold"
              >
                Pokračovat
              </button>

              <button
                onClick={() => {
                  setShowLeaveConfirm(
                    false
                  );

                  setScreen("home");
                }}
                className="hero-button hero-button-red rounded-lg px-5 py-3 font-bold"
              >
                Domů
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STATISTICS */}
      {showStatistics && (
        <StatisticsModal
          onClose={() =>
            setShowStatistics(false)
          }
        />
      )}
    </main>
  );
}