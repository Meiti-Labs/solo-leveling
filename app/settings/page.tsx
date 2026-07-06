"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BellRing,
  CalendarDays,
  Database,
  Download,
  Flame,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  gameService,
  normalizeNotificationPreferences,
  NOTIFICATION_PREFERENCES_KEY,
} from "@/lib/game";
import type {
  NotificationPreferenceKey,
  NotificationPreferences,
} from "@/lib/game";
import { settingsService } from "@/lib/indexed-db";
import { cn } from "@/lib/utils";
import { useGameSnapshot } from "@/hooks/use-game-snapshot";

const weekDays = [
  { label: "Sun", value: 0 },
  { label: "Mon", value: 1 },
  { label: "Tue", value: 2 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 4 },
  { label: "Fri", value: 5 },
  { label: "Sat", value: 6 },
];

const notificationItems: Array<{
  description: string;
  icon: ReactNode;
  key: NotificationPreferenceKey;
  title: string;
}> = [
  {
    description: "A gentle local reminder to clear daily quests.",
    icon: <BellRing className="size-5" />,
    key: "dailyQuestReminder",
    title: "Daily quest reminder",
  },
  {
    description: "Warn before your current streak is at risk.",
    icon: <Flame className="size-5" />,
    key: "streakProtection",
    title: "Streak protection",
  },
  {
    description: "Surface boss quests that are close to their deadline.",
    icon: <Trophy className="size-5" />,
    key: "bossDeadlineWarning",
    title: "Boss deadline warning",
  },
  {
    description: "Include store purchases and redeemed rewards in reminders.",
    icon: <Sparkles className="size-5" />,
    key: "rewardActivity",
    title: "Reward activity",
  },
];

