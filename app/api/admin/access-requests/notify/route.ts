import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type NotifyAction = "approve" | "reject";

type NotifyRequestBody = {
  adminSessionToken?: string;
  action?: NotifyAction;
  request?: {
    requestType?: "registration" | "password_reset";
    playerId?: string;
    playerName?: string | null;
    email?: string;
  };
};

const resolveRequestLabel = (requestType: "registration" | "password_reset") =>
  requestType === "registration" ? "registraci" : "reset hesla";

const buildEmailText = (input: {
  action: NotifyAction;
  requestType: "registration" | "password_reset";
  playerId: string;
  playerName: string;
}) => {
  const requestLabel = resolveRequestLabel(input.requestType);
  const statusLabel = input.action === "approve" ? "schválena" : "zamítnuta";

  const resultLine =
    input.action === "approve"
      ? "Vaše žádost byla schválena. Můžete se přihlásit do aplikace."
      : "Vaše žádost byla zamítnuta. Pokud potřebujete pomoc, odpovězte prosím na tento e-mail.";

  return [
    "Dobrý den,",
    "",
    `žádost o ${requestLabel} pro hráče ${input.playerName} (${input.playerId}) byla ${statusLabel}.`,
    resultLine,
    "",
    "S pozdravem",
    "Hero Dice Admin",
  ].join("\n");
};

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const resendApiKey = process.env.RESEND_API_KEY;
  const resendFromEmail = process.env.RESEND_FROM_EMAIL;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: "Chybí Supabase konfigurace serveru." }, { status: 500 });
  }

  if (!resendApiKey || !resendFromEmail) {
    return NextResponse.json(
      { error: "Chybí RESEND_API_KEY nebo RESEND_FROM_EMAIL v prostředí serveru." },
      { status: 500 },
    );
  }

  const body = (await request.json().catch(() => null)) as NotifyRequestBody | null;

  const adminSessionToken = body?.adminSessionToken?.trim();
  const action = body?.action;
  const requestType = body?.request?.requestType;
  const playerId = body?.request?.playerId?.trim();
  const playerName = body?.request?.playerName?.trim() || "Hráč";
  const toEmail = body?.request?.email?.trim().toLowerCase();

  if (!adminSessionToken || (action !== "approve" && action !== "reject")) {
    return NextResponse.json({ error: "Neplatný požadavek." }, { status: 400 });
  }

  if (!requestType || (requestType !== "registration" && requestType !== "password_reset")) {
    return NextResponse.json({ error: "Neplatný typ žádosti." }, { status: 400 });
  }

  if (!playerId || !toEmail) {
    return NextResponse.json({ error: "Chybí data žadatele." }, { status: 400 });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Reuse existing RPC guard to validate active admin session token.
  const { error: adminSessionError } = await supabase.rpc("count_pending_player_access_requests", {
    p_admin_session_token: adminSessionToken,
  });

  if (adminSessionError) {
    return NextResponse.json({ error: "Neplatná nebo neaktivní admin session." }, { status: 401 });
  }

  const requestLabel = resolveRequestLabel(requestType);
  const subject =
    action === "approve"
      ? `Hero Dice: žádost o ${requestLabel} schválena`
      : `Hero Dice: žádost o ${requestLabel} zamítnuta`;

  const text = buildEmailText({
    action,
    requestType,
    playerId,
    playerName,
  });

  const html = text.replace(/\n/g, "<br />");

  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: resendFromEmail,
      to: [toEmail],
      subject,
      text,
      html,
    }),
  });

  if (!resendResponse.ok) {
    const errorText = await resendResponse.text();
    return NextResponse.json(
      { error: `Resend API chyba (${resendResponse.status}): ${errorText}` },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
