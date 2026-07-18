"use client";

import Link from "next/link";
import { ArrowLeft, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGameSnapshot } from "@/hooks/use-game-snapshot";
import {
  totalXpRequiredForLevel,
  xpRequiredForNextLevel,
} from "@/lib/game";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const MAX_ROADMAP_LEVEL = 200;
const ROADMAP_WIDTH = 12000;
const ROADMAP_PADDING = 64;

type LevelMilestone = {
  isCurrent: boolean;
  isReached: boolean;
  level: number;
  nextLevelXp: number;
  totalXp: number;
  x: number;
};

export default function LevelRoadmapPage() {
  const { error, isLoading, snapshot } = useGameSnapshot();
  const { formatNumber, t } = useI18n();

  if (isLoading) {
    return (
      <main className="mx-auto min-h-[calc(100svh-8rem)] w-full max-w-md space-y-4 px-3 py-4">
        <RoadmapHeader />
        <div className="h-72 animate-pulse rounded-2xl border border-slate-800/80 bg-[#07111f]/70" />
      </main>
    );
  }

  if (error || !snapshot) {
    return (
      <main className="mx-auto min-h-[calc(100svh-8rem)] w-full max-w-md space-y-4 px-3 py-4">
        <RoadmapHeader />
        <section className="rounded-xl border border-rose-500/50 bg-rose-950/20 p-4 text-sm text-rose-100">
          {t("error.loadLevelRoadmap", { message: error?.message ?? "" })}
        </section>
      </main>
    );
  }

  const totalXp = snapshot.progress.overallXp;
  const projectedLevel = getProjectedLevel(totalXp, MAX_ROADMAP_LEVEL);
  const xpForLevel200 = totalXpRequiredForLevel(MAX_ROADMAP_LEVEL);
  const progressPercent = Math.min(100, Math.round((totalXp / xpForLevel200) * 100));
  const milestones = buildMilestones(totalXp);
  const currentX = getCurrentPosition(totalXp, projectedLevel, milestones);

  return (
    <main className="mx-auto min-h-[calc(100svh-8rem)] w-full max-w-md space-y-4 px-3 py-4">
      <RoadmapHeader />

      <section className="grid grid-cols-3 gap-2">
        <SummaryTile
          label={t("level.current")}
          value={t("level.shortValue", { level: formatNumber(projectedLevel) })}
        />
        <SummaryTile
          label={t("level.progress")}
          value={`${formatNumber(progressPercent)}%`}
        />
        <SummaryTile
          label={t("level.toMax", { level: formatNumber(MAX_ROADMAP_LEVEL) })}
          value={formatNumber(xpForLevel200)}
        />
      </section>

      <section className="space-y-3 rounded-2xl border border-slate-700/55 bg-[#07111f]/82 p-4 shadow-[0_10px_28px_rgba(0,0,0,0.28),inset_0_1px_18px_rgba(99,148,216,0.06)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-white">
              {t("level.roadmapFull")}
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              {t("level.roadmapHint")}
            </p>
          </div>
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-[#2f8cff]/35 bg-blue-950/25 text-[#78b4ff]">
            <Flag className="size-5" />
          </div>
        </div>

        <div className="-mx-4 overflow-x-auto px-4 pb-3 [-ms-overflow-style:none] [scrollbar-width:thin]">
          <div
            className="relative h-[19rem]"
            style={{ width: `${ROADMAP_WIDTH}px` }}
          >
            <div className="absolute left-0 right-0 top-28 h-3 rounded-full bg-slate-800/90 shadow-[inset_0_1px_7px_rgba(0,0,0,0.65)]" />
            <div
              className="absolute left-0 top-28 h-3 rounded-full bg-gradient-to-r from-[#2f8cff] via-violet-500 to-cyan-300 shadow-[0_0_18px_rgba(47,140,255,0.55)]"
              style={{ width: `${currentX}px` }}
            />

            <div
              className="absolute top-2.5 z-20 -translate-x-1/2"
              style={{ left: `${currentX}px` }}
            >
              <div className="flex flex-col items-center">
                <span className="rounded-full border border-[#2f8cff]/60 bg-blue-950 px-3 py-1 text-xs font-semibold text-[#78b4ff] shadow-[0_0_18px_rgba(47,140,255,0.45)]">
                  {t("level.you", { level: formatNumber(projectedLevel) })}
                </span>
                <div className="h-[4.6rem] w-px bg-[#5aa0ff]" />
                <div className="size-4 rounded-full border-2 border-white bg-[#2f8cff] shadow-[0_0_18px_rgba(47,140,255,0.8)]" />
              </div>
            </div>

            {milestones.map((milestone) => (
              <MilestoneMarker
                key={milestone.level}
                milestone={milestone}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function RoadmapHeader() {
  const { t } = useI18n();

  return (
    <header className="flex items-center gap-3 pt-1">
      <Button
        asChild
        className="size-10 shrink-0 rounded-xl border border-slate-700/60 bg-[#07111f]/80 text-white hover:bg-[#0b1728]"
        size="icon"
        variant="ghost"
      >
        <Link aria-label={t("action.backAnalytics")} href="/analytics">
          <ArrowLeft className="size-5" />
        </Link>
      </Button>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#5aa0ff]">
          {t("common.analytics")}
        </p>
        <h1 className="truncate text-2xl font-semibold leading-none tracking-[-0.03em] text-white">
          {t("analytics.levelRoadmap")}
        </h1>
      </div>
    </header>
  );
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-xl border border-slate-700/55 bg-[#07111f]/82 p-3 shadow-[0_8px_22px_rgba(0,0,0,0.22),inset_0_1px_16px_rgba(99,148,216,0.05)]">
      <p className="truncate text-xs text-slate-400">{label}</p>
      <p className="mt-1 truncate text-lg font-semibold leading-tight text-white">
        {value}
      </p>
    </article>
  );
}

function MilestoneMarker({ milestone }: { milestone: LevelMilestone }) {
  const { formatNumber, t } = useI18n();
  const isMajor =
    milestone.level % 10 === 0 ||
    milestone.level === 1 ||
    milestone.level === MAX_ROADMAP_LEVEL;

  return (
    <div
      className={`absolute ${isMajor ? "top-[6.45rem]" : "top-[4.4rem]"}  -translate-x-1/2`}
      style={{ left: `${milestone.x}px` }}
    >
      <div className="flex flex-col items-center">
        <div
          className={cn(
            "flex items-center justify-center rounded-full border",
            isMajor ? "size-7" : "size-3.5",
            milestone.isReached
              ? "border-[#78b4ff] bg-[#0d4fe0] text-white"
              : "border-slate-600 bg-[#030914] text-slate-500",
            milestone.isCurrent &&
              "ring-2 ring-white/80 shadow-[0_0_18px_rgba(47,140,255,0.75)]",
          )}
        >
          {isMajor ? (
            <span className="text-[10px] font-semibold">
              {formatNumber(milestone.level)}
            </span>
          ) : null}
        </div>
        <div
          className={cn(
            "w-px",
            isMajor ? "h-16" : "h-7",
            milestone.isReached ? "bg-[#5aa0ff]" : "bg-slate-700",
          )}
        />
        {isMajor && (
          <div className="w-28 rounded-xl border border-slate-700/60 bg-[#030914]/85 p-2 text-center shadow-[0_8px_22px_rgba(0,0,0,0.25)]">
            <p className="text-xs font-semibold text-white">
              {t("level.shortValue", { level: formatNumber(milestone.level) })}
            </p>
            <p className="mt-0.5 text-[10px] leading-tight text-slate-400">
              {t("level.totalXp", {
                xp: formatNumber(milestone.totalXp),
              })}
            </p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-slate-500">
              {t("level.nextXp", {
                xp: formatNumber(milestone.nextLevelXp),
              })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function buildMilestones(totalXp: number): LevelMilestone[] {
  const projectedLevel = getProjectedLevel(totalXp, MAX_ROADMAP_LEVEL);

  return Array.from({ length: MAX_ROADMAP_LEVEL }, (_, index) => {
    const level = index + 1;
    const totalForLevel = totalXpRequiredForLevel(level);
    const nextLevelXp =
      level >= MAX_ROADMAP_LEVEL ? 0 : xpRequiredForNextLevel(level);

    return {
      isCurrent: level === projectedLevel,
      isReached: totalXp >= totalForLevel,
      level,
      nextLevelXp,
      totalXp: totalForLevel,
      x: getMilestoneX(level),
    };
  });
}

function getProjectedLevel(totalXp: number, maxLevel: number) {
  let level = 1;
  let remainingXp = Math.max(0, Math.floor(totalXp));

  while (level < maxLevel && remainingXp >= xpRequiredForNextLevel(level)) {
    remainingXp -= xpRequiredForNextLevel(level);
    level += 1;
  }

  return level;
}

function getCurrentPosition(
  totalXp: number,
  projectedLevel: number,
  milestones: LevelMilestone[],
) {
  const currentMilestone = milestones[projectedLevel - 1];
  const nextMilestone = milestones[projectedLevel] ?? currentMilestone;
  const totalForCurrent = currentMilestone.totalXp;
  const neededForNext = currentMilestone.nextLevelXp || 1;
  const percentIntoLevel = Math.min(
    1,
    Math.max(0, (totalXp - totalForCurrent) / neededForNext),
  );

  return (
    currentMilestone.x +
    (nextMilestone.x - currentMilestone.x) * percentIntoLevel
  );
}

function getMilestoneX(level: number) {
  if (level <= 1) {
    return ROADMAP_PADDING;
  }

  return (
    ROADMAP_PADDING +
    ((level - 1) / (MAX_ROADMAP_LEVEL - 1)) *
      (ROADMAP_WIDTH - ROADMAP_PADDING * 2)
  );
}
