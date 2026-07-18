"use client";

import { Coins, Crown, PackageCheck, Skull, Trophy } from "lucide-react";
import Link from "next/link";
import type { ComponentType } from "react";
import { Button } from "@/components/ui/button";
import type { ActivityEvent } from "@/lib/indexed-db/types";
import { translateGameText, useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type ActivityTone = "blue" | "green" | "gold" | "purple" | "red";

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
  red: {
    badge: "border-rose-500/70 bg-rose-950/35 shadow-[0_0_22px_rgba(244,63,94,0.2)]",
    icon: "text-rose-400",
  },
};

export default function RecentActivitySection({
  activities,
}: {
  activities: ActivityEvent[];
}) {
  const { formatNumber, language, t } = useI18n();
  const recentActivities = activities.slice(0, 4);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3 px-1">
        <h2 className="text-lg font-medium text-white">{t("home.recentActivity")}</h2>
        <Button
          asChild
          className="h-auto px-0 text-sm font-medium text-[#4f8cff] hover:text-[#78a8ff]"
          variant="link"
        >
          <Link href="/activity">{t("action.viewAll")}</Link>
        </Button>
      </div>

      <div className="space-y-2">
        {recentActivities.length === 0 ? (
          <p className="rounded-xl border border-slate-700/55 bg-[#07111f]/82 p-4 text-sm text-slate-300">
            {t("home.noActivity")}
          </p>
        ) : (
          recentActivities.map((activity) => (
            <ActivityRow
              activity={activity}
              formatNumber={formatNumber}
              key={activity.id}
              language={language}
              t={t}
            />
          ))
        )}
      </div>
    </section>
  );
}

function ActivityRow({
  activity,
  formatNumber,
  language,
  t,
}: {
  activity: ActivityEvent;
  formatNumber: (value: number) => string;
  language: "en" | "fa";
  t: (key: string) => string;
}) {
  const visual = getActivityVisual(activity);
  const Icon = visual.icon;
  const styles = toneStyles[visual.tone];
  const delta = formatActivityDelta(activity, formatNumber, t);

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
          {translateGameText(activity.title, language)}
        </h3>
        <p className="truncate text-sm text-slate-400">
          {translateGameText(activity.description, language) ?? t("activity.progressUpdated")}
        </p>
      </div>

      <div className="shrink-0 space-y-2 text-right">
        <p className="text-sm text-slate-400">
          {formatRelativeTime(activity.occurredAt, t, formatNumber)}
        </p>
        {delta && (
          <p
            className={cn(
              "text-base font-semibold",
              delta.isNegative ? "text-rose-400" : "text-emerald-400",
            )}
          >
            {delta.label}
          </p>
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
    return { icon: Coins, tone: "purple" };
  }

  if (activity.type === "reward-redeemed") {
    return { icon: PackageCheck, tone: "green" };
  }

  return { icon: Coins, tone: "gold" };
}

function formatActivityDelta(
  activity: ActivityEvent,
  formatNumber: (value: number) => string,
  t: (key: string) => string,
) {
  const xpDelta = activity.xpDelta ?? 0;

  if (xpDelta !== 0) {
    return {
      isNegative: xpDelta < 0,
      label: `${xpDelta > 0 ? "+" : "-"}${formatNumber(Math.abs(xpDelta))} ${t("common.xp")}`,
    };
  }

  const coinDelta = activity.coinDelta ?? 0;

  if (coinDelta !== 0) {
    return {
      isNegative: coinDelta < 0,
      label: `${coinDelta > 0 ? "+" : "-"}${formatNumber(Math.abs(coinDelta))} ${t("common.coins")}`,
    };
  }

  const gemDelta = activity.gemDelta ?? 0;

  if (gemDelta !== 0) {
    return {
      isNegative: gemDelta < 0,
      label: `${gemDelta > 0 ? "+" : "-"}${formatNumber(Math.abs(gemDelta))} ${t("common.gems")}`,
    };
  }

  return null;
}

function formatRelativeTime(
  isoDate: string,
  t: (key: string, params?: Record<string, string | number>) => string,
  formatNumber: (value: number) => string,
) {
  const timestamp = new Date(isoDate).getTime();

  if (!Number.isFinite(timestamp)) {
    return t("period.recently");
  }

  const diffMs = Date.now() - timestamp;
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60_000));

  if (diffMinutes < 1) return t("period.justNow");
  if (diffMinutes < 60) return t("period.minutesAgo", { count: formatNumber(diffMinutes) });

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) return t("period.hoursAgo", { count: formatNumber(diffHours) });

  const diffDays = Math.floor(diffHours / 24);

  if (diffDays === 1) return t("period.yesterday");
  return t("period.daysAgo", { count: formatNumber(diffDays) });
}
