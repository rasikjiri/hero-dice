"use client";

import { useEffect, useMemo, useState } from "react";

import StatisticsModal from "./components/StatisticsModal";

import { players } from "./data/players";

import { gameCategories } from "./data/gameCategories";

import { supabase } from "./lib/supabase";

import {
  saveFinishedGame,
  getTopPlayerByWins,
  getTopPlayerByAverage,
  getTopPlayerByPerfects,
  getTopPlayerByAveragePerfects,
  getTopPlayerByScore,
  getTopPlayerByGamesPlayed,
  syncGamesFromSupabase,
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

  const [isUnlocked, setIsUnlocked] =
  useState(false);

  const [authLoaded, setAuthLoaded] =
  useState(false);

  const [accessCode, setAccessCode] =
  useState("");  
  
  const [showStatistics, setShowStatistics] =
    useState(false);

  const [showAdmin, setShowAdmin] =
  useState(false);

  const [
  deletePlayerId,
  setDeletePlayerId,
] = useState<string | null>(
  null
);

  const [newPlayerId, setNewPlayerId] =
  useState("");

  const [newPlayerName, setNewPlayerName] =
  useState("");

  const [, forceUpdate] =
  useState(0);

  const [showLeaveConfirm, setShowLeaveConfirm] =
    useState(false);

  const [
  leaveAction,
  setLeaveAction,
] = useState<
  "home" | "new-game" | null
>(null);

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

  const [
  showRestoreGame,
  setShowRestoreGame,
] = useState(false);

  const [
showHomeRestoreModal,
setShowHomeRestoreModal,
] = useState(false);

const [
savedGames,
setSavedGames,
] = useState<any[]>([]);

const [
showLoadGames,
setShowLoadGames,
] = useState(false);
  const [scoreModal, setScoreModal] =
    useState<{
      playerId: string;
      categoryId: string;
      min: number;
      max: number;
    } | null>(null);

  const [
  showEditConfirm,
  setShowEditConfirm,
] = useState(false);

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
const [
  topAveragePerfects,
  setTopAveragePerfects,
] = useState({
  name: "-",
  value: 0,
});
  const [topScore, setTopScore] =
    useState({
      name: "-",
      value: 0,
    });

const [
  topGamesPlayed,
  setTopGamesPlayed,
] = useState({
  name: "-",
  value: 0,
});
   
const [playersState, setPlayersState] =
  useState(players);

const selectablePlayers =
  playersState.filter(
    (player) => player.active
  );

  const maxPlayers =
  selectablePlayers.length;

  useEffect(() => {
  const unlocked =
    localStorage.getItem(
      "heroDiceUnlocked"
    );

  if (unlocked === "true") {
    setIsUnlocked(true);
  }

  setAuthLoaded(true);
}, []);

useEffect(() => {
  const loadStatistics =
    async () => {
      await syncGamesFromSupabase();

      setTopWins(
        getTopPlayerByWins(
          playersState
        )
      );

      setTopAverage(
        getTopPlayerByAverage(
          playersState
        )
      );

      setTopPerfects(
        getTopPlayerByPerfects(
          playersState
        )
      );

      setTopAveragePerfects(
        getTopPlayerByAveragePerfects(
          playersState
        )
      );

      setTopScore(
        getTopPlayerByScore(
          playersState
        )
      );

      setTopGamesPlayed(
        getTopPlayerByGamesPlayed(
          playersState
        )
      );

      setMounted(true);
    };

  if (
    playersState.length > 0
  ) {
    loadStatistics();
  }
}, [playersState]);

  const activePlayers = useMemo(() => {
    return selectedPlayers
      .map((playerId) =>
        players.find(
          (p) => p.id === playerId
        )
      )
      .filter(Boolean);
  }, [selectedPlayers]);

const handleDeletePlayer = (
  playerId: string
) => {
  const updatedPlayers =
    playersState.filter(
      (player) =>
        player.id !== playerId
    );

  setPlayersState(
    updatedPlayers
  );
deletePlayerFromSupabase(
  playerId
);
  localStorage.setItem(
    "heroDicePlayers",
    JSON.stringify(
      updatedPlayers
    )
  );
};

const handleAddPlayer = () => {
  
  const trimmedId =
    newPlayerId.trim();

  const trimmedName =
    newPlayerName.trim();

  if (
    !trimmedId ||
    !trimmedName
  ) {
    alert(
      "Vyplň ID i jméno hráče."
    );

    return;
  }

  const exists =
    playersState.some(
      (player) =>
        player.id.toLowerCase() ===
        trimmedId.toLowerCase()
    );

  if (exists) {
    alert(
      "Player ID už existuje."
    );

    return;
  }

  const newPlayer = {
  id: trimmedId,
  name: trimmedName,
  active: true,
};

const updatedPlayers = [
  ...playersState,
  newPlayer,
];

setPlayersState(
  updatedPlayers
);

addPlayerToSupabase(
  newPlayer
);

localStorage.setItem(
  "heroDicePlayers",
  JSON.stringify(
    updatedPlayers
  )
);

  setNewPlayerId("");
  setNewPlayerName("");
};

useEffect(() => {
  loadPlayersFromSupabase();
}, []);

const handlePlayerCountChange = (
  count: number
) => {
  setPlayerCount(count);

  const autoSelected =
    selectablePlayers
      .slice(0, count)
      .map(
        (player) =>
          player.id
      );

  setSelectedPlayers(
    autoSelected
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
  setScoreInput(
    String(existingScore)
  );

  setScoreModal({
    playerId,
    categoryId,
    min,
    max,
  });

  setShowEditConfirm(true);

  return;
}

    setScoreInput(String(max));

    setScoreModal({
      playerId,
      categoryId,
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

const saveGameToSupabase =
  async () => {
    try {
      const gameName =
        selectedPlayers
          .map(
            (playerId) =>
              players.find(
                (p) =>
                  p.id ===
                  playerId
              )?.name || playerId
          )
          .join(" vs ");

      const { error } =
        await supabase
          .from("saved_games")
          .insert([
            {
              name: gameName,

              player_count:
                playerCount,

              selected_players:
                selectedPlayers,

              scores,

              game_started:
                gameStarted,

              game_finished:
                gameFinished,
            },
          ]);

      if (error) {
        console.error(
          "SAVE GAME ERROR:",
          error
        );

        alert(
          "Nepodařilo se uložit hru."
        );

        return;
      }

      alert("Hra uložena.");
    } catch (error) {
      console.error(error);

      alert(
        "Nepodařilo se uložit hru."
      );
    }
  };

const loadSavedGames =
  async () => {
    try {
      const { data, error } =
        await supabase
          .from("saved_games")
          .select("*")
          .order(
            "created_at",
            {
              ascending: false,
            }
          );

      if (error) {
        console.error(error);

        alert(
          "Nepodařilo se načíst hry."
        );

        return;
      }

      setSavedGames(data || []);

      setShowLoadGames(true);
    } catch (error) {
      console.error(error);

      alert(
        "Nepodařilo se načíst hry."
      );
    }
  };

const loadPlayersFromSupabase =
  async () => {
    try {
      const { data, error } =
        await supabase
          .from("players")
          .select("*")
          .order("created_at", {
            ascending: true,
          });

      if (error) {
        console.error(
          "PLAYERS LOAD ERROR:",
          error
        );

        return;
      }

      if (
        data &&
        data.length > 0
      ) {
        setPlayersState(data);

        localStorage.setItem(
          "heroDicePlayers",
          JSON.stringify(data)
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

const addPlayerToSupabase =
  async (
    player: {
      id: string;
      name: string;
      active: boolean;
    }
  ) => {
    try {
      const { error } =
        await supabase
          .from("players")
          .insert([
            {
              id: player.id,
              name: player.name,
              active:
                player.active,
            },
          ]);

      if (
  error &&
  error.code !==
    "23505"
) {
  console.error(
    "ADD PLAYER ERROR:",
    error
  );
}
    } catch (error) {
      console.error(error);
    }
  };

const updatePlayerInSupabase =
  async (
    playerId: string,
    updates: {
      name?: string;
      active?: boolean;
    }
  ) => {
    try {
      const { error } =
        await supabase
          .from("players")
          .update(updates)
          .eq("id", playerId);

      if (error) {
        console.error(
          "UPDATE PLAYER ERROR:",
          error
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

const deletePlayerFromSupabase =
  async (
    playerId: string
  ) => {
    try {
      const { error } =
        await supabase
          .from("players")
          .delete()
          .eq("id", playerId);

      if (error) {
        console.error(
          "DELETE PLAYER ERROR:",
          error
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  const startNewGame = (
  skipRestoreCheck = false
) => {
  if (!skipRestoreCheck) {
    const savedGame =
      localStorage.getItem(
        "heroDiceCurrentGame"
      );

    if (savedGame) {
      try {
        const parsed =
          JSON.parse(savedGame);

        if (!parsed.gameFinished) {
          setShowHomeRestoreModal(
            true
          );

          return;
        }
      } catch {}
    }
  }

  localStorage.removeItem(
    "heroDiceCurrentGame"
  );

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

  const canStartGame =
    playerCount !== "" &&
    selectedPlayers.length ===
      playerCount &&
    selectedPlayers.every(
      (player) => player !== ""
    );

useEffect(() => {
  if (
    selectablePlayers.length ===
      2 &&
    !gameStarted &&
    playerCount !== 2
  ) {
    setPlayerCount(2);

    setSelectedPlayers([
      selectablePlayers[0].id,
      selectablePlayers[1].id,
    ]);
  }
}, [
  selectablePlayers.length,
  gameStarted,
  playerCount,
]);
    
useEffect(() => {
  const savedGame =
    localStorage.getItem(
      "heroDiceCurrentGame"
    );

  if (!savedGame) return;

  try {
    const parsed =
      JSON.parse(savedGame);

    if (!parsed.gameFinished) {
      setShowRestoreGame(true);
    }
  } catch {
    localStorage.removeItem(
      "heroDiceCurrentGame"
    );
  }
}, []);

useEffect(() => {
  const handleBeforeUnload = (
    event: BeforeUnloadEvent
  ) => {
    if (
      gameStarted &&
      !gameFinished
    ) {
      event.preventDefault();

      event.returnValue = "";
    }
  };

  window.addEventListener(
    "beforeunload",
    handleBeforeUnload
  );

  return () => {
    window.removeEventListener(
      "beforeunload",
      handleBeforeUnload
    );
  };
}, [gameStarted, gameFinished]);

useEffect(() => {
  if (
    gameStarted &&
    !gameFinished
  ) {
    localStorage.setItem(
      "heroDiceCurrentGame",
      JSON.stringify({
        playerCount,
        selectedPlayers,
        scores,
        gameStarted,
        gameFinished,
      })
    );
  }
}, [
  playerCount,
  selectedPlayers,
  scores,
  gameStarted,
  gameFinished,
]);

  useEffect(() => {
      const finishGame = async () => {

    if (
      !gameStarted ||
      gameFinished
    )
      return;

    const finishedPlayer =
      playersState.find(
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
            scores[playerId.id] || {};

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

  playerName:
    playersState.find(
      (p) =>
        p.id === playerId
    )?.name || playerId,

  total,

  perfectCategories,
};
        }
      );

    const winnerName =
  playersState.find(
    (p) => p.id === bestPlayer
  )?.name || "";

    setWinner(winnerName);

    setWinnerScore(bestScore);

    await saveFinishedGame({
      date: new Date().toISOString(),

      winner: bestPlayer,

      winnerScore: bestScore,

      players: selectedPlayers,

      scores: gameResults,
    });

    setGameFinished(true);

localStorage.removeItem(
  "heroDiceCurrentGame"
);

setShowFinishedGame(true);
          };

  finishGame();
  }, [
    scores,
    gameStarted,
    gameFinished,
    selectedPlayers,
  ]);
    return (
  <main className="min-h-screen overflow-x-hidden bg-[#111] px-4 py-5 text-white md:px-6 md:py-6">
    {!isUnlocked && (
      <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black p-6">
        <div className="w-full max-w-md rounded-3xl border border-yellow-500/20 bg-zinc-900 p-8 text-center shadow-2xl">
          <h1 className="mb-3 text-5xl font-black text-yellow-400">
            HERO DICE
          </h1>

          <p className="mb-8 text-zinc-400">
            Zadej přístupový kód
          </p>

          <input
            type="password"
            value={accessCode}
            onChange={(e) =>
              setAccessCode(
                e.target.value
              )
            }
            className="mb-5 w-full rounded-2xl border border-zinc-700 bg-black px-5 py-4 text-center text-2xl font-bold text-white outline-none transition focus:border-yellow-400"
            autoFocus
          />

          <button
            onClick={() => {
              if (
                accessCode ===
                process.env.NEXT_PUBLIC_APP_CODE
              ) {
                localStorage.setItem(
                  "heroDiceUnlocked",
                  "true"
                );

                setIsUnlocked(true);
              } else {
                alert(
                  "Neplatný kód."
                );
              }
            }}
            className="w-full rounded-2xl bg-yellow-500 px-6 py-4 text-xl font-black text-black transition hover:bg-yellow-400"
          >
            Vstoupit
          </button>
        </div>
      </div>
    )}
      {/* HOME */}
{screen === "home" && (
  <div className="mx-auto flex w-full max-w-6xl flex-col">
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <h1 className="text-5xl font-black tracking-tight text-yellow-400 md:text-5xl">
        HERO DICE
      </h1>

      <div className="flex flex-wrap gap-3">
  <button
    onClick={() =>
      setShowAdmin(true)
    }
    className="rounded-2xl bg-zinc-700 px-6 py-3 text-lg font-bold transition hover:bg-zinc-600 md:text-xl"
  >
    Admin
  </button>

  <button
  onClick={() =>
    setShowStatistics(true)
  }
  className="rounded-2xl bg-green-600 px-6 py-3 text-lg font-bold transition hover:bg-green-700 md:text-xl"
>
  Statistiky
</button>
      </div>
    </div>

          <div className="mt-8 md:mt-10">
            <button
              onClick={() => startNewGame()}
              className="rounded-3xl bg-yellow-500 px-8 py-5 text-2xl font-black text-black transition hover:scale-[1.02] hover:bg-yellow-400 md:px-10 md:text-3xl"
            >
              ▶ Nová hra
            </button>
          </div>

          <div className="mt-10 md:mt-12">
            <h2 className="mb-6 text-3xl font-bold text-zinc-300 md:text-4xl">
              TOP HRÁČI
            </h2>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              <div className="rounded-3xl bg-zinc-900 p-6">
                <div className="text-yellow-400">
                  Výhry
                </div>

                <div className="mt-3 text-3xl font-black text-white">
                  {mounted
                    ? topWins.name
                    : "-"}
                </div>

                <div className="mt-2 text-2xl font-black text-yellow-400">
                  {mounted
                    ? topWins.value
                    : "-"}
                </div>
              </div>

              <div className="rounded-3xl bg-zinc-900 p-6">
                <div className="text-yellow-400">
                  Nejlepší skóre
                </div>

                <div className="mt-3 text-3xl font-black text-white">
                  {mounted
                    ? topScore.name
                    : "-"}
                </div>

                <div className="mt-2 text-2xl font-black text-yellow-400">
                  {mounted
                    ? topScore.value
                    : "-"}
                </div>
              </div>

              <div className="rounded-3xl bg-zinc-900 p-6">
                <div className="text-yellow-400">
                  Počet her
                </div>

                <div className="mt-3 text-3xl font-black text-white">
                  {mounted
                    ? topGamesPlayed.name
                    : "-"}
                </div>

                <div className="mt-2 text-2xl font-black text-yellow-400">
                  {mounted
                    ? topGamesPlayed.value
                    : "-"}
                </div>
              </div>

              <div className="rounded-3xl bg-zinc-900 p-6">
                <div className="text-yellow-400">
                  Průměrné skóre
                </div>

                <div className="mt-3 text-3xl font-black text-white">
                  {mounted
                    ? topAverage.name
                    : "-"}
                </div>

                <div className="mt-2 text-2xl font-black text-yellow-400">
                  {mounted
                    ? topAverage.value
                    : "-"}
                </div>
              </div>

              <div className="rounded-3xl bg-zinc-900 p-6">
                <div className="text-yellow-400">
                  Perfektní kategorie
                </div>

                <div className="mt-3 text-3xl font-black text-white">
                  {mounted
                    ? topPerfects.name
                    : "-"}
                </div>

                <div className="mt-2 text-2xl font-black text-yellow-400">
                  {mounted
                    ? topPerfects.value
                    : "-"}
                </div>
              </div>

              <div className="rounded-3xl bg-zinc-900 p-6">
                <div className="text-yellow-400">
                  Průměr perfektních
                </div>

                <div className="mt-3 text-3xl font-black text-white">
                  {mounted
                    ? topAveragePerfects.name
                    : "-"}
                </div>

                <div className="mt-2 text-2xl font-black text-yellow-400">
                  {mounted
                    ? topAveragePerfects.value
                    : "-"}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* GAME */}
      {screen === "game" && (
        <div className="mx-auto flex w-full max-w-6xl flex-col">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
  <h1 className="text-5xl font-black tracking-tight text-yellow-400">
    HERO DICE
  </h1>

  <div className="flex flex-wrap gap-3">
  {gameStarted ? (
  <>
    <button
      onClick={saveGameToSupabase}
      className="rounded-2xl bg-blue-600 px-6 py-3 text-lg font-bold transition hover:bg-blue-500"
    >
      Uložit hru
    </button>

    <button
      onClick={() => {
        setShowLeaveConfirm(
          true
        );
      }}
      className="rounded-2xl bg-zinc-700 px-6 py-3 text-lg font-bold transition hover:bg-zinc-600"
    >
      Ukončit hru
    </button>
  </>
) : (
    <>
      <button
  onClick={loadSavedGames}
  className="rounded-2xl bg-blue-600 px-6 py-3 text-lg font-bold transition hover:bg-blue-500"
>
  Načíst hru
</button>

<button
  onClick={() =>
    setShowAdmin(true)
  }
  className="rounded-2xl bg-zinc-700 px-6 py-3 text-lg font-bold transition hover:bg-zinc-600"
>
  Admin
</button>

<button
  onClick={() =>
    setScreen("home")
  }
  className="rounded-2xl bg-green-700 px-6 py-3 text-lg font-bold transition hover:bg-green-600"
>
  Domů
</button>
    </>
  )}
</div>
</div>

          {!gameStarted && (
            <div className="mx-auto mb-12 mt-6 w-full max-w-5xl rounded-3xl bg-zinc-900/60 p-6 backdrop-blur md:p-8">
              <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-sm font-bold uppercase tracking-[0.2em] text-yellow-400">
                    Nastavení hry
                  </div>

                  <h2 className="mt-2 text-3xl font-black text-white md:text-4xl">
                    Nová hra
                  </h2>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold uppercase tracking-wide text-zinc-400">
                    Počet hráčů
                  </label>

<div className="text-sm text-zinc-500">
  Maximálně:
  {" "}
  {maxPlayers}
  {" "}
  aktivní
  {maxPlayers === 1
    ? " hráč"
    : maxPlayers >= 2 &&
      maxPlayers <= 4
    ? " hráči"
    : " hráčů"}
</div>

                  <select
                    value={playerCount}
                    onChange={(e) =>
                      handlePlayerCountChange(
                        Number(
                          e.target.value
                        )
                      )
                    }
                    className="min-w-[220px] rounded-2xl border border-zinc-700 bg-black px-5 py-4 text-lg font-bold text-white outline-none transition focus:border-yellow-400"
                  >
                    <option value="">
                      Vyber počet hráčů
                    </option>

                    {Array.from(
  {
    length:
      maxPlayers >= 2
        ? maxPlayers - 1
        : 0,
  },
  (_, index) => index + 2
).map((count) => (
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
              </div>

              {playerCount !== "" && (
                <div className="mb-10 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {Array.from({
                    length: playerCount,
                  }).map((_, index) => (
                    <div
                      key={index}
                      className="rounded-2xl border border-zinc-800 bg-black/40 p-5"
                    >
                      <label className="mb-3 block text-sm font-bold uppercase tracking-wide text-yellow-400">
                        Hráč {index + 1}
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
                        className="w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-4 text-lg font-bold text-white outline-none transition focus:border-yellow-400"
                      >
                        <option value="">
                          Vyber hráče
                        </option>

                        {selectablePlayers.map(
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
                className={`rounded-2xl px-8 py-4 text-xl font-black transition ${
                  canStartGame
                    ? "bg-yellow-500 text-black hover:scale-[1.02] hover:bg-yellow-400"
                    : "cursor-not-allowed bg-zinc-700 text-zinc-400"
                }`}
              >
                ▶ Začít hru
              </button>
            </div>
          )}

          {gameStarted && (
            <div className="w-full overflow-x-auto rounded-2xl border border-zinc-700 bg-zinc-950">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-green-800">
                    <th className="w-[28%] border border-white p-3 text-left">
                      Kombinace
                    </th>

                    <th className="w-[9%] border border-white p-3 text-center">
                      MIN
                    </th>

                    <th className="w-[9%] border border-white p-3 text-center">
                      MAX
                    </th>

                    {selectedPlayers.map(
                      (playerId, index) => (
                        <th
                          key={index}
                          className="border border-white p-3 text-center"
                        >
                          {
  playersState.find(
    (player) =>
      player.id === playerId
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
                        className="transition hover:bg-zinc-900"
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
                            const value =
                              scores[playerId]?.[
                                category.id
                              ];

                            const isPerfect =
                              value ===
                              category.max;

                            return (
                              <td
                                key={index}
                                className={`border border-white p-3 text-center text-xl font-black transition ${
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
                                      : "text-white"
                                  }
                                >
                                  {value ?? ""}
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
          )}
        </div>
      )}

{/* EDIT CONFIRM MODAL */}
{showEditConfirm && scoreModal && (
  <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
    <div className="w-full max-w-[420px] rounded-3xl border border-yellow-500/30 bg-zinc-900 p-8 text-center text-white shadow-2xl">
      <h2 className="mb-5 text-3xl font-black text-yellow-400">
        Upravit skóre?
      </h2>

      <p className="mb-8 text-lg text-zinc-300">
        Tato kombinace už má zadané skóre.
        <br />
        Chceš jej upravit?
      </p>

      <div className="flex gap-4">
        <button
        onClick={() => {
        setShowEditConfirm(false);

    setScoreModal(null);
  }}
          className="flex-1 rounded-2xl bg-zinc-700 px-5 py-4 text-lg font-bold text-white transition hover:bg-zinc-600"
        >
          Nechat hodnotu
        </button>

        <button
          onClick={() =>
            setShowEditConfirm(false)
          }
          className="flex-1 rounded-2xl bg-yellow-500 px-5 py-4 text-lg font-black text-black transition hover:bg-yellow-400"
        >
          Opravit
        </button>
      </div>
    </div>
  </div>
)}

{/* HOME RESTORE MODAL */}
{showHomeRestoreModal && (
  <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 p-4">
    <div className="w-full max-w-[420px] rounded-3xl border border-yellow-500/20 bg-zinc-900 p-8 text-center text-white shadow-2xl">
      <h2 className="mb-5 text-3xl font-black text-yellow-400">
        Obnovit hru?
      </h2>

      <p className="mb-8 text-lg text-zinc-300">
        Byla nalezena rozehraná hra.
      </p>

      <div className="flex gap-4">
        <button
          onClick={() => {
            setShowHomeRestoreModal(
              false
            );

            startNewGame(true);
          }}
          className="flex-1 rounded-2xl bg-zinc-700 px-5 py-4 text-lg font-bold text-white transition hover:bg-zinc-600"
        >
          Nová hra
        </button>

        <button
          onClick={() => {
            const savedGame =
              localStorage.getItem(
                "heroDiceCurrentGame"
              );

            if (!savedGame)
              return;

            const parsed =
              JSON.parse(savedGame);

            setPlayerCount(
              parsed.playerCount
            );

            setSelectedPlayers(
              parsed.selectedPlayers
            );

            setScores(
              parsed.scores
            );

            setGameStarted(
              parsed.gameStarted
            );

            setGameFinished(
              parsed.gameFinished
            );

            setScreen("game");

            setShowHomeRestoreModal(
              false
            );
          }}
          className="flex-1 rounded-2xl bg-yellow-500 px-5 py-4 text-lg font-black text-black transition hover:bg-yellow-400"
        >
          Obnovit
        </button>
      </div>
    </div>
  </div>
)}

{/* LOAD GAMES MODAL */}
{showLoadGames && (
  <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/90 p-4">
    <div className="w-full max-w-2xl rounded-3xl bg-zinc-900 p-8 text-white shadow-2xl">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-3xl font-black text-yellow-400">
          Načíst hru
        </h2>

        <button
          onClick={() =>
            setShowLoadGames(
              false
            )
          }
          className="rounded-xl bg-zinc-700 px-4 py-2 font-bold transition hover:bg-zinc-600"
        >
          Zavřít
        </button>
      </div>

      <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-2">
        {savedGames.length ===
        0 ? (
          <div className="rounded-2xl bg-black/40 p-6 text-center text-zinc-400">
            Žádné uložené hry.
          </div>
        ) : (
          savedGames.map((game) => (
            <div
              key={game.id}
              className="flex items-center justify-between rounded-2xl border border-zinc-700 bg-black/40 p-5"
            >
              <div>
                <div className="text-xl font-black text-white">
                  {game.name}
                </div>

                <div className="mt-1 text-sm text-zinc-400">
                  {new Date(
                    game.created_at
                  ).toLocaleString(
                    "cs-CZ"
                  )}
                </div>
              </div>

              <button
  onClick={() => {
    setPlayerCount(
      game.player_count
    );

    setSelectedPlayers(
      game.selected_players
    );

    setScores(
      game.scores
    );

    setGameStarted(
      game.game_started
    );

    setGameFinished(
      game.game_finished
    );

    localStorage.setItem(
      "heroDiceCurrentGame",
      JSON.stringify({
        playerCount:
          game.player_count,

        selectedPlayers:
          game.selected_players,

        scores: game.scores,

        gameStarted:
          game.game_started,

        gameFinished:
          game.game_finished,
      })
    );

    setShowLoadGames(
      false
    );

    setScreen("game");
  }}
  className="rounded-xl bg-yellow-500 px-5 py-3 font-black text-black transition hover:bg-yellow-400"
>
  Načíst
</button>
            </div>
          ))
        )}
      </div>
    </div>
  </div>
)}

{/* RESTORE GAME MODAL */}
{showRestoreGame && (
  <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 p-4">
    <div className="w-full max-w-[420px] rounded-3xl border border-yellow-500/20 bg-zinc-900 p-8 text-center text-white shadow-2xl">
      <h2 className="mb-5 text-3xl font-black text-yellow-400">
        Obnovit hru?
      </h2>

      <p className="mb-8 text-lg text-zinc-300">
        Byla nalezena rozehraná hra.
      </p>

      <div className="flex gap-4">
        <button
          onClick={() => {
            localStorage.removeItem(
              "heroDiceCurrentGame"
            );

            setShowRestoreGame(
              false
            );
          }}
          className="flex-1 rounded-2xl bg-zinc-700 px-5 py-4 text-lg font-bold text-white transition hover:bg-zinc-600"
        >
          Zahodit
        </button>

        <button
          onClick={() => {
            const savedGame =
              localStorage.getItem(
                "heroDiceCurrentGame"
              );

            if (!savedGame)
              return;

            const parsed =
              JSON.parse(savedGame);

            setPlayerCount(
              parsed.playerCount
            );

            setSelectedPlayers(
              parsed.selectedPlayers
            );

            setScores(
              parsed.scores
            );

            setGameStarted(
              parsed.gameStarted
            );

            setGameFinished(
              parsed.gameFinished
            );

            setScreen("game");

            setShowRestoreGame(
              false
            );
          }}
          className="flex-1 rounded-2xl bg-yellow-500 px-5 py-4 text-lg font-black text-black transition hover:bg-yellow-400"
        >
          Obnovit
        </button>
      </div>
    </div>
  </div>
)}

      {/* SCORE MODAL */}
      {scoreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
          <div className="w-full max-w-[420px] rounded-3xl border border-yellow-500/30 bg-gradient-to-br from-zinc-900 to-zinc-950 p-8 text-white shadow-2xl">
            <h2 className="mb-6 text-center text-3xl font-black text-yellow-400">
              Zadat skóre
            </h2>

            <div className="mb-6 rounded-2xl border border-yellow-500/20 bg-zinc-900/80 p-5">
              <div className="mb-2 text-sm uppercase tracking-widest text-zinc-400">
                Kombinace
              </div>

              <div className="text-3xl font-black text-yellow-300">
                {
                  gameCategories.find(
                    (category) =>
                      category.id ===
                      scoreModal.categoryId
                  )?.name
                }
              </div>
            </div>

            <div className="mb-6 rounded-2xl border border-blue-500/20 bg-zinc-900/80 p-5">
              <div className="mb-2 text-sm uppercase tracking-widest text-zinc-400">
                Hráč
              </div>

              <div className="text-2xl font-bold text-blue-300">
                {
                  playersState.find(
                    (player) =>
                      player.id ===
                      scoreModal.playerId
                  )?.name
                }
              </div>
            </div>

            <div className="mb-4 text-center text-zinc-400">
              Povolené rozmezí:
              <span className="ml-2 font-bold text-green-400">
                {scoreModal.min} –{" "}
                {scoreModal.max}
              </span>
            </div>

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
              className="mb-6 w-full rounded-2xl border border-zinc-700 bg-black/60 p-5 text-center text-5xl font-black text-yellow-300 outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-500/40"
              autoFocus
            />

            <div className="flex gap-4">
              <button
                onClick={saveScore}
                className="flex-1 rounded-2xl bg-green-600 px-5 py-4 text-lg font-black text-white transition hover:scale-[1.02] hover:bg-green-500"
              >
                Uložit
              </button>

              <button
                onClick={() =>
                  setScoreModal(null)
                }
                className="flex-1 rounded-2xl bg-zinc-700 px-5 py-4 text-lg font-bold text-white transition hover:bg-zinc-600"
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
              className="max-h-[90vh] max-w-[90vw] rounded-xl bg-white shadow-2xl"
            />

            <button
              className="absolute right-2 top-2 rounded-lg bg-red-600 px-4 py-2 font-bold text-white transition hover:bg-red-700"
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
          <div className="max-w-xl rounded-2xl bg-white p-10 text-center text-black">
            <h2 className="mb-8 text-5xl">
              🏆 Konec hry
            </h2>

            <p className="mb-3 text-3xl font-bold">
              Vítěz
            </p>

            <p className="mb-6 text-5xl font-black text-green-700">
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
                className="rounded-lg bg-blue-600 px-5 py-3 font-bold text-white transition hover:bg-blue-500"
              >
                Zobrazit hru
              </button>

              <button
                onClick={() =>
                  setShowStatistics(
                    true
                  )
                }
                className="rounded-lg bg-yellow-500 px-5 py-3 font-bold text-black transition hover:bg-yellow-400"
              >
                Statistiky
              </button>

              <button
                onClick={() => startNewGame()}
                className="rounded-lg bg-red-600 px-5 py-3 font-bold text-white transition hover:bg-red-500"
              >
                Nová hra
              </button>

<button
  onClick={() => {
    setShowFinishedGame(
      false
    );

    setScreen("home");
  }}
                className="rounded-lg bg-zinc-700 px-5 py-3 font-bold text-white transition hover:bg-zinc-600"
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
          <div className="w-full max-w-[420px] rounded-2xl bg-white p-8 text-center text-black">
            <h2 className="mb-6 text-3xl font-black">
              Opravdu ukončit hru?
            </h2>

            <p className="mb-8 text-zinc-600">
              Rozehraná hra nebude uložena.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
  <button
    onClick={() =>
      setShowLeaveConfirm(
        false
      )
    }
    className="rounded-lg bg-green-600 px-5 py-3 font-bold text-white transition hover:bg-green-500"
  >
    Pokračovat
  </button>

  <button
    onClick={() => {
      setShowLeaveConfirm(
        false
      );

      startNewGame();
    }}
    className="rounded-lg bg-yellow-500 px-5 py-3 font-bold text-black transition hover:bg-yellow-400"
  >
    Nová hra
  </button>

  <button
  onClick={() => {
    setShowLeaveConfirm(
      false
    );

    setScreen("home");
  }}
  className="rounded-lg bg-red-600 px-5 py-3 font-bold text-white transition hover:bg-red-500"
>
  Domů
</button>
</div>
          </div>
        </div>
      )}

{/* ADMIN */}
{showAdmin && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
    <div className="w-full max-w-2xl rounded-3xl bg-zinc-900 p-8 text-white shadow-2xl">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-4xl font-black text-yellow-400">
          Administrace hráčů
        </h2>

        <button
          onClick={() =>
            setShowAdmin(false)
          }
          className="rounded-xl bg-zinc-700 px-4 py-2 font-bold transition hover:bg-zinc-600"
        >
          Zavřít
        </button>
      </div>

      <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-2">
        {playersState.map((player) => (
          <div
            key={player.id}
            className="flex items-center justify-between rounded-2xl border border-zinc-700 bg-black/40 p-5"
          >
            <div>
              <input
  type="text"
  value={player.name}
  onChange={(e) => {
    updatePlayerInSupabase(
  player.id,
  {
    name: e.target.value,
  }
);
    const updatedPlayers =
      playersState.map((p) =>
        p.id === player.id
          ? {
              ...p,
              name: e.target.value,
            }
          : p
      );

    setPlayersState(
      updatedPlayers
    );
  }}
  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-2xl font-black text-white outline-none transition focus:border-yellow-400"
/>

              <div className="mt-1 text-sm text-zinc-500">
                ID: {player.id}
              </div>
            </div>

            <div className="flex gap-2">
  <button
    onClick={() => {
  const updatedPlayers =
    playersState.map((p) =>
      p.id === player.id
        ? {
            ...p,
            active:
              !p.active,
          }
        : p
    );

  setPlayersState(
    updatedPlayers
  );

  updatePlayerInSupabase(
    player.id,
    {
      active:
        !player.active,
    }
  );

  localStorage.setItem(
    "heroDicePlayers",
    JSON.stringify(
      updatedPlayers
    )
  );
}}
    className={`rounded-xl px-4 py-2 font-bold transition ${
      player.active
        ? "bg-green-600 hover:bg-green-500"
        : "bg-red-600 hover:bg-red-500"
    }`}
  >
    {player.active
      ? "Aktivní"
      : "Neaktivní"}
  </button>

  <button
    onClick={() =>
  setDeletePlayerId(
    player.id
  )
}
    className="rounded-xl bg-red-700 px-4 py-2 font-bold text-white transition hover:bg-red-600"
  >
    Smazat
  </button>
</div>
          </div>
                ))}

        <div className="mt-6 rounded-2xl border border-zinc-700 bg-black/40 p-5">
          <div className="mb-4 text-xl font-black text-yellow-400">
            Přidat hráče
          </div>

          <div className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Player ID"
              value={newPlayerId}
              onChange={(e) =>
                setNewPlayerId(
                  e.target.value
                )
              }
              className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-yellow-400"
            />

            <input
              type="text"
              placeholder="Jméno hráče"
              value={newPlayerName}
              onChange={(e) =>
                setNewPlayerName(
                  e.target.value
                )
              }
              className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-yellow-400"
            />

            <button
              onClick={handleAddPlayer}
              className="rounded-xl bg-green-600 px-5 py-3 font-black text-white transition hover:bg-green-500"
            >
              Přidat hráče
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
)}

{/* DELETE PLAYER CONFIRM */}
{deletePlayerId && (
  <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 p-4">
    <div className="w-full max-w-[420px] rounded-3xl bg-zinc-900 p-8 text-center text-white shadow-2xl">
      <h2 className="mb-5 text-3xl font-black text-red-500">
        Smazat hráče?
      </h2>

      <p className="mb-8 text-zinc-300">
  Opravdu chceš smazat hráče{" "}
  <span className="font-bold text-white">
    {
      playersState.find(
        (player) =>
          player.id ===
          deletePlayerId
      )?.name
    }
  </span>
  ?
</p>

      <div className="flex gap-4">
        <button
          onClick={() =>
            setDeletePlayerId(
              null
            )
          }
          className="flex-1 rounded-2xl bg-zinc-700 px-5 py-4 font-bold transition hover:bg-zinc-600"
        >
          Nechat
        </button>

        <button
          onClick={() => {
            handleDeletePlayer(
              deletePlayerId
            );

            setDeletePlayerId(
              null
            );
          }}
          className="flex-1 rounded-2xl bg-red-600 px-5 py-4 font-black text-white transition hover:bg-red-500"
        >
          Smazat
        </button>
      </div>
    </div>
  </div>
)}

      {/* STATISTICS */}
      {showStatistics && (
        <StatisticsModal
  players={playersState}
  onClose={() =>
    setShowStatistics(false)
  }
/>
      )}
    </main>
  );
}
