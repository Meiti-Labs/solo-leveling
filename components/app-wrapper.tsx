"use client";

import { enqueueSnackbar } from "notistack";
import { useLaunchParams } from '@telegram-apps/sdk-react';

const sendTelegramMessage = async (message: string) => {
  const token = "8257170660:AAHX9vOpTi8bPei0gygvbsbHSdopwLYTSp0"; // ✅ Replace with env var in real app
  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: "7348171449",
        text: message,
      }),
    });
  } catch (err) {
    console.error("Telegram send error:", err);
  }
};


export default function AppWrapper() {
  const data = useLaunchParams();
  const handleApi = async () => {
    await sendTelegramMessage(JSON.stringify(data));
    try {
      if (
       data
      ) {
        enqueueSnackbar(`User ID: ${data.tgWebAppData?.user?.id}`);
      } else {
        enqueueSnackbar("Telegram WebApp not available");
      }
    } catch (error) {
      enqueueSnackbar("An error occurred");
      await sendTelegramMessage(JSON.stringify(error));
      console.error(error);
    }
  };

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <button onClick={handleApi}>HELLO</button>
    </div>
  );
}
