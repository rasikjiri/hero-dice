"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { supabase } from "../lib/supabase";
import {
  listPlayerAccessRequests,
  processPlayerAccessRequest,
  type PlayerAccessRequest,
} from "../lib/authSession";

type Player = {
  id: string;
  name: string;
  active: boolean;
  role: "admin" | "player";
  email?: string | null;
};

type ManagedGame = {
  id: string;
  created_at?: string;
  date?: string;
  winner?: string;
  winner_score?: number;
  players?: string[];
  scores?: {
    playerId: string;
    playerName?: string;
    total?: number;
    perfectCategories?: number;
  }[];
  roll_count?: number;
  rewrite_enabled?: boolean;
  bonus_mode?: string;
  bonus_rolls?: number;
  game_id?: string | null;
};

type AdminTab = "players" | "requests" | "fun-games" | "league-games";

type DeleteTarget = {
  id: string;
  table: "fun_games" | "games";
  tab: Exclude<AdminTab, "players">;
  winner: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  adminSessionToken: string | null;
  players: Player[];
  pendingAccessRequestsCount: number;
  playerSessionActivityById: Record<string, boolean>;
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  newPlayerId: string;
  setNewPlayerId: React.Dispatch<React.SetStateAction<string>>;
  newPlayerName: string;
  setNewPlayerName: React.Dispatch<React.SetStateAction<string>>;
  newPlayerPassword: string;
  setNewPlayerPassword: React.Dispatch<React.SetStateAction<string>>;
  newPlayerPasswordConfirm: string;
  setNewPlayerPasswordConfirm: React.Dispatch<React.SetStateAction<string>>;
  onAddPlayer: () => void;
  onSavePlayer: (playerId: string, updates: { name?: string; active?: boolean; role?: "admin" | "player" }) => Promise<void> | void;
  onSetPlayerPassword: (playerId: string, password: string, passwordConfirm: string) => Promise<void>;
  onRequestDeletePlayer: (playerId: string) => void;
  onRevokePlayerSessions: (playerId: string) => Promise<void>;
  onPlayersReload: () => Promise<void>;
  onAccessRequestsChanged: () => Promise<void>;
  onLeagueGamesChanged: () => Promise<void>;
};

const resolveUnknownErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  if (typeof error === "string" && error.trim().length > 0) {
    return error;
  }

  if (typeof error === "object" && error !== null) {
    const candidate = error as {
      message?: unknown;
      details?: unknown;
      hint?: unknown;
      code?: unknown;
      error?: unknown;
    };

    const parts = [candidate.message, candidate.details, candidate.hint, candidate.code, candidate.error]
      .filter((value): value is string => typeof value === "string" && value.trim().length > 0);

    if (parts.length > 0) {
      return parts.join(" | ");
    }
  }

  return fallback;
};

