"use client";

import Link from "next/link";
import type { ComponentType } from "react";
import {
  ArrowLeft,
  BookOpen,
  Coins,
  Flame,
  MessageSquare,
  Shield,
  Sword,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LevelProgress } from "@/lib/game/leveling";
import type { AttributeKey, AttributeProgress } from "@/lib/indexed-db/types";
import { ATTRIBUTE_KEYS } from "@/lib/indexed-db/types";
import { cn } from "@/lib/utils";
import { useGameSnapshot } from "@/hooks/use-game-snapshot";

type AttributeWithLevel = AttributeProgress & { level: LevelProgress };

type AttributeVisual = {
  color: "purple" | "blue" | "green" | "gold" | "cyan" | "pink";
  icon: ComponentType<{ className?: string }>;
};

const attributeVisuals: Record<AttributeKey, AttributeVisual> = {
  strength: { color: "purple", icon: Sword },
  intelligence: { color: "blue", icon: BookOpen },
  discipline: { color: "green", icon: Shield },
  finance: { color: "gold", icon: Coins },
  wisdom: { color: "cyan", icon: Flame },
  communication: { color: "pink", icon: MessageSquare },
};

const colorStyles: Record<
  AttributeVisual["color"],
  {
    badge: string;
    icon: string;
    progress: string;
  }
> = {
  purple: {
    badge:
      "border-violet-500/70 bg-violet-950/35 shadow-[0_0_22px_rgba(139,92,246,0.22)]",
    icon: "text-violet-400",
    progress: "from-violet-500 to-fuchsia-400",
  },
  blue: {
    badge:
      "border-blue-500/70 bg-blue-950/35 shadow-[0_0_22px_rgba(59,130,246,0.22)]",
    icon: "text-blue-400",
    progress: "from-blue-500 to-sky-400",
  },
  green: {
    badge:
      "border-emerald-500/70 bg-emerald-950/35 shadow-[0_0_22px_rgba(16,185,129,0.22)]",
    icon: "text-emerald-400",
    progress: "from-emerald-500 to-teal-300",
  },
  gold: {
    badge:
      "border-amber-500/70 bg-amber-950/35 shadow-[0_0_22px_rgba(245,158,11,0.22)]",
    icon: "text-amber-300",
    progress: "from-amber-400 to-yellow-300",
  },
  cyan: {
    badge:
      "border-cyan-500/70 bg-cyan-950/35 shadow-[0_0_22px_rgba(6,182,212,0.22)]",
    icon: "text-cyan-300",
    progress: "from-cyan-500 to-sky-300",
  },
  pink: {
    badge:
      "border-pink-500/70 bg-pink-950/35 shadow-[0_0_22px_rgba(236,72,153,0.22)]",
    icon: "text-pink-400",
    progress: "from-pink-500 to-rose-300",
  },
};

const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-US").format(value);

export default function AttributesPage() {
  const { error, isLoading, snapshot } = useGameSnapshot();

  if (isLoading) {
    return (
      <main className="mx-auto min-h-[calc(100svh-8rem)] w-full max-w-md space-y-3 px-3 py-4">
        <Header />
        {Array.from({ length: 6 }).map((_, index) => (
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
          Could not load attributes. {error?.message}
        </section>
      </main>
    );
  }

  const attributes = ATTRIBUTE_KEYS.map((key) =>
    snapshot.attributes.find((attribute) => attribute.key === key),
  ).filter(Boolean) as AttributeWithLevel[];

  return (
    <main className="mx-auto min-h-[calc(100svh-8rem)] w-full max-w-md space-y-4 px-3 py-4">
      <Header />

      <section className="rounded-2xl border border-[#2f8cff]/45 bg-[#07111f]/82 p-4 shadow-[0_0_26px_rgba(47,140,255,0.16),inset_0_1px_18px_rgba(99,148,216,0.08)]">
        <p className="text-sm text-slate-400">Overall XP</p>
        <div className="mt-1 flex items-end justify-between gap-3">
          <p className="text-3xl font-semibold leading-none text-white">
            {formatNumber(snapshot.progress.overallXp)}
          </p>
          <p className="text-sm font-medium text-[#4f8cff]">
            Level {snapshot.overallLevel.level}
          </p>
        </div>
      </section>

      <section className="space-y-2">
        {attributes.map((attribute) => (
          <AttributeRow attribute={attribute} key={attribute.key} />
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
        <Link aria-label="Back home" href="/">
          <ArrowLeft className="size-5" />
        </Link>
      </Button>
      <div>
        <p className="text-sm font-medium text-[#3d87ff]">Progress</p>
        <h1 className="text-3xl font-semibold leading-none tracking-[-0.03em] text-white">
          Attributes
        </h1>
      </div>
    </header>
  );
}

function AttributeRow({ attribute }: { attribute: AttributeWithLevel }) {
  const visual = attributeVisuals[attribute.key];
  const Icon = visual.icon;
  const styles = colorStyles[visual.color];
  const isLegendary = attribute.level.level >= 100;

  return (
    <article className="grid grid-cols-[3.75rem_minmax(0,1fr)] items-center gap-3 rounded-xl border border-slate-700/55 bg-[#07111f]/82 p-3 shadow-[0_10px_28px_rgba(0,0,0,0.28),inset_0_1px_18px_rgba(99,148,216,0.06)] backdrop-blur-xl">
      <div
        className={cn(
          "flex size-14 items-center justify-center border",
          styles.badge,
        )}
        style={{
          clipPath:
            "polygon(25% 6%, 75% 6%, 100% 50%, 75% 94%, 25% 94%, 0 50%)",
        }}
      >
        <Icon className={cn("size-7 stroke-[2.3]", styles.icon)} />
      </div>

      <div className="min-w-0 space-y-2">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="truncate text-lg font-medium leading-none text-white">
            {attribute.label}
          </h2>
          <span className="shrink-0 text-sm text-slate-300">
            Lv. <span className="text-white">{attribute.level.level}</span>
          </span>
        </div>

        <div className="h-2.5 overflow-hidden rounded-full bg-slate-800/85 shadow-[inset_0_1px_5px_rgba(0,0,0,0.55)]">
          <div
            className={cn("h-full rounded-full bg-gradient-to-r", styles.progress)}
            style={{ width: `${attribute.level.progressPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between gap-3 text-sm text-slate-400">
          <p className="truncate">
            {isLegendary
              ? `${formatNumber(attribute.level.totalXp)} total XP`
              : `${formatNumber(attribute.level.xpIntoLevel)} / ${formatNumber(
                  attribute.level.xpForNextLevel,
                )} XP`}
          </p>
          <p className="shrink-0 text-slate-500">
            Total {formatNumber(attribute.xp)}
          </p>
        </div>
      </div>
    </article>
  );
}
