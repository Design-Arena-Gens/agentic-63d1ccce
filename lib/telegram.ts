const TELEGRAM_BASE = "https://api.telegram.org";

export type TelegramUpdate = {
  message?: {
    chat: {
      id: number;
      type: string;
      title?: string;
      username?: string;
    };
    text?: string;
    message_id: number;
    date: number;
    from?: {
      id: number;
      is_bot: boolean;
      first_name?: string;
      username?: string;
      language_code?: string;
    };
  };
};

export async function sendTelegramMessage(chatId: number | string, text: string, token: string) {
  const endpoint = `${TELEGRAM_BASE}/bot${token}/sendMessage`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "MarkdownV2",
      disable_web_page_preview: true
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Telegram sendMessage failed: ${response.status} ${body}`);
  }
}
