"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import StatisticsModal from "./components/StatisticsModal";

import FunGamesModal from "./components/FunGamesModal";

import HelpModal from "./components/HelpModal";

import { gameCategories } from "./data/gameCategories";

import { supabase } from "./lib/supabase";

import { detectCombination } from "./lib/playMode";
import confetti from "canvas-confetti";

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

  const [showFunGames,
  setShowFunGames] =
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

const winSounds = [
  "/sounds/win/wow1.mp3",
  "/sounds/win/wow2.mp3",
  "/sounds/win/wow3.mp3",
];

const celebrationAudioRef =
  useRef<HTMLAudioElement | null>(
    null
  );

const celebrationTimeoutsRef =
  useRef<number[]>([]);

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

console.log(
  "LOAD GAME",
  savedGames
);

const [
showLoadGames,
setShowLoadGames,
] = useState(false);

const [
  showGameMenu,
  setShowGameMenu,
] = useState(false);

useEffect(() => {
  const handleClickOutside = () => {
    setShowGameMenu(false);
  };

  if (showGameMenu) {
    document.addEventListener(
      "click",
      handleClickOutside
    );
  }

  return () => {
    document.removeEventListener(
      "click",
      handleClickOutside
    );
  };
}, [showGameMenu]);

const [
  showSaveGameConfirm,
  setShowSaveGameConfirm,
] = useState(false);

const [
  showGameSavedModal,
  setShowGameSavedModal,
] = useState(false);

const [
  showFinishGameConfirm,
  setShowFinishGameConfirm,
] = useState(false);

const [
  pendingFinishedGame,
  setPendingFinishedGame,
] = useState<any>(null);


const [
  deleteSavedGameId,
  setDeleteSavedGameId,
] = useState<string | null>(
  null
);

const [
  showPlayModeSetup,
  setShowPlayModeSetup,
] = useState(false);

const [
  showPlayModeHelp,
  setShowPlayModeHelp,
] = useState(false);

const [
  showHelp,
  setShowHelp,
] = useState(false);

const [
  playModeRolls,
  setPlayModeRolls,
] = useState(4);

const [
  playModeAllowRewrite,
  setPlayModeAllowRewrite,
] = useState(false);

const [
  playModeBonusMode,
  setPlayModeBonusMode,
] = useState<
  "general-only" | "all"
>("general-only");

const [
  playModeBonusRolls,
  setPlayModeBonusRolls,
] = useState(6);

const [
  isPlayModeActive,
  setIsPlayModeActive,
] = useState(false);

const [
  hasStartedPlayMode,
  setHasStartedPlayMode,
] = useState(false);

const [
  hasRolledDice,
  setHasRolledDice,
] = useState(false);

const [
  isRolling,
  setIsRolling,
] = useState(false);

const [
  showPlayModeResult,
  setShowPlayModeResult,
] = useState(false);

const [
  currentPlayPlayerIndex,
  setCurrentPlayPlayerIndex,
] = useState(0);

const [
  playModeDice,
  setPlayModeDice,
] = useState<number[]>(
  [1, 1, 1, 1, 1, 1]
);

const diceImages: Record<
  number,
  string
> = {
  1: "/dice/1.png",
  2: "/dice/2.png",
  3: "/dice/3.png",
  4: "/dice/4.png",
  5: "/dice/5.png",
  6: "/dice/6.png",
};

const [
  lockedDice,
  setLockedDice,
] = useState<boolean[]>(
  [
    false,
    false,
    false,
    false,
    false,
    false,
  ]
);

const [
  confirmedLockedDice,
  setConfirmedLockedDice,
] = useState<boolean[]>(
  [
    false,
    false,
    false,
    false,
    false,
    false,
  ]
);

const [
  remainingRolls,
  setRemainingRolls,
] = useState<number>(0);  

const [
  bonusUsed,
  setBonusUsed,
] = useState(false);

const [
  bonusActivatedThisTurn,
  setBonusActivatedThisTurn,
] = useState(false);

const [
  selectedGeneralValue,
  setSelectedGeneralValue,
] = useState<
  number | null
>(null);

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
   
type Player = {
  id: string;
  name: string;
  active: boolean;
};

const [playersState, setPlayersState] =
  useState<Player[]>([]);

const selectablePlayers =
  playersState
    .filter(
      (player) =>
        player.active
    )
    .sort((a, b) =>
      a.name.localeCompare(
        b.name,
        "cs"
      )
    );

const maxPlayers =
  selectablePlayers.length;

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

window.scrollTo({
  top: 0,
  left: 0,
  behavior: "instant" as ScrollBehavior,
});
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

const toggleDiceLock = (
  index: number
) => {
  if (
  !hasRolledDice ||
  isRolling
) {
  return;
}

  if (
    confirmedLockedDice[
      index
    ]
  ) {
    return;
  }

  if (
    bonusUsed &&
    playModeBonusMode ===
      "general-only"
  ) {
    const clickedValue =
      playModeDice[index];

    if (
      selectedGeneralValue !==
        null &&
      clickedValue !==
        selectedGeneralValue
    ) {
      return;
    }

    if (
      selectedGeneralValue ===
      null
    ) {
      setSelectedGeneralValue(
        clickedValue
      );
    }
  }

  setLockedDice((prev) => {
    const updated = [...prev];

    updated[index] =
      !updated[index];

    const anyLocked =
      updated.some(
        (dice) => dice
      );

    if (
      !anyLocked &&
      !(
        bonusUsed &&
        playModeBonusMode ===
          "general-only"
      )
    ) {
      setSelectedGeneralValue(
        null
      );
    }

    return updated;
  });
};

const bonusDifference =
  playModeBonusRolls -
  playModeRolls;

const allDiceLocked =
  lockedDice.every(
    (dice) => dice
  );

const generalBonusBlocked =
  playModeBonusMode ===
    "general-only" &&
  (() => {
    const lockedValues =
      playModeDice.filter(
        (_, index) =>
          lockedDice[index]
      );

    const uniqueValues =
      [...new Set(lockedValues)];

    return (
      uniqueValues.length > 1
    );
  })();

const canEvaluateCombination =
  hasRolledDice;

const currentCombination =
  hasRolledDice &&
  !isRolling
    ? detectCombination(
        playModeDice
      )
    : null;
    
