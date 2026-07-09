import { NextRequest, NextResponse } from "next/server";

const DEFAULT_TO_EMAIL = "dixonzor@gmail.com";
const MEET_LIMIT = 3;
const WINDOW_MS = 60 * 60 * 1000;

type RateEntry = {
  count: number;
  resetAt: number;
};

const localMeetLimits = new Map<string, RateEntry>();

function getClientKey(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip");
  const userAgent = request.headers.get("user-agent") ?? "unknown";
  return `${forwardedFor || realIp || "local"}:${userAgent}`;
}

function checkLocalRateLimit(key: string) {
  const now = Date.now();
  const existing = localMeetLimits.get(key);

  if (!existing || existing.resetAt <= now) {
    localMeetLimits.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: MEET_LIMIT - 1, resetSeconds: Math.ceil(WINDOW_MS / 1000) };
  }

  if (existing.count >= MEET_LIMIT) {
    return {
      allowed: false,
      remaining: 0,
      resetSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: Math.max(0, MEET_LIMIT - existing.count),
    resetSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
  };
}

function clean(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ").slice(0, maxLength) : "";
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function emailHtml({
  name,
  email,
  topic,
  preferredTime,
  message,
}: {
  name: string;
  email: string;
  topic: string;
  preferredTime: string;
  message: string;
}) {
  const rows = [
    ["Name", escapeHtml(name)],
    ["Email", escapeHtml(email)],
    ["Preferred time", escapeHtml(preferredTime)],
    ["Topic", escapeHtml(topic)],
    ["Message", escapeHtml(message)],
    ["Source", "deetalk.win portfolio"],
  ];

  return `
    <div style="font-family:Inter,Arial,sans-serif;line-height:1.5;color:#18181b">
      <h2 style="margin:0 0 16px">Portfolio scheduling request</h2>
      <p style="margin:0 0 18px;color:#52525b">AutoYou-ready meeting request from Dixon's portfolio.</p>
      <table style="border-collapse:collapse;width:100%;max-width:640px">
        ${rows
          .map(
            ([label, value]) => `
              <tr>
                <td style="border-top:1px solid #e4e4e7;padding:10px 14px 10px 0;font-weight:700;vertical-align:top;width:150px">${label}</td>
                <td style="border-top:1px solid #e4e4e7;padding:10px 0;vertical-align:top">${value || "Not provided"}</td>
              </tr>
            `,
          )
          .join("")}
      </table>
    </div>
  `;
}

function emailText({
  name,
  email,
  topic,
  preferredTime,
  message,
}: {
  name: string;
  email: string;
  topic: string;
  preferredTime: string;
  message: string;
}) {
  return [
    "Portfolio scheduling request",
    "",
    `Name: ${name}`,
    `Email: ${email}`,
    `Preferred time: ${preferredTime}`,
    `Topic: ${topic}`,
    `Message: ${message}`,
    "Source: deetalk.win portfolio",
  ].join("\n");
}

export async function POST(request: NextRequest) {
  const rate = checkLocalRateLimit(getClientKey(request));
  const headers = {
    "x-ratelimit-limit": String(MEET_LIMIT),
    "x-ratelimit-remaining": String(rate.remaining),
    "x-ratelimit-reset": String(rate.resetSeconds),
  };

  if (!rate.allowed) {
    return NextResponse.json({ error: "Too many scheduling requests. Try again later." }, { status: 429, headers });
  }

  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400, headers });
  }

  if (clean(payload.company, 120)) {
    return NextResponse.json({ ok: true }, { headers });
  }

  const name = clean(payload.name, 120);
  const email = clean(payload.email, 160);
  const topic = clean(payload.topic, 160);
  const preferredTime = clean(payload.preferredTime, 180);
  const message = clean(payload.message, 1200);

  if (!name || !email || !preferredTime || !message) {
    return NextResponse.json({ error: "Name, email, preferred time, and message are required." }, { status: 400, headers });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400, headers });
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    return NextResponse.json(
      { error: "Meeting email is not configured yet. Set RESEND_API_KEY on the server." },
      { status: 503, headers },
    );
  }

  const to = process.env.MEET_TO_EMAIL || DEFAULT_TO_EMAIL;
  const from = process.env.MEET_FROM_EMAIL || "Portfolio <onboarding@resend.dev>";
  const subject = `[Portfolio meet] ${name} wants to schedule`;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      reply_to: email,
      subject,
      text: emailText({ name, email, topic, preferredTime, message }),
      html: emailHtml({ name, email, topic, preferredTime, message }),
    }),
  });

  if (!response.ok) {
    return NextResponse.json({ error: "Could not send the scheduling email." }, { status: 502, headers });
  }

  return NextResponse.json({ ok: true }, { headers });
}
