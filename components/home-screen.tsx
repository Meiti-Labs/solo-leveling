"use client";

import { Button } from "@/components/ui/button";
import { useLaunchParams } from "@telegram-apps/sdk-react";
import { ExternalLink } from "lucide-react";

export default function HomeScreen() {
  const launchParams = useLaunchParams();
  const platform = launchParams.tgWebAppPlatform ?? "unknown";
  const startParam = launchParams.tgWebAppStartParam ?? "none";

  return (
    <main className="mx-auto flex min-h-[calc(100svh-5rem)] w-full max-w-md flex-col justify-between px-5 py-8">
      <section className="space-y-5">
        <p className="text-sm uppercase tracking-[0.22em] text-primary/70">
          Telegram Mini App
        </p>
        <div className="space-y-3">
          <h1 className="text-4xl font-semibold leading-tight">
            Solo Leveling is ready for a clean rebuild.
          </h1>
          <p className="font-sans text-sm leading-6 text-muted-foreground">
            The old quest stack has been cleared out. This screen keeps the
            Telegram launch context wired so you can build the next flow on a
            fresh foundation.
          </p>
        </div>
      </section>

      <section className="space-y-3 rounded-lg border border-border/60 bg-card/70 p-4 font-sans text-sm shadow-sm backdrop-blur">
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">Platform</span>
          <span className="font-medium">{platform}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">Start param</span>
          <span className="max-w-40 truncate font-medium">{startParam}</span>
        </div>
        <Button className="mt-2 w-full" asChild>
          <a
            href="https://docs.telegram-mini-apps.com/"
            rel="noreferrer"
            target="_blank"
          >
            Telegram Mini Apps docs
            <ExternalLink />
          </a>
        </Button>
      </section>
    </main>
  );
}
