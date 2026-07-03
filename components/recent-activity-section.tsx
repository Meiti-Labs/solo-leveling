"use client";

import { Coins, Crown, Skull, Trophy } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ActivityTone = "blue" | "green" | "gold" | "purple";

type ActivityItem = {
  title: string;
  description: string;
  time: string;
  xp: number;
  tone: ActivityTone;
  icon: React.ComponentType<{ className?: string }>;
};

const activities: ActivityItem[] = [
  {
    title: "Level Up!",
    description: "You reached Level 28",
    time: "2h ago",
    xp: 1200,
    tone: "blue",
    icon: Crown,
  },
  {
    title: "Achievement Unlocked",
    description: "Consistent Warrior",
    time: "5h ago",
    xp: 750,
    tone: "green",
    icon: Trophy,
  },
  {
    title: "Quest Completed",
    description: "Morning Workout",
    time: "8h ago",
    xp: 250,
    tone: "gold",
    icon: Coins,
  },
  {
    title: "Boss Quest Progress",
    description: "Inner Procrastination (75%)",
    time: "Yesterday",
    xp: 600,
    tone: "purple",
    icon: Skull,
  },
];

const toneStyles: Record<
  ActivityTone,
  {
    badge: string;
    icon: string;
  }
> = {
  blue: {
    badge: "border-blue-500/70 bg-blue-950/35 shadow-[0_0_22px_rgba(59,130,246,0.2)]",
    icon: "text-blue-400",
  },
  green: {
    badge: "border-emerald-500/70 bg-emerald-950/35 shadow-[0_0_22px_rgba(16,185,129,0.2)]",
    icon: "text-emerald-400",
  },
  gold: {
    badge: "border-amber-500/70 bg-amber-950/35 shadow-[0_0_22px_rgba(245,158,11,0.2)]",
    icon: "text-amber-300",
  },
  purple: {
    badge: "border-violet-500/70 bg-violet-950/35 shadow-[0_0_22px_rgba(139,92,246,0.2)]",
    icon: "text-violet-400",
  },
};

const formatXp = (xp: number) => new Intl.NumberFormat("en-US").format(xp);

export default function RecentActivitySection() {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3 px-1">
        <h2 className="text-lg font-medium text-white">Recent Activity</h2>
        <Button
          asChild
          className="h-auto px-0 text-sm font-medium text-[#4f8cff] hover:text-[#78a8ff]"
          variant="link"
        >
          <Link href="/activity">View All</Link>
        </Button>
      </div>

      <div className="space-y-2">
        {activities.map((activity) => (
          <ActivityRow activity={activity} key={activity.title} />
        ))}
      </div>
    </section>
  );
}

function ActivityRow({ activity }: { activity: ActivityItem }) {
  const Icon = activity.icon;
  const styles = toneStyles[activity.tone];

  return (
    <article className="grid grid-cols-[3.25rem_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-slate-700/55 bg-[#07111f]/82 p-3 font-sans shadow-[0_10px_28px_rgba(0,0,0,0.28),inset_0_1px_18px_rgba(99,148,216,0.06)] backdrop-blur-xl">
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

      <div className="min-w-0 space-y-1">
        <h3 className="truncate text-base font-medium leading-tight text-white">
          {activity.title}
        </h3>
        <p className="truncate text-sm text-slate-400">{activity.description}</p>
      </div>

      <div className="shrink-0 space-y-2 text-right">
        <p className="text-sm text-slate-400">{activity.time}</p>
        <p className="text-base font-semibold text-emerald-400">
          +{formatXp(activity.xp)} XP
        </p>
      </div>
    </article>
  );
}
