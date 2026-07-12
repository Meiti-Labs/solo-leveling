"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Check, Flame, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toAppDate } from "@/lib/game/date";
import type {
  ActivityEvent,
  AppDate,
  TaskCompletion,
  TaskDefinition,
} from "@/lib/indexed-db/types";
import { cn } from "@/lib/utils";

type TaskStreakCalendarProps = {
  activityEvents: ActivityEvent[];
  completions: TaskCompletion[];
  task: TaskDefinition;
  weeklyOffDay: number;
};

type CalendarDay = {
  date: Date;
  dateKey: AppDate;
  dayNumber: number;
  isCompleted: boolean;
  isCurrentMonth: boolean;
  isCurrentStreak: boolean;
  isFreeDay: boolean;
  isMissed: boolean;
  isToday: boolean;
  startsCurrentStreak: boolean;
  endsCurrentStreak: boolean;
};

const weekdayLabels = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const monthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
});

export default function TaskStreakCalendar({
  activityEvents,
  completions,
  task,
  weeklyOffDay,
}: TaskStreakCalendarProps) {
  const today = toAppDate();
  const [visibleMonth, setVisibleMonth] = useState(() =>
    getMonthStart(fromAppDate(today)),
  );
  const calendarData = useMemo(
    () =>
      buildCalendarData({
        activityEvents,
        completions,
        task,
        today,
        visibleMonth,
        weeklyOffDay,
      }),
    [activityEvents, completions, task, today, visibleMonth, weeklyOffDay],
  );

  function moveMonth(delta: number) {
    setVisibleMonth((current) => {
      const next = new Date(current);
      next.setMonth(current.getMonth() + delta);
      return getMonthStart(next);
    });
  }

  return (
    <section className="relative overflow-hidden rounded-2xl border border-amber-400/35 bg-[#050b16] p-4 shadow-[0_0_30px_rgba(245,158,11,0.13),inset_0_1px_22px_rgba(99,148,216,0.08)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(47,140,255,0.18),transparent_36%),radial-gradient(circle_at_82%_4%,rgba(245,158,11,0.18),transparent_28%)]" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-blue-950/25 to-transparent" />

      <div className="relative space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-amber-300">Streak Calendar</p>
            <h2 className="mt-1 truncate text-2xl font-semibold leading-none text-white">
              {task.title}
            </h2>
          </div>
          <div className="flex shrink-0 items-center gap-2 rounded-full border border-amber-400/35 bg-amber-950/20 px-3 py-1.5 text-amber-200 shadow-[0_0_18px_rgba(245,158,11,0.18)]">
            <Flame className="size-5 fill-amber-300/25" />
            <span className="text-lg font-semibold">
              {calendarData.currentStreak}
            </span>
          </div>
        </div>

        <div className="rounded-[1.35rem] border border-[#2f8cff]/35 bg-[#07111f]/72 p-3 shadow-[inset_0_1px_18px_rgba(99,148,216,0.08)]">
          <div className="mb-4 flex items-center justify-between gap-3">
            <Button
              aria-label="Previous month"
              className="size-10 rounded-full border border-slate-700/70 bg-slate-950/40 text-slate-200 hover:border-[#2f8cff]/55 hover:bg-blue-950/30"
              onClick={() => moveMonth(-1)}
              size="icon"
              type="button"
              variant="ghost"
            >
              <ChevronLeft className="size-5" />
            </Button>
            <h3 className="truncate text-xl font-semibold text-white">
              {monthFormatter.format(visibleMonth)}
            </h3>
            <Button
              aria-label="Next month"
              className="size-10 rounded-full border border-slate-700/70 bg-slate-950/40 text-slate-200 hover:border-[#2f8cff]/55 hover:bg-blue-950/30"
              onClick={() => moveMonth(1)}
              size="icon"
              type="button"
              variant="ghost"
            >
              <ChevronRight className="size-5" />
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-y-2">
            {weekdayLabels.map((label) => (
              <div
                className="text-center text-sm font-semibold text-slate-400"
                key={label}
              >
                {label}
              </div>
            ))}

            {calendarData.days.map((day) => (
              <CalendarCell day={day} key={day.dateKey} />
            ))}
          </div>

          <div className="mt-5 border-t border-slate-700/55 pt-4">
            <div className="grid grid-cols-3 gap-2 text-xs font-medium text-slate-300">
              <LegendItem
                icon={
                  <span className="flex size-6 items-center justify-center rounded-full border border-amber-300/70 bg-amber-400/25 shadow-[0_0_14px_rgba(245,158,11,0.45)]">
                    <Check className="size-3.5 text-amber-100" />
                  </span>
                }
                label="Completed"
              />
              <LegendItem
                icon={
                  <span className="h-4 w-9 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 shadow-[0_0_14px_rgba(245,158,11,0.42)]" />
                }
                label="Current"
              />
              <LegendItem
                icon={
                  <span className="flex size-6 items-center justify-center rounded-full border border-rose-400/30 bg-rose-950/35">
                    <X className="size-3.5 text-rose-300" />
                  </span>
                }
                label="Missed"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex w-full items-center gap-3">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#2f8cff]/60" />
            <span className="flex size-13 items-center justify-center rounded-full border border-[#2f8cff]/45 bg-blue-950/25 text-amber-300 shadow-[0_0_18px_rgba(47,140,255,0.2)]">
              <Flame className="size-7 fill-amber-300/20" />
            </span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#2f8cff]/60" />
          </div>
          <p className="text-2xl font-semibold text-white">
            {calendarData.currentStreak}-day streak
          </p>
          <p className="text-sm text-slate-400">
            {calendarData.currentStreak > 0
              ? "Keep the chain alive."
              : "Complete this quest to start the chain."}
          </p>
        </div>
      </div>
    </section>
  );
}

