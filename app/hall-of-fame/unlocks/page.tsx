"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Check, CircleDollarSign, Gem, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildAchievementViews } from "@/lib/game/achievement-view";
import type { AchievementView } from "@/lib/game/achievement-view";
import { cn } from "@/lib/utils";
import { useGameSnapshot } from "@/hooks/use-game-snapshot";

const fallbackMedal = "/images/medals/star-shield-medal.png";

const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-US").format(value);

export default function HallOfFameUnlocksPage() {
  const { error, isLoading, snapshot } = useGameSnapshot();

  if (isLoading) {
    return (
      <main className="mx-auto min-h-[calc(100svh-8rem)] w-full max-w-md space-y-3 px-3 py-4">
        <Header />
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
      <main className="mx-auto min-h-[calc(100svh-8rem)] w-full max-w-md space-y-3 px-3 py-4">
        <Header />
        <section className="rounded-xl border border-rose-500/50 bg-rose-950/20 p-4 text-sm text-rose-100">
          Could not load achievements. {error?.message}
        </section>
      </main>
    );
  }

  const achievements = buildAchievementViews(snapshot);
  const unlockedCount = achievements.filter(
    (achievement) => achievement.isUnlocked,
  ).length;

  return (
    <main className="mx-auto min-h-[calc(100svh-8rem)] w-full max-w-md space-y-4 px-3 py-4">
      <Header />

      <section className="rounded-2xl border border-[#2f8cff]/45 bg-[#07111f]/82 p-4 shadow-[0_0_26px_rgba(47,140,255,0.16),inset_0_1px_18px_rgba(99,148,216,0.08)]">
        <p className="text-sm text-slate-400">Unlocked</p>
        <div className="mt-1 flex items-end justify-between gap-3">
          <p className="text-3xl font-semibold leading-none text-white">
            {unlockedCount}/{achievements.length}
          </p>
          <p className="text-sm font-medium text-[#4f8cff]">
            {achievements.length
              ? Math.round((unlockedCount / achievements.length) * 100)
              : 0}
            % complete
          </p>
        </div>
      </section>

      <section className="space-y-2">
        {achievements.map((achievement) => (
          <AchievementRow achievement={achievement} key={achievement.key} />
        ))}
      </section>
    </main>
  );
}

function Header() {
  return (
    <header className="flex items-center gap-3 pt-2">
      <Button
        asChild
        className="size-11 rounded-2xl border border-slate-700/60 bg-[#07111f]/80 text-white shadow-[0_8px_24px_rgba(0,0,0,0.35),inset_0_1px_18px_rgba(99,148,216,0.08)] hover:bg-[#0b1728]"
        size="icon"
        variant="ghost"
      >
        <Link aria-label="Back to Hall of Fame" href="/hall-of-fame">
          <ArrowLeft className="size-5" />
        </Link>
      </Button>
      <div>
        <p className="text-sm font-medium text-[#3d87ff]">Hall of Fame</p>
        <h1 className="text-3xl font-semibold leading-none tracking-[-0.03em] text-white">
          Unlocks
        </h1>
      </div>
    </header>
  );
}

function AchievementRow({ achievement }: { achievement: AchievementView }) {
  return (
    <article
      className={cn(
        "grid grid-cols-[4.5rem_minmax(0,1fr)] gap-3 rounded-2xl border border-slate-700/55 bg-[#07111f]/82 p-3 shadow-[0_10px_28px_rgba(0,0,0,0.28),inset_0_1px_18px_rgba(99,148,216,0.06)] backdrop-blur-xl",
        achievement.isUnlocked && "border-amber-400/45 bg-amber-950/10",
      )}
    >
      <div className="relative aspect-square overflow-hidden rounded-xl border border-[#2f8cff]/20 bg-blue-950/20">
        <Image
          alt={`${achievement.title} medal`}
          className={cn(
            "object-contain p-1 drop-shadow-[0_0_14px_rgba(245,158,11,0.35)]",
            !achievement.isUnlocked && "grayscale opacity-45",
          )}
          fill
          sizes="72px"
          src={achievement.medalImage ?? fallbackMedal}
        />
      </div>

      <div className="min-w-0 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold text-white">
              {achievement.title}
            </h2>
            <p className="truncate text-sm text-slate-400">
              {achievement.description}
            </p>
          </div>
          <StatusBadge isUnlocked={achievement.isUnlocked} />
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-slate-800/85 shadow-[inset_0_1px_5px_rgba(0,0,0,0.55)]">
          <div
            className={cn(
              "h-full rounded-full bg-gradient-to-r",
              achievement.isUnlocked
                ? "from-amber-400 to-yellow-300"
                : "from-[#2f80ff] to-cyan-300",
            )}
            style={{ width: `${achievement.progressPercent}%` }}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
          <span>
            {formatNumber(achievement.currentValue)} /{" "}
            {formatNumber(achievement.target)}
          </span>
          {achievement.coinReward > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/25 bg-amber-950/25 px-2 py-1 text-amber-200">
              <CircleDollarSign className="size-3" />
              {formatNumber(achievement.coinReward)}
            </span>
          )}
          {achievement.gemReward > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full border border-cyan-400/25 bg-cyan-950/25 px-2 py-1 text-cyan-200">
              <Gem className="size-3" />
              {formatNumber(achievement.gemReward)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

function StatusBadge({ isUnlocked }: { isUnlocked: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex size-7 shrink-0 items-center justify-center rounded-full border",
        isUnlocked
          ? "border-emerald-400/70 bg-emerald-950/40 text-emerald-300"
          : "border-slate-600/70 bg-slate-950/50 text-slate-400",
      )}
    >
      {isUnlocked ? <Check className="size-4" /> : <Lock className="size-4" />}
    </span>
  );
}
