import { supabase } from "./supabase";

export type AppRole = "admin" | "player";

export type AuthSession = {
  playerId: string;
  playerName: string;
  role: AppRole;
  sessionToken: string;
  deviceId: string;
};

export type PlayerAccessRequestType = "registration" | "password_reset";

export type PlayerAccessRequestStatus = "pending" | "approved" | "rejected";

export type PlayerAccessRequest = {
  id: string;
  requestType: PlayerAccessRequestType;
  playerId: string;
  playerName: string | null;
  email: string;
  status: PlayerAccessRequestStatus;
  createdAt: string;
  reviewedAt: string | null;
  reviewedByPlayerId: string | null;
};

type VerifyLoginRow = {
  session_token: string;
  player_id: string;
  player_name: string;
  role: AppRole;
};

type HeartbeatRow = {
  status: "active" | "revoked" | "ended" | "invalid";
  player_id: string | null;
  role: AppRole | null;
};

type PlayerActivityRow = {
  player_id: string;
  is_online: boolean;
  last_seen_at: string | null;
  active_sessions: number;
};

type PlayerAccessRequestRow = {
  id: string;
  request_type: PlayerAccessRequestType;
  player_id: string;
  player_name: string | null;
  email: string;
  status: PlayerAccessRequestStatus;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by_player_id: string | null;
};

export const AUTH_SESSION_STORAGE_KEY = "heroDiceAuthSession";
const DEVICE_ID_STORAGE_KEY = "heroDiceDeviceId";

export const SESSION_TTL_SECONDS = 120;
export const HEARTBEAT_INTERVAL_MS = 30_000;

export const getOrCreateDeviceId = () => {
  if (typeof window === "undefined") {
    return "";
  }

  const existing = localStorage.getItem(DEVICE_ID_STORAGE_KEY);

  if (existing && existing.trim().length > 0) {
    return existing;
  }

  const next = crypto.randomUUID();

  localStorage.setItem(DEVICE_ID_STORAGE_KEY, next);

  return next;
};

export const verifyLogin = async (
  playerId: string,
  password: string,
  deviceId: string,
): Promise<AuthSession | null> => {
  const { data, error } = await supabase.rpc("verify_login", {
    p_player_id: playerId,
    p_password: password,
    p_device_id: deviceId,
  });

  if (error) {
    throw error;
  }

  const row = (Array.isArray(data) ? data[0] : data) as VerifyLoginRow | null;

  if (!row?.session_token || !row?.player_id) {
    return null;
  }

  return {
    playerId: row.player_id,
    playerName: row.player_name,
    role: row.role === "admin" ? "admin" : "player",
    sessionToken: row.session_token,
    deviceId,
  };
};

export const heartbeatSession = async (sessionToken: string) => {
  const { data, error } = await supabase.rpc("heartbeat_session", {
    p_session_token: sessionToken,
  });

  if (error) {
    throw error;
  }

  const row = (Array.isArray(data) ? data[0] : data) as HeartbeatRow | null;

  return {
    status: row?.status ?? "invalid",
    playerId: row?.player_id ?? null,
    role: row?.role ?? null,
  };
};

export const logoutSession = async (sessionToken: string) => {
  const { error } = await supabase.rpc("logout_session", {
    p_session_token: sessionToken,
  });

  if (error) {
    throw error;
  }
};

export const revokePlayerSessions = async (playerId: string) => {
  const { error } = await supabase.rpc("revoke_player_sessions", {
    p_player_id: playerId,
  });

  if (error) {
    throw error;
  }
};

export const setPlayerPassword = async (
  adminSessionToken: string,
  playerId: string,
  newPassword: string,
) => {
  const { data, error } = await supabase.rpc("set_player_password", {
    p_admin_session_token: adminSessionToken,
    p_new_password: newPassword,
    p_player_id: playerId,
  });

  if (error) {
    throw error;
  }

  return Boolean(data);
};

export const fetchPlayerActivity = async (ttlSeconds: number) => {
  const { data, error } = await supabase.rpc("get_player_activity", {
    p_ttl_seconds: ttlSeconds,
  });

  if (error) {
    throw error;
  }

  return ((data as PlayerActivityRow[] | null) ?? []).map((row) => ({
    playerId: row.player_id,
    isOnline: Boolean(row.is_online),
    lastSeenAt: row.last_seen_at,
    activeSessions: Number(row.active_sessions ?? 0),
  }));
};

export const submitPlayerAccessRequest = async (input: {
  requestType: PlayerAccessRequestType;
  playerId: string;
  playerName?: string;
  email: string;
  password: string;
}) => {
  const { data, error } = await supabase.rpc("submit_player_access_request", {
    p_request_type: input.requestType,
    p_player_id: input.playerId,
    p_player_name: input.playerName ?? "",
    p_email: input.email,
    p_password: input.password,
  });

  if (error) {
    throw error;
  }

  return String(data);
};

export const listPlayerAccessRequests = async (adminSessionToken: string) => {
  const { data, error } = await supabase.rpc("list_player_access_requests", {
    p_admin_session_token: adminSessionToken,
  });

  if (error) {
    throw error;
  }

  return ((data as PlayerAccessRequestRow[] | null) ?? []).map((row) => ({
    id: row.id,
    requestType: row.request_type,
    playerId: row.player_id,
    playerName: row.player_name,
    email: row.email,
    status: row.status,
    createdAt: row.created_at,
    reviewedAt: row.reviewed_at,
    reviewedByPlayerId: row.reviewed_by_player_id,
  } satisfies PlayerAccessRequest));
};

export const countPendingPlayerAccessRequests = async (adminSessionToken: string) => {
  const { data, error } = await supabase.rpc("count_pending_player_access_requests", {
    p_admin_session_token: adminSessionToken,
  });

  if (error) {
    throw error;
  }

  return Number(data ?? 0);
};

export const processPlayerAccessRequest = async (
  adminSessionToken: string,
  requestId: string,
  action: "approve" | "reject",
) => {
  const { data, error } = await supabase.rpc("process_player_access_request", {
    p_admin_session_token: adminSessionToken,
    p_request_id: requestId,
    p_action: action,
  });

  if (error) {
    throw error;
  }

  return Boolean(data);
};
