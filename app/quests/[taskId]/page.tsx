"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Gem,
  Pencil,
  ShieldAlert,
  Sparkles,
  Trash2,
  Zap,
} from "lucide-react";
import {
  getAttributeColorSchemeOption,
  getAttributeVisual,
} from "@/components/attribute-visuals";
import TaskStreakCalendar from "@/components/task-streak-calendar";
import { Button } from "@/components/ui/button";
import { useGameSnapshot } from "@/hooks/use-game-snapshot";
import { gameService } from "@/lib/game";
import { toAppDate } from "@/lib/game/date";
import type {
  AttributeKey,
  AttributeProgress,
  TaskCompletion,
  TaskDefinition,
  TaskDifficulty,
  TaskKind,
} from "@/lib/indexed-db/types";
import { cn } from "@/lib/utils";

const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-US").format(value);

const kindLabels: Record<TaskKind, string> = {
  avoid: "Avoid Quest",
  boss: "Boss Quest",
  daily: "Daily Quest",
  goal: "Goal Quest",
};

const difficultyLabels: Record<TaskDifficulty, string> = {
  boss: "Boss",
  easy: "Easy",
  hard: "Hard",
  medium: "Medium",
};

const statusLabels: Record<TaskDefinition["status"], string> = {
  active: "Active",
  archived: "Deleted",
  completed: "Completed",
  failed: "Failed",
};

