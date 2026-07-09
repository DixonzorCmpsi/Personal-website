import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { buildPortfolioChatContext } from "@/lib/portfolioChatContext";

const WINDOW_SECONDS = 60 * 60;
const MAX_TURNS = 10;
const localBuckets = new Map<string, { count: number; resetAt: number }>();

function upstreamChatUrl() {
  return process.env.CHAT_API_URL || process.env.BACKEND_CHAT_URL || "http://127.0.0.1:8001/api/chat";
}

function clientKey(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip =
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-real-ip") ||
    forwardedFor ||
    "unknown-ip";
  const userAgent = request.headers.get("user-agent") || "unknown-agent";

  return crypto.createHash("sha256").update(`${ip}:${userAgent}`).digest("hex");
}

async function redisCommand(args: Array<string | number>) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  const response = await fetch(`${url}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([args]),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Redis command failed: ${response.status}`);
  }

  const [result] = await response.json();
  return result?.result;
}

async function checkRedisLimit(key: string) {
  const bucketKey = `portfolio-chat:${key}`;
  const count = Number(await redisCommand(["INCR", bucketKey]));

  if (count === 1) {
    await redisCommand(["EXPIRE", bucketKey, WINDOW_SECONDS]);
  }

  const ttl = Number(await redisCommand(["TTL", bucketKey]));
  const resetSeconds = Number.isFinite(ttl) && ttl > 0 ? ttl : WINDOW_SECONDS;

  return {
    allowed: count <= MAX_TURNS,
    remaining: Math.max(0, MAX_TURNS - count),
    resetSeconds,
  };
}

function checkLocalLimit(key: string) {
  const now = Date.now();
  const existing = localBuckets.get(key);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + WINDOW_SECONDS * 1000;
    localBuckets.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: MAX_TURNS - 1, resetSeconds: WINDOW_SECONDS };
  }

  existing.count += 1;
  localBuckets.set(key, existing);

  return {
    allowed: existing.count <= MAX_TURNS,
    remaining: Math.max(0, MAX_TURNS - existing.count),
    resetSeconds: Math.ceil((existing.resetAt - now) / 1000),
  };
}

async function checkRateLimit(request: NextRequest) {
  const key = clientKey(request);

  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    return checkRedisLimit(key);
  }

  return checkLocalLimit(key);
}

function rateLimitHeaders(limit: Awaited<ReturnType<typeof checkRateLimit>>) {
  return {
    "X-RateLimit-Limit": String(MAX_TURNS),
    "X-RateLimit-Remaining": String(limit.remaining),
    "X-RateLimit-Reset": String(limit.resetSeconds),
  };
}

function directModelConfig() {
  if (process.env.OLLAMA_CLOUD_API_KEY) {
    return {
      apiKey: process.env.OLLAMA_CLOUD_API_KEY,
      baseUrl: process.env.OLLAMA_CLOUD_URL || "https://ollama.com",
      model: process.env.OLLAMA_CLOUD_MODEL || process.env.OLLAMA_MODEL || "gpt-oss:120b",
      label: "ollama-cloud",
    };
  }

  if (process.env.OPENAI_API_KEY) {
    return {
      apiKey: process.env.OPENAI_API_KEY,
      baseUrl: process.env.OPENAI_BASE_URL || "https://api.openai.com",
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      label: "openai-compatible",
    };
  }

  return null;
}