const canStartPlayMode =
  !selectedPlayers.some(
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

const isLeaguePlayMode =
  playModeRolls === 4 &&
  !playModeAllowRewrite &&
  playModeBonusMode ===
    "general-only" &&
  playModeBonusRolls === 6;

const playModeCategoryMap: Record<
  string,
  string
> = {
  Generál: "general",
  Pyramida: "pyramida",
  Hrozen: "hrozen",
  Postupka: "postupka",
  "Čtyři-dvě": "ctyri_dva",
  Dvojice: "dvojce",
  Trojice: "trojce",
};

const currentPlayModeScore =
  currentCombination
    ? scores[
        selectedPlayers[
          currentPlayPlayerIndex
        ]
      ]?.[
        playModeCategoryMap[
          currentCombination
            .combination
        ]
      ]
    : undefined;

const hasLockedDice =
  lockedDice.some(
    (dice) => dice
  );

const hasUsefulFutureMove =
  useMemo(() => {
    if (!hasLockedDice) {
      return null;
    }

    const playerId =
      selectedPlayers[
        currentPlayPlayerIndex
      ];

    const unlockedIndexes =
      lockedDice
        .map(
          (locked, index) =>
            locked
              ? -1
              : index
        )
        .filter(
          (index) =>
            index !== -1
        );

    const testDice = [
      ...playModeDice,
    ];

    let foundUsefulMove =
      false;

    const checkCombination =
      (
        position: number
      ) => {
        if (
          foundUsefulMove
        ) {
          return;
        }

        if (
          position ===
          unlockedIndexes.length
        ) {
          const result =
            detectCombination(
              testDice
            );

          if (!result) {
            return;
          }

          const categoryId =
            playModeCategoryMap[
              result
                .combination
            ];

          if (
            !categoryId
          ) {
            return;
          }

          const existingScore =
            scores[playerId]?.[
              categoryId
            ];

          if (
            existingScore ===
            undefined
          ) {
            foundUsefulMove =
              true;

            return;
          }

          if (
            playModeAllowRewrite &&
            result.score >
              existingScore
          ) {
            foundUsefulMove =
              true;
          }

          return;
        }

        const diceIndex =
          unlockedIndexes[
            position
          ];

        for (
          let value = 1;
          value <= 6;
          value++
        ) {
          testDice[
            diceIndex
          ] = value;

          checkCombination(
            position + 1
          );

          if (
            foundUsefulMove
          ) {
            return;
          }
        }
      };

    checkCombination(0);

    return foundUsefulMove;
  }, [
    hasLockedDice,
    lockedDice,
    playModeDice,
    selectedPlayers,
    currentPlayPlayerIndex,
    scores,
    playModeAllowRewrite,
  ]);
    
const canSavePlayModeScore =
  !currentCombination ||
  !playModeAllowRewrite
    ? true
    : currentPlayModeScore ===
        undefined ||
      currentCombination.score >
        currentPlayModeScore;

const savePlayModeScore =
  () => {
    if 
    (!currentCombination)
      
    return true;

    const playerId =
      selectedPlayers[
        currentPlayPlayerIndex
      ];

    const categoryId =
      playModeCategoryMap[
        currentCombination
          .combination
      ];

    if (!categoryId)
      return true;

    const existingScore =
      scores[playerId]?.[
        categoryId
      ];

if (
  existingScore !== undefined &&
  playModeAllowRewrite &&
  existingScore >=
    currentCombination.score
) {
  return true;
}

    if (
      existingScore !==
        undefined &&
      !playModeAllowRewrite
    ) {
      alert(
        "Tato kombinace je již zapsána a Play Mode neumožňuje přepis skóre."
      );

      return false;
    }

    setScores((prev) => ({
      ...prev,

      [playerId]: {
        ...prev[playerId],

        [categoryId]:
          currentCombination.score,
      },
    }));

    return true;
  };

const endTurn = () => {
  const nextPlayer =
    currentPlayPlayerIndex +
    1 >=
    selectedPlayers.length
      ? 0
      : currentPlayPlayerIndex +
        1;

  setCurrentPlayPlayerIndex(
    nextPlayer
  );

  setPlayModeDice([
    1,
    1,
    1,
    1,
    1,
    1,
  ]);

  setLockedDice([
    false,
    false,
    false,
    false,
    false,
    false,
  ]);

  setConfirmedLockedDice([
    false,
    false,
    false,
    false,
    false,
    false,
  ]);

  setRemainingRolls(
    playModeRolls
  );
  
  setBonusUsed(false);
  setHasRolledDice(false);
setSelectedGeneralValue(
  null
);
  setBonusUsed(false);
};

const activateBonus = () => {
  if (bonusUsed) {
  if (
    bonusActivatedThisTurn
  ) {
      setRemainingRolls(
        (prev) =>
          prev - bonusDifference
      );

      setBonusUsed(false);
    }

    return;
  }
if (
  playModeBonusMode ===
    "general-only"
) {
  const lockedValues =
    playModeDice.filter(
      (_, index) =>
        lockedDice[index]
    );

  const uniqueValues =
    [...new Set(lockedValues)];

  if (
    uniqueValues.length > 1
  ) {
    return;
  }
}
  setRemainingRolls(
    (prev) =>
      prev + bonusDifference
  );

  setBonusUsed(true);

setBonusActivatedThisTurn(
  true
);
};

const rollAllDice = () => {
  if (
    remainingRolls <= 0 ||
    isRolling
  ) {
    return;
  }

  setIsRolling(true);

  let ticks = 0;

  const interval =
    setInterval(() => {
      setPlayModeDice(
        (prev) =>
          prev.map(
            (
              dice,
              index
            ) => {
              if (
                lockedDice[
                  index
                ]
              ) {
                return dice;
              }

              return (
                Math.floor(
                  Math.random() *
                    6
                ) + 1
              );
            }
          )
      );

      ticks++;

      if (ticks >= 6) {
        clearInterval(
          interval
        );

        const finalDice =
          playModeDice.map(
            (
              dice,
              index
            ) => {
              if (
                lockedDice[
                  index
                ]
              ) {
                return dice;
              }

              return (
                Math.floor(
                  Math.random() *
                    6
                ) + 1
              );
            }
          );

        setPlayModeDice(
          finalDice
        );

        setHasRolledDice(
          true
        );

        setRemainingRolls(
          (prev) =>
            prev - 1
        );

        setConfirmedLockedDice(
  [...lockedDice]
);

setBonusActivatedThisTurn(
  false
);

setIsRolling(
  false
);
      }
    }, 133);
};

const saveFunGame =
  async ({
    winner,
    winnerScore,
    players,
    scores,
  }: {
    winner: string;
    winnerScore: number;
    players: string[];
    scores: any;
  }) => {
    const { error } =
      await supabase
        .from("fun_games")
        .insert([
          {
            date:
              new Date().toISOString(),

            winner,

            winner_score:
              winnerScore,

            players,

            scores,

            roll_count:
              playModeRolls,

            rewrite_enabled:
              playModeAllowRewrite,

            bonus_mode:
              playModeBonusMode,

            bonus_rolls:
              playModeBonusRolls,
          },
        ]);

    if (error) {
      console.error(
        "Fun game save error:",
        error
      );
    }
  };

const saveGameToSupabase =
  async () => {
    try {
      const gameName =
        selectedPlayers
          .map(
            (player) =>
              playersState.find(
  (p) =>
    p.id === player
)?.name || player
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

      setShowSaveGameConfirm(
  false
);

setShowGameSavedModal(
  true
);
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

const deleteSavedGame =
  async (gameId: number) => {
    const { error } =
      await supabase
        .from("saved_games")
        .delete()
        .eq("id", gameId);

    if (error) {
      console.error(error);

      alert(
        "Nepodařilo se smazat hru."
      );

      return;
    }

    setSavedGames((prev) =>
      prev.filter(
        (game) =>
          game.id !== gameId
      )
    );
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
setHasStartedPlayMode(
  false
);

setIsPlayModeActive(
  false
);

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

        playerName:
          playersState.find(
            (p) =>
              p.id === playerId
          )?.name ||
          playerId,

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

if (!hasStartedPlayMode) {
  setPendingFinishedGame({
    winner: bestPlayer,
    winnerScore: bestScore,
    players: selectedPlayers,
    scores: gameResults,
  });

  setShowFinishGameConfirm(
    true
  );

  return;
}

if (isLeaguePlayMode) {
  await saveFinishedGame({
    date:
      new Date().toISOString(),

    winner:
      bestPlayer,

    winnerScore:
      bestScore,

    players:
      selectedPlayers,

    scores:
      gameResults,
  });
} else {
  await saveFunGame({
    winner:
      bestPlayer,

    winnerScore:
      bestScore,

    players:
      selectedPlayers,

    scores:
      gameResults,
  });
}

setGameFinished(true);

setIsPlayModeActive(
  false
);

setShowPlayModeResult(
  false
);

localStorage.removeItem(
  "heroDiceCurrentGame"
);

const randomSound =
  winSounds[
    Math.floor(
      Math.random() *
      winSounds.length
    )
  ];

console.log(
  "WIN SOUND:",
  randomSound
);

const audio = new Audio(
  `${randomSound}?t=${Date.now()}`
);

audio.volume = 0.8;

celebrationAudioRef.current =
  audio;

audio.play().catch(() => {});

setShowFinishedGame(true);

const celebrationType =
  Math.floor(
    Math.random() * 3
  );

if (celebrationType === 0) {
  for (
    let i = 0;
    i < 18;
    i++
  ) {
    const timeoutId =
      window.setTimeout(
        () => {
          confetti({
            particleCount: 35,
            spread: 100,
            startVelocity: 35,
            origin: {
              x: Math.random(),
              y: 0.6,
            },
          });
        },
        i * 500
      );

    celebrationTimeoutsRef.current.push(
      timeoutId
    );
  }
}

if (celebrationType === 1) {
  for (
    let i = 0;
    i < 18;
    i++
  ) {
    const timeoutId =
      window.setTimeout(
        () => {
          confetti({
            particleCount: 60,
            spread: 180,
            startVelocity: 60,
            origin: {
              x: 0.5,
              y: 0.6,
            },
          });
        },
        i * 500
      );

    celebrationTimeoutsRef.current.push(
      timeoutId
    );
  }
}

if (celebrationType === 2) {
  for (
    let i = 0;
    i < 18;
    i++
  ) {
    const timeoutId =
      window.setTimeout(
        () => {
          confetti({
            particleCount: 40,
            angle: 60,
            spread: 55,
            origin: {
              x: 0,
              y: 0.7,
            },
          });

          confetti({
            particleCount: 40,
            angle: 120,
            spread: 55,
            origin: {
              x: 1,
              y: 0.7,
            },
          });
        },
        i * 250
      );

    celebrationTimeoutsRef.current.push(
      timeoutId
    );
  }
}
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
          <h1 className="mb-3 text-5xl font-black text-yellow-400 tracking-[0.14em]">
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
      <div className="flex items-center gap-3">
  <h1 className="text-5xl font-black tracking-[0.14em] text-yellow-400 md:text-5xl">
    HERO DICE
  </h1>

  <button
    onClick={() =>
      setShowHelp(true)
    }
    className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-lg font-black text-black transition hover:bg-green-400"
  >
    ?
  </button>
</div>

      <div className="flex flex-wrap gap-3">
  <button
    onClick={loadSavedGames}
    className="rounded-2xl bg-blue-600 px-6 py-3 text-lg font-bold transition hover:bg-blue-500 md:text-xl"
  >
    Načíst hru
  </button>

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
    className="rounded-2xl bg-yellow-500 px-6 py-3 text-lg font-bold transition hover:bg-yellow-400 md:text-xl"
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
            <h2 className="mb-6 text-3xl font-bold text-zinc-300 md:text-4xl tracking-[0.1em]">
              TOP HRÁČI
            </h2>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              <div className="rounded-3xl bg-zinc-900 p-6">
                <div className="text-yellow-400 tracking-[0.14em]">
                  Výhry
                </div>

                <div className="mt-3 text-3xl font-black text-white tracking-[0.07em]">
                  {mounted
                    ? topWins.name
                    : "-"}
                </div>

                <div className="mt-2 text-2xl font-black text-yellow-400 tracking-[0.12em] ">
                  {mounted
                    ? topWins.value
                    : "-"}
                </div>
              </div>

              <div className="rounded-3xl bg-zinc-900 p-6">
                <div className="text-yellow-400 tracking-[0.14em]">
                  Nejlepší skóre
                </div>

                <div className="mt-3 text-3xl font-black text-white tracking-[0.07em]">
                  {mounted
                    ? topScore.name
                    : "-"}
                </div>

                <div className="mt-2 text-2xl font-black text-yellow-400 tracking-[0.12em]">
                  {mounted
                    ? topScore.value
                    : "-"}
                </div>
              </div>

              <div className="rounded-3xl bg-zinc-900 p-6">
                <div className="text-yellow-400 tracking-[0.14em]">
                  Počet her
                </div>

                <div className="mt-3 text-3xl font-black text-white tracking-[0.07em]">
                  {mounted
                    ? topGamesPlayed.name
                    : "-"}
                </div>

                <div className="mt-2 text-2xl font-black text-yellow-400 tracking-[0.12em]">
                  {mounted
                    ? topGamesPlayed.value
                    : "-"}
                </div>
              </div>

              <div className="rounded-3xl bg-zinc-900 p-6">
                <div className="text-yellow-400 tracking-[0.14em]">
                  Průměrné skóre
                </div>

                <div className="mt-3 text-3xl font-black text-white tracking-[0.07em]">
                  {mounted
                    ? topAverage.name
                    : "-"}
                </div>

                <div className="mt-2 text-2xl font-black text-yellow-400 tracking-[0.12em]">
                  {mounted
                    ? topAverage.value
                    : "-"}
                </div>
              </div>

              <div className="rounded-3xl bg-zinc-900 p-6">
                <div className="text-yellow-400 tracking-[0.14em]">
                  Perfektní kategorie
                </div>

                <div className="mt-3 text-3xl font-black text-white tracking-[0.07em]">
                  {mounted
                    ? topPerfects.name
                    : "-"}
                </div>

                <div className="mt-2 text-2xl font-black text-yellow-400 tracking-[0.12em]">
                  {mounted
                    ? topPerfects.value
                    : "-"}
                </div>
              </div>

              <div className="rounded-3xl bg-zinc-900 p-6">
                <div className="text-yellow-400 tracking-[0.14em]">
                  Průměr perfektních
                </div>

                <div className="mt-3 text-3xl font-black text-white tracking-[0.07em]">
                  {mounted
                    ? topAveragePerfects.name
                    : "-"}
                </div>

                <div className="mt-2 text-2xl font-black text-yellow-400  tracking-[0.12em]">
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
          <div className="relative mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
  <div className="flex items-center gap-3">
  <h1 className="text-5xl font-black tracking-[0.14em] text-yellow-400">
    HERO DICE
  </h1>

  <button
    onClick={() =>
      setShowHelp(true)
    }
    className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-lg font-black text-black transition hover:bg-greem-400"
  >
    ?
  </button>
</div>

  <div className="flex flex-wrap gap-3">
  {gameStarted ? (
  <>
    
{hasStartedPlayMode && (
  <div
    className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-sm font-black whitespace-nowrap ${
      isLeaguePlayMode
        ? "text-green-400"
        : "text-purple-400"
    }`}
  >
    {isLeaguePlayMode
      ? "4 hody / Bez přepisu / Bonus: Generál +2 hody"
      : `${playModeRolls} hodů • Přepis: ${
          playModeAllowRewrite
            ? "Ano"
            : "Ne"
        } • Bonus: ${
          playModeBonusMode ===
          "all"
            ? "Všechny kombinace"
            : "Generál"
        } • +${
          playModeBonusRolls -
          playModeRolls
        } hody`}
  </div>
)}

    <button
  onClick={() => {
    if (
      hasStartedPlayMode
    ) {
      setIsPlayModeActive(
        true
      );

      setHasStartedPlayMode(
        true
      );

      return;
    }

    setShowPlayModeSetup(
      true
    );
  }}
  disabled={!canStartPlayMode}
  className={`rounded-2xl px-6 py-3 text-lg font-black transition ${
    canStartPlayMode
      ? "bg-purple-600 hover:bg-purple-500"
      : "cursor-not-allowed bg-zinc-700 text-zinc-400"
  }`}
>
  ▶ Play Mode
</button>

    <div
  className="relative"
  onClick={(e) =>
    e.stopPropagation()
  }
>
  <button
    onClick={() =>
      setShowGameMenu(
        (prev) => !prev
      )
    }
    className="rounded-2xl bg-blue-600 px-6 py-3 text-lg font-bold transition hover:bg-blue-500"
  >
    Hra
  </button>

  {showGameMenu && (
    <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-900 shadow-2xl">
      <button
        onClick={() => {
          loadSavedGames();
          setShowGameMenu(
            false
          );
        }}
        className="w-full px-5 py-4 text-left font-bold transition hover:bg-zinc-800 hover:text-yellow-400"
      >
        Načíst hru
      </button>

      <button
        onClick={() => {
          setShowSaveGameConfirm(
            true
          );

          setShowGameMenu(
            false
          );
        }}
        className="w-full px-5 py-4 text-left font-bold transition hover:bg-zinc-800 hover:text-yellow-400"
      >
        Uložit hru
      </button>
      
      <button
  onClick={() => {
    setShowHomeRestoreModal(
      true
    );

    setShowGameMenu(
      false
    );
  }}
  className="w-full px-5 py-4 text-left font-bold transition hover:bg-zinc-800 hover:text-yellow-400"
>
  Nová hra
</button>

      <button
        onClick={() => {
          setShowLeaveConfirm(
            true
          );

          setShowGameMenu(
            false
          );
        }}
        className="w-full px-5 py-4 text-left font-bold transition hover:bg-zinc-800 hover:text-yellow-400"
      >
        Ukončit hru
      </button>
    </div>
  )}
</div>
  </>
) : (
    <>
  <button
    onClick={() =>
      setShowStatistics(true)
    }
    className="rounded-2xl bg-yellow-500 px-6 py-3 text-lg font-bold transition hover:bg-yellow-400"
  >
    Statistiky
  </button>

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
    className="rounded-2xl bg-red-700 px-6 py-3 text-lg font-bold transition hover:bg-red-600"
  >
    Domů
  </button>
</>
  )}
</div>
</div>

          {!gameStarted && (
            <div className="mx-auto mb-12 mt-6 w-full max-w-5xl rounded-3xl bg-zinc-900/40 p-6 backdrop-blur-sm md:p-8">
              <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-sm font-bold uppercase tracking-[0.2em] text-yellow-400">
                    Nastavení
                  </div>

                  <h2 className="mt-2 text-3xl font-black text-white md:text-4xl  tracking-[0.14em]">
                    Nová hra
                  </h2>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold uppercase tracking-wide text-zinc-400">
                    Počet hráčů
                  </label>

<div className="text-sm text-zinc-500 tracking-[0.08em]">
  Aktuálně: 
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

              <div className="flex justify-end">
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
            </div>
          )}

          {gameStarted && (
            <>
            

              <div className="w-full overflow-x-auto rounded-2xl border border-zinc-700 bg-zinc-950 tracking-[0.14em]">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-green-800">
                    <th className="w-[21%] border border-white p-3 text-left">
                    KOMBINACE
                    </th>

                    <th className="w-[9%] border border-white p-3 text-center text-zinc-300">
  min
</th>

<th className="w-[9%] border border-white p-3 text-center text-zinc-300">
  max
</th>

                    {selectedPlayers.map(
                      (playerId, index) => (
                        <th
  key={index}
  className="border border-white p-3 text-center text-xl font-bold"
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

                        <td className="border border-white p-3 text-center text-zinc-300">
  {category.min}
</td>

<td className="border border-white p-3 text-center text-zinc-300">
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
    : "text-yellow-400"
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

                  <tr className="bg-green-950 text-xl font-bold text-yellow-400">
                    <td className="border border-white p-3">
                      SKÓRE
                    </td>

                    <td className="border border-white p-3"></td>

                    <td className="border border-white p-3"></td>

                    {selectedPlayers.map(
  (
    playerId,
    index
  ) => {
    const playerTotal =
      getPlayerTotal(
        playerId
      );

    const highestScore =
      Math.max(
        ...selectedPlayers.map(
          (id) =>
            getPlayerTotal(id)
        )
      );

    return (
      <td
        key={index}
        className={`border border-white p-3 text-center ${
          playerTotal ===
          highestScore
            ? "text-red-500"
            : "text-yellow-400"
        }`}
      >
        {playerTotal}
      </td>
    );
  }
)}
                  </tr>
                </tbody>
              </table>
            </div>
            </>
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
          className="flex-1 rounded-2xl bg-yellow-500 px-5 py-4 text-lg font-bold text-white transition hover:bg-yellow-400"
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
          className="flex-1 rounded-2xl bg-green-600 px-5 py-4 text-lg font-black text-black transition hover:bg-green-500"
        >
          Skóre board
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

              <div className="flex gap-3">
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

  <button
  onClick={() =>
    setDeleteSavedGameId(
      game.id
    )
  }
  className="rounded-xl bg-red-600 px-5 py-3 font-black text-white transition hover:bg-red-500"
>
  Smazat
</button>
</div>
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

{showFinishGameConfirm &&
  pendingFinishedGame && (
    <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/90 p-4">
      <div className="w-full max-w-[500px] rounded-3xl border border-yellow-500/20 bg-zinc-900 p-8 text-center text-white shadow-2xl">
        <h2 className="mb-5 text-3xl font-black text-yellow-400">
          🏁 Blížíte se ke konci hry
        </h2>

        <p className="mb-8 text-lg text-zinc-300">
          Tento zápis dokončí hru.
          <br />
          <br />
          Zvolte prosím, jak chcete
          výsledek uložit.
        </p>

        <div className="flex flex-col gap-4">
          <button
            onClick={async () => {
              await saveFinishedGame({
                date:
                  new Date().toISOString(),

                winner:
                  pendingFinishedGame.winner,

                winnerScore:
                  pendingFinishedGame.winnerScore,

                players:
                  pendingFinishedGame.players,

                scores:
                  pendingFinishedGame.scores,
              });

              setShowFinishGameConfirm(
  false
);

setPendingFinishedGame(
  null
);

setGameFinished(true);

setIsPlayModeActive(
  false
);

setShowPlayModeResult(
  false
);

localStorage.removeItem(
  "heroDiceCurrentGame"
);

const randomSound =
  winSounds[
    Math.floor(
      Math.random() *
      winSounds.length
    )
  ];

const audio = new Audio(
  `${randomSound}?t=${Date.now()}`
);

audio.volume = 0.8;

celebrationAudioRef.current =
  audio;

audio.play().catch(() => {});

setShowFinishedGame(true);


const celebrationType =
  Math.floor(
    Math.random() * 3
  );

if (celebrationType === 0) {
  for (
    let i = 0;
    i < 18;
    i++
  ) {
    const timeoutId =
      window.setTimeout(
        () => {
          confetti({
            particleCount: 35,
            spread: 100,
            startVelocity: 35,
            origin: {
              x: Math.random(),
              y: 0.6,
            },
          });
        },
        i * 500
      );

    celebrationTimeoutsRef.current.push(
      timeoutId
    );
  }
}

if (celebrationType === 1) {
  for (
    let i = 0;
    i < 18;
    i++
  ) {
    const timeoutId =
      window.setTimeout(
        () => {
          confetti({
            particleCount: 60,
            spread: 180,
            startVelocity: 60,
            origin: {
              x: 0.5,
              y: 0.6,
            },
          });
        },
        i * 500
      );

    celebrationTimeoutsRef.current.push(
      timeoutId
    );
  }
}

if (celebrationType === 2) {
  for (
    let i = 0;
    i < 18;
    i++
  ) {
    const timeoutId =
      window.setTimeout(
        () => {
          confetti({
            particleCount: 40,
            angle: 60,
            spread: 55,
            origin: {
              x: 0,
              y: 0.7,
            },
          });

          confetti({
            particleCount: 40,
            angle: 120,
            spread: 55,
            origin: {
              x: 1,
              y: 0.7,
            },
          });
        },
        i * 250
      );

    celebrationTimeoutsRef.current.push(
      timeoutId
    );
  }
}

             
            }}
            className="rounded-2xl bg-green-600 px-5 py-4 text-lg font-black text-white transition hover:bg-green-500"
          >
            🟢 Ligová hra
          </button>

          <button
            onClick={async () => {
              await saveFunGame({
                winner:
                  pendingFinishedGame.winner,

                winnerScore:
                  pendingFinishedGame.winnerScore,

                players:
                  pendingFinishedGame.players,

                scores:
                  pendingFinishedGame.scores,
              });

              setShowFinishGameConfirm(
  false
);



setPendingFinishedGame(
  null
);

setGameFinished(true);

setIsPlayModeActive(
  false
);

setShowPlayModeResult(
  false
);

localStorage.removeItem(
  "heroDiceCurrentGame"
);

const randomSound =
  winSounds[
    Math.floor(
      Math.random() *
      winSounds.length
    )
  ];

const audio = new Audio(
  `${randomSound}?t=${Date.now()}`
);

audio.volume = 0.8;

celebrationAudioRef.current =
  audio;

audio.play().catch(() => {});

setShowFinishedGame(true);

const celebrationType =
  Math.floor(
    Math.random() * 3
  );

if (celebrationType === 0) {
  for (
    let i = 0;
    i < 18;
    i++
  ) {
    const timeoutId =
      window.setTimeout(
        () => {
          confetti({
            particleCount: 35,
            spread: 100,
            startVelocity: 35,
            origin: {
              x: Math.random(),
              y: 0.6,
            },
          });
        },
        i * 500
      );

    celebrationTimeoutsRef.current.push(
      timeoutId
    );
  }
}

if (celebrationType === 1) {
  for (
    let i = 0;
    i < 18;
    i++
  ) {
    const timeoutId =
      window.setTimeout(
        () => {
          confetti({
            particleCount: 60,
            spread: 180,
            startVelocity: 60,
            origin: {
              x: 0.5,
              y: 0.6,
            },
          });
        },
        i * 500
      );

    celebrationTimeoutsRef.current.push(
      timeoutId
    );
  }
}

if (celebrationType === 2) {
  for (
    let i = 0;
    i < 18;
    i++
  ) {
    const timeoutId =
      window.setTimeout(
        () => {
          confetti({
            particleCount: 40,
            angle: 60,
            spread: 55,
            origin: {
              x: 0,
              y: 0.7,
            },
          });

          confetti({
            particleCount: 40,
            angle: 120,
            spread: 55,
            origin: {
              x: 1,
              y: 0.7,
            },
          });
        },
        i * 250
      );

    celebrationTimeoutsRef.current.push(
      timeoutId
    );
  }
}
              
            }}
            className="rounded-2xl bg-purple-600 px-5 py-4 text-lg font-black text-white transition hover:bg-purple-500"
          >
            🟣 Fun hra
          </button>
        </div>
      </div>
    </div>
)}


{/* GAME SAVED MODAL */}
{showGameSavedModal && (
  <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/90 p-4">
    <div className="w-full max-w-[420px] rounded-3xl border border-green-500/20 bg-zinc-900 p-8 text-center text-white shadow-2xl">
      <h2 className="mb-5 text-3xl font-black text-green-400">
        Hra uložena
      </h2>

      <p className="mb-8 text-lg text-zinc-300">
        Rozehraná hra byla úspěšně uložena.
      </p>

      <button
        onClick={() =>
  setShowGameSavedModal(
    false
  )
}
        className="w-full rounded-2xl bg-green-600 px-5 py-4 text-lg font-black text-white transition hover:bg-green-500"
      >
        OK
      </button>
    </div>
  </div>
)}

{/* PLAY MODE SETUP */}
{showPlayModeSetup && (
  <div className="fixed inset-0 z-[140] overflow-y-auto bg-black/90 p-4">
    <div className="mx-auto my-10 w-full max-w-[560px] rounded-3xl border border-purple-500/30 bg-zinc-900 p-6 text-white shadow-2xl md:p-8">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
  <h2 className="text-4xl font-black text-purple-400">
    PLAY MODE
  </h2>

  <div className="group relative">
    <button
      className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-sm font-black text-white"
    >
      ?
    </button>

    <div className="pointer-events-none absolute left-1/2 top-11 z-10 w-[260px] -translate-x-1/2 rounded-2xl border border-green-500/20 bg-zinc-950 p-4 text-left text-sm text-zinc-300 opacity-0 shadow-2xl transition duration-200 group-hover:opacity-100">
      <div className="mb-2 font-black uppercase tracking-wide text-green-400">
        Ligové statistiky
      </div>

      <div className="space-y-1">
        <div>
          • 4 hody
        </div>

        <div>
          • bez přepisování skóre
        </div>

        <div>
          • bonus pouze u generála s 6 hody
        </div>
      </div>
    </div>
  </div>
</div>

        <button
          onClick={() =>
            setShowPlayModeSetup(
              false
            )
          }
          className="rounded-xl bg-zinc-700 px-4 py-2 font-bold transition hover:bg-zinc-600"
        >
          ✕
        </button>
      </div>

      <div className="space-y-5">
        

        <div className="rounded-2xl border border-purple-500/20 bg-black/40 p-6">
          <div className="mb-4 text-center text-sm font-bold uppercase tracking-[0.2em] text-purple-400">
            Počet hodů
          </div>

          <div className="flex items-center justify-center gap-6">
            <button
              onClick={() =>
                setPlayModeRolls(
                  (prev) =>
                    Math.max(
                      1,
                      prev - 1
                    )
                )
              }
              className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-800 text-3xl font-black transition hover:bg-zinc-700"
            >
              −
            </button>

            <div
              className={`min-w-[100px] text-center text-5xl font-black ${
                playModeRolls === 4
                  ? "text-green-400"
                  : "text-yellow-400"
              }`}
            >
              {playModeRolls}
            </div>

            <button
              onClick={() =>
                setPlayModeRolls(
                  (prev) =>
                    Math.min(
                      7,
                      prev + 1
                    )
                )
              }
              className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-800 text-3xl font-black transition hover:bg-zinc-700"
            >
              +
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-purple-500/20 bg-black/40 p-6">
          <div className="mb-4 text-center text-sm font-bold uppercase tracking-[0.2em] text-purple-400">
            Přepisování skóre
          </div>

          <div className="flex gap-4">
            <button
              onClick={() =>
                setPlayModeAllowRewrite(
                  false
                )
              }
              className={`flex-1 rounded-2xl px-5 py-4 font-black transition ${
                !playModeAllowRewrite
                  ? "bg-green-600 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              Ne
            </button>

            <button
              onClick={() =>
                setPlayModeAllowRewrite(
                  true
                )
              }
              className={`flex-1 rounded-2xl px-5 py-4 font-black transition ${
                playModeAllowRewrite
                  ? "bg-yellow-500 text-black"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              Ano
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-purple-500/20 bg-black/40 p-6">
          <div className="mb-4 text-center text-sm font-bold uppercase tracking-[0.2em] text-purple-400">
            Bonus
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() =>
                setPlayModeBonusMode(
                  "general-only"
                )
              }
              className={`rounded-2xl px-5 py-4 text-left font-black transition ${
                playModeBonusMode ===
                "general-only"
                  ? "bg-green-600 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              Pouze generál
            </button>

            <button
              onClick={() =>
                setPlayModeBonusMode(
                  "all"
                )
              }
              className={`rounded-2xl px-5 py-4 text-left font-black transition ${
                playModeBonusMode ===
                "all"
                  ? "bg-yellow-500 text-black"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              Všechny kombinace
            </button>
          </div>
        </div>
      </div>

<div className="rounded-2xl border border-purple-500/20 bg-black/40 p-6">
  <div className="mb-4 text-center text-sm font-bold uppercase tracking-[0.2em] text-purple-400">
    Bonus hody
  </div>

  <div className="flex items-center justify-center gap-6">
    <button
      onClick={() =>
        setPlayModeBonusRolls(
          (prev) =>
            Math.max(
              1,
              prev - 1
            )
        )
      }
      className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-800 text-3xl font-black transition hover:bg-zinc-700"
    >
      −
    </button>

    <div
      className={`min-w-[100px] text-center text-5xl font-black ${
        playModeBonusRolls ===
        6
          ? "text-green-400"
          : "text-yellow-400"
      }`}
    >
      {playModeBonusRolls}
    </div>

    <button
      onClick={() =>
        setPlayModeBonusRolls(
          (prev) =>
            Math.min(
              10,
              prev + 1
            )
        )
      }
      className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-800 text-3xl font-black transition hover:bg-zinc-700"
    >
      +
    </button>
  </div>
</div>

      <div className="mt-8 flex flex-wrap justify-between gap-4">
        

        <div className="flex gap-4">
          <button
            onClick={() =>
              setShowPlayModeSetup(
                false
              )
            }
            className="rounded-2xl bg-zinc-700 px-6 py-4 font-bold transition hover:bg-zinc-600"
          >
            Zrušit
          </button>

          <button
  onClick={() => {
  setCurrentPlayPlayerIndex(
    0
  );

  setPlayModeDice([
    1,
    1,
    1,
    1,
    1,
    1,
  ]);

  setLockedDice([
    false,
    false,
    false,
    false,
    false,
    false,
  ]);

setConfirmedLockedDice([
  false,
  false,
  false,
  false,
  false,
  false,
]);

  setRemainingRolls(
    playModeRolls
  );
  setHasRolledDice(false);
  setBonusUsed(false);
  setShowPlayModeSetup(
    false
  );

  setIsPlayModeActive(
    true
  );
  setHasStartedPlayMode(
  true
);
}}
  className="rounded-2xl bg-purple-600 px-8 py-4 font-black text-white transition hover:bg-purple-500"
>
  ▶ Spustit Play Mode
</button>
        </div>
      </div>
    </div>
  </div>
)}

{/* PLAY MODE */}

{showPlayModeResult &&
currentCombination && (
  <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 p-6">
    <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950 p-8 text-center shadow-2xl">
      <div className="text-sm font-bold uppercase tracking-[0.25em] text-zinc-500">
        Zapsaný výsledek hodu
      </div>

      <div className="mt-6 text-4xl font-black text-green-400">
        {
          currentCombination.combination
        }
      </div>

      <div className="mt-3 text-xl font-bold text-zinc-300">
        Hráč:
        {" "}
        {
          playersState.find(
  (player) =>
    player.id ===
    selectedPlayers[
      currentPlayPlayerIndex
    ]
)?.name
        }
      </div>

      <div className="mt-2 text-2xl font-black text-white">
        Score:
        {" "}
        {
          currentCombination.score
        }
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4">
  <button
    onClick={() => {
  setShowPlayModeResult(
    false
  );

  endTurn();

  setIsPlayModeActive(
    false
  );
}}
    className="rounded-2xl bg-green-700 px-4 py-5 text-lg font-black text-white transition hover:bg-green-600"
  >
    Scoreboard
  </button>

  <button
    onClick={() => {
      setShowPlayModeResult(
        false
      );

      endTurn();
    }}
    className="rounded-2xl bg-yellow-500 px-4 py-5 text-lg font-black text-black transition hover:bg-yellow-400"
  >
    ▶ Další hráč
  </button>
</div>
    </div>
  </div>
)}

{isPlayModeActive && (
  <div className="fixed inset-0 z-[150] overflow-y-auto bg-black/60 backdrop-blur-sm p-4 text-white">
    <div className="mx-auto flex w-full max-w-4xl flex-col">
      <div className="mb-4" />

      <div className="rounded-3xl border border-purple-500/20 bg-zinc-900 p-8">
  <div className="grid grid-cols-3 items-start gap-8">
    <div>
      <div className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-purple-400">
        Aktuální hráč
      </div>

      <div className="text-5xl font-black text-yellow-400">
        {
          playersState.find(
            (player) =>
              player.id ===
              selectedPlayers[
                currentPlayPlayerIndex
              ]
          )?.name
        }
      </div>
    </div>

    <div className="flex h-full flex-col items-center justify-center text-center">
      <div className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
        Aktuální kombinace
      </div>

      <div className="mt-3 min-h-[84px]">
        {currentCombination &&
        hasRolledDice ? (
          <>
            <div className="text-3xl font-black text-green-400">
              {
                currentCombination.combination
              }
            </div>

            <div className="mt-1 text-lg font-bold text-green-400">
              Score:
              {" "}
              {
                currentCombination.score
              }
            </div>
          </>
        ) : (
          <>
            <div className="text-3xl font-black text-zinc-800">
              —
            </div>

            <div className="mt-1 text-lg font-bold text-zinc-800">
              —
            </div>
          </>
        )}
      </div>
    </div>

    <button
  onClick={() =>
    setIsPlayModeActive(
      false
    )
  }
  className="justify-self-end rounded-2xl bg-green-800 px-5 py-3 font-bold transition hover:bg-green-700"
>
      Scoreboard
    </button>
  </div>
</div>

      <div className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
        <div className="mb-6 flex items-center justify-between">
  <div className="text-lg font-bold tracking-[0.3em] text-gray-400">
    KOSTKY
  </div>

  <div className="flex items-center gap-62">
    <div className="text-2xl leading-none">
      {hasUsefulFutureMove ===
      null
        ? "😴"
        : hasUsefulFutureMove
          ? "😀"
          : "😵"}
    </div>

    {isLeaguePlayMode && (
      <div className="text-lg font-bold uppercase tracking-[0.25em] text-green-400">
        LIGOVÁ HRA
      </div>
    )}
  </div>
</div>

        <div className="flex flex-wrap justify-center gap-4">
  {playModeDice.map(
    (
      dice,
      index
    ) => (
      <button
        key={index}
        onClick={() =>
          toggleDiceLock(
            index
          )
        }
        className={`flex h-20 w-20 items-center justify-center rounded-xl border-0 transition ${
  lockedDice[
    index
  ]
    ? "border-yellow-400 bg-yellow-400"
    : "border-black bg-white"
}`}
      >
        <img
          src={
            diceImages[dice]
          }
          alt={`Kostka ${dice}`}
          className="h-[85%] w-[85%] object-contain"
          draggable={false}
        />
      </button>
    )
  )}
</div>

        <div className="mx-auto mt-8 grid w-full max-w-xl grid-cols-1 gap-4 md:grid-cols-2">
          <button
  onClick={
    activateBonus
  }
  disabled={
  generalBonusBlocked
}
            className={`h-24 rounded-2xl px-8 text-2xl font-black transition ${
  bonusUsed ||
  generalBonusBlocked
    ? "cursor-not-allowed bg-zinc-700 text-zinc-400"
    : playModeBonusMode ===
        "general-only"
      ? "bg-yellow-500 text-white hover:bg-yellow-400"
      : "bg-yellow-500 text-black hover:bg-yellow-400"
}`}
          >
            {playModeBonusMode ===
            "general-only"
              ? `Bonus generál +${bonusDifference}`
: `Bonus +${bonusDifference}`}
          </button>

          <button
            onClick={() => {
  if (
    !currentCombination
  ) {
    return;
  }

  const saved =
    savePlayModeScore();

  if (!saved) {
    return;
  }

  setShowPlayModeResult(
    true
  );
}}
            disabled={
  !currentCombination ||
  !hasRolledDice ||
  !canSavePlayModeScore ||
  (
    bonusUsed &&
    playModeBonusMode ===
      "general-only" &&
    currentCombination
      .combination !==
      "Generál"
  ) ||
  (
    currentCombination &&
    !playModeAllowRewrite &&
    scores[
      selectedPlayers[
        currentPlayPlayerIndex
      ]
    ]?.[
      playModeCategoryMap[
        currentCombination
          .combination
      ]
    ] !== undefined
  )
}
            className={`h-24 rounded-2xl px-8 text-2xl font-black transition ${
  currentCombination &&
hasRolledDice &&
canSavePlayModeScore &&
  !(
    bonusUsed &&
    playModeBonusMode ===
      "general-only" &&
    currentCombination
      .combination !==
      "Generál"
  ) &&
  !(
    !playModeAllowRewrite &&
    scores[
      selectedPlayers[
        currentPlayPlayerIndex
      ]
    ]?.[
      playModeCategoryMap[
        currentCombination
          .combination
      ]
    ] !== undefined
  )
    ? "bg-green-600 text-white hover:bg-green-500"
    : "cursor-not-allowed bg-zinc-700 text-zinc-400"
}`}
          >
            Zapsat skóre
          </button>

{remainingRolls <= 0 && (
  <button
    onClick={endTurn}
    className="h-24 rounded-2xl bg-yellow-500 px-8 text-2xl font-black text-black transition hover:bg-yellow-400 md:col-span-2"
  >
    ▶ Hází další hráč
  </button>
)}
{remainingRolls > 0 && (
          <button
            onClick={
              rollAllDice
            }
            disabled={
              remainingRolls <=
              0
            }
            className={`h-24 rounded-2xl px-8 text-2xl font-black text-white transition md:col-span-2 ${
              remainingRolls <=
              0
                ? "cursor-not-allowed bg-zinc-800 text-zinc-500"
                : playModeRolls ===
                      4 &&
                    !playModeAllowRewrite &&
                    playModeBonusMode ===
                      "general-only" &&
                    playModeBonusRolls ===
                      6
                  ? "bg-purple-600 hover:bg-purple-500"
                  : "bg-purple-600 hover:bg-purple-500"
            }`}
          >
            Zbývá hodů:
{" "}
{
  remainingRolls
}
          </button>
          )}
        </div>
      </div>
    </div>

    {showPlayModeResult &&
      currentCombination && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-6">
          <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950 p-8 text-center shadow-2xl">
            <div className="text-sm font-bold uppercase tracking-[0.25em] text-zinc-500">
              Zapsaný výsledek hodu
            </div>

            <div className="mt-6 text-4xl font-black text-green-400">
              {
                currentCombination.combination
              }
            </div>

            <div className="mt-3 text-xl font-bold text-zinc-300">
              Hráč:
              {" "}
              {
                playersState.find(
                  (
                    player
                  ) =>
                    player.id ===
                    selectedPlayers[
                      currentPlayPlayerIndex
                    ]
                )?.name
              }
            </div>

            <div className="mt-2 text-2xl font-black text-white">
              Score:
              {" "}
              {
                currentCombination.score
              }
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
  <button
    onClick={() => {
  setShowPlayModeResult(
    false
  );

  endTurn();

  setIsPlayModeActive(
    false
  );
}}
    className="rounded-2xl bg-green-700 px-4 py-5 text-lg font-black text-white transition hover:bg-green-600"
  >
    Scoreboard
  </button>

  <button
    onClick={() => {
      setShowPlayModeResult(
        false
      );

      endTurn();
    }}
    className="rounded-2xl bg-yellow-500 px-4 py-5 text-lg font-black text-black transition hover:bg-yellow-400"
  >
    ▶ Další hráč
  </button>
</div>
          </div>
        </div>
      )}
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
  onFocus={(e) =>
  e.target.select()
}
  onBlur={() => {
  setTimeout(() => {
    window.scrollTo(0, 0);
  }, 50);
}}
  className="mb-6 w-full rounded-2xl border border-zinc-700 bg-black/60 p-5 text-center text-5xl font-black text-yellow-300 outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-500/40"
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

{/* GAME SAVED MODAL */}
{showGameSavedModal && (
  <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/90 p-4">
    <div className="w-full max-w-[420px] rounded-3xl border border-green-500/20 bg-zinc-900 p-8 text-center text-white shadow-2xl">
      <h2 className="mb-5 text-3xl font-black text-green-400">
        Hra uložena
      </h2>

      <p className="mb-8 text-lg text-zinc-300">
        Rozehraná hra byla úspěšně uložena.
      </p>

      <button
        onClick={() =>
          setShowGameSavedModal(
            false
          )
        }
        className="w-full rounded-2xl bg-green-600 px-5 py-4 text-lg font-black text-white transition hover:bg-green-500"
      >
        OK
      </button>
    </div>
  </div>
)}

      {/* WINNER MODAL */}
      {showFinishedGame && (
        <div
  className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4"
  onClick={() => {
    celebrationAudioRef.current?.pause();

    celebrationTimeoutsRef.current.forEach(
      clearTimeout
    );

    celebrationTimeoutsRef.current = [];

    setShowFinishedGame(false);
  }}
>
          <div className="max-w-xl rounded-2xl bg-black p-10 text-center text-white">
            <h2 className="mb-8 text-5xl">
              🏆
            </h2>

            <p className="mb-3 text-3xl font-bold">
              vítězem se stává
            </p>

            <p className="mb-6 text-5xl font-black text-yellow-400">
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
          <div className="w-full max-w-[420px] rounded-2xl bg-black p-8 text-center text-white">
            <h2 className="mb-6 text-3xl font-black">
              Opravdu ukončit hru?
            </h2>

            <p className="mb-8 text-zinc-300">
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

{/* SAVE GAME CONFIRM */}
{showSaveGameConfirm && (
  <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/90 p-4">
    <div className="w-full max-w-[420px] rounded-2xl bg-black p-8 text-center text-white">
      <h2 className="mb-21 text-3xl font-black">
        Uložit rozehranou hru?
      </h2>

      <p className="mb-8 text-zinc-300">
        Hra bude uložena mezi uložené hry a lze ji později znovu načíst.
      </p>

      <div className="flex flex-wrap justify-center gap-4">
        <button
          onClick={() =>
            setShowSaveGameConfirm(
              false
            )
          }
          className="rounded-lg bg-zinc-600 px-5 py-3 font-bold text-white transition hover:bg-zinc-500"
        >
          Zrušit
        </button>

        <button
          onClick={async () => {
            await saveGameToSupabase();

            setShowSaveGameConfirm(
              false
            );
          }}
          className="rounded-lg bg-green-600 px-5 py-3 font-bold text-white transition hover:bg-green-500"
        >
          Uložit
        </button>
      </div>
    </div>
  </div>
)}


{deleteSavedGameId !== null && (
  <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/90 p-4">
    <div className="w-full max-w-[520px] rounded-2xl bg-zinc-900 p-8 text-center text-white">
      <h2 className="mb-6 text-3xl font-black text-red-500">
        Smazat uloženou hru?
      </h2>

      <p className="mb-8 text-zinc-300">
        Opravdu chceš smazat tuto uloženou hru?
      </p>

      <div className="flex flex-wrap justify-center gap-4">
        <button
          onClick={() =>
            setDeleteSavedGameId(
              null
            )
          }
          className="rounded-xl bg-zinc-700 px-8 py-4 font-black text-white transition hover:bg-zinc-600"
        >
          Nechat
        </button>

        <button
          onClick={async () => {
            const { error } =
              await supabase
                .from(
                  "saved_games"
                )
                .delete()
                .eq(
                  "id",
                  deleteSavedGameId
                );

            if (!error) {
              setSavedGames(
                savedGames.filter(
                  (savedGame) =>
                    savedGame.id !==
                    deleteSavedGameId
                )
              );
            }

            setDeleteSavedGameId(
              null
            );
          }}
          className="rounded-xl bg-red-600 px-8 py-4 font-black text-white transition hover:bg-red-500"
        >
          Smazat
        </button>
      </div>
    </div>
  </div>
)}


{/* ADMIN */}
{showAdmin && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
    <div className="w-full max-w-3xl rounded-3xl bg-zinc-900 p-8 text-white shadow-2xl">
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
      updatePlayerInSupabase(
        player.id,
        {
          name: player.name,
        }
      );
    }}
    className="rounded-xl bg-blue-600 px-4 py-2 font-bold text-white transition hover:bg-blue-500"
  >
    Uložit
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
  onOpenFunGames={() => {
    setShowStatistics(
      false
    );

    setShowFunGames(
      true
    );
  }}
/>
)}

{/* FUN GAMES */}
{showFunGames && (
  <FunGamesModal
    players={playersState}
    onClose={() => {
      setShowFunGames(
        false
      );

      setShowStatistics(
        true
      );
    }}
  />
)}
    
    <HelpModal
  open={showHelp}
  onClose={() =>
    setShowHelp(false)
  }
/>
    
    </main>
  );
}

