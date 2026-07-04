import { supabase } from "./supabase";

export type GameMessage = {
  id: string;
  game_id: string;
  player_id: string;
  player_name: string;
  message: string;
  created_at: string;
};

type OnlineGameState =
  Record<string, unknown>;

export const createOnlineSession = async (
  hostPlayerId: string,
  gameState: OnlineGameState = {}
) => {
  const { data, error } = await supabase
    .from("online_sessions")
    .insert([
      {
        host_player_id: hostPlayerId,
        game_state: gameState,
        status: "waiting",
      },
    ])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const joinOnlineSession = async (
  sessionId: string
) => {
  const { data, error } = await supabase
    .from("online_sessions")
    .select("*")
    .eq("id", sessionId)
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const findSessionByInviteCode = async (
  inviteCode: string
) => {
  const { data, error } = await supabase
    .from("online_sessions")
    .select("*")
    .eq("game_state->>inviteCode", inviteCode)
    .order("created_at", {
      ascending: false,
    })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
};

export const updateOnlineState = async (
  sessionId: string,
  gameState: OnlineGameState
) => {
  const { error } = await supabase
    .from("online_sessions")
    .update({
      game_state: gameState,
    })
    .eq("id", sessionId);

  if (error) {
    throw error;
  }
};

export const subscribeToSession = (
  sessionId: string,
  onStateChange: (gameState: unknown) => void
) => {
  return supabase
    .channel(`online-session-${sessionId}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "online_sessions",
        filter: `id=eq.${sessionId}`,
      },
      (payload) => {
        const nextState = (
          payload.new as {
            game_state?: unknown;
          }
        ).game_state;

        onStateChange(
          nextState
        );
      }
    )
    .subscribe();
};

export const leaveOnlineSession = (
  channel: ReturnType<typeof supabase.channel>
) => {
  supabase.removeChannel(channel);
};

export const fetchGameMessages = async (
  sessionId: string
) => {
  const { data, error } = await supabase
    .from("game_messages")
    .select("*")
    .eq("game_id", sessionId)
    .order("created_at", {
      ascending: true,
    });

  if (error) {
    throw error;
  }

  return (data ?? []) as GameMessage[];
};

export const sendGameMessage = async (
  payload: {
    gameId: string;
    playerId: string;
    playerName: string;
    message: string;
  }
) => {
  const { error } = await supabase
    .from("game_messages")
    .insert([
      {
        game_id: payload.gameId,
        player_id: payload.playerId,
        player_name: payload.playerName,
        message: payload.message,
      },
    ]);

  if (error) {
    console.error(
      "SUPABASE INSERT game_messages ERROR:",
      {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      }
    );

    throw error;
  }
};

export const subscribeToGameMessages = (
  sessionId: string,
  onMessage: (message: GameMessage) => void
) => {
  return supabase
    .channel(
      `online-messages-${sessionId}-${Math.random()
        .toString(36)
        .slice(2)}`
    )
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "game_messages",
        filter: `game_id=eq.${sessionId}`,
      },
      (payload) => {
        onMessage(payload.new as GameMessage);
      }
    )
    .subscribe();
};