async function callDirectModel(message: string, systemPrompt: string) {
  const config = directModelConfig();
  if (!config) return null;

  const response = await fetch(`${config.baseUrl.replace(/\/$/, "")}/v1/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      max_tokens: 650,
      temperature: 0.35,
    }),
    cache: "no-store",
  });

  const payload = await response.json().catch(() => ({}));
  const content = payload?.choices?.[0]?.message?.content;

  if (!response.ok || typeof content !== "string" || !content.trim()) {
    throw new Error(payload?.error?.message || `Direct model failed with status ${response.status}`);
  }

  return {
    response: content.trim(),
    model: `${config.label}:${config.model}`,
  };
}

function looksLikeCannedBackendResponse(payload: Record<string, unknown>) {
  if (typeof payload.model === "string") return false;
  const response = typeof payload.response === "string" ? payload.response : "";
  return [
    "VS Code-themed portfolio website",
    "Great question! Dixon is a Computer Science graduate from Penn State",
    "What would you like to know?",
    "Check out his GitHub to see more!",
  ].some((marker) => response.includes(marker));
}

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const message = typeof (body as { message?: unknown }).message === "string" ? (body as { message: string }).message.trim() : "";
  const pageContext =
    typeof (body as { pageContext?: unknown }).pageContext === "string"
      ? (body as { pageContext: string }).pageContext.trim().slice(0, 1200)
      : "";
  const conversationContext =
    typeof (body as { conversationContext?: unknown }).conversationContext === "string"
      ? (body as { conversationContext: string }).conversationContext.trim().slice(0, 2200)
      : "";

  if (!message) {
    return NextResponse.json({ error: "Message is required." }, { status: 400 });
  }

  if (message.length > 1600) {
    return NextResponse.json({ error: "Message is too long. Keep questions under 1600 characters." }, { status: 413 });
  }

  let limit;
  try {
    limit = await checkRateLimit(request);
  } catch (error) {
    console.error("[Chat API] Rate limiter failed closed:", error);
    return NextResponse.json(
      { error: "Chat is temporarily unavailable. Please try again soon." },
      { status: 503 }
    );
  }

  if (!limit.allowed) {
    return NextResponse.json(
      {
        error: "Hourly question limit reached.",
        response: `You have used the 10-question hourly limit. Try again in ${Math.ceil(limit.resetSeconds / 60)} minute(s).`,
        resetSeconds: limit.resetSeconds,
      },
      {
        status: 429,
        headers: {
          ...rateLimitHeaders(limit),
          "Retry-After": String(limit.resetSeconds),
        },
      }
    );
  }

  const systemPrompt = buildPortfolioChatContext(pageContext, conversationContext);

  try {
    const directPayload = await callDirectModel(message, systemPrompt);
    if (directPayload) {
      return NextResponse.json(directPayload, { headers: rateLimitHeaders(limit) });
    }
  } catch (error) {
    console.error("[Chat API] Direct model failed:", error);
  }

  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (process.env.CHAT_PROXY_SECRET) {
      headers["X-Chat-Proxy-Secret"] = process.env.CHAT_PROXY_SECRET;
    }

    const upstreamResponse = await fetch(upstreamChatUrl(), {
      method: "POST",
      headers,
      body: JSON.stringify({
        message,
        project_context: systemPrompt,
        system_prompt: systemPrompt,
        context: systemPrompt,
      }),
      cache: "no-store",
    });

    const payload = await upstreamResponse.json().catch(() => ({})) as Record<string, unknown>;

    if (!upstreamResponse.ok) {
      return NextResponse.json(
        { response: payload.response || payload.error || "The model endpoint returned an error." },
        { status: upstreamResponse.status, headers: rateLimitHeaders(limit) }
      );
    }

    if (looksLikeCannedBackendResponse(payload)) {
      return NextResponse.json(
        {
          error: "Model backend is returning canned fallback responses.",
          response: "The live model is not connected yet, so I am not going to show a prebuilt answer. Start the model-backed chat service or set an OpenAI-compatible model env var for this route.",
        },
        { status: 502, headers: rateLimitHeaders(limit) }
      );
    }

    return NextResponse.json(payload, { headers: rateLimitHeaders(limit) });
  } catch (error) {
    console.error("[Chat API] Upstream chat failed:", error);
    return NextResponse.json(
      { response: "The model endpoint is offline right now. Please try again later." },
      { status: 502, headers: rateLimitHeaders(limit) }
    );
  }
}
