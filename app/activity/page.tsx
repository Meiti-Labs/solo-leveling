"use client";

import Link from "next/link";
import type { ComponentType } from "react";
import {
  ArrowLeft,
  Coins,
  Crown,
  Gem,
  PackageCheck,
  Skull,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ActivityEvent } from "@/lib/indexed-db/types";
import { cn } from "@/lib/utils";
import { useGameSnapshot } from "@/hooks/use-game-snapshot";

type ActivityTone = "blue" | "green" | "gold" | "purple" | "red";

const toneStyles: Record<
  ActivityTone,
  {
    badge: string;
    icon: string;
  }
> = {
  blue: {
    badge:
      "border-blue-500/70 bg-blue-950/35 shadow-[0_0_22px_rgba(59,130,246,0.2)]",
    icon: "text-blue-400",
  },
  green: {
    badge:
      "border-emerald-500/70 bg-emerald-950/35 shadow-[0_0_22px_rgba(16,185,129,0.2)]",
    icon: "text-emerald-400",
  },
  gold: {
    badge:
      "border-amber-500/70 bg-amber-950/35 shadow-[0_0_22px_rgba(245,158,11,0.2)]",
    icon: "text-amber-300",
  },
  purple: {
    badge:
      "border-violet-500/70 bg-violet-950/35 shadow-[0_0_22px_rgba(139,92,246,0.2)]",
    icon: "text-violet-400",
  },
  red: {
    badge:
      "border-rose-500/70 bg-rose-950/35 shadow-[0_0_22px_rgba(244,63,94,0.2)]",
    icon: "text-rose-400",
  },
};

const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-US").format(Math.abs(value));

export default function ActivityPage() {
  const { error, isLoading, snapshot } = useGameSnapshot();

  if (isLoading) {
    return (
      <main className="mx-auto min-h-[calc(100svh-8rem)] w-full max-w-md space-y-3 px-3 py-4">
        <Header />
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            className="h-20 animate-pulse rounded-xl border border-slate-800/80 bg-[#07111f]/70"
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
          Could not load activity. {error?.message}
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-[calc(100svh-8rem)] w-full max-w-md space-y-4 px-3 py-4">
      <Header />

      <section className="grid grid-cols-3 gap-2">
        <SummaryCard label="Events" value={snapshot.activityEvents.length} />
        <SummaryCard label="Tasks" value={snapshot.taskCompletions.length} />
        <SummaryCard label="Rewards" value={snapshot.rewardPurchases.length} />
      </section>

      <section className="space-y-2">
        {snapshot.activityEvents.length === 0 ? (
          <p className="rounded-xl border border-slate-700/55 bg-[#07111f]/82 p-4 text-sm text-slate-300">
            Nothing recorded yet. Complete quests, unlock achievements, or buy a
            reward to start the timeline.
          </p>
        ) : (
          snapshot.activityEvents.map((activity) => (
            <ActivityRow activity={activity} key={activity.id} />
          ))
        )}
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
        <Link aria-label="Back home" href="/">
          <ArrowLeft className="size-5" />
        </Link>
      </Button>
      <div>
        <p className="text-sm font-medium text-[#3d87ff]">Timeline</p>
        <h1 className="text-3xl font-semibold leading-none tracking-[-0.03em] text-white">
          Activity
        </h1>
      </div>
    </header>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-xl border border-slate-700/55 bg-[#07111f]/82 p-3 shadow-[0_8px_22px_rgba(0,0,0,0.24),inset_0_1px_16px_rgba(99,148,216,0.05)]">
      <p className="truncate text-xs text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold leading-none text-white">
        {value}
      </p>
    </article>
  );
}

function ActivityRow({ activity }: { activity: ActivityEvent }) {
  const visual = getActivityVisual(activity);
  const Icon = visual.icon;
  const styles = toneStyles[visual.tone];
  const delta = formatActivityDelta(activity);

  return (
    <article className="grid grid-cols-[3.25rem_minmax(0,1fr)] gap-3 rounded-xl border border-slate-700/55 bg-[#07111f]/82 p-3 shadow-[0_10px_28px_rgba(0,0,0,0.28),inset_0_1px_18px_rgba(99,148,216,0.06)] backdrop-blur-xl">
      <div
        className={cn(
          "flex size-12 items-center justify-center border",
          styles.badge,
        )}
        style={{
          clipPath:
            "polygon(25% 6%, 75% 6%, 100% 50%, 75% 94%, 25% 94%, 0 50%)",
        }}
      >
        <Icon className={cn("size-6 stroke-[2.2]", styles.icon)} />
      </div>

      <div className="min-w-0 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-base font-medium leading-tight text-white">
              {activity.title}
            </h2>
            <p className="truncate text-sm text-slate-400">
              {activity.description ?? "Progress updated"}
            </p>
          </div>
          <p className="shrink-0 text-xs text-slate-500">
            {formatDate(activity.occurredAt)}
          </p>
        </div>

        {delta && (
          <div className="flex flex-wrap gap-2">
            {delta.map((item) => (
              <span
                className={cn(
                  "rounded-full border px-2 py-1 text-xs font-semibold",
                  item.isNegative
                    ? "border-rose-500/40 bg-rose-950/25 text-rose-300"
                    : "border-emerald-500/40 bg-emerald-950/25 text-emerald-300",
                )}
                key={item.label}
              >
                {item.label}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

function getActivityVisual(activity: ActivityEvent): {
  icon: ComponentType<{ className?: string }>;
  tone: ActivityTone;
} {
  if (activity.type === "level-up") {
    return { icon: Crown, tone: "blue" };
  }

  if (
    activity.type === "achievement-unlocked" ||
    activity.type === "avoidance-succeeded"
  ) {
    return { icon: Trophy, tone: "green" };
  }

  if (
    activity.type === "avoidance-slip" ||
    activity.type === "boss-failed" ||
    activity.type === "daily-missed"
  ) {
    return { icon: Skull, tone: "red" };
  }

  if (activity.type === "reward-purchased") {
    return { icon: Gem, tone: "purple" };
  }

  if (activity.type === "reward-redeemed") {
    return { icon: PackageCheck, tone: "green" };
  }

  return { icon: Coins, tone: "gold" };
}

function formatActivityDelta(activity: ActivityEvent) {
  const deltas = [
    createDelta(activity.xpDelta, "XP"),
    createDelta(activity.coinDelta, "coins"),
    createDelta(activity.gemDelta, "gems"),
  ].filter(Boolean) as Array<{ isNegative: boolean; label: string }>;

  return deltas.length ? deltas : null;
}

function createDelta(value: number | undefined, label: string) {
  if (!value) {
    return null;
  }

  return {
    isNegative: value < 0,
    label: `${value > 0 ? "+" : "-"}${formatNumber(value)} ${label}`,
  };
}

function formatDate(isoDate: string) {
  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
  }).format(date);
}
