"use client";

import { useEffect, useMemo } from "react";
import { CalendarDays, CheckCircle2, Circle, Flame, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { isOffDay, toAppDate } from "@/lib/game/date";
import { cn } from "@/lib/utils";
import { useGameSnapshot } from "@/hooks/use-game-snapshot";

const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-US").format(value);

export default function TodayStreakCard({ revision }: { revision: number }) {
  const { error, isLoading, refresh, snapshot } = useGameSnapshot();
  const today = toAppDate();

  useEffect(() => {
    if (revision <= 0) {
      return;
    }

    void refresh().catch(() => undefined);
  }, [refresh, revision]);

  const streakState = useMemo(() => {
    if (!snapshot) {
      return null;
    }

    const activeDailyTasks = snapshot.tasks.filter(
      (task) => task.kind === "daily" && task.status === "active",
    );
    const completedTaskIds = new Set(
      snapshot.taskCompletions
        .filter(
          (completion) =>
            completion.taskKind === "daily" &&
            completion.completedForDate === today,
        )
        .map((completion) => completion.taskId),
    );
    const completedTasks = activeDailyTasks.filter((task) =>
      completedTaskIds.has(task.id),
    );
    const remainingTasks = activeDailyTasks.filter(
      (task) => !completedTaskIds.has(task.id),
    );
    const completionPercent = activeDailyTasks.length
      ? Math.round((completedTasks.length / activeDailyTasks.length) * 100)
      : 0;

    return {
      activeDailyTasks,
      completedTasks,
      completionPercent,
      isOffDay: isOffDay(today, snapshot.progress.weeklyOffDay),
      isSecured:
        activeDailyTasks.length > 0 && remainingTasks.length === 0,
      remainingTasks,
    };
  }, [snapshot, today]);

  if (isLoading) {
    return (
      <section className="h-36 animate-pulse rounded-2xl border border-slate-800/80 bg-[#07111f]/70" />
    );
  }

  if (error || !snapshot || !streakState) {
    return (
      <section className="rounded-2xl border border-rose-500/45 bg-rose-950/20 p-4 text-sm text-rose-100">
        Could not load today&apos;s streak plan.
      </section>
    );
  }

  const remainingCount = streakState.remainingTasks.length;

  return (
    <section className="space-y-3 rounded-2xl border border-[#2f8cff]/45 bg-[#07111f]/82 p-4 shadow-[0_10px_28px_rgba(0,0,0,0.28),inset_0_1px_18px_rgba(99,148,216,0.08)] backdrop-blur-xl">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-sm font-medium text-[#5aa0ff]">
            <CalendarDays className="size-4" />
            Today&apos;s Streak
          </p>
          <h2 className="mt-1 text-xl font-semibold leading-tight text-white">
            {streakState.isSecured
              ? "Streak secured"
              : remainingCount > 0
                ? `${remainingCount} daily quest${
                    remainingCount === 1 ? "" : "s"
                  } left`
                : "No daily quests"}
          </h2>
        </div>

        <div
          className={cn(
            "flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
            streakState.isSecured
              ? "border-emerald-400/50 bg-emerald-950/25 text-emerald-300"
              : streakState.isOffDay
                ? "border-cyan-400/45 bg-cyan-950/25 text-cyan-300"
                : "border-amber-400/45 bg-amber-950/25 text-amber-200",
          )}
        >
          {streakState.isSecured ? (
            <ShieldCheck className="size-3.5" />
          ) : (
            <Flame className="size-3.5" />
          )}
          {streakState.isSecured
            ? "Done"
            : streakState.isOffDay
              ? "Off day"
              : "Open"}
        </div>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3">
        <div className="min-w-0 space-y-2">
          <div className="h-2.5 overflow-hidden rounded-full bg-slate-800/85 shadow-[inset_0_1px_5px_rgba(0,0,0,0.55)]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#2f8cff] to-cyan-300"
              style={{ width: `${streakState.completionPercent}%` }}
            />
          </div>
          <p className="text-sm text-slate-400">
            {formatNumber(streakState.completedTasks.length)} /{" "}
            {formatNumber(streakState.activeDailyTasks.length)} daily quests
            completed
          </p>
        </div>

        <div className="text-right">
          <p className="text-xs text-slate-400">Current</p>
          <p className="text-2xl font-semibold leading-none text-white">
            {formatNumber(snapshot.progress.currentStreak)}
          </p>
        </div>
      </div>

      {streakState.activeDailyTasks.length === 0 ? (
        <Button
          asChild
          className="h-10 w-full rounded-xl bg-[#0d4fe0] text-white hover:bg-[#155df0]"
        >
          <Link href="/quests/create">Create Daily Quest</Link>
        </Button>
      ) : streakState.isSecured ? (
        <p className="rounded-xl border border-emerald-400/35 bg-emerald-950/20 px-3 py-2 text-sm text-emerald-100">
          All active dailies are complete. Today&apos;s streak is locked in.
        </p>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-slate-300">
            Complete these to secure today&apos;s streak:
          </p>
          <div className="space-y-1.5">
            {streakState.remainingTasks.slice(0, 3).map((task) => (
              <div
                className="flex items-center gap-2 rounded-xl border border-slate-700/50 bg-[#030914]/55 px-3 py-2 text-sm text-white"
                key={task.id}
              >
                <Circle className="size-3.5 shrink-0 text-slate-500" />
                <span className="min-w-0 truncate">{task.title}</span>
              </div>
            ))}
            {streakState.remainingTasks.length > 3 && (
              <p className="px-1 text-xs text-slate-500">
                +{streakState.remainingTasks.length - 3} more daily quest
                {streakState.remainingTasks.length - 3 === 1 ? "" : "s"}
              </p>
            )}
          </div>
        </div>
      )}

      {streakState.isOffDay && !streakState.isSecured && (
        <p className="flex items-center gap-2 text-xs leading-relaxed text-cyan-200/85">
          <CheckCircle2 className="size-4 shrink-0" />
          Off day is active: missing dailies will not break the streak, and
          completed quests earn the off-day multiplier.
        </p>
      )}
    </section>
  );
}
