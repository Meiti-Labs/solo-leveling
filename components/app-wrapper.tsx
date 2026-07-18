"use client";

import { useRawInitData } from "@telegram-apps/sdk-react";
import { useEffect, useState } from "react";
import BottomNavigation from "@/components/bottom-navigation";
import { I18nProvider, useI18n } from "@/lib/i18n";
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

  return (
    <I18nProvider>
      <BootstrappedApp rawInitData={rawInitData}>{children}</BootstrappedApp>
    </I18nProvider>
  );
}

function BootstrappedApp({
  children,
  rawInitData,
}: {
  children: React.ReactNode;
  rawInitData?: string;
}) {
  const { hasLanguagePreference, isLoadingLanguage, language } = useI18n();
  const [hasBooted, setHasBooted] = useState(false);

  useEffect(() => {
    if (rawInitData) {
      localStorage.setItem("tma", rawInitData);
    }
  }, [rawInitData]);

  useEffect(() => {
    if (isLoadingLanguage || !hasLanguagePreference || hasBooted) {
      return;
    }

    let isActive = true;

    async function bootLocalGame() {
      await gameService.initialize(parseTelegramUser(rawInitData), language);
      await gameService.applyMissedDailyPenalties();
      await gameService.evaluateBossDeadlines();
      await gameService.evaluateAvoidanceDeadlines();
    }

    bootLocalGame()
      .then(() => {
        if (isActive) {
          setHasBooted(true);
        }
      })
      .catch((error) => {
        console.error("Failed to initialize local game data", error);
        if (isActive) {
          setHasBooted(true);
        }
      });

    return () => {
      isActive = false;
    };
  }, [
    hasBooted,
    hasLanguagePreference,
    isLoadingLanguage,
    language,
    rawInitData,
  ]);

  if (isLoadingLanguage || !hasLanguagePreference || !hasBooted) {
    return <div className="min-h-svh bg-background" />;
  }

  return (
    <div className="min-h-svh bg-background pb-28 text-foreground">
      {children}
      <BottomNavigation />
    </div>
  );
}
