"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Gem,
  Sparkles,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TaskCompletion, TaskDefinition } from "@/lib/indexed-db/types";
import { translateGameText, useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useGameSnapshot } from "@/hooks/use-game-snapshot";

type HistoryItem = TaskCompletion & {
  task?: TaskDefinition;
};

export default function QuestHistoryPage() {
  const { error, isLoading, snapshot } = useGameSnapshot();
  const { t } = useI18n();

  if (isLoading) {
    return (
      <main className="mx-auto min-h-[calc(100svh-8rem)] w-full max-w-md space-y-3 px-3 py-4">
        <Header />
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            className="h-24 animate-pulse rounded-xl border border-slate-800/80 bg-[#07111f]/70"
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
          {t("error.loadQuestHistory", { message: error?.message ?? "" })}
        </section>
      </main>
    );
  }

  const taskMap = new Map(snapshot.tasks.map((task) => [task.id, task]));
  const historyItems = snapshot.taskCompletions
    .map((completion) => ({
      ...completion,
      task: taskMap.get(completion.taskId),
    }))
    .sort((first, second) => second.completedAt.localeCompare(first.completedAt));
  const totalXp = historyItems.reduce(
    (total, completion) => total + completion.earnedXp,
    0,
  );
  const totalCoins = historyItems.reduce(
    (total, completion) => total + completion.earnedCoins,
    0,
  );
  const totalGems = historyItems.reduce(
    (total, completion) => total + completion.earnedGems,
    0,
  );

  return (
    <main className="mx-auto min-h-[calc(100svh-8rem)] w-full max-w-md space-y-4 px-3 py-4">
      <Header />

      <section className="grid grid-cols-3 gap-2">
        <SummaryCard icon={<Zap className="size-4" />} label={t("common.xp")} value={totalXp} />
        <SummaryCard
          icon={<CircleDollarSign className="size-4" />}
          label={t("common.coinsLabel")}
          value={totalCoins}
        />
        <SummaryCard icon={<Gem className="size-4" />} label={t("common.gemsLabel")} value={totalGems} />
      </section>

      <section className="space-y-2">
        {historyItems.length === 0 ? (
          <p className="rounded-xl border border-slate-700/55 bg-[#07111f]/82 p-4 text-sm text-slate-300">
            {t("quest.historyEmpty")}
          </p>
        ) : (
          historyItems.map((item) => <HistoryRow item={item} key={item.id} />)
        )}
      </section>
    </main>
  );
}

function Header() {
  const { t } = useI18n();

  return (
    <header className="flex items-center gap-3 pt-2">
      <Button
        asChild
        className="size-11 rounded-2xl border border-slate-700/60 bg-[#07111f]/80 text-white shadow-[0_8px_24px_rgba(0,0,0,0.35),inset_0_1px_18px_rgba(99,148,216,0.08)] hover:bg-[#0b1728]"
        size="icon"
        variant="ghost"
      >
        <Link aria-label={t("action.backQuests")} href="/quests">
          <ArrowLeft className="size-5" />
        </Link>
      </Button>
      <div>
        <p className="text-sm font-medium text-[#3d87ff]">{t("quest.log")}</p>
        <h1 className="text-3xl font-semibold leading-none tracking-[-0.03em] text-white">
          {t("quest.history")}
        </h1>
      </div>
    </header>
  );
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: number;
}) {
  const { formatNumber } = useI18n();

  return (
    <article className="rounded-xl border border-slate-700/55 bg-[#07111f]/82 p-3 shadow-[0_8px_22px_rgba(0,0,0,0.24),inset_0_1px_16px_rgba(99,148,216,0.05)]">
      <p className="flex items-center gap-1.5 truncate text-xs text-slate-400">
        <span className="text-[#4f8cff]">{icon}</span>
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold leading-none text-white">
        {formatNumber(value)}
      </p>
    </article>
  );
}

function HistoryRow({ item }: { item: HistoryItem }) {
  const { formatDate, formatNumber, language, t } = useI18n();
  const taskTitle = item.task
    ? translateGameText(item.task.title, language) ?? item.task.title
    : t("quest.deleted");
  const taskKind = item.task?.kind ?? item.taskKind;
  const isBoss = taskKind === "boss";

  return (
    <article
      className={cn(
        "grid grid-cols-[3.25rem_minmax(0,1fr)] gap-3 rounded-xl border border-slate-700/55 bg-[#07111f]/82 p-3 shadow-[0_10px_28px_rgba(0,0,0,0.28),inset_0_1px_18px_rgba(99,148,216,0.06)] backdrop-blur-xl",
        isBoss && "border-violet-500/45 bg-violet-950/10",
      )}
    >
      <div
        className={cn(
          "flex size-12 items-center justify-center border",
          isBoss
            ? "border-violet-500/70 bg-violet-950/35 text-violet-300 shadow-[0_0_18px_rgba(139,92,246,0.35)]"
            : "border-emerald-500/70 bg-emerald-950/35 text-emerald-300 shadow-[0_0_18px_rgba(16,185,129,0.3)]",
        )}
        style={{
          clipPath:
            "polygon(25% 6%, 75% 6%, 100% 50%, 75% 94%, 25% 94%, 0 50%)",
        }}
      >
        {isBoss ? (
          <Sparkles className="size-6" />
        ) : (
          <CheckCircle2 className="size-6" />
        )}
      </div>

      <div className="min-w-0 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold text-white">
              {taskTitle}
            </h2>
            <p className="flex items-center gap-1.5 truncate text-sm text-slate-400">
              <CalendarDays className="size-3.5" />
              {formatQuestHistoryDate(item.completedAt, formatDate, t)}
            </p>
          </div>
          {item.offDayMultiplier > 1 && (
            <span className="shrink-0 rounded-full border border-cyan-400/30 bg-cyan-950/30 px-2 py-1 text-xs font-semibold text-cyan-200">
              {formatNumber(item.offDayMultiplier)}x
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <RewardPill
            label={`${formatNumber(item.earnedXp)} ${t("common.xp")}`}
            tone="blue"
          />
          {item.earnedCoins > 0 && (
            <RewardPill
              label={`${formatNumber(item.earnedCoins)} ${t("common.coins")}`}
              tone="gold"
            />
          )}
          {item.earnedGems > 0 && (
            <RewardPill
              label={`${formatNumber(item.earnedGems)} ${t("common.gems")}`}
              tone="cyan"
            />
          )}
        </div>
      </div>
    </article>
  );
}

function RewardPill({
  label,
  tone,
}: {
  label: string;
  tone: "blue" | "gold" | "cyan";
}) {
  const styles = {
    blue: "border-[#2f8cff]/30 bg-blue-950/30 text-blue-200",
    gold: "border-amber-400/30 bg-amber-950/25 text-amber-200",
    cyan: "border-cyan-400/30 bg-cyan-950/25 text-cyan-200",
  };

  return (
    <span className={cn("rounded-full border px-2 py-1", styles[tone])}>
      +{label}
    </span>
  );
}

function formatQuestHistoryDate(
  isoDate: string,
  formatDate: (date: Date | string, options?: Intl.DateTimeFormatOptions) => string,
  t: (key: string) => string,
) {
  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    return t("period.recently");
  }

  return formatDate(date, {
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
  });
}
