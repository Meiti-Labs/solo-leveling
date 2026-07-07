"use client";

import {
  BookOpen,
  Coins,
  Flame,
  MessageSquare,
  Shield,
  Sword,
} from "lucide-react";
import Link from "next/link";
import type { ComponentType } from "react";
import { Button } from "@/components/ui/button";
import type { LevelProgress } from "@/lib/game/leveling";
import type {
  AttributeKey,
  AttributeProgress,
  CoreAttributeKey,
} from "@/lib/indexed-db/types";
import { ATTRIBUTE_KEYS } from "@/lib/indexed-db/types";
import { cn } from "@/lib/utils";

type Attribute = {
  key: AttributeKey;
  label: string;
  progress: LevelProgress;
  color: "purple" | "blue" | "green" | "gold" | "cyan" | "pink";
  icon: ComponentType<{ className?: string }>;
};

type AttributeWithLevel = AttributeProgress & { level: LevelProgress };

const attributeVisuals: Record<
  CoreAttributeKey,
  Pick<Attribute, "color" | "icon" | "label">
> = {
  strength: {
    label: "Strength",
    color: "purple",
    icon: Sword,
  },
  intelligence: {
    label: "Intelligence",
    color: "blue",
    icon: BookOpen,
  },
  discipline: {
    label: "Discipline",
    color: "green",
    icon: Shield,
  },
  finance: {
    label: "Finance",
    color: "gold",
    icon: Coins,
  },
  wisdom: {
    label: "Wisdom",
    color: "cyan",
    icon: Flame,
  },
  communication: {
    label: "Communication",
    color: "pink",
    icon: MessageSquare,
  },
};

const colorStyles: Record<
  Attribute["color"],
  {
    badge: string;
    icon: string;
    progress: string;
  }
> = {
  purple: {
    badge: "border-violet-500/70 bg-violet-950/35 shadow-[0_0_22px_rgba(139,92,246,0.22)]",
    icon: "text-violet-400",
    progress: "from-violet-500 to-fuchsia-400",
  },
  blue: {
    badge: "border-blue-500/70 bg-blue-950/35 shadow-[0_0_22px_rgba(59,130,246,0.22)]",
    icon: "text-blue-400",
    progress: "from-blue-500 to-sky-400",
  },
  green: {
    badge: "border-emerald-500/70 bg-emerald-950/35 shadow-[0_0_22px_rgba(16,185,129,0.22)]",
    icon: "text-emerald-400",
    progress: "from-emerald-500 to-teal-300",
  },
  gold: {
    badge: "border-amber-500/70 bg-amber-950/35 shadow-[0_0_22px_rgba(245,158,11,0.22)]",
    icon: "text-amber-300",
    progress: "from-amber-400 to-yellow-300",
  },
  cyan: {
    badge: "border-cyan-500/70 bg-cyan-950/35 shadow-[0_0_22px_rgba(6,182,212,0.22)]",
    icon: "text-cyan-300",
    progress: "from-cyan-500 to-sky-300",
  },
  pink: {
    badge: "border-pink-500/70 bg-pink-950/35 shadow-[0_0_22px_rgba(236,72,153,0.22)]",
    icon: "text-pink-400",
    progress: "from-pink-500 to-rose-300",
  },
};

const formatXp = (xp: number) => new Intl.NumberFormat("en-US").format(xp);

export default function CoreAttributesSection({
  attributes,
}: {
  attributes: AttributeWithLevel[];
}) {
  const cards = ATTRIBUTE_KEYS.map((key) => {
    const attribute = attributes.find((item) => item.key === key);
    const visual = attributeVisuals[key];

    if (!attribute) {
      return null;
    }

    return {
      key,
      label: attribute.label || visual.label,
      progress: attribute.level,
      color: visual.color,
      icon: visual.icon,
    } satisfies Attribute;
  }).filter(Boolean) as Attribute[];

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3 px-1">
        <h2 className="text-lg font-medium text-white">Core Attributes</h2>
        <Button
          asChild
          className="h-auto px-0 text-sm font-medium text-[#4f8cff] hover:text-[#78a8ff]"
          variant="link"
        >
          <Link href="/attributes">View All</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {cards.map((attribute) => (
          <AttributeCard attribute={attribute} key={attribute.key} />
        ))}
      </div>
    </section>
  );
}

function AttributeCard({ attribute }: { attribute: Attribute }) {
  const Icon = attribute.icon;
  const percent = attribute.progress.progressPercent;
  const styles = colorStyles[attribute.color];
  const isLegendary = attribute.progress.level >= 100;

  return (
    <article className="grid grid-cols-[3.25rem_minmax(0,1fr)] items-center gap-3 rounded-xl border border-slate-700/55 bg-[#07111f]/82 p-3 shadow-[0_10px_28px_rgba(0,0,0,0.28),inset_0_1px_18px_rgba(99,148,216,0.06)] backdrop-blur-xl">
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
        <Icon className={cn("size-6 stroke-[2.3]", styles.icon)} />
      </div>

      <div className="min-w-0 space-y-2 font-sans">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="truncate text-base font-medium leading-none text-white">
            {attribute.label}
          </h3>
          <span className="shrink-0 text-sm text-slate-300">
            Lv. <span className="text-white">{attribute.progress.level}</span>
          </span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-slate-800/85 shadow-[inset_0_1px_5px_rgba(0,0,0,0.55)]">
          <div
            className={cn("h-full rounded-full bg-gradient-to-r", styles.progress)}
            style={{ width: `${percent}%` }}
          />
        </div>

        <p className="truncate text-sm text-slate-400">
          {isLegendary
            ? `${formatXp(attribute.progress.totalXp)} total XP`
            : `${formatXp(attribute.progress.xpIntoLevel)} / ${formatXp(
                attribute.progress.xpForNextLevel,
              )} XP`}
        </p>
      </div>
    </article>
  );
}
