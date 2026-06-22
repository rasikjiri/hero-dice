"use client";

/* =======================================================
   Hero Dice — page.tsx
   Organizational headers added (visual only - no logic changes)
   Sections (for navigation):
   01. IMPORTS
   02. TYPES
   03. CONSTANTS
   04. GLOBAL STATE
   05. PLAYER MANAGEMENT
   06. GAME CONFIGURATION
   07. DICE ENGINE
   08. GAME ENGINE
   09. PLAY MODE
   10. AI PLAYER (reserved)
   11. ONLINE
   12. SAVE / LOAD
   13. STATISTICS
   14. AUDIO
   15. ANIMATIONS
   16. MODALS
   17. UI HELPERS
   18. JSX
  ======================================================= */

// 01. IMPORTS
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import StatisticsModal from "./components/StatisticsModal";

import FunGamesModal from "./components/FunGamesModal";

import HelpModal from "./components/HelpModal";

import AppMenu from "./components/AppMenu";

import { gameCategories } from "./data/gameCategories";

import { supabase } from "./lib/supabase";

import { detectCombination } from "./lib/playMode";

import {
  createOnlineSession,
  joinOnlineSession,
  updateOnlineState,
  subscribeToSession,
  leaveOnlineSession,
  fetchGameMessages,
  sendGameMessage,
  subscribeToGameMessages,
  type GameMessage,
} from "./lib/onlineSession";

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

// 02. TYPES
type ScoreMap = {
  [playerId: string]: {
    [categoryId: string]: number;
  };
};

export default function Home() {
  // 04. GLOBAL STATE
  const [screen, setScreen] = useState<
    "home" | "game" | "online-lobby"
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

const [gameId, setGameId] =
  useState<string>("");

  const [showFinishedGame, setShowFinishedGame] =
    useState(false);

  const [showDuplicateGameMessage, setShowDuplicateGameMessage] =
    useState(false);

  // 14. AUDIO
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

const [
  showSettings,
  setShowSettings,
] = useState(false);

const [
  celebrationSoundEnabled,
  setCelebrationSoundEnabled,
] = useState(true);

const [
  maxScoreSoundEnabled,
  setMaxScoreSoundEnabled,
] = useState(true);

const [
  maxScoreSoundPlayed,
  setMaxScoreSoundPlayed,
] = useState(false);

const [
  noCombinationSoundEnabled,
  setNoCombinationSoundEnabled,
] = useState(true);

const [
  noCombinationSoundPlayed,
  setNoCombinationSoundPlayed,
] = useState(false);

const [
  suppressNoCombinationSound,
  setSuppressNoCombinationSound,
] = useState(false);

  const [scores, setScores] =
    useState<ScoreMap>({});

const [
  isOnlineGame,
  setIsOnlineGame,
] = useState(false);

const [
  onlineSessionId,
  setOnlineSessionId,
] = useState<string | null>(
  null
);

const onlineSessionIdRef =
  useRef<string | null>(null);

const isOnlineGameRef = useRef(false);

const [
  onlineChannel,
  setOnlineChannel,
] = useState<any>(null);

const [
  joinSessionId,
  setJoinSessionId,
] = useState("");

const [
  playerReadiness,
  setPlayerReadiness,
] = useState<{
  [playerId: string]: boolean;
}>({});

const [
  localOnlinePlayerId,
  setLocalOnlinePlayerId,
] = useState<string | null>(null);

const [
  onlineChatMessages,
  setOnlineChatMessages,
] = useState<GameMessage[]>([]);

const [
  onlineChatInput,
  setOnlineChatInput,
] = useState("");

const [
  isOnlineChatCollapsed,
  setIsOnlineChatCollapsed,
] = useState(false);

const [
  isMobileChatOpen,
  setIsMobileChatOpen,
] = useState(false);

const [
  isOnlineChatLoading,
  setIsOnlineChatLoading,
] = useState(false);

const [
  onlineChatError,
  setOnlineChatError,
] = useState<string | null>(null);

const onlineChatBottomRef =
  useRef<HTMLDivElement | null>(null);

const localRuntimeRevisionRef =
  useRef(0);

const bumpLocalRuntimeRevision =
  () => {
    localRuntimeRevisionRef.current += 1;

    return localRuntimeRevisionRef.current;
  };

const localTurnVersionRef =
  useRef(0);

const hasAutoOpenedOnlinePlayModeRef =
  useRef(false);

const forceOnlineLobbyUntilHostStartRef =
  useRef(false);

const lastComputerAutoTurnRef =
  useRef<string | null>(null);

const bumpLocalTurnVersion =
  () => {
    localTurnVersionRef.current += 1;

    return localTurnVersionRef.current;
  };

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

const [
  showHomeMenu,
  setShowHomeMenu,
] = useState(false);

const [
  showSetupMenu,
  setShowSetupMenu,
] = useState(false);

const [
  showJoinSessionModal,
  setShowJoinSessionModal,
] = useState(false);

const [
  showGameMenu,
  setShowGameMenu,
] = useState(false);

useEffect(() => {
  onlineSessionIdRef.current =
    onlineSessionId;
}, [onlineSessionId]);

useEffect(() => {
  isOnlineGameRef.current =
    isOnlineGame;
}, [isOnlineGame]);

useEffect(() => {
  const handleClickOutside = () => {
    setShowGameMenu(false);
    setShowHomeMenu(false);
    setShowSetupMenu(false);
  };

  if (
    showGameMenu ||
    showHomeMenu ||
    showSetupMenu
  ) {
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
}, [
  showGameMenu,
  showHomeMenu,
  showSetupMenu,
]);

useEffect(() => {
  const celebration =
    localStorage.getItem(
      "heroDiceCelebrationSound"
    );

  const maxScore =
    localStorage.getItem(
      "heroDiceMaxScoreSound"
    );

  const noCombination =
    localStorage.getItem(
      "heroDiceNoCombinationSound"
    );

  if (celebration !== null) {
    setCelebrationSoundEnabled(
      celebration === "true"
    );
  }

  if (maxScore !== null) {
    setMaxScoreSoundEnabled(
      maxScore === "true"
    );
  }

  if (noCombination !== null) {
    setNoCombinationSoundEnabled(
      noCombination === "true"
    );
  }
}, []);

// Preload audio files after first user interaction
useEffect(() => {
  const preloadAudio = () => {
    // Preload no-combination sound
    const noCombAudio = new Audio('/sounds/playmode/nocombination.wav');
    noCombAudio.preload = 'auto';

    // Preload max-score fanfare
    const fanfareAudio = new Audio('/sounds/win/fanfare.mp3');
    fanfareAudio.preload = 'auto';

    // Preload win sounds
    const winSoundUrls = [
      '/sounds/win/wow.mp3',
      '/sounds/win/wow_1.mp3',
      '/sounds/win/wow_2.mp3',
    ];

    winSoundUrls.forEach((url) => {
      const audio = new Audio(url);
      audio.preload = 'auto';
    });

    // Remove listener after preload
    document.removeEventListener('click', preloadAudio);
    document.removeEventListener('touchstart', preloadAudio);
  };

  // Listen for first user interaction
  document.addEventListener('click', preloadAudio, { once: true });
  document.addEventListener('touchstart', preloadAudio, { once: true });

  return () => {
    document.removeEventListener('click', preloadAudio);
    document.removeEventListener('touchstart', preloadAudio);
  };
}, []);

const saveSettings = (
  celebration: boolean,
  maxScore: boolean,
  noCombination: boolean
) => {
  localStorage.setItem(
    "heroDiceCelebrationSound",
    String(celebration)
  );

  localStorage.setItem(
    "heroDiceMaxScoreSound",
    String(maxScore)
  );

  localStorage.setItem(
    "heroDiceNoCombinationSound",
    String(noCombination)
  );
};

const [
  showSaveGameConfirm,
  setShowSaveGameConfirm,
] = useState(false);

const [
  showGameSavedModal,
  setShowGameSavedModal,
] = useState(false);

const [
  showGameVersionModal,
  setShowGameVersionModal,
] = useState(false);

type SavedGameMetadata = {
  gameMode: "offline" | "online";
  onlineSessionId: string | null;
  localOnlinePlayerId: string | null;
};

type SavedGamesMetadataColumnSupport = {
  game_mode: boolean;
  online_session_id: boolean;
  local_online_player_id: boolean;
  current_play_player_index: boolean;
  play_mode_dice: boolean;
  locked_dice: boolean;
  confirmed_locked_dice: boolean;
  remaining_rolls: boolean;
  bonus_used: boolean;
  selected_general_value: boolean;
  has_rolled_dice: boolean;
  has_started_play_mode: boolean;
};

const [
  pendingSaveMetadata,
  setPendingSaveMetadata,
] = useState<SavedGameMetadata | null>(
  null
);

const savedGamesMetadataColumnSupportRef =
  useRef<SavedGamesMetadataColumnSupport | null>(
    null
  );

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
  selectedGameMode,
  setSelectedGameMode,
] = useState<"offline" | "online">(
  "offline"
);

const [
  gameMode,
  setGameMode,
] = useState<"offline" | "online">(
  "offline"
);

  // 09. PLAY MODE

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
] = useState(2);

const [
  isPlayModeActive,
  setIsPlayModeActive,
] = useState(false);

const [
  hasStartedPlayMode,
  setHasStartedPlayMode,
] = useState(false);

const screenSetter = setScreen;
const gameStartedSetter = setGameStarted;
const isPlayModeActiveSetter = setIsPlayModeActive;
const hasStartedPlayModeSetter = setHasStartedPlayMode;

const debugSetScreen = (
  value: "home" | "game" | "online-lobby",
  source = "unknown"
) => {
  console.log(
    `[${source}] setScreen(${value})`,
    new Date().toISOString()
  );
  screenSetter(value);
};

const debugSetGameStarted = (
  value: boolean,
  source = "unknown"
) => {
  console.log(
    `[${source}] setGameStarted(${value})`,
    new Date().toISOString()
  );
  gameStartedSetter(value);
};

const debugSetIsPlayModeActive = (
  value: boolean,
  source = "unknown"
) => {
  console.log(
    `[${source}] setIsPlayModeActive(${value})`,
    new Date().toISOString()
  );
  isPlayModeActiveSetter(value);
};

const debugSetHasStartedPlayMode = (
  value: boolean,
  source = "unknown"
) => {
  console.log(
    `[${source}] setHasStartedPlayMode(${value})`,
    new Date().toISOString()
  );
  hasStartedPlayModeSetter(value);
};

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

  // 07. DICE ENGINE
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

  // 09. PLAY MODE (state)
  const [
    hasRolledDice,
    setHasRolledDice,
  ] = useState(false);

  const [
    isRolling,
    setIsRolling,
  ] = useState(false);

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

// EDIT COMPUTER PLAYERS HERE
const ComputerPlayerNames = [
  "Computer Peppa",
  "Computer Rocky",
  "Computer Lucky",
];

const computerPlayers = ComputerPlayerNames.map(
  (name, index) => ({
    id: `computer_${index + 1}`,
    name,
  })
);

type PlayerSelectionType = "human" | "computer";

const [playersState, setPlayersState] =
  useState<Player[]>([]);

const [
  selectedPlayerTypes,
  setSelectedPlayerTypes,
] = useState<PlayerSelectionType[]>([]);

const isComputerPlayerId = (
  playerId: string
) =>
  computerPlayers.some(
    (computerPlayer) =>
      computerPlayer.id === playerId
  );

const getPlayerDisplayName = (
  playerId: string
) => {
  const humanPlayer = playersState.find(
    (player) => player.id === playerId
  );

  if (humanPlayer) {
    return humanPlayer.name;
  }

  return (
    computerPlayers.find(
      (computerPlayer) =>
        computerPlayer.id === playerId
    )?.name ?? playerId
  );
};

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
  selectablePlayers.length +
  computerPlayers.length;

const hasComputerPlayer =
  selectedPlayers.some((playerId) =>
    isComputerPlayerId(playerId)
  );

const isValidSelectedPlayersForCount = (
  players: string[],
  count: number | ""
) => {
  if (
    typeof count !== "number" ||
    count <= 0
  ) {
    return false;
  }

  if (players.length !== count) {
    return false;
  }

  if (
    players.some(
      (playerId) => playerId === ""
    )
  ) {
    return false;
  }

  return new Set(players).size === players.length;
};

