"use client";

import { useRawInitData } from "@telegram-apps/sdk-react";
import { useEffect } from "react";
import BottomNavigation from "@/components/bottom-navigation";
import { gameService } from "@/lib/game";

type TelegramInitUser = {
  id?: number;
  chatId?: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  language_code?: string;
};

type TelegramInitChat = {
  id?: number;
};

function parseTelegramUser(rawInitData?: string): TelegramInitUser | undefined {
  if (!rawInitData) {
    return undefined;
  }

  const params = new URLSearchParams(rawInitData);
  const userRaw = params.get("user");
  const chatRaw = params.get("chat");

  if (!userRaw) {
    return undefined;
  }

  try {
    const user = JSON.parse(userRaw) as TelegramInitUser;
    const chat = chatRaw ? (JSON.parse(chatRaw) as TelegramInitChat) : undefined;

    return {
      ...user,
      chatId: chat?.id,
    };
  } catch {
    return undefined;
  }
}

export default function AppProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const rawInitData = useRawInitData();

  useEffect(() => {
    if (rawInitData) {
      localStorage.setItem("tma", rawInitData);
    }

    async function bootLocalGame() {
      await gameService.initialize(parseTelegramUser(rawInitData));
      await gameService.applyMissedDailyPenalties();
      await gameService.evaluateBossDeadlines();
    }

    bootLocalGame().catch((error) => {
      console.error("Failed to initialize local game data", error);
    });
  }, [rawInitData]);

  return (
    <div className="min-h-svh bg-background pb-28 text-foreground">
      {children}
      <BottomNavigation />
    </div>
  );
}