export default function SettingsPage() {
  const { error, isLoading, refresh, snapshot } = useGameSnapshot();
  const [notice, setNotice] = useState<string | null>(null);
  const [resetText, setResetText] = useState("");
  const [isSavingOffDay, setIsSavingOffDay] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [notificationPreferences, setNotificationPreferences] =
    useState<NotificationPreferences>(normalizeNotificationPreferences());
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);
  const [savingNotificationKey, setSavingNotificationKey] =
    useState<NotificationPreferenceKey | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadNotificationPreferences() {
      try {
        const stored =
          await settingsService.get<Partial<NotificationPreferences>>(
            NOTIFICATION_PREFERENCES_KEY,
          );

        if (isMounted) {
          setNotificationPreferences(
            normalizeNotificationPreferences(stored),
          );
        }
      } finally {
        if (isMounted) {
          setIsLoadingNotifications(false);
        }
      }
    }

    loadNotificationPreferences();

    return () => {
      isMounted = false;
    };
  }, []);

  async function updateOffDay(day: number) {
    try {
      setNotice(null);
      setIsSavingOffDay(true);
      await gameService.updateWeeklyOffDay(day);
      await refresh();
      setNotice(`${weekDays[day].label} is now your weekly off day.`);
    } catch (caughtError) {
      setNotice(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not update weekly off day.",
      );
    } finally {
      setIsSavingOffDay(false);
    }
  }

  async function exportData() {
    try {
      const data = await gameService.exportLocalData();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `solo-leveling-export-${new Date()
        .toISOString()
        .slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
      setNotice("Local data export prepared.");
    } catch (caughtError) {
      setNotice(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not export local data.",
      );
    }
  }

  async function resetData() {
    if (resetText !== "RESET") {
      setNotice("Type RESET before resetting local game data.");
      return;
    }

    try {
      setIsResetting(true);
      await gameService.resetLocalGameData();
      await refresh();
      setResetText("");
      setNotificationPreferences(normalizeNotificationPreferences());
      setNotice("Local game data reset. Your Telegram profile was preserved.");
    } catch (caughtError) {
      setNotice(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not reset local game data.",
      );
    } finally {
      setIsResetting(false);
    }
  }

  async function updateNotificationPreference(
    key: NotificationPreferenceKey,
    value: boolean,
  ) {
    const nextPreferences = {
      ...notificationPreferences,
      [key]: value,
    };

    try {
      setNotice(null);
      setSavingNotificationKey(key);
      setNotificationPreferences(nextPreferences);
      await settingsService.set(
        NOTIFICATION_PREFERENCES_KEY,
        nextPreferences,
      );
      setNotice("Notification preferences saved locally.");
    } catch (caughtError) {
      setNotificationPreferences(notificationPreferences);
      setNotice(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not save notification preferences.",
      );
    } finally {
      setSavingNotificationKey(null);
    }
  }

  if (isLoading) {
    return (
      <main className="mx-auto min-h-[calc(100svh-8rem)] w-full max-w-md space-y-4 px-3 py-4">
        <SettingsHeader />
        {Array.from({ length: 4 }).map((_, index) => (
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
      <main className="mx-auto min-h-[calc(100svh-8rem)] w-full max-w-md space-y-4 px-3 py-4">
        <SettingsHeader />
        <section className="rounded-xl border border-rose-500/50 bg-rose-950/20 p-4 text-sm text-rose-100">
          Could not load settings. {error?.message}
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-[calc(100svh-8rem)] w-full max-w-md space-y-4 px-3 py-4">
      <SettingsHeader />

      {notice && (
        <p className="rounded-xl border border-[#2f8cff]/45 bg-blue-950/25 px-3 py-2 text-sm text-blue-100">
          {notice}
        </p>
      )}

      <section className="space-y-3 rounded-2xl border border-slate-700/55 bg-[#07111f]/82 p-4 shadow-[0_10px_28px_rgba(0,0,0,0.28),inset_0_1px_18px_rgba(99,148,216,0.06)] backdrop-blur-xl">
        <SectionTitle
          icon={<CalendarDays className="size-5" />}
          title="Weekly Off Day"
        />
        <p className="text-sm leading-relaxed text-slate-400">
          Missing tasks on this day will not break streak or remove XP. Any
          quest progress you do complete counts double.
        </p>
        <div className="grid grid-cols-7 gap-1.5">
          {weekDays.map((day) => {
            const isActive = snapshot.progress.weeklyOffDay === day.value;

            return (
              <Button
                className={cn(
                  "h-11 rounded-xl border px-0 text-sm font-semibold",
                  isActive
                    ? "border-[#2f8cff]/80 bg-[#0d4fe0] text-white shadow-[0_0_16px_rgba(47,140,255,0.45)] hover:bg-[#155df0]"
                    : "border-slate-700/60 bg-[#030914]/70 text-slate-300 hover:bg-[#0b1728] hover:text-white",
                )}
                disabled={isSavingOffDay}
                key={day.value}
                onClick={() => updateOffDay(day.value)}
                type="button"
                variant={isActive ? "default" : "ghost"}
              >
                {day.label}
              </Button>
            );
          })}
        </div>
      </section>

      <section className="grid grid-cols-3 gap-2">
        <SummaryCard label="Tasks" value={snapshot.tasks.length} />
        <SummaryCard label="Rewards" value={snapshot.rewards.length} />
        <SummaryCard label="Events" value={snapshot.activityEvents.length} />
      </section>

      <section className="space-y-3 rounded-2xl border border-slate-700/55 bg-[#07111f]/82 p-4 shadow-[0_10px_28px_rgba(0,0,0,0.28),inset_0_1px_18px_rgba(99,148,216,0.06)] backdrop-blur-xl">
        <SectionTitle
          icon={<BellRing className="size-5" />}
          title="Notification Preferences"
        />
        <p className="text-sm leading-relaxed text-slate-400">
          Stored locally for future Telegram reminders. These toggles do not ask
          for browser notification permission.
        </p>
        <div className="space-y-2">
          {notificationItems.map((item) => (
            <NotificationPreferenceRow
              description={item.description}
              icon={item.icon}
              isChecked={notificationPreferences[item.key]}
              isDisabled={
                isLoadingNotifications || savingNotificationKey === item.key
              }
              key={item.key}
              onChange={(value) =>
                updateNotificationPreference(item.key, value)
              }
              title={item.title}
            />
          ))}
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-slate-700/55 bg-[#07111f]/82 p-4 shadow-[0_10px_28px_rgba(0,0,0,0.28),inset_0_1px_18px_rgba(99,148,216,0.06)] backdrop-blur-xl">
        <SectionTitle icon={<Database className="size-5" />} title="Local Data" />
        <p className="text-sm leading-relaxed text-slate-400">
          This mini app stores progress on this device in IndexedDB. Export
          before changing phones or clearing browser data.
        </p>
        <Button
          className="h-11 w-full rounded-xl border border-[#2f8cff]/70 bg-blue-950/35 text-white hover:bg-blue-950/55"
          onClick={exportData}
          type="button"
          variant="ghost"
        >
          <Download className="size-5" />
          Export JSON
        </Button>
      </section>

      <section className="space-y-3 rounded-2xl border border-rose-500/40 bg-rose-950/15 p-4 shadow-[0_10px_28px_rgba(0,0,0,0.28),inset_0_1px_18px_rgba(244,63,94,0.06)] backdrop-blur-xl">
        <SectionTitle
          icon={<ShieldCheck className="size-5" />}
          title="Reset Progress"
        />
        <p className="text-sm leading-relaxed text-rose-100/75">
          This clears quests, completions, rewards, wallet history, achievements,
          and activity. Your Telegram profile stays linked.
        </p>
        <input
          className="h-11 w-full rounded-xl border border-rose-500/35 bg-[#030914]/80 px-3 text-base text-white outline-none transition placeholder:text-rose-200/35 focus:border-rose-400/80 focus:ring-2 focus:ring-rose-500/20"
          onChange={(event) => setResetText(event.target.value)}
          placeholder="Type RESET"
          value={resetText}
        />
        <Button
          className="h-11 w-full rounded-xl border border-rose-400/55 bg-rose-950/35 text-rose-100 hover:bg-rose-950/55 disabled:opacity-45"
          disabled={resetText !== "RESET" || isResetting}
          onClick={resetData}
          type="button"
          variant="ghost"
        >
          <RotateCcw className="size-5" />
          {isResetting ? "Resetting..." : "Reset Local Game Data"}
        </Button>
      </section>
    </main>
  );
}

function SettingsHeader() {
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
        <p className="text-sm font-medium text-[#3d87ff]">App Control</p>
        <h1 className="text-3xl font-semibold leading-none tracking-[-0.03em] text-white">
          Settings
        </h1>
      </div>
    </header>
  );
}

function SectionTitle({
  icon,
  title,
}: {
  icon: ReactNode;
  title: string;
}) {
  return (
    <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
      <span className="text-[#4f8cff]">{icon}</span>
      {title}
    </h2>
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

function NotificationPreferenceRow({
  description,
  icon,
  isChecked,
  isDisabled,
  onChange,
  title,
}: {
  description: string;
  icon: ReactNode;
  isChecked: boolean;
  isDisabled: boolean;
  onChange: (value: boolean) => void;
  title: string;
}) {
  return (
    <article className="grid grid-cols-[2.75rem_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-slate-700/55 bg-[#030914]/55 p-3">
      <div className="flex size-10 items-center justify-center rounded-xl border border-[#2f8cff]/35 bg-blue-950/25 text-[#5aa0ff]">
        {icon}
      </div>
      <div className="min-w-0">
        <h3 className="truncate text-sm font-semibold text-white">{title}</h3>
        <p className="mt-0.5 text-xs leading-snug text-slate-400">
          {description}
        </p>
      </div>
      <button
        aria-checked={isChecked}
        aria-label={title}
        className={cn(
          "relative h-7 w-12 rounded-full border transition disabled:opacity-50",
          isChecked
            ? "border-[#2f8cff]/75 bg-[#0d4fe0] shadow-[0_0_14px_rgba(47,140,255,0.35)]"
            : "border-slate-700/70 bg-slate-950/70",
        )}
        disabled={isDisabled}
        onClick={() => onChange(!isChecked)}
        role="switch"
        type="button"
      >
        <span
          className={cn(
            "absolute top-1/2 size-5 -translate-y-1/2 rounded-full bg-white shadow transition",
            isChecked ? "left-6" : "left-1",
          )}
        />
      </button>
    </article>
  );
}