export default function AdminModal({
  isOpen,
  onClose,
  adminSessionToken,
  players,
  pendingAccessRequestsCount,
  playerSessionActivityById,
  setPlayers,
  newPlayerId,
  setNewPlayerId,
  newPlayerName,
  setNewPlayerName,
  newPlayerPassword,
  setNewPlayerPassword,
  newPlayerPasswordConfirm,
  setNewPlayerPasswordConfirm,
  onAddPlayer,
  onSavePlayer,
  onSetPlayerPassword,
  onRequestDeletePlayer,
  onRevokePlayerSessions,
  onPlayersReload,
  onAccessRequestsChanged,
  onLeagueGamesChanged,
}: Props) {
  const tabs: { id: AdminTab; label: string }[] = [
    { id: "players", label: "Hráči" },
    {
      id: "requests",
      label:
        pendingAccessRequestsCount > 0
          ? `Žádosti (${pendingAccessRequestsCount})`
          : "Žádosti",
    },
    { id: "fun-games", label: "Fun Game" },
    { id: "league-games", label: "Liga Game" },
  ];

  const [activeTab, setActiveTab] = useState<AdminTab>("players");
  const [funGames, setFunGames] = useState<ManagedGame[]>([]);
  const [leagueGames, setLeagueGames] = useState<ManagedGame[]>([]);
  const [isLoadingFunGames, setIsLoadingFunGames] = useState(false);
  const [isLoadingLeagueGames, setIsLoadingLeagueGames] = useState(false);
  const [funGamesError, setFunGamesError] = useState<string | null>(null);
  const [leagueGamesError, setLeagueGamesError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [revokePlayerId, setRevokePlayerId] = useState<string | null>(null);
  const [accessRequests, setAccessRequests] = useState<PlayerAccessRequest[]>([]);
  const [isLoadingAccessRequests, setIsLoadingAccessRequests] = useState(false);
  const [accessRequestsError, setAccessRequestsError] = useState<string | null>(null);
  const [processingAccessRequestId, setProcessingAccessRequestId] = useState<string | null>(null);
  const [passwordDraftByPlayerId, setPasswordDraftByPlayerId] = useState<
    Record<string, string>
  >({});
  const [passwordConfirmDraftByPlayerId, setPasswordConfirmDraftByPlayerId] =
    useState<Record<string, string>>({});
  const [roleDraftByPlayerId, setRoleDraftByPlayerId] = useState<
    Record<string, Player["role"]>
  >({});
  const [savingPasswordForPlayerId, setSavingPasswordForPlayerId] = useState<
    string | null
  >(null);
  const [visibleSecretByKey, setVisibleSecretByKey] = useState<Record<string, boolean>>({});

  async function loadFunGames() {
    setIsLoadingFunGames(true);
    setFunGamesError(null);

    const { data, error } = await supabase
      .from("fun_games")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("ADMIN FUN GAMES LOAD ERROR:", error);
      setFunGamesError(error.message);
      setIsLoadingFunGames(false);
      return;
    }

    setFunGames(data || []);
    setIsLoadingFunGames(false);
  }

  async function loadLeagueGames() {
    setIsLoadingLeagueGames(true);
    setLeagueGamesError(null);

    const { data, error } = await supabase
      .from("games")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("ADMIN LEAGUE GAMES LOAD ERROR:", error);
      setLeagueGamesError(error.message);
      setIsLoadingLeagueGames(false);
      return;
    }

    setLeagueGames(data || []);
    setIsLoadingLeagueGames(false);
  }

  const loadAccessRequests = useCallback(async () => {
    if (!adminSessionToken) {
      setAccessRequests([]);
      setAccessRequestsError("Chybí aktivní admin session.");
      return;
    }

    setIsLoadingAccessRequests(true);
    setAccessRequestsError(null);

    try {
      const requests = await listPlayerAccessRequests(adminSessionToken);
      setAccessRequests(requests);
    } catch (error) {
      console.error("ADMIN ACCESS REQUESTS LOAD ERROR:", error);
      setAccessRequestsError(resolveUnknownErrorMessage(error, "Nepodařilo se načíst žádosti."));
    } finally {
      setIsLoadingAccessRequests(false);
    }
  }, [adminSessionToken]);

  const toggleSecretVisibility = (key: string) => {
    setVisibleSecretByKey((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleAccessRequestAction = async (
    requestId: string,
    action: "approve" | "reject",
  ) => {
    if (!adminSessionToken) {
      return;
    }

    setProcessingAccessRequestId(requestId);

    try {
      const request = accessRequests.find((item) => item.id === requestId);

      await processPlayerAccessRequest(adminSessionToken, requestId, action);

      if (request) {
        try {
          const response = await fetch("/api/admin/access-requests/notify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              adminSessionToken,
              action,
              request: {
                requestType: request.requestType,
                playerId: request.playerId,
                playerName: request.playerName,
                email: request.email,
              },
            }),
          });

          if (!response.ok) {
            const payload = (await response.json().catch(() => null)) as { error?: string } | null;
            throw new Error(payload?.error || "Nepodařilo se odeslat notifikační e-mail.");
          }
        } catch (notifyError) {
          console.error("ADMIN ACCESS REQUEST EMAIL ERROR:", notifyError);
          alert(
            `Žádost byla zpracována, ale e-mail se nepodařilo odeslat automaticky. ${resolveUnknownErrorMessage(
              notifyError,
              "",
            )}`.trim(),
          );
          openAccessRequestEmail({
            ...request,
            status: action === "approve" ? "approved" : "rejected",
          });
        }
      }

      await Promise.all([
        loadAccessRequests(),
        onPlayersReload(),
        onAccessRequestsChanged(),
      ]);
    } catch (error) {
      console.error("ADMIN ACCESS REQUEST PROCESS ERROR:", error);
      alert(resolveUnknownErrorMessage(error, "Nepodařilo se zpracovat žádost."));
    } finally {
      setProcessingAccessRequestId(null);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void Promise.all([loadFunGames(), loadLeagueGames(), loadAccessRequests()]);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isOpen, adminSessionToken, loadAccessRequests]);

  const handleClose = () => {
    setActiveTab("players");
    onClose();
  };

  const playerNameById = useMemo(() => {
    const names = new Map<string, string>();

    players.forEach((player) => {
      names.set(player.id, player.name);
    });

    return names;
  }, [players]);

  const resolvePlayerDisplayName = (
    playerId?: string,
    fallbackName?: string,
  ) => {
    if (playerId && playerNameById.has(playerId)) {
      return playerNameById.get(playerId) || playerId;
    }

    if (fallbackName && fallbackName.trim().length > 0) {
      return fallbackName;
    }

    return playerId || fallbackName || "Bez jména";
  };

  const getWinnerName = (game: ManagedGame) => {
    const winnerScoreEntry = Array.isArray(game.scores)
      ? game.scores.find((score) => score.playerId === game.winner)
      : undefined;

    return resolvePlayerDisplayName(game.winner, winnerScoreEntry?.playerName);
  };

  const getPlayedAt = (game: ManagedGame) => {
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

  const getPlayerSummary = (game: ManagedGame) => {
    if (Array.isArray(game.scores) && game.scores.length > 0) {
      return game.scores
        .map(
          (score) =>
            resolvePlayerDisplayName(score.playerId, score.playerName),
        )
        .join(" vs ");
    }

    if (!Array.isArray(game.players) || game.players.length === 0) {
      return "Bez hráčů";
    }

    return game.players
      .map((playerId) => resolvePlayerDisplayName(playerId))
      .join(" vs ");
  };

  const openAccessRequestEmail = (request: PlayerAccessRequest) => {
    if (typeof window === "undefined") {
      return;
    }

    const requestLabel = request.requestType === "registration" ? "registraci" : "reset hesla";
    const statusLabel =
      request.status === "approved"
        ? "schválena"
        : request.status === "rejected"
          ? "zamítnuta"
          : "přijata";

    const subject = `Hero Dice: žádost o ${requestLabel}`;
    const body = [
      "Dobrý den,",
      "",
      `vaše žádost o ${requestLabel} pro ID hráče ${request.playerId} byla ${statusLabel}.`,
      request.status === "approved"
        ? "Můžete se přihlásit do aplikace s nově nastavenými údaji."
        : request.status === "rejected"
          ? "Pokud potřebujete pomoc, odpovězte prosím na tento e-mail."
          : "Admin ji brzy zpracuje. O výsledku vás budeme informovat.",
      "",
      "S pozdravem",
      "Hero Dice Admin",
    ].join("\n");

    const mailtoUrl = `mailto:${request.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  };

  const getSortedScores = (game: ManagedGame) => {
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

  const requestDeleteGame = (target: DeleteTarget) => {
    setDeleteError(null);
    setDeleteTarget(target);
  };

  const handleDeleteGame = async () => {
    if (!deleteTarget) {
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    const { error } = await supabase
      .from(deleteTarget.table)
      .delete()
      .eq("id", deleteTarget.id);

    if (error) {
      console.error("ADMIN GAME DELETE ERROR:", error);
      setDeleteError(error.message);
      setIsDeleting(false);
      return;
    }

    if (deleteTarget.table === "fun_games") {
      setFunGames((prev) => prev.filter((game) => game.id !== deleteTarget.id));
    } else {
      setLeagueGames((prev) => prev.filter((game) => game.id !== deleteTarget.id));
      await onLeagueGamesChanged();
    }

    setDeleteTarget(null);
    setIsDeleting(false);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
        <div className="w-full max-w-6xl rounded-3xl border border-zinc-700 bg-zinc-950 p-8 text-white shadow-2xl">
          <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-4xl font-black text-yellow-400">Admin</h2>
              <p className="mt-2 text-sm text-zinc-400">
                Správa hráčů a dokončených her.
              </p>
            </div>

            <button
              onClick={handleClose}
              className="rounded-xl border border-zinc-600 bg-zinc-700 px-4 py-2 font-bold text-white transition hover:scale-[1.02] hover:brightness-110"
            >
              Zavřít
            </button>
          </div>

          <div className="mb-6 flex flex-wrap gap-3">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-xl px-5 py-3 font-black transition hover:scale-[1.02] hover:brightness-110 ${
                  activeTab === tab.id
                    ? "bg-yellow-500 text-black"
                    : "border border-zinc-700 bg-black/40 text-zinc-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="max-h-[70vh] overflow-y-auto pr-2">
            {activeTab === "players" && (
              <div className="space-y-4">
                {players.map((player) => (
                  <div
                    key={player.id}
                    className="rounded-2xl border border-zinc-700 bg-black/40 p-5"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <input
                          type="text"
                          value={player.name}
                          onChange={(e) => {
                            const updatedPlayers = players.map((currentPlayer) =>
                              currentPlayer.id === player.id
                                ? {
                                    ...currentPlayer,
                                    name: e.target.value,
                                  }
                                : currentPlayer,
                            );

                            setPlayers(updatedPlayers);
                          }}
                        />

                        <div className="mt-1 text-sm text-zinc-500">ID: {player.id}</div>

                        <div className="mt-1 text-sm text-zinc-400">
                          Session: {playerSessionActivityById[player.id] ? "Aktivní" : "Neaktivní"}
                        </div>

                        <div className="mt-1 text-sm text-zinc-400">
                          Role: {(roleDraftByPlayerId[player.id] || player.role) === "admin" ? "Admin" : "Player"}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 lg:justify-end">
                        <button
                          onClick={() => {
                            onSavePlayer(player.id, {
                              name: player.name,
                            });
                          }}
                          className="min-w-[118px] rounded-xl border border-zinc-600 bg-green-600 px-4 py-2 text-sm font-bold text-white transition hover:scale-[1.02] hover:brightness-110"
                        >
                          Uložit
                        </button>

                        <button
                          onClick={() => onRequestDeletePlayer(player.id)}
                          className="min-w-[118px] rounded-xl border border-zinc-600 bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:scale-[1.02] hover:brightness-110"
                        >
                          Smazat
                        </button>

                        <button
                          onClick={async () => {
                            if (!playerSessionActivityById[player.id]) {
                              return;
                            }

                            setRevokePlayerId(player.id);

                            try {
                              await onRevokePlayerSessions(player.id);
                            } finally {
                              setRevokePlayerId(null);
                            }
                          }}
                          disabled={
                            !playerSessionActivityById[player.id] ||
                            revokePlayerId === player.id
                          }
                          className="min-w-[118px] rounded-xl border border-zinc-600 bg-amber-600 px-4 py-2 text-sm font-bold text-white transition hover:scale-[1.02] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
                        >
                          {revokePlayerId === player.id
                            ? "Odhlašuji..."
                            : "Odhlásit"}
                        </button>

                        <button
                          onClick={() => {
                            const updatedPlayers = players.map((currentPlayer) =>
                              currentPlayer.id === player.id
                                ? {
                                    ...currentPlayer,
                                    active: !currentPlayer.active,
                                  }
                                : currentPlayer,
                            );

                            setPlayers(updatedPlayers);

                            onSavePlayer(player.id, {
                              active: !player.active,
                            });

                            localStorage.setItem(
                              "heroDicePlayers",
                              JSON.stringify(updatedPlayers),
                            );
                          }}
                          className={`min-w-[118px] rounded-xl border border-zinc-600 px-4 py-2 text-sm font-bold text-white transition hover:scale-[1.02] hover:brightness-110 ${
                            player.active
                              ? "bg-green-600"
                              : "bg-red-600"
                          }`}
                        >
                          {player.active ? "Aktivní" : "Neaktivní"}
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-2 lg:grid-cols-[1fr_1fr_180px_auto]">
                      <div className="relative">
                        <input
                          type={visibleSecretByKey[`password-${player.id}`] ? "text" : "password"}
                          value={passwordDraftByPlayerId[player.id] || ""}
                          onChange={(event) => {
                            const nextPassword = event.target.value;

                            setPasswordDraftByPlayerId((prev) => ({
                              ...prev,
                              [player.id]: nextPassword,
                            }));
                          }}
                          placeholder="Nové heslo"
                          className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 pr-12 text-sm font-bold text-white outline-none transition focus:border-yellow-400"
                        />

                        <button
                          type="button"
                          onClick={() => toggleSecretVisibility(`password-${player.id}`)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-black text-zinc-400 transition hover:text-white"
                        >
                          👁
                        </button>
                      </div>

                      <div className="relative">
                        <input
                          type={visibleSecretByKey[`password-confirm-${player.id}`] ? "text" : "password"}
                          value={passwordConfirmDraftByPlayerId[player.id] || ""}
                          onChange={(event) => {
                            const nextPasswordConfirm = event.target.value;

                            setPasswordConfirmDraftByPlayerId((prev) => ({
                              ...prev,
                              [player.id]: nextPasswordConfirm,
                            }));
                          }}
                          placeholder="Potvrzení hesla"
                          className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 pr-12 text-sm font-bold text-white outline-none transition focus:border-yellow-400"
                        />

                        <button
                          type="button"
                          onClick={() => toggleSecretVisibility(`password-confirm-${player.id}`)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-black text-zinc-400 transition hover:text-white"
                        >
                          👁
                        </button>
                      </div>

                      <select
                        value={roleDraftByPlayerId[player.id] || player.role}
                        onChange={(event) => {
                          const nextRole: Player["role"] =
                            event.target.value === "admin" ? "admin" : "player";

                          setRoleDraftByPlayerId((prev) => ({
                            ...prev,
                            [player.id]: nextRole,
                          }));
                        }}
                        className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm font-bold text-white outline-none transition focus:border-yellow-400"
                      >
                        <option value="player">Player</option>
                        <option value="admin">Admin</option>
                      </select>

                      <button
                        onClick={async () => {
                          const password = passwordDraftByPlayerId[player.id] || "";
                          const passwordConfirm =
                            passwordConfirmDraftByPlayerId[player.id] || "";
                          const nextRole = roleDraftByPlayerId[player.id] || player.role;
                          const roleChanged = nextRole !== player.role;
                          const hasPasswordChange = Boolean(password || passwordConfirm);

                          if (!hasPasswordChange && !roleChanged) {
                            alert("Nejsou žádné změny k uložení.");

                            return;
                          }

                          setSavingPasswordForPlayerId(player.id);

                          try {
                            if (roleChanged) {
                              await onSavePlayer(player.id, {
                                role: nextRole,
                              });

                              setPlayers((prev) =>
                                prev.map((currentPlayer) =>
                                  currentPlayer.id === player.id
                                    ? {
                                        ...currentPlayer,
                                        role: nextRole,
                                      }
                                    : currentPlayer,
                                ),
                              );

                              setRoleDraftByPlayerId((prev) => {
                                const next = { ...prev };

                                delete next[player.id];

                                return next;
                              });
                            }

                            if (hasPasswordChange) {
                              await onSetPlayerPassword(
                                player.id,
                                password,
                                passwordConfirm,
                              );

                              setPasswordDraftByPlayerId((prev) => ({
                                ...prev,
                                [player.id]: "",
                              }));

                              setPasswordConfirmDraftByPlayerId((prev) => ({
                                ...prev,
                                [player.id]: "",
                              }));
                            }

                            if (roleChanged && !hasPasswordChange) {
                              alert("Role byla uložena.");
                            }
                          } finally {
                            setSavingPasswordForPlayerId(null);
                          }
                        }}
                        disabled={savingPasswordForPlayerId === player.id}
                        className="min-w-[118px] rounded-xl border border-zinc-600 bg-purple-600 px-4 py-2 text-sm font-bold text-white transition hover:scale-[1.02] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
                      >
                        {savingPasswordForPlayerId === player.id
                          ? "Ukládám..."
                          : "Uložit heslo/roli"}
                      </button>
                    </div>

                    <div className="mt-2 text-xs text-zinc-500">
                      Nech prázdné, pokud nechceš heslo měnit.
                    </div>
                  </div>
                ))}

                <div className="mt-6 rounded-2xl border border-zinc-700 bg-black/40 p-5">
                  <div className="mb-4 text-xl font-black text-yellow-400">Přidat hráče</div>

                  <div className="flex flex-col gap-3">
                    <input
                      type="text"
                      placeholder="Player ID"
                      value={newPlayerId}
                      onChange={(e) => setNewPlayerId(e.target.value)}
                      className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-yellow-400"
                    />

                    <div className="relative">
                      <input
                        type={visibleSecretByKey["new-player-password"] ? "text" : "password"}
                        placeholder="Heslo hráče"
                        value={newPlayerPassword}
                        onChange={(e) => setNewPlayerPassword(e.target.value)}
                        className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 pr-12 text-white outline-none transition focus:border-yellow-400"
                      />

                      <button
                        type="button"
                        onClick={() => toggleSecretVisibility("new-player-password")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-black text-zinc-400 transition hover:text-white"
                      >
                        👁
                      </button>
                    </div>

                    <div className="relative">
                      <input
                        type={visibleSecretByKey["new-player-password-confirm"] ? "text" : "password"}
                        placeholder="Potvrzení hesla"
                        value={newPlayerPasswordConfirm}
                        onChange={(e) => setNewPlayerPasswordConfirm(e.target.value)}
                        className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 pr-12 text-white outline-none transition focus:border-yellow-400"
                      />

                      <button
                        type="button"
                        onClick={() => toggleSecretVisibility("new-player-password-confirm")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-black text-zinc-400 transition hover:text-white"
                      >
                        👁
                      </button>
                    </div>

                    <input
                      type="text"
                      placeholder="Jméno hráče"
                      value={newPlayerName}
                      onChange={(e) => setNewPlayerName(e.target.value)}
                      className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-yellow-400"
                    />

                    <button
                      onClick={onAddPlayer}
                      className="rounded-xl bg-green-600 px-5 py-3 font-black text-white transition hover:scale-[1.02] hover:brightness-110"
                    >
                      Přidat hráče
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "requests" && (
              <div className="space-y-4">
                <div className="rounded-2xl border border-zinc-700 bg-black/40 p-5">
                  <div className="text-xl font-black text-yellow-400">Žádosti o přístup</div>

                  <div className="mt-2 text-sm text-zinc-400">
                    Registrace a požadavky na reset hesla čekající na schválení adminem.
                  </div>
                </div>

                {isLoadingAccessRequests && (
                  <div className="rounded-2xl border border-zinc-700 bg-black/40 p-5 text-sm text-zinc-400">
                    Načítám žádosti...
                  </div>
                )}

                {accessRequestsError && (
                  <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-5 text-sm text-red-300">
                    {accessRequestsError}
                  </div>
                )}

                {!isLoadingAccessRequests && !accessRequestsError && accessRequests.length === 0 && (
                  <div className="rounded-2xl border border-zinc-700 bg-black/40 p-5 text-sm text-zinc-400">
                    Nejsou evidovány žádné žádosti.
                  </div>
                )}

                {!isLoadingAccessRequests &&
                  !accessRequestsError &&
                  accessRequests.map((request) => {
                    const isPending = request.status === "pending";
                    const statusClassName =
                      request.status === "approved"
                        ? "bg-green-600 text-white"
                        : request.status === "rejected"
                          ? "bg-red-600 text-white"
                          : "bg-yellow-500 text-black";

                    return (
                      <div
                        key={request.id}
                        className="rounded-2xl border border-zinc-700 bg-black/40 p-5"
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-3">
                              <div className="text-lg font-black text-white">
                                {request.requestType === "registration"
                                  ? "Nová registrace"
                                  : "Reset hesla"}
                              </div>

                              <span className={`rounded-full px-3 py-1 text-xs font-black ${statusClassName}`}>
                                {request.status === "approved"
                                  ? "Schváleno"
                                  : request.status === "rejected"
                                    ? "Zamítnuto"
                                    : "Čeká"}
                              </span>
                            </div>

                            <div className="mt-2 text-sm text-zinc-300">
                              ID hráče: <span className="font-bold text-white">{request.playerId}</span>
                            </div>

                            {request.playerName && (
                              <div className="mt-1 text-sm text-zinc-300">
                                Jméno hráče: <span className="font-bold text-white">{request.playerName}</span>
                              </div>
                            )}

                            <div className="mt-1 text-sm text-zinc-300">
                              E-mail: <span className="font-bold text-white">{request.email}</span>
                            </div>

                            <div className="mt-1 text-sm text-zinc-500">
                              Vytvořeno: {new Date(request.createdAt).toLocaleString("cs-CZ")}
                            </div>

                            {request.reviewedAt && (
                              <div className="mt-1 text-sm text-zinc-500">
                                Zpracováno: {new Date(request.reviewedAt).toLocaleString("cs-CZ")}
                              </div>
                            )}

                            <div className="mt-3">
                              <button
                                onClick={() => openAccessRequestEmail(request)}
                                className="rounded-xl border border-zinc-600 bg-zinc-800 px-3 py-2 text-xs font-bold text-zinc-100 transition hover:scale-[1.02] hover:bg-zinc-700"
                              >
                                Odeslat e-mail žadateli
                              </button>
                            </div>
                          </div>

                          {isPending && (
                            <div className="flex flex-wrap gap-2 lg:justify-end">
                              <button
                                onClick={() => {
                                  void handleAccessRequestAction(request.id, "approve");
                                }}
                                disabled={processingAccessRequestId === request.id}
                                className="min-w-[118px] rounded-xl border border-zinc-600 bg-green-600 px-4 py-2 text-sm font-bold text-white transition hover:scale-[1.02] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {processingAccessRequestId === request.id ? "Ukládám..." : "Schválit"}
                              </button>

                              <button
                                onClick={() => {
                                  void handleAccessRequestAction(request.id, "reject");
                                }}
                                disabled={processingAccessRequestId === request.id}
                                className="min-w-[118px] rounded-xl border border-zinc-600 bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:scale-[1.02] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                Zamítnout
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}

            {activeTab === "fun-games" && (
              <GamesPanel
                title="Fun Game historie"
                loading={isLoadingFunGames}
                error={funGamesError}
                games={funGames}
                emptyMessage="Žádné dokončené Fun hry."
                getPlayedAt={getPlayedAt}
                getWinnerName={getWinnerName}
                getPlayerSummary={getPlayerSummary}
                getSortedScores={getSortedScores}
                resolvePlayerDisplayName={resolvePlayerDisplayName}
                showFunSettings
                onDelete={(game) =>
                  requestDeleteGame({
                    id: game.id,
                    table: "fun_games",
                    tab: "fun-games",
                    winner: getWinnerName(game),
                  })
                }
              />
            )}

            {activeTab === "league-games" && (
              <GamesPanel
                title="Liga Game historie"
                loading={isLoadingLeagueGames}
                error={leagueGamesError}
                games={leagueGames}
                emptyMessage="Žádné dokončené Liga hry."
                getPlayedAt={getPlayedAt}
                getWinnerName={getWinnerName}
                getPlayerSummary={getPlayerSummary}
                getSortedScores={getSortedScores}
                resolvePlayerDisplayName={resolvePlayerDisplayName}
                onDelete={(game) =>
                  requestDeleteGame({
                    id: game.id,
                    table: "games",
                    tab: "league-games",
                    winner: getWinnerName(game),
                  })
                }
              />
            )}
          </div>
        </div>
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 p-4">
          <div className="w-full max-w-[520px] rounded-3xl bg-zinc-900 p-8 text-center text-white shadow-2xl">
            <h2 className="mb-5 text-3xl font-black text-red-500">Smazat hru?</h2>

            <p className="mb-4 text-zinc-300">
              Opravdu chceš smazat tuto dokončenou hru?
            </p>

            <p className="mb-2 text-sm text-zinc-400">
              Akce je nevratná a hra bude trvale odstraněna z databáze.
            </p>

            <p className="mb-6 text-sm text-zinc-400">
              Výsledek se přestane započítávat do historie, statistik a leaderboardů.
            </p>

            <div className="mb-8 rounded-2xl border border-zinc-700 bg-black/40 p-4 text-left text-sm text-zinc-300">
              <div>
                <span className="font-bold text-white">Typ:</span>{" "}
                {deleteTarget.tab === "fun-games" ? "Fun Game" : "Liga Game"}
              </div>
              <div className="mt-1">
                <span className="font-bold text-white">Vítěz:</span> {deleteTarget.winner}
              </div>
            </div>

            {deleteError && (
              <div className="mb-6 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-left text-sm text-red-300">
                {deleteError}
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={() => {
                  if (isDeleting) {
                    return;
                  }

                  setDeleteTarget(null);
                  setDeleteError(null);
                }}
                className="flex-1 rounded-2xl border border-zinc-600 bg-zinc-700 px-5 py-4 font-bold text-white transition hover:scale-[1.02] hover:brightness-110"
              >
                Ne
              </button>

              <button
                onClick={() => void handleDeleteGame()}
                disabled={isDeleting}
                className="flex-1 rounded-2xl border border-zinc-600 bg-red-600 px-5 py-4 font-black text-white transition hover:scale-[1.02] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeleting ? "Mažu..." : "Ano, smazat"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function GamesPanel({
  title,
  loading,
  error,
  games,
  emptyMessage,
  getPlayedAt,
  getWinnerName,
  getPlayerSummary,
  getSortedScores,
  resolvePlayerDisplayName,
  showFunSettings,
  onDelete,
}: {
  title: string;
  loading: boolean;
  error: string | null;
  games: ManagedGame[];
  emptyMessage: string;
  getPlayedAt: (game: ManagedGame) => string;
  getWinnerName: (game: ManagedGame) => string;
  getPlayerSummary: (game: ManagedGame) => string;
  getSortedScores: (game: ManagedGame) => {
    playerId: string;
    playerName?: string;
    total: number;
    perfectCategories: number;
  }[];
  resolvePlayerDisplayName: (
    playerId?: string,
    fallbackName?: string,
  ) => string;
  showFunSettings?: boolean;
  onDelete: (game: ManagedGame) => void;
}) {
  const [expandedGameId, setExpandedGameId] = useState<string | null>(null);
  const visibleExpandedGameId = games.some((game) => game.id === expandedGameId)
    ? expandedGameId
    : null;

  if (loading) {
    return (
      <div className="rounded-2xl border border-zinc-700 bg-black/40 p-6 text-zinc-300">
        Načítám hry...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-6 text-red-300">
        Nepodařilo se načíst hry: {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-zinc-700 bg-black/40 p-5">
        <div className="text-2xl font-black text-yellow-400">{title}</div>
        <div className="mt-1 text-sm text-zinc-400">Počet záznamů: {games.length}</div>
      </div>

      {games.length === 0 ? (
        <div className="rounded-2xl border border-zinc-700 bg-black/40 p-6 text-zinc-400">
          {emptyMessage}
        </div>
      ) : (
        games.map((game) => (
          <div
            key={game.id}
            className="rounded-2xl border border-zinc-700 bg-black/40 p-5"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="text-2xl font-black text-white">{getWinnerName(game)}</div>
                <div className="mt-1 text-sm text-zinc-400">{getPlayedAt(game)}</div>

                <div className="mt-3 flex flex-wrap gap-2 text-xs font-black uppercase tracking-[0.16em]">
                  <span className="rounded-full bg-yellow-500/20 px-3 py-1 text-yellow-300">
                    Skóre {game.winner_score ?? 0}
                  </span>

                  {typeof game.roll_count === "number" && (
                    <span className="rounded-full bg-purple-500/20 px-3 py-1 text-purple-300">
                      {game.roll_count} hodů
                    </span>
                  )}

                  {typeof game.rewrite_enabled === "boolean" && (
                    <span className="rounded-full bg-blue-500/20 px-3 py-1 text-blue-300">
                      Přepis {game.rewrite_enabled ? "Ano" : "Ne"}
                    </span>
                  )}

                  {typeof game.bonus_rolls === "number" && (
                    <span className="rounded-full bg-green-500/20 px-3 py-1 text-green-300">
                      Bonus {game.bonus_rolls}
                    </span>
                  )}
                </div>

                <div className="mt-4 text-sm text-zinc-300">{getPlayerSummary(game)}</div>

                {game.game_id && (
                  <div className="mt-2 text-xs text-zinc-500">Game ID: {game.game_id}</div>
                )}
              </div>

              <div className="flex flex-wrap gap-3 lg:justify-end">
                <button
                  onClick={() =>
                    setExpandedGameId((current) =>
                      current === game.id ? null : game.id,
                    )
                  }
                  className="rounded-xl border border-zinc-600 bg-zinc-800 px-5 py-3 font-black text-white transition hover:scale-[1.02] hover:brightness-110"
                >
                  {visibleExpandedGameId === game.id ? "Sbalit" : "Rozbalit"}
                </button>

                <button
                  onClick={() => onDelete(game)}
                  className="rounded-xl bg-red-600 px-5 py-3 font-black text-white transition hover:scale-[1.02] hover:brightness-110"
                >
                  Smazat
                </button>
              </div>
            </div>

            {visibleExpandedGameId === game.id && (
              <div className="mt-5 rounded-2xl border border-zinc-700 bg-zinc-950/70 p-4">
                {showFunSettings && (
                  <div className="mb-5 rounded-xl border border-zinc-700 bg-black/30 p-4">
                    <div className="mb-3 text-sm font-black uppercase tracking-[0.16em] text-zinc-400">
                      Nastavení hry
                    </div>

                    <div className="grid gap-2 text-sm text-zinc-200 md:grid-cols-2 lg:grid-cols-4">
                      <div>Počet hodů: {game.roll_count ?? "Neuvedeno"}</div>

                      <div>
                        Přepis výsledku:{" "}
                        {typeof game.rewrite_enabled === "boolean"
                          ? game.rewrite_enabled
                            ? "zapnutý"
                            : "vypnutý"
                          : "Neuvedeno"}
                      </div>

                      <div>
                        Bonusový režim:{" "}
                        {game.bonus_mode === "all"
                          ? "Všechny kombinace"
                          : game.bonus_mode === "general-only"
                            ? "Pouze Hero"
                            : "Neuvedeno"}
                      </div>

                      <div>Bonusové hody: {game.bonus_rolls ?? "Neuvedeno"}</div>
                    </div>
                  </div>
                )}

                <div className="mb-3 text-sm font-black uppercase tracking-[0.16em] text-zinc-400">
                  Výsledky hráčů
                </div>

                <div className="space-y-3">
                  {(() => {
                    const sortedScores = getSortedScores(game);

                    if (sortedScores.length === 0) {
                      return (
                        <div className="rounded-xl border border-zinc-700 bg-black/30 p-4 text-sm text-zinc-400">
                          Chybí výsledky hráčů.
                        </div>
                      );
                    }

                    return sortedScores.map((score, index) => {
                      const winnerId = game.winner;
                      const topScore = sortedScores[0]?.total ?? 0;
                      const topScoreCount = sortedScores.filter(
                        (entry) => entry.total === topScore,
                      ).length;
                      const isWinner = Boolean(winnerId && score.playerId === winnerId);
                      const isTopScore = score.total === topScore;
                      const isDraw = !winnerId && isTopScore && topScoreCount > 1;

                      return (
                        <div
                          key={`${game.id}-${score.playerId}-${index}`}
                          className={`rounded-xl border p-4 ${
                            isWinner || isTopScore
                              ? "border-yellow-400/50 bg-yellow-500/10"
                              : "border-zinc-700 bg-black/30"
                          }`}
                        >
                          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <div className="text-lg font-black text-white">
                                  #{index + 1} {resolvePlayerDisplayName(score.playerId, score.playerName)}
                                </div>

                                {isWinner && (
                                  <span className="rounded-full bg-yellow-500 px-3 py-1 text-xs font-black text-black">
                                    Vítěz
                                  </span>
                                )}

                                {!isWinner && isDraw && (
                                  <span className="rounded-full bg-zinc-600 px-3 py-1 text-xs font-black text-white">
                                    Remíza
                                  </span>
                                )}
                              </div>

                              <div className="mt-1 text-sm text-zinc-400">
                                ID: {score.playerId}
                              </div>
                            </div>

                            <div className="text-sm text-zinc-300 md:text-right">
                              <div>Celkové skóre: {score.total}</div>

                              <div>Perfektní kategorie: {score.perfectCategories}</div>
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}