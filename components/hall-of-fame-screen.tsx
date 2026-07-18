"use client";

import Image from "next/image";
import Link from "next/link";
import type { ComponentType } from "react";
import {
  CalendarDays,
  ChevronRight,
  Coins,
  Crown,
  Flame,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildAchievementViews } from "@/lib/game/achievement-view";
import type { AchievementView } from "@/lib/game/achievement-view";
import type { ActivityEvent } from "@/lib/indexed-db/types";
import { translateGameText, useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useGameSnapshot } from "@/hooks/use-game-snapshot";

type TimelineTone = "green" | "violet" | "gold" | "cyan" | "pink";

const fallbackMedal = "/images/medals/star-shield-medal.png";
const tabKeys = [
  "hall.medals",
  "hall.achievements",
  "hall.bossTrophies",
  "hall.titles",
];

const toneStyles: Record<TimelineTone, string> = {
  green:
    "border-emerald-400/70 bg-emerald-950/45 text-emerald-300 shadow-[0_0_18px_rgba(16,185,129,0.45)]",
  violet:
    "border-violet-400/70 bg-violet-950/45 text-violet-300 shadow-[0_0_18px_rgba(139,92,246,0.45)]",
  gold:
    "border-amber-400/70 bg-amber-950/45 text-amber-300 shadow-[0_0_18px_rgba(245,158,11,0.45)]",
  cyan:
    "border-cyan-400/70 bg-cyan-950/45 text-cyan-300 shadow-[0_0_18px_rgba(6,182,212,0.45)]",
  pink:
    "border-pink-400/70 bg-pink-950/45 text-pink-300 shadow-[0_0_18px_rgba(236,72,153,0.45)]",
};

export default function HallOfFameScreen() {
  const { error, isLoading, snapshot } = useGameSnapshot();
  const { t } = useI18n();

  if (isLoading) {
    return (
      <main className="mx-auto min-h-[calc(100svh-8rem)] w-full max-w-md space-y-4 px-3 py-4">
        <HeroSection />
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            className="h-32 animate-pulse rounded-2xl border border-slate-800/80 bg-[#07111f]/70"
            key={index}
          />
        ))}
      </main>
    );
  }

  if (error || !snapshot) {
    return (
      <main className="mx-auto min-h-[calc(100svh-8rem)] w-full max-w-md space-y-4 px-3 py-4">
        <HeroSection />
        <section className="rounded-xl border border-rose-500/50 bg-rose-950/20 p-4 text-sm text-rose-100">
          {t("error.loadHallOfFame", { message: error?.message ?? "" })}
        </section>
      </main>
    );
  }

  const achievementViews = buildAchievementViews(snapshot);
  const unlockedAchievements = achievementViews.filter(
    (achievement) => achievement.isUnlocked,
  );
  const featuredAchievement =
    unlockedAchievements[0] ?? achievementViews[0] ?? null;

  return (
    <main className="mx-auto min-h-[calc(100svh-8rem)] w-full max-w-md space-y-4 px-3 py-4">
      <HeroSection />
      {featuredAchievement && (
        <ProudAchievementCard achievement={featuredAchievement} />
      )}
      <HallTabs />
      <RecentUnlocks achievements={achievementViews.slice(0, 4)} />
      <LegacyTimeline activities={snapshot.activityEvents} />
    </main>
  );
}

function HeroSection() {
  const { t } = useI18n();

  return (
    <section className="relative -mx-3 min-h-40 overflow-hidden px-3 pt-8">
      <div className="absolute inset-0 bg-[url('/images/hall-of-fame-banners/royal-crown-stage-banner.png')] bg-cover bg-center opacity-90" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#020713]/95 via-[#020713]/52 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-background to-transparent" />

      <div className="relative space-y-3">
        <h1 className="text-3xl font-semibold leading-none tracking-[-0.03em] text-white">
          {t("common.hallOfFame")}
        </h1>
        <div className="h-px w-36 bg-gradient-to-r from-[#2f80ff] via-[#6fb6ff] to-transparent shadow-[0_0_12px_rgba(47,128,255,0.9)]" />
      </div>
    </section>
  );
}

