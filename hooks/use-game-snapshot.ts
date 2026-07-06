"use client";

import { useCallback, useEffect, useState } from "react";
import { gameService } from "@/lib/game";

export type GameSnapshot = Awaited<ReturnType<typeof gameService.getSnapshot>>;

export function useGameSnapshot() {
  const [snapshot, setSnapshot] = useState<GameSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    try {
      const nextSnapshot = await gameService.initialize();
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
  }, []);

  useEffect(() => {
    let isActive = true;

    async function loadSnapshot() {
      try {
        const nextSnapshot = await gameService.initialize();

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
  }, []);

  return {
    error,
    isLoading,
    refresh,
    snapshot,
  };
}
