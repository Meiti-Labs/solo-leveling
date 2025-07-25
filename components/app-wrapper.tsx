"use client";

import { useEffect, useState } from "react";
import { enqueueSnackbar } from "notistack";
import { useRawInitData } from "@telegram-apps/sdk-react";

const sendTelegramMessage = async (message: string) => {
  const token = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN!; // ✅ Use .env file in real use
  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: "7348171449", // 🔥 optional: get this dynamically from Telegram user
        text: message,
      }),
    });
  } catch (err) {
    console.error("Telegram send error:", err);
  }
};

export default function AppWrapper() {
  const data = useRawInitData();
  const [telegramReady, setTelegramReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.Telegram &&
      window.Telegram.WebApp &&
      window.Telegram.WebApp.initDataUnsafe?.user
    ) {
      setTelegramReady(true);
      setUserId(window.Telegram.WebApp.initDataUnsafe.user.id);
    }
  }, []);

  const handleApi = async () => {
    await sendTelegramMessage(JSON.stringify(data));

    if (telegramReady && userId) {
      enqueueSnackbar(`User ID: ${userId}`);
    } else {
      enqueueSnackbar("Telegram WebApp not available");
    }
  };

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <button onClick={handleApi}>HELLO</button>
    </div>
  );
}