function CalendarCell({ day }: { day: CalendarDay }) {
  if (!day.isCurrentMonth) {
    return <div className="h-12" />;
  }

  return (
    <div className="relative flex h-12 items-center justify-center">
      {day.isCurrentStreak && (
        <div
          className={cn(
            "absolute inset-x-0 top-1/2 h-9 -translate-y-1/2 bg-gradient-to-r from-amber-400 to-yellow-300 shadow-[0_0_18px_rgba(245,158,11,0.32)]",
            day.startsCurrentStreak && "rounded-l-full",
            day.endsCurrentStreak && "rounded-r-full",
          )}
        />
      )}

      <span
        className={cn(
          "relative z-10 flex size-9 items-center justify-center rounded-full text-base font-semibold transition",
          day.isCurrentStreak && "text-slate-950",
          day.isCompleted &&
            !day.isCurrentStreak &&
            "border border-amber-300/55 bg-amber-400/20 text-amber-100 shadow-[0_0_18px_rgba(245,158,11,0.36)]",
          day.isMissed &&
            !day.isCompleted &&
            "border border-rose-400/25 bg-rose-950/25 text-rose-300",
          !day.isCompleted &&
            !day.isMissed &&
            !day.isCurrentStreak &&
            "text-slate-500",
          day.isToday &&
            !day.isCurrentStreak &&
            "ring-1 ring-[#5aa0ff]/70 ring-offset-2 ring-offset-[#07111f]",
        )}
      >
        {day.isMissed && !day.isCompleted ? (
          <X className="size-4" />
        ) : (
          day.dayNumber
        )}
      </span>
    </div>
  );
}

function LegendItem({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="flex min-w-0 items-center justify-center gap-2">
      <span className="shrink-0">{icon}</span>
      <span className="truncate">{label}</span>
    </div>
  );
}

function buildCalendarData({
  activityEvents,
  completions,
  task,
  today,
  visibleMonth,
  weeklyOffDay,
}: {
  activityEvents: ActivityEvent[];
  completions: TaskCompletion[];
  task: TaskDefinition;
  today: AppDate;
  visibleMonth: Date;
  weeklyOffDay: number;
}) {
  const completionDates = new Set(
    completions
      .filter((completion) => completion.taskId === task.id)
      .map((completion) => completion.completedForDate),
  );
  const missedDates = getMissedDatesForTask(activityEvents, task.id);
  const taskCreatedDate = toDateKey(new Date(task.createdAt));
  const currentStreakDates = getCurrentStreakDates({
    completionDates,
    taskCreatedDate,
    today,
    weeklyOffDay,
  });
  const monthStart = getMonthStart(visibleMonth);
  const firstGridDate = addDays(monthStart, -monthStart.getDay());
  const days = Array.from({ length: 42 }, (_, index) => {
    const date = addDays(firstGridDate, index);
    const dateKey = toDateKey(date);
    const previousDateKey = toDateKey(addDays(date, -1));
    const nextDateKey = toDateKey(addDays(date, 1));
    const isCurrentStreak = currentStreakDates.has(dateKey);
    const isFreeDay =
      dateKey >= taskCreatedDate &&
      dateKey <= today &&
      date.getDay() === weeklyOffDay;
    const isCompleted = completionDates.has(dateKey) || isFreeDay;

    return {
      date,
      dateKey,
      dayNumber: date.getDate(),
      isCompleted,
      isCurrentMonth: date.getMonth() === monthStart.getMonth(),
      isCurrentStreak,
      isFreeDay,
      isMissed: missedDates.has(dateKey) && !isFreeDay,
      isToday: dateKey === today,
      startsCurrentStreak:
        isCurrentStreak &&
        (date.getDay() === 0 || !currentStreakDates.has(previousDateKey)),
      endsCurrentStreak:
        isCurrentStreak &&
        (date.getDay() === 6 || !currentStreakDates.has(nextDateKey)),
    };
  });

  return {
    currentStreak: currentStreakDates.size,
    days,
  };
}

function getMissedDatesForTask(activityEvents: ActivityEvent[], taskId: string) {
  const missedDates = new Set<AppDate>();

  for (const event of activityEvents) {
    if (event.type !== "daily-missed") {
      continue;
    }

    const date = event.metadata?.date;
    const taskIds = event.metadata?.taskIds;

    if (
      typeof date === "string" &&
      Array.isArray(taskIds) &&
      taskIds.includes(taskId)
    ) {
      missedDates.add(date);
    }
  }

  return missedDates;
}

function getCurrentStreakDates({
  completionDates,
  taskCreatedDate,
  today,
  weeklyOffDay,
}: {
  completionDates: Set<AppDate>;
  taskCreatedDate: AppDate;
  today: AppDate;
  weeklyOffDay: number;
}) {
  const streakDates = new Set<AppDate>();
  let cursor =
    completionDates.has(today) || fromAppDate(today).getDay() === weeklyOffDay
      ? today
      : toDateKey(addDays(fromAppDate(today), -1));

  while (cursor >= taskCreatedDate) {
    const cursorDate = fromAppDate(cursor);

    if (completionDates.has(cursor) || cursorDate.getDay() === weeklyOffDay) {
      streakDates.add(cursor);
      cursor = toDateKey(addDays(cursorDate, -1));
      continue;
    }

    break;
  }

  return streakDates;
}

function getMonthStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(date.getDate() + days);
  return next;
}

function fromAppDate(date: AppDate) {
  return new Date(`${date}T00:00:00`);
}

function toDateKey(date: Date): AppDate {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
