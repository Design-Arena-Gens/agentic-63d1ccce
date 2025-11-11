# Telegram AQI Bot

A Next.js deployment that exposes a Telegram webhook endpoint which fetches realtime UV data from the Cambodian Ministry of Economy and Finance API.

## Local Development

```bash
npm install
npm run dev
```

Set the environment variables in a `.env.local` file:

```
TELEGRAM_BOT_TOKEN=123
TELEGRAM_WEBHOOK_SECRET=secret
```

## Deployment

```bash
npm run build
vercel deploy --prod --yes --token $VERCEL_TOKEN --name agentic-63d1ccce
```

After deployment, configure the webhook:

```bash
curl -X POST https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook \
  -H "Content-Type: application/json" \
  -d '{"url":"https://agentic-63d1ccce.vercel.app/api/telegram-webhook","secret_token":"'$TELEGRAM_WEBHOOK_SECRET'"}'
```
