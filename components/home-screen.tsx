"use client";

import HomeHeader  from "@/components/home-header";
import LevelProgressCard from "@/components/level-progress-card";
import CoreAttributesSection from "@/components/core-attributes-section";
import TodayOverviewSection from "@/components/today-overview-section";
import RecentActivitySection from "@/components/recent-activity-section";
import { useGameSnapshot } from "@/hooks/use-game-snapshot";
import { useI18n } from "@/lib/i18n";

export default function HomeScreen() {
  const { error, isLoading, snapshot } = useGameSnapshot();
  const { t } = useI18n();

  if (isLoading) {
    return (
      <main className="mx-auto min-h-[calc(100svh-8rem)] w-full max-w-md space-y-4 px-3 py-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            className="h-28 animate-pulse rounded-2xl border border-slate-800/80 bg-[#07111f]/70"
            key={index}
          />
        ))}
      </main>
    );
  }

  if (error || !snapshot) {
    return (
      <main className="mx-auto min-h-[calc(100svh-8rem)] w-full max-w-md px-3 py-4">
        <section className="rounded-xl border border-rose-500/50 bg-rose-950/20 p-4 text-sm text-rose-100">
          {t("error.loadLocalProgress", { message: error?.message ?? "" })}
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-[calc(100svh-8rem)] w-full max-w-md space-y-4 px-3 py-4">
      <section className="space-y-2">
        <HomeHeader
          level={snapshot.overallLevel.level}
          profile={snapshot.profile}
          unreadNotifications={
            snapshot.notifications.filter((notification) => !notification.readAt)
              .length
          }
        />
        <LevelProgressCard progress={snapshot.overallLevel} />
      </section>

      <CoreAttributesSection attributes={snapshot.attributes} />
      <TodayOverviewSection snapshot={snapshot} />
      <RecentActivitySection activities={snapshot.activityEvents} />
    </main>
  );
}
