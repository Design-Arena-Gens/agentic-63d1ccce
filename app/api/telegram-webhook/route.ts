import { NextRequest, NextResponse } from "next/server";
import { fetchRealtimeData } from "@/lib/realtime";
import { sendTelegramMessage, TelegramUpdate } from "@/lib/telegram";

const TELEGRAM_WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

function validateSecret(request: NextRequest) {
  if (!TELEGRAM_WEBHOOK_SECRET) {
    return true;
  }

  return request.headers.get("x-telegram-bot-api-secret-token") === TELEGRAM_WEBHOOK_SECRET;
}

function formatReading(update: Awaited<ReturnType<typeof fetchRealtimeData>>["data"][number]) {
  const timestamp = new Date(update.reading_time);
  return [
    `*${escapeMarkdown(update.location)}*`,
    `UV Index: *${update.uv_index.toFixed(1)}*`,
    `Recorded: ${escapeMarkdown(timestamp.toUTCString())}`
  ].join("\n");
}

function escapeMarkdown(input: string) {
  return input.replace(/[_*[\]()~`>#+\-=|{}.!]/g, "\\$&");
}

export async function POST(request: NextRequest) {
  if (!validateSecret(request)) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }

  if (!TELEGRAM_BOT_TOKEN) {
    return NextResponse.json({ error: "Missing TELEGRAM_BOT_TOKEN" }, { status: 500 });
  }

  const update = (await request.json()) as TelegramUpdate;

  const text = update.message?.text?.trim();
  const chatId = update.message?.chat.id;

  if (!text || !chatId) {
    return NextResponse.json({ ok: true });
  }

  try {
    if (text.startsWith("/start")) {
      await sendTelegramMessage(
        chatId,
        [
          "*Welcome to the Cambodia UV Monitor*",
          "Use /uv to retrieve the latest UV readings from the Ministry of Economy and Finance realtime API."
        ].join("\n"),
        TELEGRAM_BOT_TOKEN
      );
    } else if (text.startsWith("/uv")) {
      const payload = await fetchRealtimeData();
      if (!payload.data?.length) {
        await sendTelegramMessage(chatId, "No readings are available right now.", TELEGRAM_BOT_TOKEN);
      } else {
        const topReadings = payload.data.slice(0, 5).map(formatReading).join("\n\n");
        await sendTelegramMessage(chatId, topReadings, TELEGRAM_BOT_TOKEN);
      }
    } else {
      await sendTelegramMessage(
        chatId,
        "Unknown command. Try /uv to fetch the current UV measurements.",
        TELEGRAM_BOT_TOKEN
      );
    }
  } catch (error) {
    await sendTelegramMessage(
      chatId,
      `Could not complete the request: ${escapeMarkdown(error instanceof Error ? error.message : String(error))}`,
      TELEGRAM_BOT_TOKEN
    );
  }

  return NextResponse.json({ ok: true });
}
