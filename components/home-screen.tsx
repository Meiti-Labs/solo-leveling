"use client";

import { Button } from "@/components/ui/button";
import { useLaunchParams } from "@telegram-apps/sdk-react";
import { ExternalLink } from "lucide-react";
import HomeHeader  from "@/components/home-header";
import LevelProgressCard from "@/components/level-progress-card";
import CoreAttributesSection from "@/components/core-attributes-section";

export default function HomeScreen() {
  const launchParams = useLaunchParams();
  const platform = launchParams.tgWebAppPlatform ?? "unknown";
  const startParam = launchParams.tgWebAppStartParam ?? "none";

  return (
    <main className="mx-auto min-h-[calc(100svh-8rem)] w-full max-w-md space-y-4 px-3 py-4">
      <section className="space-y-2">
        <HomeHeader />
        <LevelProgressCard />
      </section>

      <CoreAttributesSection />

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
