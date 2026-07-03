"use client";

import { useEffect, useMemo, useState } from "react";

import { supabase } from "../lib/supabase";

type Player = {
  id: string;
  name: string;
  active: boolean;
};

type ManagedGame = {
  id: string;
  created_at?: string;
  date?: string;
  winner: string;
  winner_score: number;
  players?: string[];
  scores?: {
    playerId: string;
    total: number;
    perfectCategories: number;
  }[];
  roll_count?: number;
  rewrite_enabled?: boolean;
  bonus_mode?: string;
  bonus_rolls?: number;
  game_id?: string | null;
};

type AdminTab = "players" | "fun-games" | "league-games";

type DeleteTarget = {
  id: string;
  table: "fun_games" | "games";
  tab: Exclude<AdminTab, "players">;
  winner: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  players: Player[];
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  newPlayerId: string;
  setNewPlayerId: React.Dispatch<React.SetStateAction<string>>;
  newPlayerName: string;
  setNewPlayerName: React.Dispatch<React.SetStateAction<string>>;
  onAddPlayer: () => void;
  onSavePlayer: (playerId: string, updates: { name?: string; active?: boolean }) => void;
  onRequestDeletePlayer: (playerId: string) => void;
  onLeagueGamesChanged: () => Promise<void>;
};

const tabs: { id: AdminTab; label: string }[] = [
  { id: "players", label: "Hráči" },
  { id: "fun-games", label: "Fun Game" },
  { id: "league-games", label: "Liga Game" },
];

export default function AdminModal({
  isOpen,
  onClose,
  players,
  setPlayers,
  newPlayerId,
  setNewPlayerId,
  newPlayerName,
  setNewPlayerName,
  onAddPlayer,
  onSavePlayer,
  onRequestDeletePlayer,
  onLeagueGamesChanged,
}: Props) {
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

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void Promise.all([loadFunGames(), loadLeagueGames()]);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isOpen]);

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

  const getWinnerName = (winnerId: string) => {
    return playerNameById.get(winnerId) || winnerId;
  };

  const getPlayedAt = (game: ManagedGame) => {
    const rawDate = game.created_at || game.date;

    if (!rawDate) {
      return "Bez data";
    }

    return new Date(rawDate).toLocaleString("cs-CZ");
  };

  const getPlayerSummary = (game: ManagedGame) => {
    if (!Array.isArray(game.players) || game.players.length === 0) {
      return "Bez hráčů";
    }

    return game.players
      .map((playerId) => playerNameById.get(playerId) || playerId)
      .join(" vs ");
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
                    className="flex items-center justify-between rounded-2xl border border-zinc-700 bg-black/40 p-5"
                  >
                    <div>
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
                        className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-2xl font-black text-white outline-none transition focus:border-yellow-400"
                      />

                      <div className="mt-1 text-sm text-zinc-500">ID: {player.id}</div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          onSavePlayer(player.id, {
                            name: player.name,
                          });
                        }}
                        className="rounded-xl bg-blue-600 px-4 py-2 font-bold text-white transition hover:scale-[1.02] hover:brightness-110"
                      >
                        Uložit
                      </button>

                      <button
                        onClick={() => onRequestDeletePlayer(player.id)}
                        className="rounded-xl bg-red-700 px-4 py-2 font-bold text-white transition hover:scale-[1.02] hover:brightness-110"
                      >
                        Smazat
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
                        className={`rounded-xl px-4 py-2 font-bold transition hover:scale-[1.02] hover:brightness-110 ${
                          player.active ? "bg-green-600" : "bg-red-600"
                        }`}
                      >
                        {player.active ? "Aktivní" : "Neaktivní"}
                      </button>
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
                onDelete={(game) =>
                  requestDeleteGame({
                    id: game.id,
                    table: "fun_games",
                    tab: "fun-games",
                    winner: getWinnerName(game.winner),
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
                onDelete={(game) =>
                  requestDeleteGame({
                    id: game.id,
                    table: "games",
                    tab: "league-games",
                    winner: getWinnerName(game.winner),
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
  onDelete,
}: {
  title: string;
  loading: boolean;
  error: string | null;
  games: ManagedGame[];
  emptyMessage: string;
  getPlayedAt: (game: ManagedGame) => string;
  getWinnerName: (winnerId: string) => string;
  getPlayerSummary: (game: ManagedGame) => string;
  onDelete: (game: ManagedGame) => void;
}) {
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
                <div className="text-2xl font-black text-white">{getWinnerName(game.winner)}</div>
                <div className="mt-1 text-sm text-zinc-400">{getPlayedAt(game)}</div>

                <div className="mt-3 flex flex-wrap gap-2 text-xs font-black uppercase tracking-[0.16em]">
                  <span className="rounded-full bg-yellow-500/20 px-3 py-1 text-yellow-300">
                    Skóre {game.winner_score}
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

              <button
                onClick={() => onDelete(game)}
                className="rounded-xl bg-red-600 px-5 py-3 font-black text-white transition hover:scale-[1.02] hover:brightness-110"
              >
                Smazat
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}