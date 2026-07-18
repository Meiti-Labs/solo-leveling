"use client";

import { BadgeDollarSign, ClipboardList, Flame, Sparkles } from "lucide-react";
import type { ComponentType } from "react";
import type { GameSnapshot } from "@/hooks/use-game-snapshot";
import { isOffDay, toAppDate } from "@/lib/game/date";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type OverviewStat = {
  label: string;
  value: string;
  helper: string;
  tone: "blue" | "amber" | "purple" | "gold";
  icon: ComponentType<{ className?: string }>;
};

const toneStyles: Record<
  OverviewStat["tone"],
  {
    box: string;
    icon: string;
    helper: string;
  }
> = {
  blue: {
    box: "border-blue-500/25 bg-blue-950/20",
    icon: "text-blue-400",
    helper: "text-emerald-400",
  },
  amber: {
    box: "border-amber-500/25 bg-amber-950/20",
    icon: "text-amber-400",
    helper: "text-slate-400",
  },
  purple: {
    box: "border-indigo-500/25 bg-indigo-950/20",
    icon: "text-indigo-300",
    helper: "text-slate-400",
  },
  gold: {
    box: "border-yellow-500/25 bg-yellow-950/20",
    icon: "text-yellow-400",
    helper: "text-slate-400",
  },
};

export default function TodayOverviewSection({
  snapshot,
}: {
  snapshot: GameSnapshot;
}) {
  const { formatNumber, t } = useI18n();
  const today = toAppDate();
  const todaysCompletions = snapshot.taskCompletions.filter(
    (completion) => completion.completedForDate === today,
  );
  const todaysXp = todaysCompletions.reduce(
    (total, completion) => total + completion.earnedXp,
    0,
  );
  const activeTasks = snapshot.tasks.filter((task) => task.status === "active");
  const activeDailyTasks = activeTasks.filter((task) => task.kind === "daily");
  const completedDailyTasks = todaysCompletions.filter(
    (completion) => completion.taskKind === "daily",
  ).length;
  const offDay = isOffDay(today, snapshot.progress.weeklyOffDay);
  const overviewStats: OverviewStat[] = [
    {
      label: t("home.todayXp"),
      value: formatNumber(todaysXp),
      helper: offDay
        ? t("home.twoXOffDay")
        : t("home.dailyCount", {
            done: completedDailyTasks,
            total: activeDailyTasks.length,
          }),
      tone: "blue",
      icon: Sparkles,
    },
    {
      label: t("home.currentStreak"),
      value: formatNumber(snapshot.progress.currentStreak),
      helper: t("home.days"),
      tone: "amber",
      icon: Flame,
    },
    {
      label: t("home.activeQuests"),
      value: formatNumber(activeTasks.length),
      helper: t("home.ongoing"),
      tone: "purple",
      icon: ClipboardList,
    },
    {
      label: t("home.coins"),
      value: formatNumber(snapshot.progress.coins),
      helper: `${formatNumber(snapshot.progress.gems)} ${t("common.gems")}`,
      tone: "gold",
      icon: BadgeDollarSign,
    },
  ];

  return (
    <section className="space-y-3">
      <h2 className="px-1 text-lg font-medium text-white">{t("home.todayOverview")}</h2>

      <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-slate-700/55 bg-[#07111f]/82 shadow-[0_10px_28px_rgba(0,0,0,0.28),inset_0_1px_18px_rgba(99,148,216,0.06)] backdrop-blur-xl min-[430px]:grid-cols-4">
        {overviewStats.map((stat, index) => (
          <OverviewStatItem
            index={index}
            key={stat.label}
            stat={stat}
          />
        ))}
      </div>
    </section>
  );
}

function OverviewStatItem({
  index,
  stat,
}: {
  index: number;
  stat: OverviewStat;
}) {
  const Icon = stat.icon;
  const styles = toneStyles[stat.tone];

  return (
    <article
      className={cn(
        "relative min-w-0 p-4 font-sans",
        index % 2 === 1 && "border-l border-slate-700/55",
        index > 1 && "border-t border-slate-700/55 min-[430px]:border-t-0",
        index > 0 && "min-[430px]:border-l min-[430px]:border-slate-700/55",
      )}
    >
      <div className="flex items-start gap-3 min-[430px]:flex-col min-[430px]:gap-2">
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl border",
            styles.box,
          )}
        >
          <Icon className={cn("size-5 stroke-[2.2]", styles.icon)} />
        </div>

        <div className="min-w-0 space-y-1">
          <p className="truncate text-sm font-medium text-slate-300">
            {stat.label}
          </p>
          <p className="text-3xl font-semibold leading-tight text-white">
            {stat.value}
          </p>
          <p className={cn("truncate text-sm font-medium", styles.helper)}>
            {stat.helper}
          </p>
        </div>
      </div>
    </article>
  );
}
