"use client";

import { useState } from "react";

type SampleReading = {
  location: string;
  uv_index: number;
  reading_time: string;
};

async function fetchSampleData(): Promise<SampleReading[]> {
  const response = await fetch("/api/sample-data");
  if (!response.ok) {
    throw new Error("Failed to fetch sample data");
  }
  return response.json();
}

export default function Home() {
  const [readings, setReadings] = useState<SampleReading[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const handleLoad = async () => {
    try {
      setPending(true);
      setError(null);
      const data = await fetchSampleData();
      setReadings(data.slice(0, 3));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setPending(false);
    }
  };

  return (
    <main
      style={{
        maxWidth: "960px",
        width: "100%",
        display: "grid",
        gap: "1.5rem"
      }}
    >
      <header>
        <h1 style={{ margin: 0, fontSize: "2.5rem" }}>Telegram AQI Bot</h1>
        <p style={{ marginTop: "1rem", lineHeight: 1.6 }}>
          This bot bridges Telegram with the Cambodian Ministry of Economy and Finance realtime UV API.
          Deploy it to Vercel, set the webhook, and your chat will receive structured air quality updates on demand.
        </p>
      </header>

      <section
        style={{
          backgroundColor: "#1e293b",
          borderRadius: "1rem",
          padding: "1.5rem",
          display: "grid",
          gap: "1rem"
        }}
      >
        <h2 style={{ margin: 0, fontSize: "1.5rem" }}>Setup Checklist</h2>
        <ol style={{ margin: 0, paddingLeft: "1.25rem", lineHeight: 1.6 }}>
          <li>Create a Telegram bot with BotFather and grab the bot token.</li>
          <li>Set `TELEGRAM_BOT_TOKEN` and `TELEGRAM_WEBHOOK_SECRET` as Vercel environment variables.</li>
          <li>
            Optional: set `DEFAULT_CHAT_ID` if you want scheduled pushes via automation (see `README.md` for ideas).
          </li>
          <li>
            Deploy to Vercel then run the webhook command listed below to point Telegram at the hosted endpoint.
          </li>
        </ol>
        <pre
          style={{
            border: "1px solid #334155",
            borderRadius: "0.75rem",
            padding: "1rem",
            fontFamily: "Menlo, Monaco, Consolas, monospace",
            background: "#0f172a",
            margin: 0,
            overflowX: "auto"
          }}
        >
          <code>
            {`curl -X POST https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook \\
  -H "Content-Type: application/json" \\
  -d '{"url":"https://agentic-63d1ccce.vercel.app/api/telegram-webhook","secret_token":"<secret>"}'`}
          </code>
        </pre>
      </section>

      <section
        style={{
          display: "grid",
          gap: "1rem"
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: "1.5rem" }}>Try the Data Feed</h2>
          <p style={{ marginTop: "0.5rem", lineHeight: 1.6 }}>
            Fetch the latest sample readings directly from the API proxy endpoint exposed by this deployment.
          </p>
        </div>
        <button
          onClick={handleLoad}
          disabled={pending}
          style={{
            backgroundColor: "#38bdf8",
            color: "#0f172a",
            border: "none",
            borderRadius: "999px",
            padding: "0.75rem 1.5rem",
            fontSize: "1rem",
            fontWeight: 600,
            cursor: pending ? "not-allowed" : "pointer"
          }}
        >
          {pending ? "Loading..." : "Load UV Data Sample"}
        </button>
        {error && (
          <p style={{ color: "#f87171", margin: 0 }}>
            {error}
          </p>
        )}
        {readings && (
          <div
            style={{
              display: "grid",
              gap: "0.75rem"
            }}
          >
            {readings.map((reading, idx) => (
              <article
                key={`${reading.location}-${idx}`}
                style={{
                  backgroundColor: "#1e293b",
                  borderRadius: "0.75rem",
                  padding: "1rem",
                  display: "grid",
                  gap: "0.5rem"
                }}
              >
                <h3 style={{ margin: 0, fontSize: "1.25rem" }}>{reading.location}</h3>
                <p style={{ margin: 0 }}>UV Index: {reading.uv_index}</p>
                <p style={{ margin: 0, color: "#94a3b8" }}>
                  Reading Time: {new Date(reading.reading_time).toLocaleString()}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section
        style={{
          backgroundColor: "#0f172a",
          borderRadius: "1rem",
          padding: "1.5rem",
          border: "1px solid #1f2937"
        }}
      >
        <h2 style={{ margin: 0, fontSize: "1.5rem" }}>Bot Commands</h2>
        <p style={{ marginTop: "0.5rem", lineHeight: 1.6 }}>
          Inside Telegram, send <code>/uv</code> to receive the most recent readings formatted for humans.
        </p>
        <p style={{ margin: 0 }}>
          You can inspect the webhook handler at{" "}
          <a href="https://agentic-63d1ccce.vercel.app/api/telegram-webhook" target="_blank" rel="noreferrer">
            /api/telegram-webhook
          </a>
          . Remember webhooks must respond within 10 seconds.
        </p>
      </section>
    </main>
  );
}
