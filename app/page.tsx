"use client";

import { enqueueSnackbar } from "notistack";

export default function Home() {
  const handleApi = () => {
    try {
      if (
        typeof window !== "undefined" &&
        window.Telegram &&
        window.Telegram.WebApp &&
        window.Telegram.WebApp.initDataUnsafe &&
        window.Telegram.WebApp.initDataUnsafe.user
      ) {
        const userId = window.Telegram.WebApp.initDataUnsafe.user.id;
        enqueueSnackbar(`User ID: ${userId}`);
      } else {
        enqueueSnackbar("Telegram WebApp not available");
      }
    } catch (error) {
      enqueueSnackbar("An error occurred");
      console.error(error);
    }
  };

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <button onClick={handleApi}>HELLO</button>
    </div>
  );
}
