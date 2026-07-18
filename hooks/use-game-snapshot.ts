"use client";

import { useCallback, useEffect, useState } from "react";
import { gameService } from "@/lib/game";
import { useI18n } from "@/lib/i18n";

export type GameSnapshot = Awaited<ReturnType<typeof gameService.getSnapshot>>;

export function useGameSnapshot() {
  const { language } = useI18n();
  const [snapshot, setSnapshot] = useState<GameSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    try {
      const nextSnapshot = await gameService.initialize(undefined, language);
      setSnapshot(nextSnapshot);
      setError(null);
      return nextSnapshot;
    } catch (caughtError) {
      const nextError =
        caughtError instanceof Error
          ? caughtError
          : new Error("Failed to load local game data.");
      setError(nextError);
      throw nextError;
    } finally {
      setIsLoading(false);
    }
  }, [language]);

  useEffect(() => {
    let isActive = true;

    async function loadSnapshot() {
      try {
        const nextSnapshot = await gameService.initialize(undefined, language);

        if (!isActive) {
          return;
        }

        setSnapshot(nextSnapshot);
        setError(null);
      } catch (caughtError) {
        if (!isActive) {
          return;
        }

        setError(
          caughtError instanceof Error
            ? caughtError
            : new Error("Failed to load local game data."),
        );
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadSnapshot();

    return () => {
      isActive = false;
    };
  }, [language]);

  return {
    error,
    isLoading,
    refresh,
    snapshot,
  };
}