export default function QuestDetailPage() {
  const params = useParams<{ taskId: string }>();
  const router = useRouter();
  const { error, isLoading, refresh, snapshot } = useGameSnapshot();
  const [actionNotice, setActionNotice] = useState<{
    tone: "success" | "error";
    message: string;
  } | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  if (isLoading) {
    return (
      <main className="mx-auto min-h-[calc(100svh-8rem)] w-full max-w-md space-y-4 px-3 py-4">
        <DetailHeader backHref="/quests" title="Quest Detail" />
        <div className="h-44 animate-pulse rounded-2xl border border-slate-800/80 bg-[#07111f]/70" />
        <div className="h-72 animate-pulse rounded-2xl border border-slate-800/80 bg-[#07111f]/70" />
      </main>
    );
  }

  if (error || !snapshot) {
    return (
      <main className="mx-auto min-h-[calc(100svh-8rem)] w-full max-w-md space-y-4 px-3 py-4">
        <DetailHeader backHref="/quests" title="Quest Detail" />
        <section className="rounded-xl border border-rose-500/50 bg-rose-950/20 p-4 text-sm text-rose-100">
          Could not load this quest. {error?.message}
        </section>
      </main>
    );
  }

  const task = snapshot.tasks.find((candidate) => candidate.id === params.taskId);

  if (!task) {
    return (
      <main className="mx-auto min-h-[calc(100svh-8rem)] w-full max-w-md space-y-4 px-3 py-4">
        <DetailHeader backHref="/quests" title="Quest Detail" />
        <section className="rounded-xl border border-rose-500/50 bg-rose-950/20 p-4 text-sm text-rose-100">
          Quest was not found on this device.
        </section>
      </main>
    );
  }

  const selectedTask: TaskDefinition = task;
  const today = toAppDate();
  const completions = snapshot.taskCompletions
    .filter((completion) => completion.taskId === selectedTask.id)
    .sort((first, second) => second.completedAt.localeCompare(first.completedAt));
  const isCompleted = isTaskCompleted(selectedTask, completions, today);
  const canComplete =
    selectedTask.status === "active" &&
    (selectedTask.kind === "avoid" || !isCompleted);
  const taskAttributes = selectedTask.attributes.map((taskAttribute) => {
    const storedAttribute = snapshot.attributes.find(
      (attribute) => attribute.key === taskAttribute.key,
    );

    return {
      key: taskAttribute.key,
      label: storedAttribute?.label ?? getAttributeFallbackLabel(taskAttribute.key),
      storedAttribute,
      weight: taskAttribute.weight,
    };
  });

  async function completeQuest() {
    try {
      setActionNotice(null);
      setIsCompleting(true);

      if (selectedTask.kind === "avoid") {
        const result = await gameService.recordAvoidanceSlip(selectedTask.id);
        await refresh();
        setActionNotice({
          tone: "error",
          message: `Penalty recorded: -${formatNumber(result.penaltyXp)} XP${
            result.penaltyCoins > 0
              ? `, -${formatNumber(result.penaltyCoins)} coins`
              : ""
          }${
            result.penaltyGems > 0
              ? `, -${formatNumber(result.penaltyGems)} gems`
              : ""
          }.`,
        });
        return;
      }

      const result = await gameService.completeTask(selectedTask.id, today);
      await refresh();
      setActionNotice({
        tone: "success",
        message: `${selectedTask.title} completed for ${formatAppDate(
          result.completion.completedForDate,
        )}.`,
      });
    } catch (caughtError) {
      setActionNotice({
        tone: "error",
        message:
          caughtError instanceof Error
            ? caughtError.message
            : "Could not complete this quest.",
      });
    } finally {
      setIsCompleting(false);
    }
  }

  async function deleteQuest() {
    if (!isConfirmingDelete) {
      setIsConfirmingDelete(true);
      return;
    }

    try {
      setActionNotice(null);
      setIsDeleting(true);
      await gameService.archiveTask(selectedTask.id);
      router.push("/quests");
    } catch (caughtError) {
      setActionNotice({
        tone: "error",
        message:
          caughtError instanceof Error
            ? caughtError.message
            : "Could not delete this quest.",
      });
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <main className="mx-auto min-h-[calc(100svh-8rem)] w-full max-w-md space-y-4 px-3 py-4">
      <DetailHeader backHref="/quests" title="Quest Detail" />

      {actionNotice && (
        <p
          className={cn(
            "rounded-xl border px-3 py-2 text-sm",
            actionNotice.tone === "success"
              ? "border-[#2f8cff]/45 bg-blue-950/25 text-blue-100"
              : "border-rose-500/50 bg-rose-950/25 text-rose-100",
          )}
        >
          {actionNotice.message}
        </p>
      )}

      <QuestHero task={selectedTask} />

      <section className="grid grid-cols-3 gap-2">
        <SummaryTile
          icon={<Zap className="size-4" />}
          label="XP"
          value={formatNumber(selectedTask.xpReward)}
        />
        <SummaryTile
          icon={<CircleDollarSign className="size-4" />}
          label="Coins"
          value={formatNumber(selectedTask.coinReward)}
        />
        <SummaryTile
          icon={<Gem className="size-4" />}
          label="Gems"
          value={formatNumber(selectedTask.gemReward)}
        />
      </section>

      <section className="grid grid-cols-2 gap-2">
        <DetailStat label="Type" value={kindLabels[selectedTask.kind]} />
        <DetailStat
          label="Difficulty"
          value={difficultyLabels[selectedTask.difficulty]}
        />
        <DetailStat label="Status" value={statusLabels[selectedTask.status]} />
        <DetailStat
          label="XP Loss"
          value={`${formatNumber(selectedTask.missedPenaltyXp)} XP`}
        />
      </section>

      <section className="space-y-3 rounded-2xl border border-slate-700/55 bg-[#07111f]/82 p-4 shadow-[0_10px_28px_rgba(0,0,0,0.28),inset_0_1px_18px_rgba(99,148,216,0.06)] backdrop-blur-xl">
        <SectionTitle
          icon={<CalendarDays className="size-5" />}
          title={
            selectedTask.kind === "daily"
              ? "Daily Rules"
              : selectedTask.kind === "avoid"
                ? "Avoidance Rules"
                : "Deadline"
          }
        />
        {selectedTask.kind === "daily" ? (
          <div className="grid grid-cols-2 gap-2">
            <DetailStat
              label="Streak Every"
              value={`${formatNumber(selectedTask.streakBonusEvery ?? 0)} days`}
            />
            <DetailStat
              label="Bonus"
              value={`${formatNumber(selectedTask.streakBonusXp ?? 0)} XP`}
            />
          </div>
        ) : selectedTask.kind === "avoid" ? (
          <div className="space-y-2">
            <p className="rounded-xl border border-slate-700/55 bg-[#030914]/55 p-3 text-sm text-slate-300">
              {selectedTask.deadline
                ? `Avoid until ${formatAppDate(
                    selectedTask.deadline,
                  )}. If the deadline passes untouched, this quest succeeds.`
                : "No deadline. This stays active as a reusable penalty button."}
            </p>
            <div className="grid grid-cols-3 gap-2">
              <DetailStat
                label="XP Loss"
                value={`${formatNumber(selectedTask.missedPenaltyXp)} XP`}
              />
              <DetailStat
                label="Coin Loss"
                value={formatNumber(selectedTask.missedPenaltyCoins ?? 0)}
              />
              <DetailStat
                label="Gem Loss"
                value={formatNumber(selectedTask.missedPenaltyGems ?? 0)}
              />
            </div>
          </div>
        ) : (
          <p className="rounded-xl border border-slate-700/55 bg-[#030914]/55 p-3 text-sm text-slate-300">
            {selectedTask.deadline
              ? `Due ${formatAppDate(selectedTask.deadline)}`
              : "No deadline set."}
          </p>
        )}
      </section>

      {selectedTask.kind === "daily" && (
        <TaskStreakCalendar
          activityEvents={snapshot.activityEvents}
          completions={completions}
          task={selectedTask}
          weeklyOffDay={snapshot.progress.weeklyOffDay}
        />
      )}

      <section className="space-y-3">
        <SectionTitle
          icon={<Sparkles className="size-5" />}
          title="Related Attributes"
        />
        <div className="space-y-2">
          {taskAttributes.map((attribute) => (
            <AttributeRow
              key={attribute.key}
              label={attribute.label}
              storedAttribute={attribute.storedAttribute}
              weight={attribute.weight}
            />
          ))}
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-slate-700/55 bg-[#07111f]/82 p-4 shadow-[0_10px_28px_rgba(0,0,0,0.28),inset_0_1px_18px_rgba(99,148,216,0.06)] backdrop-blur-xl">
        <SectionTitle
          icon={<CheckCircle2 className="size-5" />}
          title="Completion History"
        />
        {completions.length === 0 ? (
          <p className="text-sm text-slate-400">
            This quest has not been completed yet.
          </p>
        ) : (
          <div className="space-y-2">
            {completions.slice(0, 5).map((completion) => (
              <CompletionRow completion={completion} key={completion.id} />
            ))}
          </div>
        )}
      </section>

      <section className="grid grid-cols-2 gap-2">
        <Button
          asChild
          className="h-12 rounded-xl border border-[#2f8cff]/70 bg-blue-950/35 text-white hover:bg-blue-950/55"
          variant="ghost"
        >
          <Link href={`/quests/${selectedTask.id}/edit`}>
            <Pencil className="size-5" />
            Edit
          </Link>
        </Button>
        <Button
          className={cn(
            "h-12 rounded-xl border border-rose-400/55 bg-rose-950/25 text-rose-100 hover:bg-rose-950/45",
            isConfirmingDelete && "border-rose-300 bg-rose-950/45",
          )}
          disabled={isDeleting}
          onClick={deleteQuest}
          type="button"
          variant="ghost"
        >
          <Trash2 className={cn("size-5", isDeleting && "animate-pulse")} />
          {isDeleting ? "Deleting..." : isConfirmingDelete ? "Confirm Delete" : "Delete"}
        </Button>
        <Button
          className={cn(
            "col-span-2 h-12 rounded-xl text-base font-semibold disabled:border-slate-700/70 disabled:bg-slate-900/70 disabled:text-slate-500",
            selectedTask.kind === "avoid"
              ? "border border-rose-400/70 bg-rose-950/30 text-rose-100 hover:bg-rose-950/50"
              : "border border-emerald-400/70 bg-emerald-950/30 text-emerald-100 hover:bg-emerald-950/50",
          )}
          disabled={!canComplete || isCompleting}
          onClick={completeQuest}
          type="button"
          variant="ghost"
        >
          <CheckCircle2 className={cn("size-5", isCompleting && "animate-pulse")} />
          {getCompleteButtonLabel({
            canComplete,
            isCompleted,
            isCompleting,
            task: selectedTask,
          })}
        </Button>
      </section>
    </main>
  );
}

function DetailHeader({
  backHref,
  title,
}: {
  backHref: string;
  title: string;
}) {
  return (
    <header className="flex items-center gap-3 pt-2">
      <Button
        asChild
        className="size-11 rounded-2xl border border-slate-700/60 bg-[#07111f]/80 text-white shadow-[0_8px_24px_rgba(0,0,0,0.35),inset_0_1px_18px_rgba(99,148,216,0.08)] hover:bg-[#0b1728]"
        size="icon"
        variant="ghost"
      >
        <Link aria-label="Back to quests" href={backHref}>
          <ArrowLeft className="size-5" />
        </Link>
      </Button>
      <div className="min-w-0">
        <p className="text-sm font-medium text-[#3d87ff]">Quest Control</p>
        <h1 className="truncate text-3xl font-semibold leading-none tracking-[-0.03em] text-white">
          {title}
        </h1>
      </div>
    </header>
  );
}

function QuestHero({ task }: { task: TaskDefinition }) {
  const isBoss = task.kind === "boss";

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-[#07111f] p-4 shadow-[0_10px_28px_rgba(0,0,0,0.28),inset_0_1px_18px_rgba(99,148,216,0.06)]",
        isBoss ? "border-violet-500/70" : "border-[#2f8cff]/45",
      )}
    >
      {isBoss && (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center opacity-75"
            style={{
              backgroundImage:
                "url(/images/card-backgrounds/boss-background-1.png)",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#070713]/95 via-[#16092d]/75 to-[#150726]/45" />
        </>
      )}

      <div className="relative space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-2">
            <p
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
                isBoss
                  ? "border-violet-400/45 bg-violet-950/35 text-violet-200"
                  : "border-[#2f8cff]/45 bg-blue-950/25 text-blue-200",
              )}
            >
              {isBoss ? (
                <ShieldAlert className="size-3.5" />
              ) : (
                <Sparkles className="size-3.5" />
              )}
              {kindLabels[task.kind]}
            </p>
            <h2 className="text-3xl font-semibold leading-none tracking-[-0.03em] text-white">
              {task.title}
            </h2>
          </div>
          <span
            className={cn(
              "shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold",
              task.status === "active"
                ? "border-emerald-400/45 bg-emerald-950/25 text-emerald-300"
                : "border-slate-600/60 bg-slate-950/50 text-slate-300",
            )}
          >
            {statusLabels[task.status]}
          </span>
        </div>

        <p className="text-sm leading-relaxed text-slate-300">
          {task.description ?? "No description yet."}
        </p>
      </div>
    </section>
  );
}