useEffect(() => {
  // 13. STATISTICS
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
  count: number | ""
) => {
  setPlayerCount(count);

  // Invalidate all previous selections whenever player count changes.
  setSelectedPlayers([]);
  setSelectedPlayerTypes(
    typeof count === "number"
      ? Array.from(
          { length: count },
          () => "human" as PlayerSelectionType
        )
      : []
  );
};

const handlePlayerTypeChange = (
  index: number,
  value: PlayerSelectionType
) => {
  if (
    typeof playerCount !== "number" ||
    playerCount <= 0
  ) {
    return;
  }

  const updatedTypes = Array.from(
    { length: playerCount },
    (_, playerIndex) =>
      selectedPlayerTypes[
        playerIndex
      ] || "human"
  );

  updatedTypes[index] = value;

  const updatedPlayers = Array.from(
    { length: playerCount },
    (_, playerIndex) =>
      selectedPlayers[playerIndex] || ""
  );

  updatedPlayers[index] = "";

  setSelectedPlayerTypes(updatedTypes);
  setSelectedPlayers(updatedPlayers);
};

  const handlePlayerChange = (
    index: number,
    value: string
  ) => {
    if (
      typeof playerCount !== "number" ||
      playerCount <= 0
    ) {
      return;
    }

    if (
      value !== "" &&
      selectedPlayers.some(
        (
          selectedPlayer,
          selectedIndex
        ) =>
          selectedPlayer === value &&
          selectedIndex !== index
      )
    ) {
      alert(
        "Tento hráč už je vybraný."
      );

      return;
    }

    const updated = Array.from(
      { length: playerCount },
      (_, playerIndex) =>
        selectedPlayers[
          playerIndex
        ] || ""
    );

    updated[index] = value;

    setSelectedPlayers(updated);
  };

  const openScoreModal = (
    playerId: string,
    categoryId: string,
    min: number,
    max: number
  ) => {
    if (
      isOnlineGame ||
      hasComputerPlayer
    ) {
      return;
    }

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
    if (isOnlineGame) {
      return;
    }

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

    const category =
  gameCategories.find(
    (c) =>
      c.id ===
      scoreModal.categoryId
  );

const playerScoresAfterSave = {
  ...scores[scoreModal.playerId],
  [scoreModal.categoryId]:
    parsed,
};

const finishesPlayer =
  Object.keys(
    playerScoresAfterSave
  ).length ===
  gameCategories.length;

  const completedScores =
  Object.values(
    updatedScores
  ).reduce(
    (sum, playerScores) =>
      sum +
      Object.keys(
        playerScores
      ).length,
    0
  );

const totalScoresNeeded =
  selectedPlayers.length *
  gameCategories.length;

const finishesGame =
  completedScores ===
  totalScoresNeeded;

if (
  maxScoreSoundEnabled &&
  category &&
  parsed === category.max &&
  !finishesPlayer
) {
  const audio =
    new Audio(
      `/sounds/win/fanfare.mp3`
    );

  audio.volume = 0.9;

  audio.play().catch(() => {});
}

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

      // 09. PLAY MODE
      const toggleDiceLock = (
  index: number
) => {
  if (
    isOnlineGame &&
    !isCurrentPlayer
  ) {
    return;
  }

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

  bumpLocalRuntimeRevision();

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
  playModeBonusRolls;

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
  !hasComputerPlayer &&
  playModeRolls === 4 &&
  !playModeAllowRewrite &&
  playModeBonusMode ===
    "general-only" &&
  playModeBonusRolls === 2;

const gameTypeInfoText =
  gameMode === "online"
    ? "Online hra"
    : "Offline hra";

const gameTypeTagText =
  gameMode === "online"
    ? "ONLINE"
    : "OFFLINE";

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

const currentGeneralScore =
  scores[
    selectedPlayers[
      currentPlayPlayerIndex
    ]
  ]?.general;

const canUseGeneralBonus =
  (() => {
    if (
      playModeBonusMode !==
      "general-only"
    ) {
      return true;
    }

    if (
      currentGeneralScore ===
      undefined
    ) {
      return true;
    }

    if (
      isLeaguePlayMode
    ) {
      return false;
    }

    if (
      !playModeAllowRewrite
    ) {
      return false;
    }

    const lockedValues =
      playModeDice.filter(
        (_, index) =>
          lockedDice[index]
      );

    const sourceValues =
      lockedValues.length > 0
        ? lockedValues
        : playModeDice;

    const highestValue =
      Math.max(
        ...sourceValues
      );

    const potentialGeneralScore =
      highestValue * 6;

    return (
      potentialGeneralScore >
      currentGeneralScore
    );
  })();

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

useEffect(() => {
  if (
    !currentCombination ||
    !maxScoreSoundEnabled
  ) {
    setMaxScoreSoundPlayed(
      false
    );

    return;
  }

  const categoryId =
    playModeCategoryMap[
      currentCombination
        .combination
    ];

  if (!categoryId) {
    setMaxScoreSoundPlayed(
      false
    );

    return;
  }

  const category =
    gameCategories.find(
      (c) =>
        c.id === categoryId
    );

  if (!category) {
    setMaxScoreSoundPlayed(
      false
    );

    return;
  }

  const playerId =
    selectedPlayers[
      currentPlayPlayerIndex
    ];

  const existingScore =
    scores[playerId]?.[
      categoryId
    ];

  const canWrite =
    existingScore ===
      undefined ||
    (
      playModeAllowRewrite &&
      currentCombination.score >
        existingScore
    );

  const isMaxScore =
    currentCombination.score ===
    category.max;

  if (
    isMaxScore &&
    canWrite &&
    !maxScoreSoundPlayed
  ) {
    const audio =
      new Audio(
        `/sounds/win/fanfare.mp3`
      );

    audio.volume = 0.9;

    audio.play().catch(
      () => {}
    );

    setMaxScoreSoundPlayed(
      true
    );
  }

  if (
    !isMaxScore ||
    !canWrite
  ) {
    setMaxScoreSoundPlayed(
      false
    );
  }
}, [
  currentCombination,
  currentPlayPlayerIndex,
  selectedPlayers,
  scores,
  playModeAllowRewrite,
  maxScoreSoundEnabled,
  maxScoreSoundPlayed,
]);

useEffect(() => {
  if (
  hasUsefulFutureMove === false &&
  !noCombinationSoundPlayed &&
  noCombinationSoundEnabled &&
  !suppressNoCombinationSound
) {
    const audio =
      new Audio(
        `/sounds/playmode/nocombination.wav`
      );

    audio.volume = 0.1;

    audio.play().catch(
      () => {}
    );

    setNoCombinationSoundPlayed(
      true
    );
  }

  if (
  hasUsefulFutureMove !== false
) {
  setNoCombinationSoundPlayed(
    false
  );

  setSuppressNoCombinationSound(
    false
  );
}
}, [
  hasUsefulFutureMove,
  noCombinationSoundPlayed,
  noCombinationSoundEnabled,
  suppressNoCombinationSound,
]);

        const savePlayModeScore =
  () => {
    if (
      isOnlineGame &&
      !isCurrentPlayer
    ) {
      return false;
    }

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

setSuppressNoCombinationSound(
  true
);

    const savedTurnVersion =
      bumpLocalTurnVersion();

    localTurnVersionRef.current =
      savedTurnVersion;

    bumpLocalRuntimeRevision();

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

const endTurn = async () => {
  // Reset sound flag for new player
  setNoCombinationSoundPlayed(false);

  if (
    isOnlineGame &&
    !isCurrentPlayer
  ) {
    return;
  }

  const nextPlayer =
    currentPlayPlayerIndex +
    1 >=
    selectedPlayers.length
      ? 0
      : currentPlayPlayerIndex +
        1;

  const nextPlayModeDice = [
    1,
    1,
    1,
    1,
    1,
    1,
  ];

  const nextLockedDice = [
    false,
    false,
    false,
    false,
    false,
    false,
  ];

  const nextConfirmedLockedDice = [
    false,
    false,
    false,
    false,
    false,
    false,
  ];

  const handoffTurnVersion =
    bumpLocalTurnVersion();

  const handoffRuntimeRevision =
    bumpLocalRuntimeRevision();

  if (
    isOnlineGame &&
    onlineSessionId &&
    gameStarted &&
    hasStartedPlayMode &&
    screen === "game" &&
    isCurrentPlayer
  ) {
    try {
      await updateOnlineState(
        onlineSessionId,
        {
          scores,
          currentPlayPlayerIndex:
            nextPlayer,
          playModeDice:
            nextPlayModeDice,
          lockedDice:
            nextLockedDice,
          confirmedLockedDice:
            nextConfirmedLockedDice,
          remainingRolls:
            playModeRolls,
          bonusUsed: false,
          selectedGeneralValue:
            null,
          hasRolledDice: false,
          selectedPlayers,
          playerCount,
          playModeRolls,
          playModeAllowRewrite,
          playModeBonusMode,
          playModeBonusRolls,
          playerReadiness,
          gameStarted,
          hasStartedPlayMode,
          turnVersion:
            handoffTurnVersion,
          updatedByPlayerId:
            localOnlinePlayerId,
          updatedAt: Date.now(),
          runtimeRevision:
            handoffRuntimeRevision,
        }
      );
    } catch (error) {
      console.error(
        "END TURN SYNC ERROR:",
        error
      );
    }
  }

  setCurrentPlayPlayerIndex(
    nextPlayer
  );

  setPlayModeDice(nextPlayModeDice);

  setLockedDice(nextLockedDice);

  setConfirmedLockedDice(
    nextConfirmedLockedDice
  );

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

useEffect(() => {
  if (
    isOnlineGame ||
    !gameStarted ||
    !hasStartedPlayMode ||
    gameFinished ||
    showPlayModeResult ||
    selectedPlayers.length === 0
  ) {
    return;
  }

  const playerId =
    selectedPlayers[
      currentPlayPlayerIndex
    ];

  if (
    !playerId ||
    !isComputerPlayerId(playerId)
  ) {
    lastComputerAutoTurnRef.current =
      null;

    return;
  }

  const currentPlayerScores =
    scores[playerId] || {};

  const turnMarker = `${playerId}:${Object.keys(currentPlayerScores).length}:${currentPlayPlayerIndex}:${localTurnVersionRef.current}`;

  if (
    lastComputerAutoTurnRef.current ===
    turnMarker
  ) {
    return;
  }

  lastComputerAutoTurnRef.current =
    turnMarker;

  if (!currentCombination) {
    setRemainingRolls(0);
    setHasRolledDice(false);

    return;
  }

  const categoryId =
    playModeCategoryMap[
      currentCombination.combination
    ];

  if (!categoryId) {
    setRemainingRolls(0);
    setHasRolledDice(false);

    return;
  }

  const existingScore =
    currentPlayerScores[categoryId];

  if (
    existingScore !== undefined &&
    !playModeAllowRewrite
  ) {
    setRemainingRolls(0);
    setHasRolledDice(false);

    return;
  }

  if (
    existingScore !== undefined &&
    playModeAllowRewrite &&
    existingScore >=
      currentCombination.score
  ) {
    setRemainingRolls(0);
    setHasRolledDice(false);

    return;
  }

  setScores((prev) => ({
    ...prev,
    [playerId]: {
      ...prev[playerId],
      [categoryId]:
        currentCombination.score,
    },
  }));

  setShowPlayModeResult(true);
}, [
  isOnlineGame,
  gameStarted,
  hasStartedPlayMode,
  gameFinished,
  showPlayModeResult,
  currentCombination,
  selectedPlayers,
  currentPlayPlayerIndex,
  scores,
  playModeAllowRewrite,
  playModeCategoryMap,
]);

const activateBonus = () => {
  if (
    isOnlineGame &&
    !isCurrentPlayer
  ) {
    return;
  }

  if (bonusUsed) {
  if (
    bonusActivatedThisTurn
  ) {
      bumpLocalRuntimeRevision();

      setRemainingRolls(
        (prev) =>
          prev - bonusDifference
      );

      setBonusUsed(false);
    }
setMaxScoreSoundPlayed(
  false
);
setNoCombinationSoundPlayed(
  false
);
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

  bumpLocalRuntimeRevision();

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
    isOnlineGame &&
    !isCurrentPlayer
  ) {
    return;
  }

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

        bumpLocalRuntimeRevision();

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

setMaxScoreSoundPlayed(
  false
);
setNoCombinationSoundPlayed(
  false
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

  // 12. SAVE / LOAD
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
  }): Promise<boolean> => {
    if (gameId) {
      const { data: existing } =
        await supabase
          .from("fun_games")
          .select("id")
          .eq("game_id", gameId)
          .limit(1);

      if (existing && existing.length > 0) {
        return false;
      }
    }

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

            game_id: gameId ?? null,
          },
        ]);

    if (error) {
      console.error(
        "Fun game save error:",
        error
      );
      return false;
    }

    return true;
  };

const checkExistingGameVersion =
  async () => {
    const { data, error } =
      await supabase
        .from("saved_games")
        .select("id")
        .eq("game_id", gameId);

    if (error) {
      console.error(error);

      return false;
    }

    return (
      data &&
      data.length > 0
    );
  };

const resolveSavedGameMetadata =
  (): SavedGameMetadata => {
    const isOnlineSave =
      gameMode === "online";

    const knownOnlineSessionId =
      onlineSessionId ??
      onlineSessionIdRef.current;

    return {
      gameMode,
      onlineSessionId:
        isOnlineSave
          ? knownOnlineSessionId ?? null
          : null,
      localOnlinePlayerId:
        isOnlineSave
          ? localOnlinePlayerId
          : null,
    };
  };

const isUuid = (
  value: string
) => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
};

const checkSavedGamesColumnExists =
  async (column: string) => {
    const { error } =
      await supabase
        .from("saved_games")
        .select(column)
        .limit(1);

    if (!error) {
      return true;
    }

    const message = `${error.message ?? ""} ${error.details ?? ""}`.toLowerCase();

    const missingColumnError =
      message.includes("could not find") ||
      message.includes("schema cache") ||
      message.includes("column");

    if (missingColumnError) {
      return false;
    }

    // Prefer save reliability: if probing fails for another reason,
    // treat metadata column as unsupported and continue with base payload.
    return false;
  };

const getSavedGamesMetadataColumnSupport =
  async (): Promise<SavedGamesMetadataColumnSupport> => {
    if (
      savedGamesMetadataColumnSupportRef.current
    ) {
      return savedGamesMetadataColumnSupportRef.current;
    }

    const [
      hasGameMode,
      hasOnlineSessionId,
      hasLocalOnlinePlayerId,
      hasCurrentPlayPlayerIndex,
      hasPlayModeDice,
      hasLockedDice,
      hasConfirmedLockedDice,
      hasRemainingRolls,
      hasBonusUsed,
      hasSelectedGeneralValue,
      hasHasRolledDice,
      hasHasStartedPlayMode,
    ] = await Promise.all([
      checkSavedGamesColumnExists("game_mode"),
      checkSavedGamesColumnExists("online_session_id"),
      checkSavedGamesColumnExists(
        "local_online_player_id"
      ),
      checkSavedGamesColumnExists(
        "current_play_player_index"
      ),
      checkSavedGamesColumnExists(
        "play_mode_dice"
      ),
      checkSavedGamesColumnExists(
        "locked_dice"
      ),
      checkSavedGamesColumnExists(
        "confirmed_locked_dice"
      ),
      checkSavedGamesColumnExists(
        "remaining_rolls"
      ),
      checkSavedGamesColumnExists(
        "bonus_used"
      ),
      checkSavedGamesColumnExists(
        "selected_general_value"
      ),
      checkSavedGamesColumnExists(
        "has_rolled_dice"
      ),
      checkSavedGamesColumnExists(
        "has_started_play_mode"
      ),
    ]);

    const support = {
      game_mode: hasGameMode,
      online_session_id:
        hasOnlineSessionId,
      local_online_player_id:
        hasLocalOnlinePlayerId,
      current_play_player_index:
        hasCurrentPlayPlayerIndex,
      play_mode_dice:
        hasPlayModeDice,
      locked_dice:
        hasLockedDice,
      confirmed_locked_dice:
        hasConfirmedLockedDice,
      remaining_rolls:
        hasRemainingRolls,
      bonus_used:
        hasBonusUsed,
      selected_general_value:
        hasSelectedGeneralValue,
      has_rolled_dice:
        hasHasRolledDice,
      has_started_play_mode:
        hasHasStartedPlayMode,
    };

    savedGamesMetadataColumnSupportRef.current =
      support;

    return support;
  };

const buildSavedGamesPayload =
  async (
    gameName: string,
    resolvedSaveMetadata: SavedGameMetadata,
    overrideGameId?: string
  ) => {
    if (
      !isValidSelectedPlayersForCount(
        selectedPlayers,
        playerCount
      )
    ) {
      throw new Error(
        "INVALID_SELECTED_PLAYERS_STATE"
      );
    }

    const columnSupport =
      await getSavedGamesMetadataColumnSupport();

    const payload: Record<string, any> = {
      game_id:
        overrideGameId ??
        gameId,
      name: gameName,
      player_count: playerCount,
      selected_players: selectedPlayers,
      scores,
      game_started: gameStarted,
      game_finished: gameFinished,
      is_play_mode_active:
        isPlayModeActive,
      play_mode_rolls: playModeRolls,
      play_mode_allow_rewrite:
        playModeAllowRewrite,
      play_mode_bonus_mode:
        playModeBonusMode,
      play_mode_bonus_rolls:
        playModeBonusRolls,
    };

    if (
      columnSupport.current_play_player_index
    ) {
      payload.current_play_player_index =
        currentPlayPlayerIndex;
    }

    if (columnSupport.play_mode_dice) {
      payload.play_mode_dice =
        playModeDice;
    }

    if (columnSupport.locked_dice) {
      payload.locked_dice =
        lockedDice;
    }

    if (
      columnSupport.confirmed_locked_dice
    ) {
      payload.confirmed_locked_dice =
        confirmedLockedDice;
    }

    if (columnSupport.remaining_rolls) {
      payload.remaining_rolls =
        remainingRolls;
    }

    if (columnSupport.bonus_used) {
      payload.bonus_used = bonusUsed;
    }

    if (
      columnSupport.selected_general_value
    ) {
      payload.selected_general_value =
        selectedGeneralValue;
    }

    if (columnSupport.has_rolled_dice) {
      payload.has_rolled_dice =
        hasRolledDice;
    }

    if (
      columnSupport.has_started_play_mode
    ) {
      payload.has_started_play_mode =
        hasStartedPlayMode;
    }

    if (columnSupport.game_mode) {
      payload.game_mode =
        resolvedSaveMetadata.gameMode;
    }

    if (columnSupport.online_session_id) {
      const rawSessionId =
        resolvedSaveMetadata.onlineSessionId;

      payload.online_session_id =
        rawSessionId && isUuid(rawSessionId)
          ? rawSessionId
          : null;
    }

    if (
      columnSupport.local_online_player_id
    ) {
      payload.local_online_player_id =
        resolvedSaveMetadata.localOnlinePlayerId;
    }

    return {
      payload,
      columnSupport,
    };
  };

const overwriteGameInSupabase =
  async (
    saveMetadata?: SavedGameMetadata
  ) => {

    try {
      const resolvedSaveMetadata =
        saveMetadata ??
        resolveSavedGameMetadata();

      const gameName =
        selectedPlayers
          .map(
            (player) =>
              getPlayerDisplayName(
                player
              )
          )
          .join(" vs ");

      const {
        payload: savedGamePayload,
        columnSupport,
      } = await buildSavedGamesPayload(
        gameName,
        resolvedSaveMetadata
      );

      console.log(
        "[saved_games][overwrite] pre-write",
        {
          isOnlineGame,
          isOnlineGameRefCurrent:
            isOnlineGameRef.current,
          onlineSessionId,
          onlineSessionIdRefCurrent:
            onlineSessionIdRef.current,
          hasOnlineChannel:
            Boolean(onlineChannel),
          resolvedGameMode:
            resolvedSaveMetadata.gameMode,
          resolvedOnlineSessionId:
            resolvedSaveMetadata.onlineSessionId,
          savedGamesColumnSupport:
            columnSupport,
          payload: savedGamePayload,
        }
      );

      const {
  data: insertedGame,
  error,
} = await supabase
  .from("saved_games")
  .insert([
    savedGamePayload,
  ])
  .select()
  .single();


const {
  data: oldGames,
  error: findError,
} = await supabase
  .from("saved_games")
  .select("id")
  .eq(
    "game_id",
    gameId
  );

if (
  !findError &&
  oldGames
) {
  const idsToDelete =
    oldGames
      .filter(
        (game) =>
          game.id !==
          insertedGame.id
      )
      .map(
        (game) =>
          game.id
      );

  if (
    idsToDelete.length > 0
  ) {
    await supabase
      .from("saved_games")
      .delete()
      .in(
        "id",
        idsToDelete
      );
  }
}
      if (error) {
        console.error(
          "OVERWRITE GAME ERROR:",
          error
        );

        alert(
          "Nepodařilo se přepsat hru."
        );

        return;
      }

      setShowGameVersionModal(
        false
      );

      setPendingSaveMetadata(null);

      setShowGameSavedModal(
        true
      );
    } catch (error) {
      console.error(error);

      alert(
        "Nepodařilo se přepsat hru."
      );
    }
  };

const saveGameToSupabase =
  async (
    overrideGameId?: string,
    saveMetadata?: SavedGameMetadata
  ) => {
    try {
      const resolvedSaveMetadata =
        saveMetadata ??
        resolveSavedGameMetadata();

      const gameName =
        selectedPlayers
          .map(
            (player) =>
              getPlayerDisplayName(
                player
              )
          )
          .join(" vs ");

      const {
        payload: savedGamePayload,
        columnSupport,
      } = await buildSavedGamesPayload(
        gameName,
        resolvedSaveMetadata,
        overrideGameId
      );

      console.log(
        "[saved_games][save] pre-write",
        {
          isOnlineGame,
          isOnlineGameRefCurrent:
            isOnlineGameRef.current,
          onlineSessionId,
          onlineSessionIdRefCurrent:
            onlineSessionIdRef.current,
          hasOnlineChannel:
            Boolean(onlineChannel),
          resolvedGameMode:
            resolvedSaveMetadata.gameMode,
          resolvedOnlineSessionId:
            resolvedSaveMetadata.onlineSessionId,
          savedGamesColumnSupport:
            columnSupport,
          payload: savedGamePayload,
        }
      );

      const { error } =
        await supabase
          .from("saved_games")
          .insert([
            savedGamePayload,
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

      setPendingSaveMetadata(null);

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

const runSaveCurrentGameFlow =
  async () => {
    const saveMetadata =
      resolveSavedGameMetadata();

    const exists =
      await checkExistingGameVersion();

    setPendingSaveMetadata(
      saveMetadata
    );

    if (exists) {
      setShowGameVersionModal(
        true
      );

      return;
    }

    await saveGameToSupabase(
      undefined,
      saveMetadata
    );
  };

const loadSavedGames =
  async () => {
    if (isOnlineGame) {
      return;
    }

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
  async (gameId: string) => {
    const result =
  await supabase
    .from("saved_games")
    .delete()
    .eq("id", gameId);

const { error } =
  result;

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

const buildLobbyReadinessMap = (
  playerIds: string[],
  readiness?: {
    [playerId: string]: boolean;
  } | null
) => {
  const next: {
    [playerId: string]: boolean;
  } = {};

  playerIds.forEach((playerId) => {
    next[playerId] = Boolean(
      readiness?.[playerId]
    );
  });

  return next;
};

  
  // 11. ONLINE
  const handleCreateOnlineSession =
    async () => {
    if (
      !isValidSelectedPlayersForCount(
        selectedPlayers,
        playerCount
      )
    ) {
      alert(
        "Vyber platný seznam hráčů před vytvořením online hry."
      );

      return;
    }

    try {
      const sessionSelectedPlayers = [
        ...selectedPlayers,
      ];

      const sessionPlayerCount =
        playerCount;

      localTurnVersionRef.current = 0;

      setGameMode("online");
      setSelectedGameMode("online");

      const initialReadiness: {
        [playerId: string]: boolean;
      } = {};

      sessionSelectedPlayers.forEach((playerId) => {
        initialReadiness[playerId] = false;
      });

      const initialOnlineState = {
        scores,
        selectedPlayers:
          sessionSelectedPlayers,
        playerCount:
          sessionPlayerCount,
        playerReadiness: initialReadiness,
        playModeRolls,
        playModeAllowRewrite,
        playModeBonusMode,
        playModeBonusRolls,
        currentPlayPlayerIndex,
        playModeDice,
        lockedDice,
        confirmedLockedDice,
        remainingRolls,
        bonusUsed,
        selectedGeneralValue,
        hasRolledDice,
        gameStarted,
        isPlayModeActive,
        hasStartedPlayMode,
        resume_started_at: null,
      };

      const session =
        await createOnlineSession(
          sessionSelectedPlayers[0] || "",
          initialOnlineState
        );

      setOnlineSessionId(session.id);

      setIsOnlineGame(true);
      setJoinSessionId("");
      setLocalOnlinePlayerId(null);

      setPlayerReadiness(initialReadiness);

      const channel = subscribeToSession(
        session.id,
        (gameState) => {
          applyOnlineGameState(gameState);
        }
      );

      setOnlineChannel(channel);

      // Ensure player list is loaded so lobby UI can render selection
      if (playersState.length === 0) {
        try {
          await loadPlayersFromSupabase();
        } catch (err) {
          console.error("LOAD PLAYERS FOR LOBBY ERROR:", err);
        }
      }

      await navigator.clipboard.writeText(session.id);

      debugSetScreen("online-lobby");
    } catch (error) {
      console.error(error);

      alert(
        "Nepodařilo se vytvořit online hru."
      );
    }
  };
  
  const applyOnlineGameState = (
  gameState: any
) => {
  const remoteSelectedPlayers =
    Array.isArray(
      gameState.selectedPlayers
    )
      ? gameState.selectedPlayers.filter(
          (playerId: unknown): playerId is string =>
            typeof playerId === "string"
        )
      : [];

  const remotePlayerCount =
    typeof gameState.playerCount ===
    "number"
      ? gameState.playerCount
      : "";

  if (
    !isValidSelectedPlayersForCount(
      remoteSelectedPlayers,
      remotePlayerCount
    )
  ) {
    setSelectedPlayers([]);
    setPlayerCount("");
    setPlayerReadiness({});

    return;
  }

  const incomingTurnVersion =
    Number(gameState.turnVersion ?? 0);

  const incomingUpdatedByPlayerId =
    gameState.updatedByPlayerId ?? null;

  const shouldIgnoreOwnEcho =
    localOnlinePlayerId !== null &&
    incomingUpdatedByPlayerId ===
      localOnlinePlayerId &&
    incomingTurnVersion <=
      localTurnVersionRef.current;

  const isStaleTurnVersion =
    incomingTurnVersion <
    localTurnVersionRef.current;

  if (
    shouldIgnoreOwnEcho ||
    isStaleTurnVersion
  ) {
    return;
  }

  localTurnVersionRef.current =
    Math.max(
      localTurnVersionRef.current,
      incomingTurnVersion
    );

  const incomingRuntimeRevision =
    Number(
      gameState.runtimeRevision ?? 0
    );

  const incomingTurnIndex =
    gameState.currentPlayPlayerIndex ??
    currentPlayPlayerIndex;

  const isStaleForActiveTurn =
    isOnlineGame &&
    isCurrentPlayer &&
    gameStarted &&
    incomingTurnIndex ===
      currentPlayPlayerIndex &&
    incomingRuntimeRevision <
      localRuntimeRevisionRef.current;

  if (isStaleForActiveTurn) {
    return;
  }

  localRuntimeRevisionRef.current =
    Math.max(
      localRuntimeRevisionRef.current,
      incomingRuntimeRevision
    );

  setScores(
    gameState.scores ?? {}
  );

  setCurrentPlayPlayerIndex(
    gameState.currentPlayPlayerIndex ?? 0
  );

  setPlayModeDice(
    gameState.playModeDice ??
      [1, 1, 1, 1, 1, 1]
  );

  setLockedDice(
    gameState.lockedDice ??
      [
        false,
        false,
        false,
        false,
        false,
        false,
      ]
  );

  setConfirmedLockedDice(
    gameState.confirmedLockedDice ??
      [
        false,
        false,
        false,
        false,
        false,
        false,
      ]
  );

  setRemainingRolls(
    gameState.remainingRolls ?? 0
  );

  setBonusUsed(
    gameState.bonusUsed ?? false
  );

  setSelectedGeneralValue(
    gameState.selectedGeneralValue ??
      null
  );

  setHasRolledDice(
    gameState.hasRolledDice ??
      false
  );

  const nextSelectedPlayers =
    remoteSelectedPlayers;

  setSelectedPlayers(
    nextSelectedPlayers
  );

  setPlayerCount(
    remotePlayerCount
  );

  const nextLobbyReadiness =
    buildLobbyReadinessMap(
      nextSelectedPlayers,
      gameState.playerReadiness ?? null
    );

  setPlayerReadiness(
    nextLobbyReadiness
  );

  setPlayModeRolls(
    gameState.playModeRolls ??
      playModeRolls
  );

  setPlayModeAllowRewrite(
    gameState.playModeAllowRewrite ??
      playModeAllowRewrite
  );

  setPlayModeBonusMode(
    gameState.playModeBonusMode ??
      playModeBonusMode
  );

  setPlayModeBonusRolls(
    gameState.playModeBonusRolls ??
      playModeBonusRolls
  );

  debugSetGameStarted(
    gameState.gameStarted ??
      gameStarted
  );

  const hasResumeSnapshotState =
    Boolean(
      gameState.gameStarted &&
      gameState.hasStartedPlayMode
    );

  const hasResumeStartSignal =
    Boolean(
      gameState.resume_started_at
    );

  const shouldHoldInLobby =
    forceOnlineLobbyUntilHostStartRef.current &&
    hasResumeSnapshotState &&
    !hasResumeStartSignal;

  if (hasResumeStartSignal) {
    forceOnlineLobbyUntilHostStartRef.current =
      false;
  }

  const shouldAutoOpenPlayMode =
    Boolean(
      gameState.gameStarted &&
      gameState.hasStartedPlayMode &&
      !hasStartedPlayMode
    );

  const shouldOpenFromResumeSignal =
    Boolean(
      hasResumeStartSignal &&
      gameState.gameStarted &&
      gameState.hasStartedPlayMode
    );

  debugSetHasStartedPlayMode(
    gameState.hasStartedPlayMode ??
      hasStartedPlayMode
  );

  if (
    (shouldAutoOpenPlayMode ||
      shouldOpenFromResumeSignal) &&
    !shouldHoldInLobby
  ) {
    if (!hasAutoOpenedOnlinePlayModeRef.current) {
      hasAutoOpenedOnlinePlayModeRef.current = true;
      debugSetIsPlayModeActive(true);
    }
  }

  if (shouldHoldInLobby) {
    debugSetIsPlayModeActive(false);
    debugSetScreen("online-lobby");

    return;
  }

  if (gameState.gameStarted) {
    debugSetScreen("game");
  }
};

  const syncCurrentGameState =
  async () => {
    if (
      !isOnlineGame ||
      !onlineSessionId
    ) {
      return;
    }

    try {
      await updateOnlineState(
        onlineSessionId,
        {
          scores,

          currentPlayPlayerIndex,

          playModeDice,

          lockedDice,

          confirmedLockedDice,

          remainingRolls,

          bonusUsed,

          selectedGeneralValue,

          hasRolledDice,

          selectedPlayers,

          playerCount,

          playModeRolls,

          playModeAllowRewrite,

          playModeBonusMode,

          playModeBonusRolls,

          playerReadiness,

          gameStarted,

          hasStartedPlayMode,

          turnVersion:
            localTurnVersionRef.current,

          updatedByPlayerId:
            localOnlinePlayerId,

          updatedAt: Date.now(),

          runtimeRevision:
            localRuntimeRevisionRef.current,
        }
      );
    } catch (error) {
      console.error(
        "ONLINE SYNC ERROR:",
        error
      );
    }
  };

  const claimOnlinePlayer = async (
    playerId: string
  ) => {
    if (
      isOnlineGame &&
      onlineSessionId
    ) {
      try {
        const session =
          await joinOnlineSession(
            onlineSessionId
          );

        const currentState =
          session.game_state ?? {};

        const remoteSelectedPlayers =
          Array.isArray(
            currentState.selectedPlayers
          )
            ? currentState.selectedPlayers.filter(
                (candidate: unknown): candidate is string =>
                  typeof candidate === "string"
              )
            : [];

        const remotePlayerCount =
          typeof currentState.playerCount ===
          "number"
            ? currentState.playerCount
            : "";

        if (
          !isValidSelectedPlayersForCount(
            remoteSelectedPlayers,
            remotePlayerCount
          )
        ) {
          setSelectedPlayers([]);
          setPlayerCount("");
          setPlayerReadiness({});

          alert(
            "Online session neobsahuje platný výběr hráčů."
          );

          return;
        }

        const nextReadiness =
          buildLobbyReadinessMap(
            remoteSelectedPlayers,
            currentState.playerReadiness
          );

        if (
          localOnlinePlayerId &&
          localOnlinePlayerId !== playerId &&
          localOnlinePlayerId in
            nextReadiness
        ) {
          nextReadiness[localOnlinePlayerId] = false;
        }

        if (!(playerId in nextReadiness)) {
          nextReadiness[playerId] = false;
        }

        nextReadiness[playerId] = true;

        setLocalOnlinePlayerId(playerId);
        setPlayerReadiness(nextReadiness);

        const claimTurnVersion =
          Math.max(
            Number(
              currentState.turnVersion ??
                0
            ),
            localTurnVersionRef.current
          ) + 1;

        await updateOnlineState(
          onlineSessionId,
          {
            ...currentState,
            playerReadiness: nextReadiness,
            updatedByPlayerId: playerId,
            updatedAt: Date.now(),
            turnVersion: claimTurnVersion,
          }
        );
      } catch (error) {
        console.error(
          "CLAIM PLAYER SYNC ERROR:",
          error
        );
      }
    }
  };
  
  
  const handleJoinOnlineSession =
  async () => {
    if (!joinSessionId.trim()) {
      alert("Zadej kód místnosti.");

      return false;
    }

    try {
      localTurnVersionRef.current = 0;
      hasAutoOpenedOnlinePlayModeRef.current = false;

      const session =
        await joinOnlineSession(
          joinSessionId.trim()
        );

      const sessionSelectedPlayers: string[] =
        Array.isArray(
          session.game_state?.selectedPlayers
        )
          ? session.game_state.selectedPlayers.filter(
              (candidate: unknown): candidate is string =>
                typeof candidate === "string"
            )
          : [];

      const sessionPlayerCount =
        typeof session.game_state?.playerCount ===
        "number"
          ? session.game_state.playerCount
          : "";

      if (
        !isValidSelectedPlayersForCount(
          sessionSelectedPlayers,
          sessionPlayerCount
        )
      ) {
        setSelectedPlayers([]);
        setPlayerCount("");
        setPlayerReadiness({});

        alert(
          "Online session neobsahuje platný výběr hráčů."
        );

        return false;
      }

      setGameMode("online");
      setSelectedGameMode("online");

      const isResumeLobbyJoin =
        Boolean(
          session.game_state?.gameStarted &&
          session.game_state?.hasStartedPlayMode
        );

      forceOnlineLobbyUntilHostStartRef.current =
        isResumeLobbyJoin;

      setOnlineSessionId(session.id);

      setIsOnlineGame(true);
      setLocalOnlinePlayerId(null);

      setPlayerCount(sessionPlayerCount);

      setSelectedPlayers(
        sessionSelectedPlayers
      );

      const nextReadiness =
        buildLobbyReadinessMap(
          sessionSelectedPlayers,
          session.game_state
            ?.playerReadiness
        );

      setPlayerReadiness(nextReadiness);

      const channel = subscribeToSession(
        session.id,
        (gameState) => {
          applyOnlineGameState(gameState);
        }
      );

      setOnlineChannel(channel);

      // Ensure player list is loaded so lobby UI can render selection
      if (playersState.length === 0) {
        try {
          await loadPlayersFromSupabase();
        } catch (err) {
          console.error("LOAD PLAYERS FOR LOBBY ERROR:", err);
        }
      }

      if (
        isResumeLobbyJoin ||
        !session.game_state ||
        !session.game_state.gameStarted
      ) {
        debugSetScreen("online-lobby");
      }

      if (session.game_state) {
        applyOnlineGameState(
          session.game_state
        );
      }

      return true;
    } catch (error) {
      console.error(error);

      alert(
        "Nepodařilo se připojit k online hře."
      );

      return false;
    }
  };

  const handleStartOnlineGame =
  async () => {
    if (
      !isOnlineGame ||
      !onlineSessionId ||
      !canStartOnlineGame
    ) {
      return;
    }

    if (
      !isValidSelectedPlayersForCount(
        selectedPlayers,
        playerCount
      )
    ) {
      alert(
        "Vyber platný seznam hráčů před spuštěním online hry."
      );

      return;
    }

    let nextRuntimeRevision =
      localRuntimeRevisionRef.current + 1;
    let nextTurnVersion =
      localTurnVersionRef.current + 1;
    let startSelectedPlayers = [
      ...selectedPlayers,
    ];
    let startPlayerCount = playerCount;

    try {
      const latestSession =
        await joinOnlineSession(
          onlineSessionId
        );

      const remoteSelectedPlayers =
        Array.isArray(
          latestSession.game_state
            ?.selectedPlayers
        )
          ? latestSession.game_state.selectedPlayers.filter(
              (candidate: unknown): candidate is string =>
                typeof candidate === "string"
            )
          : [];

      const remotePlayerCount =
        typeof latestSession.game_state
          ?.playerCount === "number"
          ? latestSession.game_state
              .playerCount
          : "";

      if (
        !isValidSelectedPlayersForCount(
          remoteSelectedPlayers,
          remotePlayerCount
        )
      ) {
        setSelectedPlayers([]);
        setPlayerCount("");
        setPlayerReadiness({});

        alert(
          "Online session neobsahuje platný výběr hráčů."
        );

        return;
      }

      startSelectedPlayers =
        remoteSelectedPlayers;
      startPlayerCount =
        remotePlayerCount;

      setSelectedPlayers(
        remoteSelectedPlayers
      );
      setPlayerCount(
        remotePlayerCount
      );

      const remoteRuntimeRevision =
        Number(
          latestSession.game_state
            ?.runtimeRevision ?? 0
        );

      const remoteTurnVersion =
        Number(
          latestSession.game_state
            ?.turnVersion ?? 0
        );

      nextRuntimeRevision =
        Math.max(
          localRuntimeRevisionRef.current,
          remoteRuntimeRevision
        ) + 1;

      nextTurnVersion =
        Math.max(
          localTurnVersionRef.current,
          remoteTurnVersion
        ) + 1;
    } catch (error) {
      console.error(
        "ONLINE START PREP ERROR:",
        error
      );
    }

    localRuntimeRevisionRef.current =
      nextRuntimeRevision;
    localTurnVersionRef.current =
      nextTurnVersion;

    hasAutoOpenedOnlinePlayModeRef.current = true;

    if (isOnlineResumeLobbyMode) {
      const resumeGameState = {
        scores,
        selectedPlayers:
          startSelectedPlayers,
        playerCount:
          startPlayerCount,
        playModeRolls,
        playModeAllowRewrite,
        playModeBonusMode,
        playModeBonusRolls,
        playerReadiness,
        currentPlayPlayerIndex,
        playModeDice,
        lockedDice,
        confirmedLockedDice,
        remainingRolls,
        bonusUsed,
        selectedGeneralValue,
        hasRolledDice,
        gameStarted: true,
        isPlayModeActive: true,
        hasStartedPlayMode: true,
        turnVersion:
          nextTurnVersion,
        updatedByPlayerId:
          localOnlinePlayerId,
        updatedAt: Date.now(),
        runtimeRevision:
          nextRuntimeRevision,
        resume_started_at: Date.now(),
      };

      debugSetIsPlayModeActive(true);
      debugSetHasStartedPlayMode(true);

      try {
        await updateOnlineState(
          onlineSessionId,
          resumeGameState
        );

        debugSetScreen("game");
      } catch (error) {
        console.error(
          "RESUME ONLINE GAME ERROR:",
          error
        );

        alert(
          "Nepodařilo se pokračovat v online hře."
        );
      }

      return;
    }

    const initialGameState = {
      scores,
      selectedPlayers:
        startSelectedPlayers,
      playerCount:
        startPlayerCount,
      playModeRolls,
      playModeAllowRewrite,
      playModeBonusMode,
      playModeBonusRolls,
      playerReadiness,
      currentPlayPlayerIndex: 0,
      playModeDice: [1, 1, 1, 1, 1, 1],
      lockedDice: [false, false, false, false, false, false],
      confirmedLockedDice: [false, false, false, false, false, false],
      remainingRolls: playModeRolls,
      bonusUsed: false,
      selectedGeneralValue: null,
      hasRolledDice: false,
      gameStarted: true,
      isPlayModeActive: true,
      hasStartedPlayMode: true,
      turnVersion:
        nextTurnVersion,
      updatedByPlayerId:
        localOnlinePlayerId,
      updatedAt: Date.now(),
      runtimeRevision:
        nextRuntimeRevision,
      resume_started_at: Date.now(),
    };

    setShowPlayModeSetup(false);
    setCurrentPlayPlayerIndex(0);
    setPlayModeDice([1, 1, 1, 1, 1, 1]);
    setLockedDice([false, false, false, false, false, false]);
    setConfirmedLockedDice([false, false, false, false, false, false]);
    setRemainingRolls(playModeRolls);
    setBonusUsed(false);
    setSelectedGeneralValue(null);
    setHasRolledDice(false);
    debugSetGameStarted(true);
    debugSetIsPlayModeActive(true);
    debugSetHasStartedPlayMode(true);

    try {
      await updateOnlineState(
        onlineSessionId,
        initialGameState
      );

      debugSetScreen("game");
    } catch (error) {
      console.error("START ONLINE GAME ERROR:", error);

      alert(
        "Nepodařilo se spustit online hru."
      );
    }
  };

  const leaveCurrentOnlineGame = () => {
    if (onlineChannel) {
      leaveOnlineSession(onlineChannel);
      setOnlineChannel(null);
    }

    setOnlineSessionId(null);
    setIsOnlineGame(false);
    setGameMode("offline");
    setSelectedGameMode("offline");
    setLocalOnlinePlayerId(null);
    setJoinSessionId("");
    setPlayerReadiness({});

    debugSetScreen("home");
  };

  const buildSavedGamePayload = (
    savedGame?: {
      gameId?: string;
      playerCount?: number | "";
      selectedPlayers?: string[];
      scores?: ScoreMap;
      gameStarted?: boolean;
      gameFinished?: boolean;
      isPlayModeActive?: boolean;
      hasStartedPlayMode?: boolean;
      playModeRolls?: number;
      playModeAllowRewrite?: boolean;
      playModeBonusMode?: "general-only" | "all";
      playModeBonusRolls?: number;
      currentPlayPlayerIndex?: number;
      playModeDice?: number[];
      lockedDice?: boolean[];
      confirmedLockedDice?: boolean[];
      remainingRolls?: number;
      bonusUsed?: boolean;
      selectedGeneralValue?: number | null;
      hasRolledDice?: boolean;
      gameMode?: "offline" | "online";
      onlineSessionId?: string | null;
      localOnlinePlayerId?: string | null;
    }
  ) => ({
    gameId: savedGame?.gameId ?? gameId,
    playerCount: savedGame?.playerCount ?? playerCount,
    selectedPlayers:
      savedGame?.selectedPlayers ?? selectedPlayers,
    scores: savedGame?.scores ?? scores,
    gameStarted: savedGame?.gameStarted ?? gameStarted,
    gameFinished:
      savedGame?.gameFinished ?? gameFinished,
    isPlayModeActive:
      savedGame?.isPlayModeActive ??
      isPlayModeActive,
    hasStartedPlayMode:
      savedGame?.hasStartedPlayMode ??
      hasStartedPlayMode,
    playModeRolls:
      savedGame?.playModeRolls ?? playModeRolls,
    playModeAllowRewrite:
      savedGame?.playModeAllowRewrite ??
      playModeAllowRewrite,
    playModeBonusMode:
      savedGame?.playModeBonusMode ??
      playModeBonusMode,
    playModeBonusRolls:
      savedGame?.playModeBonusRolls ??
      playModeBonusRolls,
    currentPlayPlayerIndex:
      savedGame?.currentPlayPlayerIndex ??
      currentPlayPlayerIndex,
    playModeDice:
      savedGame?.playModeDice ?? playModeDice,
    lockedDice:
      savedGame?.lockedDice ?? lockedDice,
    confirmedLockedDice:
      savedGame?.confirmedLockedDice ??
      confirmedLockedDice,
    remainingRolls:
      savedGame?.remainingRolls ??
      remainingRolls,
    bonusUsed:
      savedGame?.bonusUsed ?? bonusUsed,
    selectedGeneralValue:
      savedGame?.selectedGeneralValue ??
      selectedGeneralValue,
    hasRolledDice:
      savedGame?.hasRolledDice ??
      hasRolledDice,
    gameMode:
      savedGame?.gameMode ??
      gameMode,
    onlineSessionId:
      savedGame?.onlineSessionId ??
      (gameMode === "online"
        ? onlineSessionId
        : null),
    localOnlinePlayerId:
      savedGame?.localOnlinePlayerId ??
      (gameMode === "online"
        ? localOnlinePlayerId
        : null),
  });

  const openSavedGame = async (
    savedGame: ReturnType<
      typeof buildSavedGamePayload
    >
  ) => {
    const savedGameMode =
      savedGame.gameMode ?? "offline";
    const isOnlineSavedGame =
      savedGameMode === "online";

    setGameMode(savedGameMode);
    setSelectedGameMode(savedGameMode);

    setGameId(savedGame.gameId ?? "");
    setPlayerCount(savedGame.playerCount);
    setSelectedPlayers(savedGame.selectedPlayers);
    setScores(savedGame.scores);
    debugSetGameStarted(savedGame.gameStarted);
    setGameFinished(savedGame.gameFinished);
    debugSetIsPlayModeActive(
      isOnlineSavedGame
        ? false
        : savedGame.isPlayModeActive ?? false
    );
    debugSetHasStartedPlayMode(
      savedGame.hasStartedPlayMode ?? false
    );
    setShowPlayModeResult(false);
    setPlayModeRolls(savedGame.playModeRolls ?? 4);
    setPlayModeAllowRewrite(
      savedGame.playModeAllowRewrite ?? false
    );
    setPlayModeBonusMode(
      savedGame.playModeBonusMode ??
        "general-only"
    );
    setPlayModeBonusRolls(
      savedGame.playModeBonusRolls ?? 2
    );

    const offlineDefaultDice = [
      1,
      1,
      1,
      1,
      1,
      1,
    ];

    const offlineDefaultLocks = [
      false,
      false,
      false,
      false,
      false,
      false,
    ];

    if (isOnlineSavedGame) {
      setCurrentPlayPlayerIndex(0);
      setPlayModeDice(offlineDefaultDice);
      setLockedDice(offlineDefaultLocks);
      setConfirmedLockedDice(
        offlineDefaultLocks
      );
      setRemainingRolls(
        savedGame.playModeRolls ?? 4
      );
      setBonusUsed(false);
      setSelectedGeneralValue(null);
      setHasRolledDice(false);
    } else {
      setCurrentPlayPlayerIndex(
        savedGame.currentPlayPlayerIndex ?? 0
      );
      setPlayModeDice(
        savedGame.playModeDice ??
          offlineDefaultDice
      );
      setLockedDice(
        savedGame.lockedDice ??
          offlineDefaultLocks
      );
      setConfirmedLockedDice(
        savedGame.confirmedLockedDice ??
          offlineDefaultLocks
      );
      setRemainingRolls(
        savedGame.remainingRolls ??
          (savedGame.playModeRolls ?? 4)
      );
      setBonusUsed(
        savedGame.bonusUsed ?? false
      );
      setSelectedGeneralValue(
        savedGame.selectedGeneralValue ??
          null
      );
      setHasRolledDice(
        savedGame.hasRolledDice ?? false
      );
    }

    if (onlineChannel) {
      leaveOnlineSession(onlineChannel);
    }

    setOnlineChannel(null);
    setJoinSessionId("");

    if (isOnlineSavedGame) {
      const resumeSessionId =
        savedGame.onlineSessionId ?? null;

      if (!resumeSessionId) {
        alert(
          "Uložená online hra neobsahuje platné session ID."
        );

        setOnlineSessionId(null);
        setLocalOnlinePlayerId(null);
        setPlayerReadiness({});
        setIsOnlineGame(false);
        setGameMode("offline");
        setSelectedGameMode("offline");
        debugSetScreen("home");

        return;
      }

      try {
        localTurnVersionRef.current = 0;
        hasAutoOpenedOnlinePlayModeRef.current = false;

        const session =
          await joinOnlineSession(
            resumeSessionId
          );

        const sessionSelectedPlayers: string[] =
          Array.isArray(
            session.game_state?.selectedPlayers
          )
            ? session.game_state.selectedPlayers.filter(
                (candidate: unknown): candidate is string =>
                  typeof candidate === "string"
              )
            : [];

        const sessionPlayerCount =
          typeof session.game_state?.playerCount ===
          "number"
            ? session.game_state.playerCount
            : "";

        if (
          !isValidSelectedPlayersForCount(
            sessionSelectedPlayers,
            sessionPlayerCount
          )
        ) {
          setSelectedPlayers([]);
          setPlayerCount("");
          setOnlineSessionId(null);
          setLocalOnlinePlayerId(null);
          setPlayerReadiness({});
          setIsOnlineGame(false);
          setGameMode("offline");
          setSelectedGameMode("offline");

          alert(
            "Online session neobsahuje platný výběr hráčů."
          );

          debugSetScreen("home");

          return;
        }

        const isResumeLobbyJoin =
          Boolean(
            session.game_state?.gameStarted &&
            session.game_state?.hasStartedPlayMode
          );

        forceOnlineLobbyUntilHostStartRef.current =
          isResumeLobbyJoin;

        setOnlineSessionId(session.id);
        setIsOnlineGame(true);
        setLocalOnlinePlayerId(
          savedGame.localOnlinePlayerId ??
            null
        );

        setPlayerCount(
          sessionPlayerCount
        );

        setSelectedPlayers(
          sessionSelectedPlayers
        );

        const nextReadiness =
          buildLobbyReadinessMap(
            sessionSelectedPlayers,
            session.game_state
              ?.playerReadiness
          );

        setPlayerReadiness(
          nextReadiness
        );

        const channel = subscribeToSession(
          session.id,
          (gameState) => {
            applyOnlineGameState(gameState);
          }
        );

        setOnlineChannel(channel);

        if (playersState.length === 0) {
          try {
            await loadPlayersFromSupabase();
          } catch (err) {
            console.error(
              "LOAD PLAYERS FOR RESUME LOBBY ERROR:",
              err
            );
          }
        }

        if (
          isResumeLobbyJoin ||
          !session.game_state ||
          !session.game_state.gameStarted
        ) {
          debugSetScreen("online-lobby");
        }

        if (session.game_state) {
          applyOnlineGameState(
            session.game_state
          );
        }
      } catch (error) {
        console.error(
          "OPEN SAVED ONLINE RESUME ERROR:",
          error
        );

        alert(
          "Nepodařilo se obnovit online session."
        );

        setOnlineSessionId(null);
        setLocalOnlinePlayerId(null);
        setPlayerReadiness({});
        setIsOnlineGame(false);
        setGameMode("offline");
        setSelectedGameMode("offline");
        debugSetScreen("home");
      }

      return;
    }

    setOnlineSessionId(null);
    setLocalOnlinePlayerId(
      savedGame.localOnlinePlayerId ?? null
    );
    setPlayerReadiness({});
    setIsOnlineGame(false);
    debugSetScreen("game");
  };
  
  const startNewGame = (
  skipRestoreCheck = false
) => {
debugSetHasStartedPlayMode(
  false
);

debugSetIsPlayModeActive(
  false
);

  if (!isOnlineGame && !skipRestoreCheck) {
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

  if (!isOnlineGame) {
    localStorage.removeItem(
      "heroDiceCurrentGame"
    );
  }

  setPlayerCount("");

  setSelectedPlayers([]);

  setSelectedPlayerTypes([]);

  setLocalOnlinePlayerId(null);

  setGameMode("offline");
  setSelectedGameMode("offline");

  debugSetGameStarted(false);

  setGameFinished(false);

  setWinner("");

  setWinnerScore(0);

  setShowFinishedGame(false);

  setScores({});

setGameId(
  crypto.randomUUID()
);

  debugSetScreen("game");
};

  const canStartGame =
    isValidSelectedPlayersForCount(
      selectedPlayers,
      playerCount
    );

  const lobbyReadiness = useMemo(
    () =>
      buildLobbyReadinessMap(
        selectedPlayers,
        playerReadiness
      ),
    [selectedPlayers, playerReadiness]
  );

  const allPlayersReady =
    selectedPlayers.length > 0 &&
    selectedPlayers.every(
      (playerId) =>
        lobbyReadiness[playerId] === true
    );

  const canStartOnlineGame =
    isValidSelectedPlayersForCount(
      selectedPlayers,
      playerCount
    ) &&
    selectedPlayers.every(
      (playerId) =>
        playerReadiness[playerId] === true
    );

  const isOnlineResumeLobbyMode =
    isOnlineGame &&
    gameStarted &&
    hasStartedPlayMode;

  const isOnlineHost =
    joinSessionId === "";

  const activePlayerId =
    selectedPlayers[currentPlayPlayerIndex] ??
    null;

  const isCurrentPlayer =
    !isOnlineGame ||
    (localOnlinePlayerId !== null &&
      localOnlinePlayerId === activePlayerId);

  const canControlOnlinePlayMode =
    !isOnlineGame || isCurrentPlayer;

  const canShowOnlineChat =
    isOnlineGame &&
    Boolean(onlineSessionId);

  const canSubmitOnlineChat =
    canShowOnlineChat &&
    Boolean(localOnlinePlayerId) &&
    onlineChatInput.trim().length > 0;

  const getSupabaseErrorMessage = (
    error: unknown
  ) => {
    if (
      typeof error === "object" &&
      error !== null
    ) {
      const record = error as {
        message?: unknown;
        details?: unknown;
        hint?: unknown;
        code?: unknown;
      };

      const pieces = [
        typeof record.code === "string"
          ? `code=${record.code}`
          : null,
        typeof record.message ===
        "string"
          ? `message=${record.message}`
          : null,
        typeof record.details ===
        "string"
          ? `details=${record.details}`
          : null,
        typeof record.hint === "string"
          ? `hint=${record.hint}`
          : null,
      ].filter(
        (
          value
        ): value is string =>
          value !== null
      );

      if (pieces.length > 0) {
        return pieces.join(" | ");
      }
    }

    if (error instanceof Error) {
      return error.message;
    }

    return "Neznámá chyba";
  };

  const sendOnlineChatMessageNow =
    async () => {
      if (
        !canShowOnlineChat ||
        !onlineSessionId ||
        !localOnlinePlayerId
      ) {
        return;
      }

      const trimmedMessage =
        onlineChatInput.trim();

      if (!trimmedMessage) {
        return;
      }

      try {
        await sendGameMessage({
          gameId: onlineSessionId,
          playerId: localOnlinePlayerId,
          playerName:
            getPlayerDisplayName(
              localOnlinePlayerId
            ),
          message: trimmedMessage,
        });

        setOnlineChatInput("");
        setOnlineChatError(null);

        try {
          const refreshedMessages =
            await fetchGameMessages(
              onlineSessionId
            );

          setOnlineChatMessages(
            refreshedMessages
          );
        } catch (refreshError) {
          console.error(
            "ONLINE CHAT REFRESH ERROR:",
            getSupabaseErrorMessage(
              refreshError
            ),
            refreshError
          );
        }
      } catch (error) {
        const detailedError =
          getSupabaseErrorMessage(
            error
          );

        console.error(
          "ONLINE CHAT SEND ERROR:",
          detailedError,
          error
        );

        setOnlineChatError(
          detailedError
        );

        alert(
          "Nepodařilo se odeslat zprávu do chatu."
        );
      }
    };

  const formatChatMessageTime = (
    rawValue: string
  ) => {
    const date = new Date(rawValue);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "--:--";
    }

    return date.toLocaleTimeString(
      "cs-CZ",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

useEffect(() => {
  if (
    selectablePlayers.length ===
      2 &&
    !gameStarted &&
    playerCount !== 2
  ) {
    setPlayerCount(2);

    setSelectedPlayers([]);
  }
}, [
  selectablePlayers.length,
  gameStarted,
  playerCount,
]);
    
useEffect(() => {
  if (isOnlineGame) {
    setShowRestoreGame(false);
    return;
  }

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
}, [isOnlineGame]);

useEffect(() => {
  if (
    !canShowOnlineChat ||
    !onlineSessionId
  ) {
    setOnlineChatMessages([]);
    setOnlineChatInput("");
    setIsOnlineChatCollapsed(false);
    setIsMobileChatOpen(false);
    setIsOnlineChatLoading(false);
    setOnlineChatError(null);

    return;
  }

  let isMounted = true;

  const loadMessages = async () => {
    setIsOnlineChatLoading(true);

    try {
      const data =
        await fetchGameMessages(
          onlineSessionId
        );

      if (isMounted) {
        setOnlineChatMessages(data);
        setOnlineChatError(null);
      }
    } catch (error) {
      const detailedError =
        getSupabaseErrorMessage(
          error
        );

      console.error(
        "ONLINE CHAT LOAD ERROR:",
        detailedError,
        error
      );

      if (isMounted) {
        setOnlineChatError(
          detailedError
        );
      }
    } finally {
      if (isMounted) {
        setIsOnlineChatLoading(false);
      }
    }
  };

  loadMessages();

  const channel =
    subscribeToGameMessages(
      onlineSessionId,
      (incomingMessage) => {
        if (!isMounted) {
          return;
        }

        setOnlineChatMessages((prev) => {
          if (
            prev.some(
              (message) =>
                message.id ===
                incomingMessage.id
            )
          ) {
            return prev;
          }

          return [
            ...prev,
            incomingMessage,
          ].sort(
            (left, right) =>
              new Date(
                left.created_at
              ).getTime() -
              new Date(
                right.created_at
              ).getTime()
          );
        });
      }
    );

  return () => {
    isMounted = false;
    leaveOnlineSession(channel);
  };
}, [canShowOnlineChat, onlineSessionId]);

useEffect(() => {
  if (
    !canShowOnlineChat ||
    isOnlineChatCollapsed
  ) {
    return;
  }

  onlineChatBottomRef.current?.scrollIntoView(
    {
      behavior: "smooth",
      block: "end",
    }
  );
}, [
  canShowOnlineChat,
  isOnlineChatCollapsed,
  isMobileChatOpen,
  onlineChatMessages,
]);

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
  if (isOnlineGame) {
    return;
  }

  if (
    gameStarted &&
    !gameFinished
  ) {
    const savedGamePayload =
      buildSavedGamePayload({
        gameMode: "offline",
        onlineSessionId: null,
        localOnlinePlayerId: null,
      });

    localStorage.setItem(
  "heroDiceCurrentGame",
  JSON.stringify(savedGamePayload)
);
  }
}, [
  isOnlineGame,
  playerCount,
  selectedPlayers,
  scores,
  gameStarted,
  gameFinished,
gameId,
  isPlayModeActive,
  playModeRolls,
  playModeAllowRewrite,
  playModeBonusMode,
  playModeBonusRolls,
]);

useEffect(() => {
  if (
    !isOnlineGame ||
    !onlineSessionId ||
    !gameStarted ||
    !hasStartedPlayMode ||
    isRolling ||
    screen !== "game" ||
    !isCurrentPlayer
  ) {
    return;
  }

  syncCurrentGameState();
}, [
  scores,
  currentPlayPlayerIndex,
  playModeDice,
  lockedDice,
  confirmedLockedDice,
  remainingRolls,
  bonusUsed,
  selectedGeneralValue,
  hasRolledDice,
  playModeRolls,
  playModeAllowRewrite,
  playModeBonusMode,
  playModeBonusRolls,
  isRolling,
  isOnlineGame,
  onlineSessionId,
  gameStarted,
  hasStartedPlayMode,
  isCurrentPlayer,
  screen,
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
          getPlayerDisplayName(
            playerId
          ),

        total,

        perfectCategories,
      };
    }
  );

const winnerName =
  getPlayerDisplayName(
    bestPlayer
  );

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
  const saveSuccess =
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

      gameId,
    });

  if (!saveSuccess) {
    setShowDuplicateGameMessage(
      true
    );
  }
} else {
  const saveSuccess =
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

  if (!saveSuccess) {
    setShowDuplicateGameMessage(
      true
    );
  }
}

setGameFinished(true);

debugSetIsPlayModeActive(
  false
);

setShowPlayModeResult(
  false
);

localStorage.removeItem(
  "heroDiceCurrentGame"
);

if (
  celebrationSoundEnabled
) {
  const randomSound =
    winSounds[
      Math.floor(
        Math.random() *
          winSounds.length
      )
    ];

  if (
    celebrationAudioRef.current
  ) {
    celebrationAudioRef.current.pause();
  }

  const audio =
    new Audio(
      randomSound
    );

  celebrationAudioRef.current =
    audio;

  audio.play().catch(
    () => {}
  );
}

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
            particleCount: 333,
            spread: 100,
            startVelocity: 35,
            zIndex: 9999,
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
            particleCount: 333,
            spread: 180,
            startVelocity: 60,
            zIndex: 9999,
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
            particleCount: 333,
            angle: 60,
            spread: 55,
            zIndex: 9999,
            origin: {
              x: 0,
              y: 0.7,
            },
          });

          confetti({
            particleCount: 333,
            angle: 120,
            spread: 55,
            zIndex: 9999,
            origin: {
              x: 1,
              y: 0.7,
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
          };

  finishGame();
  }, [
    scores,
    gameStarted,
    gameFinished,
    selectedPlayers,
  ]);

const renderOnlineChatMessages = () => (
  <>
    {onlineChatError && (
      <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-xs font-bold text-red-300">
        Chat error: {onlineChatError}
      </div>
    )}

    <div className="mt-4 flex-1 overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-950/70 p-3">
      {isOnlineChatLoading && (
        <div className="pt-6 text-center text-sm font-bold text-zinc-500">
          Načítám chat...
        </div>
      )}

      {!isOnlineChatLoading &&
        onlineChatMessages.length ===
          0 && (
          <div className="pt-6 text-center text-sm font-bold text-zinc-500">
            Zatím bez zpráv
          </div>
        )}

      {!isOnlineChatLoading &&
        onlineChatMessages.length >
          0 && (
          <div className="space-y-3">
            {onlineChatMessages.map(
              (message) => {
                const isOwnMessage =
                  localOnlinePlayerId !==
                    null &&
                  message.player_id ===
                    localOnlinePlayerId;

                return (
                  <div
                    key={message.id}
                    className={`rounded-2xl border p-3 ${
                      isOwnMessage
                        ? "border-blue-400/40 bg-blue-500/10"
                        : "border-zinc-700 bg-zinc-900/80"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="truncate text-sm font-black text-yellow-300">
                        {
                          message.player_name
                        }
                      </div>

                      <div className="text-xs font-bold text-zinc-500">
                        {formatChatMessageTime(
                          message.created_at
                        )}
                      </div>
                    </div>

                    <p className="mt-2 whitespace-pre-wrap break-words text-sm text-zinc-200">
                      {message.message}
                    </p>
                  </div>
                );
              }
            )}
          </div>
        )}

      <div ref={onlineChatBottomRef} />
    </div>

    <div className="mt-4 flex gap-2">
      <input
        value={onlineChatInput}
        onChange={(event) =>
          setOnlineChatInput(
            event.target.value
          )
        }
        onKeyDown={(event) => {
          if (
            event.key === "Enter" &&
            !event.shiftKey
          ) {
            event.preventDefault();
            sendOnlineChatMessageNow();
          }
        }}
        maxLength={500}
        placeholder={
          localOnlinePlayerId
            ? "Napiš zprávu..."
            : "Vyber hráče v lobby"
        }
        className="h-12 flex-1 rounded-2xl border border-zinc-700 bg-black/60 px-4 text-sm font-bold text-white outline-none transition focus:border-blue-400"
      />

      <button
        onClick={sendOnlineChatMessageNow}
        disabled={!canSubmitOnlineChat}
        className={`h-12 rounded-2xl px-4 text-sm font-black transition ${
          canSubmitOnlineChat
            ? "bg-blue-600 text-white hover:bg-blue-500"
            : "cursor-not-allowed bg-zinc-700 text-zinc-400"
        }`}
      >
        Odeslat
      </button>
    </div>
  </>
);

    // 18. JSX
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

      <AppMenu
        isOpen={showHomeMenu}
        onToggle={() =>
          setShowHomeMenu(
            (prev) => !prev
          )
        }
        items={[
          {
            label: "Načíst hru",
            onClick: () => {
              loadSavedGames();
              setShowHomeMenu(false);
            },
          },
          {
            label: "Připojit se",
            onClick: () => {
              setShowJoinSessionModal(
                true
              );
              setShowHomeMenu(false);
            },
          },
          {
            label: "Admin",
            onClick: () => {
              setShowAdmin(true);
              setShowHomeMenu(false);
            },
          },
          {
            label: "Statistiky",
            onClick: () => {
              setShowStatistics(true);
              setShowHomeMenu(false);
            },
          },
        ]}
      />
    </div>

          <div className="mt-8 md:mt-10">
            <div className="flex flex-wrap items-center gap-3">
  <button
    onClick={() => startNewGame()}
    className="rounded-3xl border border-zinc-600 bg-yellow-500 px-8 py-5 text-2xl font-black text-black transition hover:scale-[1.02] hover:brightness-110 md:px-10 md:text-3xl"
  >
    ▶ Nová hra
  </button>
</div>
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
      {/* ONLINE LOBBY */}
      {screen === "online-lobby" && (
        <div className="mx-auto flex w-full max-w-6xl flex-col">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
            <h1 className="text-5xl font-black tracking-[0.14em] text-green-400">
              ONLINE LOBBY
            </h1>

            <button
              onClick={() => {
                leaveCurrentOnlineGame();
              }}
              className="rounded-2xl bg-red-700 px-6 py-3 text-lg font-bold transition hover:bg-red-600"
            >
              Zpět domů
            </button>
          </div>

          <div className="mx-auto mb-12 w-full max-w-3xl rounded-3xl bg-zinc-900/40 p-8 backdrop-blur-sm text-center">
            {onlineSessionId === null ? (
              <div className="text-lg font-bold text-zinc-400 mb-4">
                Připojování...
              </div>
            ) : (
              <>
                <div className={`text-sm font-bold uppercase tracking-[0.2em] mb-2 ${
                  isOnlineHost
                    ? "text-green-400"
                    : "text-blue-400"
                }`}>
                  {isOnlineHost
                    ? "Host Mode"
                    : "Client Mode"}
                </div>

                <div className="text-2xl font-black text-white mb-6">
                  {isOnlineHost
                    ? "Místnost vytvořena"
                    : "Připojeno do místnosti"}
                </div>

                <div className="rounded-2xl border border-green-500/30 bg-black/40 p-6 mb-8">
                  <div className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-400 mb-3">
                    Kód místnosti
                  </div>

                  <div className="text-4xl font-black text-green-400 tracking-[0.14em] font-mono">
                    {onlineSessionId}
                  </div>

                  {isOnlineHost && (
                    <div className="mt-4 text-xs text-zinc-500">
                      (zkopírován do schránky)
                    </div>
                  )}
                </div>

                <div className="text-lg font-bold text-zinc-400 mb-8">
                  ⏳ Lobby čeká na identifikaci a připravenost všech hráčů.
                </div>

                <div className="mx-auto mb-10 max-w-4xl rounded-3xl bg-zinc-950/60 p-8 text-left">
                  <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="text-sm font-bold uppercase tracking-[0.2em] text-yellow-400">
                        Online lobby
                      </div>

                      <h2 className="mt-2 text-3xl font-black text-white tracking-[0.14em]">
                        Seznam hráčů a připravenost
                      </h2>
                    </div>
                  </div>

                  <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
                    <div className="rounded-2xl border border-zinc-800 bg-black/40 p-6">
                      <div className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-400">
                        Hráči v místnosti
                      </div>

                      <div className="mt-5 space-y-3">
                        {selectedPlayers.map((playerId, index) => {
                          const player = playersState.find(
                            (entry) => entry.id === playerId
                          );
                          const ready = Boolean(
                            lobbyReadiness[playerId]
                          );
                          const isLocalPlayer =
                            localOnlinePlayerId === playerId;

                          return (
                            <div
                              key={playerId || index}
                              className="flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-4 md:flex-row md:items-center md:justify-between"
                            >
                              <div>
                                <div className="text-sm font-bold text-white">
                                  {player?.name ?? `Hráč ${index + 1}`}
                                </div>
                                <div className="text-xs text-zinc-500">
                                  {playerId}
                                </div>
                              </div>

                              <div className="flex flex-col gap-3 md:items-end">
                                <div
                                  className={`rounded-full px-3 py-1 text-center text-sm font-bold ${
                                    ready
                                      ? "bg-green-500 text-black"
                                      : "bg-zinc-800 text-zinc-400"
                                  }`}
                                >
                                  {ready ? "Připraven" : "Čeká"}
                                </div>

                                <button
                                  type="button"
                                  onClick={() =>
                                    claimOnlinePlayer(playerId)
                                  }
                                  disabled={
                                    isLocalPlayer && ready
                                  }
                                  className={`rounded-2xl px-4 py-3 text-sm font-black transition ${
                                    isLocalPlayer
                                      ? "cursor-default bg-green-600 text-white"
                                      : "bg-blue-600 text-white hover:bg-blue-500"
                                  }`}
                                >
                                  {isLocalPlayer
                                    ? "Připraven"
                                    : "Jsem tento hráč"}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-zinc-800 bg-black/40 p-6">
                      <div className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-400">
                        Stav lobby
                      </div>

                      <div className="mt-4 text-2xl font-black text-white">
                        {allPlayersReady
                          ? "Všichni hráči jsou připraveni"
                          : "Čeká se na připravenost hráčů"}
                      </div>

                      <div className="mt-4 text-sm text-zinc-400">
                        Každé zařízení si zvolí svého hráče. Host může hru spustit až ve chvíli, kdy jsou všichni připraveni.
                      </div>

                      {localOnlinePlayerId && (
                        <div className="mt-4 rounded-2xl border border-green-500/20 bg-zinc-950/70 px-4 py-3 text-sm font-bold text-green-400">
                          Toto zařízení ovládá hráče: {getPlayerDisplayName(localOnlinePlayerId)}
                        </div>
                      )}

                      {isOnlineHost ? (
                        <>
                          <button
                            type="button"
                            onClick={handleStartOnlineGame}
                            disabled={!canStartOnlineGame}
                            className={`mt-8 w-full rounded-2xl px-6 py-4 text-xl font-black text-black transition ${
                              canStartOnlineGame
                                ? "bg-yellow-500 hover:bg-yellow-400"
                                : "cursor-not-allowed bg-zinc-700 text-zinc-400"
                            }`}
                          >
                            {isOnlineResumeLobbyMode
                              ? "▶ Pokračovat v online hře"
                              : "▶ Zahájit online hru"}
                          </button>

                          {!allPlayersReady && (
                            <div className="mt-3 text-sm text-zinc-500">
                              Host může spustit hru pouze, když jsou všichni připraveni.
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="mt-8 rounded-2xl bg-zinc-900 px-4 py-4 text-sm font-bold text-zinc-400">
                          Po výběru svého hráče zůstává klient v lobby a čeká na spuštění hry hostem.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {/* GAME */}
      {screen === "game" && (
        <div className="mx-auto flex w-full max-w-6xl flex-col">
          <div
            className={`relative mb-8 flex w-full flex-col gap-4 md:flex-row md:items-center md:justify-between ${
              !gameStarted
                ? "mx-auto max-w-5xl"
                : ""
            }`}
          >
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
    
    <button
  onClick={() => {
    if (
      hasStartedPlayMode
    ) {
      debugSetIsPlayModeActive(
        true
      );

      debugSetHasStartedPlayMode(
        true
      );

      return;
    }

    setShowPlayModeSetup(
      true
    );
  }}
  disabled={!canStartPlayMode}
  className={`rounded-2xl border border-zinc-600 px-6 py-3 text-lg font-black transition ${
    canStartPlayMode
      ? "bg-purple-600 hover:scale-[1.02] hover:brightness-110"
      : "cursor-not-allowed bg-zinc-700 text-zinc-400"
  }`}
>
  ▶ Play Mode
</button>

    <AppMenu
      label="MENU"
      isOpen={showGameMenu}
      onToggle={() =>
        setShowGameMenu(
          (prev) => !prev
        )
      }
      items={[
        {
          label: "Zvuk",
          onClick: () => {
            setShowSettings(true);
            setShowGameMenu(false);
          },
        },
        {
          label: "Načíst hru",
          onClick: () => {
            loadSavedGames();
            setShowGameMenu(false);
          },
        },
        {
          label: "Uložit hru",
          onClick: () => {
            setShowSaveGameConfirm(
              true
            );
            setShowGameMenu(false);
          },
        },
        {
          label: "Nová hra",
          onClick: () => {
            setShowHomeRestoreModal(
              true
            );
            setShowGameMenu(false);
          },
        },
        {
          label: "Ukončit hru",
          onClick: () => {
            setShowLeaveConfirm(
              true
            );
            setShowGameMenu(false);
          },
        },
      ]}
    />
  </>
) : (
    <AppMenu
      isOpen={showSetupMenu}
      onToggle={() =>
        setShowSetupMenu(
          (prev) => !prev
        )
      }
      items={[
        {
          label: "Načíst hru",
          onClick: () => {
            loadSavedGames();
            setShowSetupMenu(false);
          },
        },
        {
          label: "Admin",
          onClick: () => {
            setShowAdmin(true);
            setShowSetupMenu(false);
          },
        },
        {
          label: "Statistiky",
          onClick: () => {
            setShowStatistics(true);
            setShowSetupMenu(false);
          },
        },
        {
          label: "Domů",
          onClick: () => {
            debugSetScreen("home");
            setShowSetupMenu(false);
          },
        },
      ]}
    />
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
                        e.target.value === ""
                          ? ""
                          : Number(
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
                          selectedPlayerTypes[
                            index
                          ] || "human"
                        }
                        onChange={(e) =>
                          handlePlayerTypeChange(
                            index,
                            e.target
                              .value as PlayerSelectionType
                          )
                        }
                        className="mb-3 w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-base font-bold text-white outline-none transition focus:border-yellow-400"
                      >
                        <option value="human">
                          Human
                        </option>
                        <option value="computer">
                          Computer
                        </option>
                      </select>

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
                          {(
                            selectedPlayerTypes[
                              index
                            ] || "human"
                          ) === "computer"
                            ? "Vyber Computer hráče"
                            : "Vyber hráče"}
                        </option>

                        {(selectedPlayerTypes[
                          index
                        ] || "human") ===
                        "computer"
                          ? computerPlayers.map(
                              (
                                computerPlayer
                              ) => (
                                <option
                                  key={
                                    computerPlayer.id
                                  }
                                  value={
                                    computerPlayer.id
                                  }
                                >
                                  {
                                    computerPlayer.name
                                  }
                                </option>
                              )
                            )
                          : selectablePlayers.map(
                              (
                                player
                              ) => (
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
              onClick={() => {
                if (!canStartGame) {
                  alert(
                    "Vyber platný seznam hráčů."
                  );

                  return;
                }

                // Do not start the game yet; open Play Mode setup first.
                debugSetGameStarted(false, 'GameSetup');
                setShowPlayModeSetup(true);
              }}
  disabled={!canStartGame}
  className={`rounded-2xl px-8 py-4 text-xl font-black transition ${
    canStartGame
      ? "border border-zinc-600 bg-gradient-to-r from-violet-600 to-green-500 text-zinc-100 hover:scale-[1.02] hover:brightness-110 hover:text-white"
: "cursor-not-allowed border border-zinc-600 bg-zinc-700 text-zinc-400"
  }`}
>
  ▶ Nastavit hru
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
                          {getPlayerDisplayName(
                            playerId
                          )}
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
            {hasStartedPlayMode && (
  <div
    className={`mt-4 text-center text-sm font-black ${
      isLeaguePlayMode
        ? "text-green-400"
        : "text-purple-400"
    }`}
  >
    {isLeaguePlayMode
  ? "Ligová hra"
  : "Fun hra"}
:{" "}
{isLeaguePlayMode
  ? "4 hody / Bez přepisu / Bonus: Generál +2 hody"
      : `${playModeRolls} hodů / Přepis: ${
      playModeAllowRewrite
        ? "Ano"
        : "Ne"
    } / Bonus: ${
      playModeBonusMode ===
      "all"
        ? "Všechny kombinace"
        : "Generál"
    } +${
      playModeBonusRolls -
      playModeRolls
        } body`} / {gameTypeInfoText}
  </div>
)}
            </>
          )}
        </div>
      )}

{/* EDIT CONFIRM MODAL */}
{showEditConfirm &&
  scoreModal &&
  hasStartedPlayMode &&
  !playModeAllowRewrite && (
  <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
    <div className="w-full max-w-[420px] rounded-3xl border border-yellow-500/30 bg-zinc-900 p-8 text-center text-white shadow-2xl">
      <h2 className="mb-5 text-3xl font-black text-yellow-400">
        Přepis není povolen
      </h2>

      <p className="mb-8 text-lg text-zinc-300">
        Nastavení hry neumožňuje
        přepsat skóre.
      </p>

      <button
        onClick={() => {
          setShowEditConfirm(
            false
          );

          setScoreModal(null);
        }}
        className="w-full rounded-2xl bg-zinc-700 px-5 py-4 text-lg font-bold text-white transition hover:bg-zinc-600"
      >
        Zavřít
      </button>
    </div>
  </div>
)}

{showEditConfirm &&
  scoreModal &&
  (!hasStartedPlayMode ||
    playModeAllowRewrite) && (
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
            setShowEditConfirm(
              false
            );

            setScoreModal(null);
          }}
          className="flex-1 rounded-2xl bg-zinc-700 px-5 py-4 text-lg font-bold text-white transition hover:bg-zinc-600"
        >
          Nechat hodnotu
        </button>

        <button
          onClick={() =>
            setShowEditConfirm(
              false
            )
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
{!isOnlineGame && showHomeRestoreModal && (
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
          className="flex-1 rounded-2xl border border-zinc-600 bg-yellow-500 px-5 py-4 text-lg font-bold text-black transition hover:scale-[1.02] hover:brightness-110"
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

            openSavedGame(parsed);

            setShowHomeRestoreModal(
              false
            );
          }}
          className="flex-1 rounded-2xl border border-zinc-600 bg-green-600 px-5 py-4 text-lg font-black text-white transition hover:scale-[1.02] hover:brightness-110"
        >
          Skóre board
        </button>
      </div>
    </div>
  </div>
)}

{/* LOAD GAMES MODAL */}
{!isOnlineGame && showLoadGames && (
  <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/90 p-4">
    <div className="w-full max-w-2xl rounded-3xl border border-zinc-700 bg-zinc-950 p-8 text-white">
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
          className="rounded-xl border border-zinc-600 bg-zinc-700 px-4 py-2 font-bold text-white transition hover:scale-[1.02] hover:brightness-110"
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

                <div className="mt-3 flex flex-wrap gap-2 text-xs font-black uppercase tracking-[0.16em]">
                  <span
                    className={`rounded-full px-3 py-1 ${
                      (game.game_mode ?? "offline") ===
                      "online"
                        ? "bg-green-600/20 text-green-400"
                        : "bg-blue-600/20 text-blue-400"
                    }`}
                  >
                    {(game.game_mode ?? "offline") ===
                    "online"
                      ? "Online hra"
                      : "Offline hra"}
                  </span>

                  <span
                    className={`rounded-full px-3 py-1 ${
                      Array.isArray(
                        game.selected_players
                      ) &&
                      game.selected_players.some(
                        (playerId: unknown) =>
                          typeof playerId ===
                            "string" &&
                          isComputerPlayerId(
                            playerId
                          )
                      )
                        ? "bg-purple-600/20 text-purple-300"
                        : game.play_mode_rolls ===
                            4 &&
                          !game.play_mode_allow_rewrite &&
                          game.play_mode_bonus_mode ===
                            "general-only" &&
                          game.play_mode_bonus_rolls ===
                            2
                        ? "bg-green-600/20 text-green-400"
                        : "bg-purple-600/20 text-purple-300"
                    }`}
                  >
                    {Array.isArray(
                      game.selected_players
                    ) &&
                    game.selected_players.some(
                      (playerId: unknown) =>
                        typeof playerId ===
                          "string" &&
                        isComputerPlayerId(
                          playerId
                        )
                    )
                      ? "Fun hra"
                      : game.play_mode_rolls ===
                          4 &&
                        !game.play_mode_allow_rewrite &&
                        game.play_mode_bonus_mode ===
                          "general-only" &&
                        game.play_mode_bonus_rolls ===
                          2
                      ? "Ligová hra"
                      : "Fun hra"}
                  </span>
                </div>

                <div className="mt-2 text-xs text-zinc-500">
                  {`${game.play_mode_rolls ?? 4} hodů / Přepis: ${
                    game.play_mode_allow_rewrite
                      ? "Ano"
                      : "Ne"
                  } / Bonus: ${
                    game.play_mode_bonus_mode ===
                    "all"
                      ? "Všechny kombinace"
                      : "Generál"
                  } +${
                    Math.max(
                      (game.play_mode_bonus_rolls ?? 2) -
                        (game.play_mode_rolls ?? 4),
                      0
                    )
                  }`}
                </div>

                {(game.game_mode ?? "offline") ===
                  "online" &&
                  game.online_session_id && (
                  <div className="mt-2 text-xs font-bold text-green-400">
                    Session: {game.online_session_id}
                  </div>
                )}
              </div>

              <div className="flex gap-3">
  <button
    onClick={() => {
      if (isOnlineGame) {
        return;
      }

      const savedGamePayload =
        buildSavedGamePayload({
          gameId: game.game_id ?? "",
          playerCount: game.player_count,
          selectedPlayers:
            game.selected_players ?? [],
          scores: game.scores ?? {},
          gameStarted: game.game_started,
          gameFinished: game.game_finished,
          isPlayModeActive:
            game.is_play_mode_active ?? false,
          hasStartedPlayMode:
            game.has_started_play_mode ??
            game.is_play_mode_active ??
            false,
          playModeRolls:
            game.play_mode_rolls ?? 4,
          playModeAllowRewrite:
            game.play_mode_allow_rewrite ?? false,
          playModeBonusMode:
            game.play_mode_bonus_mode ??
            "general-only",
          playModeBonusRolls:
            game.play_mode_bonus_rolls ?? 2,
          currentPlayPlayerIndex:
            game.current_play_player_index ?? 0,
          playModeDice:
            game.play_mode_dice ?? [
              1,
              1,
              1,
              1,
              1,
              1,
            ],
          lockedDice:
            game.locked_dice ?? [
              false,
              false,
              false,
              false,
              false,
              false,
            ],
          confirmedLockedDice:
            game.confirmed_locked_dice ?? [
              false,
              false,
              false,
              false,
              false,
              false,
            ],
          remainingRolls:
            game.remaining_rolls ??
            (game.play_mode_rolls ?? 4),
          bonusUsed:
            game.bonus_used ?? false,
          selectedGeneralValue:
            game.selected_general_value ?? null,
          hasRolledDice:
            game.has_rolled_dice ?? false,
          gameMode:
            game.game_mode ?? "offline",
          onlineSessionId:
            game.online_session_id ?? null,
          localOnlinePlayerId:
            game.local_online_player_id ?? null,
        });

      localStorage.setItem(
  "heroDiceCurrentGame",
  JSON.stringify(savedGamePayload)
);

      setShowLoadGames(
  false
);

      openSavedGame(savedGamePayload);
    }}
    className="rounded-xl bg-yellow-500 px-5 py-3 font-black text-black transition hover:scale-[1.02] hover:brightness-110"
  >
    Načíst
  </button>

  <button
  onClick={() =>
    setDeleteSavedGameId(
      game.id
    )
  }
  className="rounded-xl bg-red-600 px-5 py-3 font-black text-white transition hover:scale-[1.02] hover:brightness-110"
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
{!isOnlineGame && showRestoreGame && (
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
          className="flex-1 rounded-2xl border border-zinc-600 bg-zinc-700 px-5 py-4 text-lg font-bold text-white transition hover:scale-[1.02] hover:brightness-110"
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

            openSavedGame(parsed);

            setShowRestoreGame(
              false
            );
          }}
          className="flex-1 rounded-2xl border border-zinc-600 bg-yellow-500 px-5 py-4 text-lg font-black text-black transition hover:scale-[1.02] hover:brightness-110"
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
              if (hasComputerPlayer) {
                return;
              }

              const saveSuccess =
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

                  gameId,
                });

              if (!saveSuccess) {
                setShowFinishGameConfirm(
                  false
                );

                setPendingFinishedGame(
                  null
                );

                setShowDuplicateGameMessage(
                  true
                );

                return;
              }

              setShowFinishGameConfirm(
  false
);

setPendingFinishedGame(
  null
);

setGameFinished(true);

debugSetIsPlayModeActive(
  false
);

setShowPlayModeResult(
  false
);

localStorage.removeItem(
  "heroDiceCurrentGame"
);

if (
  celebrationSoundEnabled
) {
  const randomSound =
    winSounds[
      Math.floor(
        Math.random() *
        winSounds.length
      )
    ];

  const audio =
    new Audio(
      randomSound
    );

  audio.volume = 0.8;

  celebrationAudioRef.current =
    audio;

  audio.play().catch(() => {});
}

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
            disabled={hasComputerPlayer}
            className={`rounded-2xl px-5 py-4 text-lg font-black text-white transition ${
              hasComputerPlayer
                ? "cursor-not-allowed bg-zinc-700 text-zinc-400"
                : "bg-green-600 hover:bg-green-500"
            }`}
          >
            {hasComputerPlayer
              ? "Ligová hra není dostupná s Computer hráčem"
              : "🟢 Ligová hra"}
          </button>

          <button
            onClick={async () => {
              const saveSuccess =
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

              if (!saveSuccess) {
                setShowFinishGameConfirm(
                  false
                );

                setPendingFinishedGame(
                  null
                );

                setShowDuplicateGameMessage(
                  true
                );

                return;
              }

              setShowFinishGameConfirm(
  false
);



setPendingFinishedGame(
  null
);

setGameFinished(true);

debugSetIsPlayModeActive(
  false
);

setShowPlayModeResult(
  false
);

localStorage.removeItem(
  "heroDiceCurrentGame"
);

if (
  celebrationSoundEnabled
) {
  const randomSound =
    winSounds[
      Math.floor(
        Math.random() *
        winSounds.length
      )
    ];

  const audio =
    new Audio(
      randomSound
    );

  audio.volume = 0.8;

  celebrationAudioRef.current =
    audio;

  audio.play().catch(() => {});
}

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
        className="w-full rounded-2xl border border-zinc-600 bg-green-600 px-5 py-4 text-lg font-black text-white transition hover:scale-[1.02] hover:brightness-110"
      >
        OK
      </button>
    </div>
  </div>
)}

{/* GAME VERSION MODAL */}
{showGameVersionModal && (
  <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/90 p-4">
    <div className="w-full max-w-[520px] rounded-3xl border border-zinc-700 bg-zinc-950 p-8 text-center text-white">
      <h2 className="mb-5 text-3xl font-black text-yellow-400">
        Hra již existuje
      </h2>

      <p className="mb-8 text-zinc-300">
        Tato rozehraná hra už byla dříve uložena.
      </p>

      <div className="flex flex-wrap justify-center gap-4">
        <button
          onClick={() =>
            {
              setShowGameVersionModal(
                false
              );

              setPendingSaveMetadata(
                null
              );
            }
          }
          className="rounded-xl border border-zinc-600 bg-zinc-700 px-6 py-4 font-bold text-white transition hover:scale-[1.02] hover:brightness-110"
        >
          Zrušit
        </button>

        <button
          onClick={async () => {
  await overwriteGameInSupabase(
    pendingSaveMetadata ?? undefined
  );
}}
          className="rounded-xl border border-zinc-600 bg-green-600 px-6 py-4 font-black text-white transition hover:scale-[1.02] hover:brightness-110"
        >
          Přepsat
        </button>
      </div>
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
          • bonus pouze u generála (2 bonus hody)
        </div>
      </div>
    </div>
  </div>
</div>

        <button
  onClick={() => {
    setShowPlayModeSetup(
      false
    );

    debugSetGameStarted(
      false
    );
  }}
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
    playModeBonusRolls === 2
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

{!hasStartedPlayMode && (
  <div className="rounded-2xl border border-purple-500/20 bg-black/40 p-6">
    <div className="mb-4 text-center text-sm font-bold uppercase tracking-[0.2em] text-purple-400">
      Režim hry
    </div>

    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <button
        onClick={() =>
          setSelectedGameMode(
            "offline"
          )
        }
        className={`rounded-2xl px-5 py-4 font-black transition ${
          selectedGameMode ===
          "offline"
            ? "bg-yellow-500 text-black"
            : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
        }`}
      >
        ▶ Offline hra
      </button>

      <button
        onClick={() =>
          setSelectedGameMode(
            "online"
          )
        }
        disabled={hasComputerPlayer}
        className={`rounded-2xl px-5 py-4 font-black transition ${
          hasComputerPlayer
            ? "cursor-not-allowed bg-zinc-800 text-zinc-500"
            :
          selectedGameMode ===
          "online"
            ? "bg-green-600 text-white"
            : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
        }`}
      >
        🌐 Online hra
      </button>
    </div>
  </div>
)}

      <div className="mt-8 flex flex-wrap justify-between gap-4">
        

        <div className="flex gap-4">
          <button
  onClick={() => {
    setShowPlayModeSetup(
      false
    );

    debugSetGameStarted(
      false
    );
  }}
  className="rounded-2xl bg-zinc-700 px-6 py-4 font-bold transition hover:bg-zinc-600"
>
  Zrušit
</button>

            <button
          onClick={async () => {
    // If the game is already started, behave as before (enter Play Mode).
    if (gameStarted && hasStartedPlayMode) {
      setCurrentPlayPlayerIndex(0);

      setPlayModeDice([1, 1, 1, 1, 1, 1]);

      setLockedDice([false, false, false, false, false, false]);

      setConfirmedLockedDice([
        false,
        false,
        false,
        false,
        false,
        false,
      ]);

      setRemainingRolls(playModeRolls);
      setHasRolledDice(false);
      setBonusUsed(false);
      setShowPlayModeSetup(false);

      debugSetIsPlayModeActive(true);
      debugSetHasStartedPlayMode(true);

      return;
    }

    if (!canStartGame) {
      alert(
        "Vyber platný seznam hráčů."
      );

      return;
    }

    if (hasComputerPlayer) {
      setSelectedGameMode("offline");
      setGameMode("offline");
    }

    if (
      selectedGameMode === "online" &&
      !hasComputerPlayer
    ) {
      setShowPlayModeSetup(false);
      setGameMode("online");

      try {
        await handleCreateOnlineSession();
      } catch (err) {
        console.error(
          "PLAY MODE SETUP -> create online session error:",
          err
        );
      }

      return;
    }

    setShowPlayModeSetup(false);
    setGameMode("offline");

    debugSetGameStarted(
      true,
      "PlayModeSetup"
    );

    setCurrentPlayPlayerIndex(0);

    setPlayModeDice([1, 1, 1, 1, 1, 1]);

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

    setRemainingRolls(playModeRolls);
    setHasRolledDice(false);
    setBonusUsed(false);

    debugSetIsPlayModeActive(
      true,
      "PlayModeSetup"
    );
    debugSetHasStartedPlayMode(
      true,
      "PlayModeSetup"
    );

    debugSetScreen(
      "game",
      "PlayModeSetup"
    );
}}
  className={`rounded-2xl px-8 py-4 font-black text-white transition ${
    hasComputerPlayer
      ? "bg-purple-600 hover:bg-purple-500"
      : selectedGameMode === "online"
      ? "bg-green-600 hover:bg-green-500"
      : isLeaguePlayMode
      ? "bg-green-600 hover:bg-green-500"
      : "bg-purple-600 hover:bg-purple-500"
  }`}
>
  {hasComputerPlayer
    ? "▶ Spustit fun offline hru"
    : screen === "online-lobby"
    ? "Hotovo"
    : selectedGameMode === "online"
    ? isLeaguePlayMode
      ? "🌐 Spustit ligovou online hru"
      : "🌐 Spustit fun online hru"
    : isLeaguePlayMode
    ? "▶ Spustit ligovou offline hru"
    : "▶ Spustit fun offline hru"}
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

      <div
        className={`mt-2 text-2xl font-black ${(() => {
          const categoryId =
            playModeCategoryMap[
              currentCombination
                .combination
            ];

          const category =
            gameCategories.find(
              (c) =>
                c.id ===
                categoryId
            );

          return (
            category &&
            currentCombination.score ===
              category.max
              ? "text-red-500"
              : "text-white"
          );
        })()}`}
      >
        Skóre: {currentCombination.score}
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4">
  <button
    onClick={() => {
  setShowPlayModeResult(
    false
  );

  endTurn();

  debugSetIsPlayModeActive(
    false
  );
}}
    disabled={!canControlOnlinePlayMode}
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
    <div
      className={`mx-auto flex w-full flex-col ${
        canShowOnlineChat
          ? "max-w-6xl lg:flex-row lg:items-stretch lg:gap-5"
          : "max-w-2xl"
      }`}
    >
      <div className="w-full lg:flex-1">
      <div className="rounded-3xl border border-purple-500/20 bg-zinc-900 p-6 md:p-8">
  <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
    
    <div className="text-center md:text-left">
      <div className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
        Aktuální hráč
      </div>

      <div className="text-3xl font-black text-yellow-400 md:text-4xl">
        {getPlayerDisplayName(
          selectedPlayers[
            currentPlayPlayerIndex
          ] ?? ""
        )}
      </div>

      <div
        className={`mt-2 text-lg font-bold uppercase tracking-[0.25em] ${
          isLeaguePlayMode
            ? "text-green-400"
            : "text-purple-400"
        }`}
      >
        {`${
          isLeaguePlayMode
            ? "LIGOVÁ HRA"
            : "FUN HRA"
        } · ${gameTypeTagText}`}
      </div>
    </div>

    <div className="text-center">
      <div className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
        Aktuální kombinace
      </div>

      <div className="mt-3 min-h-[84px]">
        {currentCombination &&
        hasRolledDice ? (
          <>
            <div className="text-2xl font-black text-green-400 md:text-3xl">
              {
                currentCombination.combination
              }
            </div>

            <div
              className={`mt-2 text-xl font-bold ${
                (() => {
                  const categoryId =
  playModeCategoryMap[
    currentCombination
      .combination
  ];

const category =
  gameCategories.find(
    (c) =>
      c.id === categoryId
  );

return (
  category &&
  currentCombination.score ===
    category.max
)
  ? "text-red-500"
  : "text-green-400";
                })()
              }`}
            >
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

  </div>
</div>

      <div className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
        <div className="relative mb-8 flex items-center justify-end">
  <div className="absolute left-1/2 -translate-x-1/2 text-4xl leading-none">
    {hasUsefulFutureMove ===
    null
      ? "❌"
      : hasUsefulFutureMove
        ? "👍🏻"
        : "❌"}
  </div>

  <button
    onClick={() =>
      debugSetIsPlayModeActive(
        false
      )
    }
    className="rounded-2xl bg-green-700 px-5 py-3 font-bold transition hover:bg-green-600"
  >
    Scoreboard
  </button>
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
        disabled={!canControlOnlinePlayMode}
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
  generalBonusBlocked ||
          !canUseGeneralBonus ||
          !canControlOnlinePlayMode
}
            className={`h-24 rounded-2xl px-8 text-2xl font-black transition ${
  bonusUsed ||
  generalBonusBlocked ||
  !canUseGeneralBonus
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
  !canControlOnlinePlayMode ||
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
    disabled={!canControlOnlinePlayMode}
    className="h-24 rounded-2xl bg-yellow-500 px-8 text-2xl font-black text-black transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400 md:col-span-2"
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
              0 ||
              !canControlOnlinePlayMode
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

      {canShowOnlineChat && (
        <div className="hidden lg:flex lg:self-stretch">
          {isOnlineChatCollapsed ? (
            <button
              onClick={() =>
                setIsOnlineChatCollapsed(
                  false
                )
              }
              className="h-full w-12 rounded-2xl border border-blue-500/30 bg-zinc-900 text-sm font-black uppercase tracking-[0.15em] text-blue-300 transition hover:bg-zinc-800"
            >
              Chat
            </button>
          ) : (
            <div className="flex h-full w-[360px] flex-col rounded-3xl border border-blue-500/20 bg-zinc-900 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-black uppercase tracking-[0.18em] text-blue-300">
                    Chat
                  </div>

                  <div className="text-xs font-bold text-zinc-500">
                    Online hra
                  </div>
                </div>

                <button
                  onClick={() =>
                    setIsOnlineChatCollapsed(
                      true
                    )
                  }
                  className="rounded-xl border border-zinc-700 px-3 py-2 text-xs font-black text-zinc-200 transition hover:bg-zinc-800"
                >
                  Sbalit
                </button>
              </div>

              {renderOnlineChatMessages()}
            </div>
          )}
        </div>
      )}
    </div>

    {canShowOnlineChat && (
      <>
        <button
          onClick={() =>
            setIsMobileChatOpen(
              true
            )
          }
          className="fixed bottom-6 right-4 z-[180] rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black uppercase tracking-[0.15em] text-white shadow-xl transition hover:bg-blue-500 lg:hidden"
        >
          Chat
        </button>

        {isMobileChatOpen && (
          <div className="fixed inset-0 z-[220] bg-black/80 p-4 lg:hidden">
            <div className="mx-auto flex h-full max-h-[85vh] w-full max-w-md flex-col rounded-3xl border border-blue-500/20 bg-zinc-900 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-black uppercase tracking-[0.18em] text-blue-300">
                    Chat
                  </div>

                  <div className="text-xs font-bold text-zinc-500">
                    Online hra
                  </div>
                </div>

                <button
                  onClick={() =>
                    setIsMobileChatOpen(
                      false
                    )
                  }
                  className="rounded-xl border border-zinc-700 px-3 py-2 text-xs font-black text-zinc-200 transition hover:bg-zinc-800"
                >
                  Zavřít
                </button>
              </div>

              {renderOnlineChatMessages()}
            </div>
          </div>
        )}
      </>
    )}

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
              {getPlayerDisplayName(
                selectedPlayers[
                  currentPlayPlayerIndex
                ] ?? ""
              )}
            </div>

            <div
              className={`mt-2 text-2xl font-black ${(() => {
                const categoryId =
                  playModeCategoryMap[
                    currentCombination
                      .combination
                  ];

                const category =
                  gameCategories.find(
                    (c) =>
                      c.id ===
                      categoryId
                  );

                return (
                  category &&
                  currentCombination.score ===
                    category.max
                    ? "text-red-500"
                    : "text-white"
                );
              })()}`}
            >
              Skóre: {currentCombination.score}
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
  <button
    onClick={() => {
  setShowPlayModeResult(
    false
  );

  endTurn();

  debugSetIsPlayModeActive(
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
    disabled={!canControlOnlinePlayMode}
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
                {getPlayerDisplayName(
                  scoreModal.playerId
                )}
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
        className="w-full rounded-2xl border border-zinc-600 bg-green-600 px-5 py-4 text-lg font-black text-white transition hover:scale-[1.02] hover:brightness-110"
      >
        OK
      </button>
    </div>
  </div>
)}

{/* DUPLICATE GAME MESSAGE */}
{showDuplicateGameMessage && (
  <div className="fixed inset-0 z-[170] flex items-center justify-center bg-black/90 p-4">
    <div className="w-full max-w-[420px] rounded-3xl border border-yellow-500/20 bg-zinc-900 p-8 text-center text-white shadow-2xl">
      <h2 className="mb-5 text-3xl font-black text-yellow-400">
        Hra již zapsána
      </h2>

      <p className="mb-8 text-lg text-zinc-300">
        Tato hra již byla dříve do statistik zapsána.
        <br />
        Výsledek nebyl uložen znovu.
      </p>

      <button
        onClick={() =>
          setShowDuplicateGameMessage(
            false
          )
        }
        className="w-full rounded-2xl border border-zinc-600 bg-yellow-500 px-5 py-4 text-lg font-black text-black transition hover:scale-[1.02] hover:brightness-110"
      >
        OK
      </button>
    </div>
  </div>
)}

{showSettings && (
  <div className="fixed inset-0 z-[170] flex items-center justify-center bg-black/90 p-4">
    <div className="w-full max-w-[520px] rounded-3xl bg-zinc-900 p-8 text-white">

      <h2 className="mb-8 text-3xl font-black text-yellow-400">
        Nastavení zvuku
      </h2>

      <div className="space-y-6">

        <div className="flex items-center justify-between">
          <span className="font-bold">
            Závěrečná oslava
          </span>

          <button
            onClick={() => {
              const value =
                !celebrationSoundEnabled;

              setCelebrationSoundEnabled(
                value
              );

              saveSettings(
  value,
  maxScoreSoundEnabled,
  noCombinationSoundEnabled
);
            }}
            className={`rounded-xl px-5 py-2 font-black ${
              celebrationSoundEnabled
                ? "bg-green-600"
                : "bg-red-600"
            }`}
          >
            {celebrationSoundEnabled
              ? "ZAP"
              : "VYP"}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-bold">
            Max skóre
          </span>

          <button
            onClick={() => {
              const value =
                !maxScoreSoundEnabled;

              setMaxScoreSoundEnabled(
                value
              );

              saveSettings(
  celebrationSoundEnabled,
  value,
  noCombinationSoundEnabled
);
            }}
            className={`rounded-xl px-5 py-2 font-black ${
              maxScoreSoundEnabled
                ? "bg-green-600"
                : "bg-red-600"
            }`}
          >
            {maxScoreSoundEnabled
              ? "ZAP"
              : "VYP"}
          </button>
        </div>
        <div className="flex items-center justify-between">
  <span className="font-bold">
    Není kombinace
  </span>

  <button
    onClick={() => {
      const value =
        !noCombinationSoundEnabled;

      setNoCombinationSoundEnabled(
        value
      );

      saveSettings(
        celebrationSoundEnabled,
        maxScoreSoundEnabled,
        value
      );
    }}
    className={`rounded-xl px-5 py-2 font-black ${
      noCombinationSoundEnabled
        ? "bg-green-600"
        : "bg-red-600"
    }`}
  >
    {noCombinationSoundEnabled
      ? "ZAP"
      : "VYP"}
  </button>
</div>
      </div>

      <button
        onClick={() =>
          setShowSettings(false)
        }
        className="mt-8 w-full rounded-2xl bg-yellow-500 px-5 py-4 font-black text-black"
      >
        Zavřít
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
      <h2
        className="mb-8 cursor-pointer text-5xl transition hover:scale-110"
        onClick={(e) => {
          e.stopPropagation();

          const randomSound =
            winSounds[
              Math.floor(
                Math.random() *
                  winSounds.length
              )
            ];

          const isPlaying =
            celebrationAudioRef.current &&
            !celebrationAudioRef.current
              .paused &&
            !celebrationAudioRef.current
              .ended;

          if (!isPlaying) {
            const audio =
              new Audio(
                randomSound
              );

            celebrationAudioRef.current =
              audio;

            audio.play().catch(
              () => {}
            );
          }

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
            particleCount: 333,
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
            particleCount: 333,
            spread: 60,
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
            particleCount: 333,
            angle: 60,
            spread: 55,
            origin: {
              x: 0,
              y: 0.7,
            },
          });

          confetti({
            particleCount: 333,
            angle: 120,
            spread: 55,
            origin: {
              x: 1,
              y: 0.7,
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
        }}
      >
        🏆
      </h2>

      <p className="mb-3 text-3xl font-bold">
        vítězem se stává
      </p>

      <p className="mb-2 animate-pulse text-5xl font-black text-yellow-400">
        {winner}
      </p>

      <p
  className={`mb-6 text-3xl font-black ${
    winnerScore === 214
      ? "text-red-500"
      : "text-yellow-400"
  }`}
>
  {winnerScore} bodů
</p>

      <p className="mb-6 text-sm text-zinc-400">
        klikni na 🏆 pro další
        oslavu
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
          onClick={() =>
            startNewGame()
          }
          className="rounded-lg bg-red-600 px-5 py-3 font-bold text-white transition hover:bg-red-500"
        >
          Nová hra
        </button>

        <button
          onClick={() => {
            setShowFinishedGame(
              false
            );

            debugSetScreen("home");
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
          <div className="relative w-full max-w-[420px] rounded-2xl border border-zinc-700 bg-zinc-950 p-8 text-center text-white">
            <button
              onClick={() =>
                setShowLeaveConfirm(
                  false
                )
              }
              className="absolute right-5 top-5 rounded-lg border border-zinc-700 px-3 py-1 text-sm font-black text-zinc-400 transition hover:border-zinc-500 hover:text-white"
              aria-label="Zavřít modal"
            >
              ✕
            </button>

            <h2 className="mb-6 text-3xl font-black">
              Opravdu ukončit hru?
            </h2>

            <p className="mb-8 text-zinc-300">
              Rozehraná hra nebude uložena.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
  <button
    onClick={async () => {
      setShowLeaveConfirm(
        false
      );

      await runSaveCurrentGameFlow();
    }}
    className="rounded-xl border border-zinc-600 bg-green-600 px-5 py-3 font-bold text-white transition hover:scale-[1.02] hover:brightness-110"
  >
    Uložit hru
  </button>

  <button
    onClick={() => {
      setShowLeaveConfirm(
        false
      );

      startNewGame();
    }}
    className="rounded-xl border border-zinc-600 bg-yellow-500 px-5 py-3 font-bold text-black transition hover:scale-[1.02] hover:brightness-110"
  >
    Nová hra
  </button>

  <button
  onClick={() => {
    setShowLeaveConfirm(
      false
    );

    if (isOnlineGame) {
      leaveCurrentOnlineGame();
    } else {
      debugSetScreen("home");
    }
  }}
  className="rounded-xl border border-zinc-600 bg-red-600 px-5 py-3 font-bold text-white transition hover:scale-[1.02] hover:brightness-110"
>
  Domů
</button>
</div>
          </div>
        </div>
      )}

      {/* JOIN SESSION MODAL */}
      {showJoinSessionModal && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/90 p-4">
          <div className="relative w-full max-w-[460px] rounded-2xl border border-zinc-700 bg-zinc-950 p-8 text-white">
            <button
              onClick={() =>
                setShowJoinSessionModal(
                  false
                )
              }
              className="absolute right-4 top-4 rounded-lg border border-zinc-700 px-3 py-1 text-sm font-black text-zinc-300 transition hover:border-zinc-500 hover:text-white"
              aria-label="Zavřít modal"
            >
              X
            </button>

            <h2 className="mb-2 text-3xl font-black text-cyan-300 tracking-[0.08em]">
              Připojit se
            </h2>

            <p className="mb-6 text-zinc-400">
              Zadej kód místnosti a připoj se do online lobby.
            </p>

            <input
              type="text"
              value={joinSessionId}
              onChange={(e) =>
                setJoinSessionId(
                  e.target.value
                )
              }
              onKeyDown={async (event) => {
                if (event.key !== "Enter") {
                  return;
                }

                const joined =
                  await handleJoinOnlineSession();

                if (joined) {
                  setShowJoinSessionModal(
                    false
                  );
                }
              }}
              placeholder="Kód místnosti"
              className="mb-6 w-full rounded-2xl border border-zinc-700 bg-black px-5 py-4 text-lg font-bold tracking-[0.08em] text-white outline-none transition focus:border-cyan-400"
              autoFocus
            />

            <button
              onClick={async () => {
                const joined =
                  await handleJoinOnlineSession();

                if (joined) {
                  setShowJoinSessionModal(
                    false
                  );
                }
              }}
              className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-4 text-xl font-black tracking-[0.08em] text-white transition hover:brightness-110"
            >
              Připojit se
            </button>
          </div>
        </div>
      )}

{/* SAVE GAME CONFIRM */}
{showSaveGameConfirm && (
  <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/90 p-4">
    <div className="w-full max-w-[420px] rounded-2xl border border-zinc-700 bg-zinc-950 p-8 text-center text-white">
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
          className="rounded-xl border border-zinc-600 bg-zinc-700 px-5 py-3 font-bold text-white transition hover:scale-[1.02] hover:brightness-110"
        >
          Zrušit
        </button>

        <button
          onClick={async () => {
  setShowSaveGameConfirm(
    false
  );

  await runSaveCurrentGameFlow();
}}
          className="rounded-xl border border-zinc-600 bg-green-600 px-5 py-3 font-bold text-white transition hover:scale-[1.02] hover:brightness-110"
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
          className="rounded-xl border border-zinc-600 bg-zinc-700 px-8 py-4 font-black text-white transition hover:scale-[1.02] hover:brightness-110"
        >
          Nechat
        </button>

        <button
          onClick={async () => {
            const result =
  await supabase
    .from(
      "saved_games"
    )
    .delete()
    .eq(
      "id",
      deleteSavedGameId
    );

const { error } =
  result;

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
          className="rounded-xl border border-zinc-600 bg-red-600 px-8 py-4 font-black text-white transition hover:scale-[1.02] hover:brightness-110"
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
    <div className="w-full max-w-3xl rounded-3xl border border-zinc-700 bg-zinc-950 p-8 text-white shadow-2xl">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-4xl font-black text-yellow-400">
          Administrace hráčů
        </h2>

        <button
          onClick={() =>
            setShowAdmin(false)
          }
          className="rounded-xl border border-zinc-600 bg-zinc-700 px-4 py-2 font-bold text-white transition hover:scale-[1.02] hover:brightness-110"
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
    className="rounded-xl bg-blue-600 px-4 py-2 font-bold text-white transition hover:scale-[1.02] hover:brightness-110"
  >
    Uložit
  </button>

  <button
    onClick={() =>
      setDeletePlayerId(
        player.id
      )
    }
    className="rounded-xl bg-red-700 px-4 py-2 font-bold text-white transition hover:scale-[1.02] hover:brightness-110"
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
    className={`rounded-xl px-4 py-2 font-bold transition hover:scale-[1.02] hover:brightness-110 ${
      player.active
        ? "bg-green-600"
        : "bg-red-600"
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
              className="rounded-xl bg-green-600 px-5 py-3 font-black text-white transition hover:scale-[1.02] hover:brightness-110"
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
          className="flex-1 rounded-2xl border border-zinc-600 bg-zinc-700 px-5 py-4 font-bold text-white transition hover:scale-[1.02] hover:brightness-110"
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
          className="flex-1 rounded-2xl border border-zinc-600 bg-red-600 px-5 py-4 font-black text-white transition hover:scale-[1.02] hover:brightness-110"
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