function ProudAchievementCard({
  achievement,
}: {
  achievement: AchievementView;
}) {
  const { formatDate, formatNumber, language, t } = useI18n();
  const title = translateGameText(achievement.title, language) ?? achievement.title;
  const description =
    translateGameText(achievement.description, language) ??
    achievement.description;
  const unlockedLabel = achievement.isUnlocked
    ? t("hall.unlockedOn", {
        date: formatHallDate(achievement.unlockedAt, formatDate, t),
      })
    : t("hall.achievementProgress", {
        current: formatNumber(achievement.currentValue),
        target: formatNumber(achievement.target),
      });

  return (
    <section className="relative -mt-14 overflow-hidden rounded-2xl border border-amber-500/60 bg-[#07111f]/90 p-4 shadow-[0_0_28px_rgba(245,158,11,0.25),inset_0_1px_20px_rgba(245,158,11,0.12)]">
      <div className="absolute inset-0 bg-[url('/images/hall-of-fame-banners/lion-relic-showcase-banner.png')] bg-cover bg-center opacity-35" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#070b14]/88 via-[#07111f]/72 to-[#07111f]/92" />

      <div className="relative grid grid-cols-[7rem_minmax(0,1fr)] items-center gap-3">
        <div className="relative aspect-square w-full rotate-[-8deg]">
          <Image
            alt={t("hall.medalAlt", { title })}
            className={cn(
              "object-contain drop-shadow-[0_0_18px_rgba(245,158,11,0.65)]",
              !achievement.isUnlocked && "grayscale opacity-60",
            )}
            fill
            priority
            sizes="112px"
            src={achievement.medalImage ?? fallbackMedal}
          />
        </div>

        <div className="min-w-0 space-y-2">
          <p className="flex items-center gap-1.5 truncate text-sm font-medium text-amber-300">
            <Crown className="size-4 fill-amber-300/20" />
            {achievement.isUnlocked
              ? t("hall.mostProudAchievement")
              : t("hall.nextAchievement")}
          </p>
          <h2 className="truncate text-3xl font-semibold leading-none text-amber-200">
            {title}
          </h2>
          <p className="truncate text-base text-slate-300">
            {description}
          </p>
          <p className="flex items-center gap-2 truncate text-sm text-slate-400">
            <CalendarDays className="size-4" />
            {unlockedLabel}
          </p>
        </div>
      </div>
    </section>
  );
}

function HallTabs() {
  const { t } = useI18n();

  return (
    <nav
      aria-label={t("hall.sections")}
      className="grid grid-cols-4 overflow-hidden rounded-2xl border border-slate-700/55 bg-[#07111f]/82 shadow-[inset_0_1px_18px_rgba(99,148,216,0.06)]"
    >
      {tabKeys.map((tabKey, index) => {
        const active = index === 0;

        return (
          <Button
            className={cn(
              "h-12 rounded-none border-r border-slate-700/45 px-2 text-sm font-medium last:border-r-0",
              active
                ? "bg-[#0d4fe0]/80 text-white shadow-[0_0_18px_rgba(47,140,255,0.45),inset_0_1px_12px_rgba(255,255,255,0.12)] hover:bg-[#155df0]/90"
                : "bg-transparent text-slate-400 hover:bg-[#0b1728] hover:text-slate-200",
            )}
            key={tabKey}
            type="button"
            variant={active ? "default" : "ghost"}
          >
            <span className="truncate">{t(tabKey)}</span>
          </Button>
        );
      })}
    </nav>
  );
}

function RecentUnlocks({
  achievements,
}: {
  achievements: AchievementView[];
}) {
  const { formatNumber, language, t } = useI18n();

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3 px-1">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
          <Sparkles className="size-4 fill-amber-200 text-amber-200" />
          {t("hall.recentUnlocks")}
        </h2>
        <Button
          asChild
          className="h-auto px-0 text-sm font-medium text-[#4f8cff] hover:text-[#78a8ff]"
          variant="link"
        >
          <Link href="/hall-of-fame/unlocks">
            {t("action.viewAll")}
            <ChevronRight className="size-4" />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-2 rounded-2xl border border-slate-700/55 bg-[#07111f]/82 p-3 shadow-[0_10px_28px_rgba(0,0,0,0.28),inset_0_1px_18px_rgba(99,148,216,0.06)]">
        {achievements.map((achievement) => (
          <RecentAchievementIcon
            achievement={achievement}
            formatNumber={formatNumber}
            key={achievement.key}
            language={language}
            t={t}
          />
        ))}
      </div>
    </section>
  );
}