function SummaryTile({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <article className="rounded-xl border border-slate-700/55 bg-[#07111f]/82 p-3 shadow-[0_8px_22px_rgba(0,0,0,0.24),inset_0_1px_16px_rgba(99,148,216,0.05)]">
      <p className="flex items-center gap-1.5 truncate text-xs text-slate-400">
        <span className="text-[#4f8cff]">{icon}</span>
        {label}
      </p>
      <p className="mt-1 truncate text-2xl font-semibold leading-none text-white">
        {value}
      </p>
    </article>
  );
}

function DetailStat({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-xl border border-slate-700/55 bg-[#07111f]/82 p-3 shadow-[0_8px_22px_rgba(0,0,0,0.24),inset_0_1px_16px_rgba(99,148,216,0.05)]">
      <p className="truncate text-xs text-slate-400">{label}</p>
      <p className="mt-1 truncate text-base font-semibold text-white">{value}</p>
    </article>
  );
}

function SectionTitle({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
      <span className="text-[#4f8cff]">{icon}</span>
      {title}
    </h2>
  );
}

function AttributeRow({
  label,
  storedAttribute,
  weight,
}: {
  label: string;
  storedAttribute?: AttributeProgress;
  weight: number;
}) {
  const visual = getAttributeVisual(storedAttribute ?? label);
  const colorScheme = getAttributeColorSchemeOption(visual.color);
  const Icon = visual.icon;

  return (
    <article className="grid grid-cols-[3.25rem_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-slate-700/55 bg-[#07111f]/82 p-3 shadow-[0_8px_22px_rgba(0,0,0,0.24),inset_0_1px_16px_rgba(99,148,216,0.05)]">
      <div
        className={cn(
          "flex size-12 items-center justify-center border",
          colorScheme.badge,
        )}
        style={{
          clipPath:
            "polygon(25% 6%, 75% 6%, 100% 50%, 75% 94%, 25% 94%, 0 50%)",
        }}
      >
        <Icon className={cn("size-6 stroke-[2.3]", colorScheme.icon)} />
      </div>
      <div className="min-w-0">
        <h3 className="truncate text-base font-medium text-white">{label}</h3>
        <p className="text-sm text-slate-400">Weight {formatNumber(weight)}</p>
      </div>
      <Sparkles className="size-5 text-slate-500" />
    </article>
  );
}

function CompletionRow({ completion }: { completion: TaskCompletion }) {
  return (
    <article className="grid grid-cols-[2.75rem_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-slate-700/55 bg-[#030914]/55 p-3">
      <div className="flex size-10 items-center justify-center rounded-xl border border-emerald-400/40 bg-emerald-950/25 text-emerald-300">
        <CheckCircle2 className="size-5" />
      </div>
      <div className="min-w-0">
        <h3 className="truncate text-sm font-semibold text-white">
          {formatAppDate(completion.completedForDate)}
        </h3>
        <p className="truncate text-xs text-slate-400">
          {formatDateTime(completion.completedAt)}
        </p>
      </div>
      <p className="text-sm font-semibold text-[#5aa0ff]">
        +{formatNumber(completion.earnedXp)} XP
      </p>
    </article>
  );
}

function isTaskCompleted(
  task: TaskDefinition,
  completions: TaskCompletion[],
  today: string,
) {
  return completions.some((completion) =>
    task.kind === "daily" ? completion.completedForDate === today : true,
  );
}

function getCompleteButtonLabel({
  canComplete,
  isCompleted,
  isCompleting,
  task,
}: {
  canComplete: boolean;
  isCompleted: boolean;
  isCompleting: boolean;
  task: TaskDefinition;
}) {
  if (isCompleting) {
    return "Completing...";
  }

  if (isCompleted) {
    if (task.kind === "avoid") {
      return "Avoid Quest Succeeded";
    }

    return task.kind === "boss" ? "Boss Defeated" : "Already Completed";
  }

  if (!canComplete) {
    return `Cannot Complete: ${statusLabels[task.status]}`;
  }

  if (task.kind === "avoid") {
    return "Record Penalty";
  }

  return task.kind === "boss" ? "Complete Boss Quest" : "Complete Quest";
}

function getAttributeFallbackLabel(key: AttributeKey) {
  return key
    .replace(/^custom-/, "")
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ") || "Custom";
}

function formatAppDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

function formatDateTime(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
  }).format(new Date(date));
}
