"use client";

import {
  BookOpen,
  Coins,
  Flame,
  MessageSquare,
  Shield,
  Sword,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Attribute = {
  name: string;
  level: number;
  currentXp: number;
  nextXp: number;
  color: "purple" | "blue" | "green" | "gold" | "cyan" | "pink";
  icon: React.ComponentType<{ className?: string }>;
};

const attributes: Attribute[] = [
  {
    name: "Strength",
    level: 28,
    currentXp: 2450,
    nextXp: 3500,
    color: "purple",
    icon: Sword,
  },
  {
    name: "Intelligence",
    level: 26,
    currentXp: 2100,
    nextXp: 3000,
    color: "blue",
    icon: BookOpen,
  },
  {
    name: "Discipline",
    level: 29,
    currentXp: 2800,
    nextXp: 3800,
    color: "green",
    icon: Shield,
  },
  {
    name: "Finance",
    level: 24,
    currentXp: 1900,
    nextXp: 2800,
    color: "gold",
    icon: Coins,
  },
  {
    name: "Wisdom",
    level: 27,
    currentXp: 2200,
    nextXp: 3200,
    color: "cyan",
    icon: Flame,
  },
  {
    name: "Communication",
    level: 23,
    currentXp: 1600,
    nextXp: 2500,
    color: "pink",
    icon: MessageSquare,
  },
];

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

export default function CoreAttributesSection() {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3 px-1">
        <h2 className="text-lg font-medium text-white">Core Attributes</h2>
        <Button
          className="h-auto px-0 text-sm font-medium text-[#4f8cff] hover:text-[#78a8ff]"
          type="button"
          variant="link"
        >
          View All
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-2 min-[410px]:grid-cols-2">
        {attributes.map((attribute) => (
          <AttributeCard attribute={attribute} key={attribute.name} />
        ))}
      </div>
    </section>
  );
}

function AttributeCard({ attribute }: { attribute: Attribute }) {
  const Icon = attribute.icon;
  const percent = Math.min(
    100,
    Math.round((attribute.currentXp / attribute.nextXp) * 100),
  );
  const styles = colorStyles[attribute.color];

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
            {attribute.name}
          </h3>
          <span className="shrink-0 text-sm text-slate-300">
            Lv. <span className="text-white">{attribute.level}</span>
          </span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-slate-800/85 shadow-[inset_0_1px_5px_rgba(0,0,0,0.55)]">
          <div
            className={cn("h-full rounded-full bg-gradient-to-r", styles.progress)}
            style={{ width: `${percent}%` }}
          />
        </div>

        <p className="truncate text-sm text-slate-400">
          {formatXp(attribute.currentXp)} / {formatXp(attribute.nextXp)} XP
        </p>
      </div>
    </article>
  );
}