function LegacyTimeline({ activities }: { activities: ActivityEvent[] }) {
  const { formatDate, language, t } = useI18n();
  const timeline = activities
    .filter((activity) =>
      [
        "achievement-unlocked",
        "boss-failed",
        "level-up",
        "reward-purchased",
        "reward-redeemed",
        "task-completed",
      ].includes(activity.type),
    )
    .slice(0, 5);

  return (
    <section className="space-y-3">
      <h2 className="flex items-center gap-2 px-1 text-lg font-semibold text-white">
        <ShieldCheck className="size-4 text-slate-300" />
        {t("hall.legacyTimeline")}
      </h2>

      <div className="rounded-2xl border border-slate-700/55 bg-[#07111f]/82 p-4 shadow-[0_10px_28px_rgba(0,0,0,0.28),inset_0_1px_18px_rgba(99,148,216,0.06)]">
        {timeline.length === 0 ? (
          <p className="text-sm text-slate-400">
            {t("hall.legacyEmpty")}
          </p>
        ) : (
          <div className="relative space-y-0">
            <div className="absolute bottom-8 left-6 top-6 w-px bg-gradient-to-b from-emerald-400 via-cyan-400 to-pink-400" />
            {timeline.map((item) => {
              const visual = getTimelineVisual(item);
              const Icon = visual.icon;

              return (
                <article
                  className="relative grid grid-cols-[3rem_minmax(0,1fr)_auto] items-center gap-3 border-b border-slate-700/50 py-3 last:border-b-0"
                  key={item.id}
                >
                  <div
                    className={cn(
                      "relative z-10 flex size-12 items-center justify-center rounded-full border",
                      toneStyles[visual.tone],
                    )}
                  >
                    <Icon className="size-6" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-medium text-white">
                      {translateGameText(item.title, language) ?? item.title}
                    </h3>
                    <p className="text-sm text-slate-400">
                      {formatHallDate(item.occurredAt, formatDate, t)}
                    </p>
                  </div>
                  <ChevronRight className="size-5 text-slate-400" />
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

function getTimelineVisual(activity: ActivityEvent): {
  icon: ComponentType<{ className?: string }>;
  tone: TimelineTone;
} {
  if (activity.type === "achievement-unlocked") {
    return { icon: Trophy, tone: "green" };
  }

  if (activity.type === "level-up") {
    return { icon: Zap, tone: "cyan" };
  }

  if (activity.type === "reward-purchased") {
    return { icon: Coins, tone: "gold" };
  }

  if (activity.type === "reward-redeemed") {
    return { icon: PackageCheck, tone: "green" };
  }

  if (activity.type === "boss-failed") {
    return { icon: Flame, tone: "pink" };
  }

  return { icon: Sparkles, tone: "violet" };
}

function RecentAchievementIcon({
  achievement,
  formatNumber,
  language,
  t,
}: {
  achievement: AchievementView;
  formatNumber: (value: number) => string;
  language: "en" | "fa";
  t: (key: string, params?: Record<string, number | string>) => string;
}) {
  const title = translateGameText(achievement.title, language) ?? achievement.title;

  return (
    <div
      className="relative aspect-square rounded-xl border border-[#2f8cff]/20 bg-blue-950/20"
      key={achievement.key}
    >
      <Image
        alt={t("hall.medalAlt", { title })}
        className={cn(
          "object-contain p-1 drop-shadow-[0_0_14px_rgba(245,158,11,0.35)]",
          !achievement.isUnlocked && "grayscale opacity-45",
        )}
        fill
        sizes="88px"
        src={achievement.medalImage ?? fallbackMedal}
      />
      {!achievement.isUnlocked && (
        <span className="absolute bottom-1 right-1 rounded-full bg-slate-950/80 px-1.5 py-0.5 text-[10px] font-semibold text-slate-300">
          {formatNumber(achievement.progressPercent)}%
        </span>
      )}
    </div>
  );
}

function formatHallDate(
  isoDate: string | undefined,
  formatDate: (date: Date | string, options?: Intl.DateTimeFormatOptions) => string,
  t: (key: string) => string,
) {
  if (!isoDate) {
    return t("hall.locked");
  }

  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    return t("period.recently");
  }

  return formatDate(date, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
