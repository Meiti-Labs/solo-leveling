"use client";

import Link from "next/link";
import { useEffect } from "react";
import {
  ArrowLeft,
  Award,
  Bell,
  CheckCircle2,
  Crown,
  Skull,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { notificationService } from "@/lib/game";
import type { AppNotification, NotificationType } from "@/lib/indexed-db/types";
import { translateGameText, useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useGameSnapshot } from "@/hooks/use-game-snapshot";

type NotificationTone = "blue" | "green" | "purple" | "rose";

const toneStyles: Record<NotificationTone, string> = {
  blue: "border-[#2f8cff]/55 bg-blue-950/25 text-[#78b4ff]",
  green: "border-emerald-400/45 bg-emerald-950/20 text-emerald-300",
  purple: "border-violet-400/45 bg-violet-950/25 text-violet-300",
  rose: "border-rose-400/45 bg-rose-950/25 text-rose-300",
};

export default function NotificationsPage() {
  const { error, isLoading, refresh, snapshot } = useGameSnapshot();
  const { formatDate, language, t } = useI18n();

  useEffect(() => {
    if (!snapshot?.notifications.some((notification) => !notification.readAt)) {
      return;
    }

    notificationService
      .markAllRead()
      .then(() => refresh())
      .catch(() => undefined);
  }, [refresh, snapshot]);

  const notifications = snapshot?.notifications ?? [];

  return (
    <main className="mx-auto min-h-[calc(100svh-8rem)] w-full max-w-md space-y-4 px-3 py-4">
      <header className="flex items-center justify-between gap-3 pt-1">
        <div className="flex min-w-0 items-center gap-2">
          <Button
            asChild
            className="size-10 shrink-0 rounded-xl border border-slate-700/60 bg-[#07111f]/80 text-white hover:bg-[#0b1728]"
            size="icon"
            variant="ghost"
          >
            <Link aria-label={t("action.backHome")} href="/">
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#5aa0ff]">
              {t("common.localInbox")}
            </p>
            <h1 className="truncate text-2xl font-semibold leading-none tracking-[-0.03em] text-white">
              {t("common.notifications")}
            </h1>
          </div>
        </div>
        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-[#2f8cff]/45 bg-blue-950/25 text-[#5aa0ff] shadow-[0_0_22px_rgba(47,140,255,0.22)]">
          <Bell className="size-6" />
        </div>
      </header>

      {error && (
        <p className="rounded-xl border border-rose-500/50 bg-rose-950/25 px-3 py-2 text-sm text-rose-100">
          Could not load notifications. {error.message}
        </p>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              className="h-20 animate-pulse rounded-xl border border-slate-800/80 bg-[#07111f]/70"
              key={index}
            />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <section className="rounded-2xl border border-slate-700/55 bg-[#07111f]/82 p-5 text-center shadow-[0_8px_22px_rgba(0,0,0,0.22),inset_0_1px_16px_rgba(99,148,216,0.05)]">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl border border-[#2f8cff]/35 bg-blue-950/25 text-[#5aa0ff]">
            <Bell className="size-6" />
          </div>
          <h2 className="text-base font-semibold text-white">
            {t("notification.emptyTitle")}
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            {t("notification.emptyBody")}
          </p>
        </section>
      ) : (
        <section className="space-y-2">
          {notifications.map((notification) => (
            <NotificationRow
              formatDate={formatDate}
              key={notification.id}
              language={language}
              notification={notification}
              t={t}
            />
          ))}
        </section>
      )}
    </main>
  );
}

function NotificationRow({
  formatDate,
  language,
  notification,
  t,
}: {
  formatDate: (date: Date | string, options?: Intl.DateTimeFormatOptions) => string;
  language: "en" | "fa";
  notification: AppNotification;
  t: (key: string) => string;
}) {
  const visual = getNotificationVisual(notification.type);
  const Icon = visual.icon;

  return (
    <article className="grid grid-cols-[3.5rem_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-slate-700/55 bg-[#07111f]/82 p-3 shadow-[0_8px_22px_rgba(0,0,0,0.24),inset_0_1px_16px_rgba(99,148,216,0.05)]">
      <div
        className={cn(
          "flex size-12 items-center justify-center rounded-2xl border",
          toneStyles[visual.tone],
        )}
      >
        <Icon className="size-6" />
      </div>
      <div className="min-w-0">
        <h2 className="truncate text-base font-medium text-white">
          {translateGameText(notification.title, language)}
        </h2>
        <p className="truncate text-sm text-slate-400">
          {translateGameText(notification.description, language) ??
            t("activity.progressUpdated")}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          {formatNotificationDate(notification.occurredAt, formatDate)}
        </p>
      </div>
      {notification.readAt ? (
        <CheckCircle2 className="size-5 text-emerald-300" />
      ) : (
        <span className="size-2.5 rounded-full bg-[#3b82ff] shadow-[0_0_12px_rgba(59,130,255,0.9)]" />
      )}
    </article>
  );
}

function getNotificationVisual(type: NotificationType) {
  if (type === "level-up") {
    return { icon: Crown, tone: "blue" as const };
  }

  if (type === "achievement") {
    return { icon: Trophy, tone: "green" as const };
  }

  if (type === "badge") {
    return { icon: Award, tone: "purple" as const };
  }

  return { icon: Skull, tone: "rose" as const };
}

function formatNotificationDate(
  date: string,
  formatDate: (date: Date | string, options?: Intl.DateTimeFormatOptions) => string,
) {
  return formatDate(date, {
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    month: "short",
  });
}
