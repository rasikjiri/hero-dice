import { supabase } from "./supabase";

export const createOnlineSession = async (
  hostPlayerId: string,
  gameState: any = {}
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

export const updateOnlineState = async (
  sessionId: string,
  gameState: any
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
  onStateChange: (gameState: any) => void
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
        onStateChange(
          (payload.new as any).game_state
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