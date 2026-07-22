import { NextResponse } from "next/server";

type NotifyAutoPasswordResetBody = {
  requestId?: string;
  playerId?: string;
  playerName?: string;
  email?: string;
};

const buildEmailText = (input: {
  playerId: string;
  playerName: string;
}) => {
  return [
    "Ahoj,",
    "",
    `Heslo hráče ${input.playerName} (ID: ${input.playerId}) bylo resetováno automaticky.`,
    "Do Hero Dice se teď můžeš přihlásit s nově nastaveným heslem.",
    "",
    "S pozdravem",
    "Hero Dice Admin",
  ].join("\n");
};

export async function POST(request: Request) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const resendFromEmail = process.env.RESEND_FROM_EMAIL || "Hero Dice <onboarding@resend.dev>";

  const body = (await request.json().catch(() => null)) as NotifyAutoPasswordResetBody | null;

  const playerId = body?.playerId?.trim().toLowerCase();
  const playerName = body?.playerName?.trim() || "Hráč";
  const toEmail = body?.email?.trim().toLowerCase();

  if (!playerId || !toEmail) {
    return NextResponse.json({ error: "Chybí data žadatele." }, { status: 400 });
  }

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(toEmail)) {
    return NextResponse.json({ error: "Neplatný e-mail příjemce." }, { status: 400 });
  }

  if (!resendApiKey) {
    return NextResponse.json({
      ok: true,
      emailSent: false,
      reason: "Chybí RESEND_API_KEY v prostředí serveru.",
    });
  }

  const subject = "Hero Dice: reset hesla byl proveden";
  const text = buildEmailText({
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
      tags: [
        { name: "feature", value: "auto-password-reset" },
        { name: "request_id", value: body?.requestId || "unknown" },
      ],
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
