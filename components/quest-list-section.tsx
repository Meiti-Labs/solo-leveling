"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { Check, Circle, Trash2 } from "lucide-react";
import { getAttributeVisual } from "@/components/attribute-visuals";
import { Button } from "@/components/ui/button";
import ProgressionCelebrationModal from "@/components/progression-celebration-modal";
import type { ProgressionModalData } from "@/components/progression-celebration-modal";
import type { QuestTab } from "@/components/quests-header";
import { gameService } from "@/lib/game";
import { toAppDate } from "@/lib/game/date";
import type {
  AchievementDefinition,
  AttributeKey,
  AttributeProgress,
  CoreAttributeKey,
  TaskCompletion,
  TaskDefinition,
  TaskDifficulty,
  TaskKind,
} from "@/lib/indexed-db/types";
import { isCoreAttributeKey } from "@/lib/indexed-db/types";
import { cn } from "@/lib/utils";
import { useGameSnapshot } from "@/hooks/use-game-snapshot";
import type { GameSnapshot } from "@/hooks/use-game-snapshot";

type QuestTone =
  | "blue"
  | "red"
  | "purple"
  | "green"
  | "gold"
  | "cyan"
  | "pink"
  | "indigo"
  | "boss";

type QuestAttributeVisual = ReturnType<typeof getAttributeVisual>;

const difficultyLabels: Record<TaskDifficulty, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
  boss: "Hard",
};

const coreAttributeLabels: Record<CoreAttributeKey, string> = {
  communication: "Communication",
  discipline: "Discipline",
  finance: "Finance",
  intelligence: "Intelligence",
  strength: "Strength",
  wisdom: "Wisdom",
};

const kindOrder: Record<TaskKind, number> = {
  daily: 0,
  goal: 1,
  boss: 2,
};

const toneStyles: Record<
  QuestTone,
  {
    badge: string;
    icon: string;
    dot: string;
    text: string;
  }
> = {
  blue: {
    badge:
      "border-blue-500/80 bg-blue-950/25 shadow-[0_0_22px_rgba(59,130,246,0.18)]",
    icon: "text-blue-300",
    dot: "bg-blue-400",
    text: "text-blue-300",
  },
  red: {
    badge:
      "border-rose-500/80 bg-rose-950/25 shadow-[0_0_22px_rgba(244,63,94,0.18)]",
    icon: "text-rose-400",
    dot: "bg-emerald-400",
    text: "text-slate-400",
  },
  purple: {
    badge:
      "border-violet-500/80 bg-violet-950/25 shadow-[0_0_22px_rgba(139,92,246,0.18)]",
    icon: "text-violet-400",
    dot: "bg-violet-400",
    text: "text-violet-300",
  },
  green: {
    badge:
      "border-emerald-500/80 bg-emerald-950/25 shadow-[0_0_22px_rgba(16,185,129,0.18)]",
    icon: "text-emerald-400",
    dot: "bg-emerald-400",
    text: "text-slate-400",
  },
  gold: {
    badge:
      "border-amber-500/80 bg-amber-950/25 shadow-[0_0_22px_rgba(245,158,11,0.18)]",
    icon: "text-amber-300",
    dot: "bg-emerald-400",
    text: "text-slate-400",
  },
  cyan: {
    badge:
      "border-cyan-500/80 bg-cyan-950/25 shadow-[0_0_22px_rgba(6,182,212,0.18)]",
    icon: "text-cyan-300",
    dot: "bg-cyan-400",
    text: "text-cyan-300",
  },
  pink: {
    badge:
      "border-pink-500/80 bg-pink-950/25 shadow-[0_0_22px_rgba(236,72,153,0.18)]",
    icon: "text-pink-300",
    dot: "bg-pink-400",
    text: "text-pink-300",
  },
  indigo: {
    badge:
      "border-indigo-500/80 bg-indigo-950/25 shadow-[0_0_22px_rgba(99,102,241,0.18)]",
    icon: "text-indigo-300",
    dot: "bg-indigo-400",
    text: "text-indigo-300",
  },
  boss: {
    badge:
      "border-fuchsia-500/80 bg-fuchsia-950/25 shadow-[0_0_24px_rgba(217,70,239,0.24)]",
    icon: "text-fuchsia-400",
    dot: "bg-fuchsia-400",
    text: "text-fuchsia-300",
  },
};

const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-US").format(value);

type CompletionResult = Awaited<ReturnType<typeof gameService.completeTask>>;

export default function QuestListSection({
  activeTab,
  onQuestChanged,
  searchQuery,
}: {
  activeTab: QuestTab;
  onQuestChanged?: () => void;
  searchQuery: string;
}) {
  const { error, isLoading, refresh, snapshot } = useGameSnapshot();
  const [actionError, setActionError] = useState<string | null>(null);
  const [confirmingDeleteTaskId, setConfirmingDeleteTaskId] = useState<
    string | null
  >(null);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [progressionModals, setProgressionModals] = useState<
    ProgressionModalData[]
  >([]);
  const [submittingTaskId, setSubmittingTaskId] = useState<string | null>(null);
  const today = toAppDate();

  const visibleTasks = useMemo(() => {
    if (!snapshot) {
      return [];
    }

    return snapshot.tasks
      .filter((task) =>
        shouldShowTaskForTab(task, activeTab, snapshot.taskCompletions, today),
      )
      .filter((task) =>
        taskMatchesSearch(task, snapshot.attributes, searchQuery),
      )
      .sort((first, second) => {
        const kindDelta = kindOrder[first.kind] - kindOrder[second.kind];

        if (kindDelta !== 0) {
          return kindDelta;
        }

        return first.createdAt.localeCompare(second.createdAt);
      });
  }, [activeTab, searchQuery, snapshot, today]);
  const activeProgressionModal = progressionModals[0] ?? null;
  const progressionModal = activeProgressionModal ? (
    <ProgressionCelebrationModal
      modal={activeProgressionModal}
      onContinue={() =>
        setProgressionModals((current) => current.slice(1))
      }
    />
  ) : null;

  async function completeQuest(task: TaskDefinition) {
    try {
      setActionError(null);
      setSubmittingTaskId(task.id);
      const result = await gameService.completeTask(task.id, today);
      const nextSnapshot = await refresh();
      const nextModals = buildProgressionModals(task, result, nextSnapshot);

      if (nextModals.length > 0) {
        setProgressionModals(nextModals);
      }

      onQuestChanged?.();
    } catch (caughtError) {
      setActionError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not complete this quest.",
      );
    } finally {
      setSubmittingTaskId(null);
    }
  }

  async function deleteQuest(task: TaskDefinition) {
    if (confirmingDeleteTaskId !== task.id) {
      setConfirmingDeleteTaskId(task.id);
      return;
    }

    try {
      setActionError(null);
      setDeletingTaskId(task.id);
      await gameService.archiveTask(task.id);
      await refresh();
      onQuestChanged?.();
      setConfirmingDeleteTaskId(null);
    } catch (caughtError) {
      setActionError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not delete this quest.",
      );
    } finally {
      setDeletingTaskId(null);
    }
  }

  if (isLoading) {
    return (
      <>
        <section className="space-y-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              className="h-24 animate-pulse rounded-xl border border-slate-800/80 bg-[#07111f]/70"
              key={index}
            />
          ))}
        </section>
        {progressionModal}
      </>
    );
  }

  if (error) {
    return (
      <>
        <section className="rounded-xl border border-rose-500/50 bg-rose-950/20 p-4 text-sm text-rose-100">
          Could not load quests from this device. {error.message}
        </section>
        {progressionModal}
      </>
    );
  }

  if (!snapshot || visibleTasks.length === 0) {
    return (
      <>
        <section className="rounded-xl border border-slate-700/55 bg-[#07111f]/82 p-4 text-sm text-slate-300">
          {searchQuery.trim()
            ? `No quests match "${searchQuery.trim()}".`
            : getEmptyStateMessage(activeTab)}
        </section>
        {progressionModal}
      </>
    );
  }

  return (
    <>
      <section className="space-y-2">
        {actionError && (
          <p className="rounded-xl border border-rose-500/50 bg-rose-950/25 px-3 py-2 text-sm text-rose-100">
            {actionError}
          </p>
        )}
        {visibleTasks.map((task) => {
          const isCompleted =
            task.status === "completed" ||
            isTaskCompletedToday(task, snapshot.taskCompletions, today);

          return (
            <QuestCard
              attributes={snapshot.attributes}
              isConfirmingDelete={confirmingDeleteTaskId === task.id}
              isCompleted={isCompleted}
              isDeleting={deletingTaskId === task.id}
              isSubmitting={submittingTaskId === task.id}
              key={task.id}
              onComplete={() => completeQuest(task)}
              onDelete={() => deleteQuest(task)}
              task={task}
            />
          );
        })}
      </section>
      {progressionModal}
    </>
  );
}

function QuestCard({
  attributes,
  isConfirmingDelete,
  isCompleted,
  isDeleting,
  isSubmitting,
  onComplete,
  onDelete,
  task,
}: {
  attributes: AttributeProgress[];
  isConfirmingDelete: boolean;
  isCompleted: boolean;
  isDeleting: boolean;
  isSubmitting: boolean;
  onComplete: () => void;
  onDelete: () => void;
  task: TaskDefinition;
}) {
  if (task.kind === "boss") {
    return (
      <BossQuestCard
        isConfirmingDelete={isConfirmingDelete}
        isCompleted={isCompleted}
        isDeleting={isDeleting}
        isSubmitting={isSubmitting}
        onComplete={onComplete}
        onDelete={onDelete}
        task={task}
      />
    );
  }

  return (
    <NormalQuestCard
      attributeLabel={getAttributeLabel(task, attributes)}
      attributeVisual={getTaskAttributeVisual(task, attributes)}
      isConfirmingDelete={isConfirmingDelete}
      isCompleted={isCompleted}
      isDeleting={isDeleting}
      isSubmitting={isSubmitting}
      onComplete={onComplete}
      onDelete={onDelete}
      task={task}
    />
  );
}

function NormalQuestCard({
  attributeLabel,
  attributeVisual,
  isConfirmingDelete,
  isCompleted,
  isDeleting,
  isSubmitting,
  onComplete,
  onDelete,
  task,
}: {
  attributeLabel: string;
  attributeVisual: QuestAttributeVisual;
  isConfirmingDelete: boolean;
  isCompleted: boolean;
  isDeleting: boolean;
  isSubmitting: boolean;
  onComplete: () => void;
  onDelete: () => void;
  task: TaskDefinition;
}) {
  const Icon = attributeVisual.icon;
  const styles = toneStyles[attributeVisual.color];

  return (
    <article
      className={cn(
        "grid grid-cols-[4.25rem_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-slate-700/55 bg-[#07111f]/82 p-3 font-sans shadow-[0_10px_28px_rgba(0,0,0,0.28),inset_0_1px_18px_rgba(99,148,216,0.06)] backdrop-blur-xl",
        isCompleted && "border-emerald-400/40 bg-emerald-950/10",
      )}
    >
      <QuestIconBadge styles={styles}>
        <Icon className={cn("size-6 stroke-[2.3]", styles.icon)} />
      </QuestIconBadge>

      <div className="min-w-0 space-y-1">
        <h2 className="truncate text-base font-medium leading-tight text-white">
          {task.title}
        </h2>
        <p className="truncate text-sm text-slate-400">{attributeLabel}</p>
        <div className="flex items-center gap-1.5 text-sm">
          <span className={cn("size-2 rounded-full", styles.dot)} />
          <span className={styles.text}>{difficultyLabels[task.difficulty]}</span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-4">
        <RewardSummary task={task} />
        <div className="flex items-center gap-1.5">
          <DeleteButton
            isConfirming={isConfirmingDelete}
            isDeleting={isDeleting}
            onDelete={onDelete}
          />
          <CompleteButton
            isCompleted={isCompleted}
            isSubmitting={isSubmitting}
            label={isCompleted ? "Quest completed" : "Complete quest"}
            onComplete={onComplete}
            tone="emerald"
          />
        </div>
      </div>
    </article>
  );
}

function BossQuestCard({
  isConfirmingDelete,
  isCompleted,
  isDeleting,
  isSubmitting,
  onComplete,
  onDelete,
  task,
}: {
  isConfirmingDelete: boolean;
  isCompleted: boolean;
  isDeleting: boolean;
  isSubmitting: boolean;
  onComplete: () => void;
  onDelete: () => void;
  task: TaskDefinition;
}) {
  return (
    <article
      className={cn(
        "relative min-h-28 overflow-hidden rounded-xl border border-violet-500/70 bg-[#07111f] p-4 font-sans shadow-[0_0_26px_rgba(124,58,237,0.22),inset_0_1px_20px_rgba(168,85,247,0.12)]",
        isCompleted && "border-emerald-400/50",
      )}
    >
      <div
        className="absolute inset-0 bg-cover bg-center opacity-80"
        style={{
          backgroundImage: "url(/images/card-backgrounds/boss-background-1.png)",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#070713]/95 via-[#16092d]/72 to-[#150726]/35" />
      <div className="absolute inset-y-0 left-0 w-2/3 bg-gradient-to-r from-[#070713] via-[#070713]/75 to-transparent" />

      <div className="relative grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="min-w-0 space-y-2">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-violet-400">Boss Quest</p>
            <h2 className="truncate text-xl font-semibold leading-tight text-white">
              {task.title}
            </h2>
            <p className="truncate text-sm text-slate-300">
              {task.description}
            </p>
          </div>

          <div className="flex items-center justify-between gap-3 pr-1">
            <div className="flex items-center gap-1.5 text-sm">
              <span className="size-2.5 rounded-full bg-rose-500" />
              <span className="text-rose-400">Hard</span>
            </div>
            <RewardSummary task={task} tone="violet" />
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <DeleteButton
            isConfirming={isConfirmingDelete}
            isDeleting={isDeleting}
            onDelete={onDelete}
          />
          <CompleteButton
            isCompleted={isCompleted}
            isSubmitting={isSubmitting}
            label={isCompleted ? "Boss quest completed" : "Complete boss quest"}
            onComplete={onComplete}
            tone="violet"
          />
        </div>
      </div>
    </article>
  );
}

function CompleteButton({
  isCompleted,
  isSubmitting,
  label,
  onComplete,
  tone,
}: {
  isCompleted: boolean;
  isSubmitting: boolean;
  label: string;
  onComplete: () => void;
  tone: "emerald" | "violet";
}) {
  const isViolet = tone === "violet";

  return (
    <Button
      aria-label={label}
      className={cn(
        "size-10 rounded-full bg-transparent transition-all",
        isViolet
          ? "border border-violet-400/65 text-violet-300 hover:bg-violet-950/45"
          : "border border-slate-600/80 text-slate-300 hover:border-emerald-400/70 hover:bg-emerald-950/25 hover:text-emerald-200",
        isCompleted &&
          "border-emerald-300/90 bg-emerald-950/40 text-emerald-200 shadow-[0_0_14px_rgba(16,185,129,0.35)]",
      )}
      disabled={isCompleted || isSubmitting}
      onClick={onComplete}
      size="icon"
      type="button"
      variant="ghost"
    >
      {isCompleted || isSubmitting ? (
        <Check className={cn("size-5", isSubmitting && "animate-pulse")} />
      ) : (
        <Circle className="size-4" />
      )}
    </Button>
  );
}

function DeleteButton({
  isConfirming,
  isDeleting,
  onDelete,
}: {
  isConfirming: boolean;
  isDeleting: boolean;
  onDelete: () => void;
}) {
  return (
    <Button
      aria-label={isConfirming ? "Confirm delete quest" : "Delete quest"}
      className={cn(
        "h-9 rounded-full border border-slate-700/70 bg-transparent text-slate-500 transition-all hover:border-rose-400/70 hover:bg-rose-950/25 hover:text-rose-200",
        isConfirming ? "w-16 px-2 text-xs text-rose-200" : "w-9 px-0",
      )}
      disabled={isDeleting}
      onClick={onDelete}
      type="button"
      variant="ghost"
    >
      {isDeleting ? (
        <Trash2 className="size-4 animate-pulse" />
      ) : isConfirming ? (
        "Delete"
      ) : (
        <Trash2 className="size-4" />
      )}
    </Button>
  );
}

function RewardSummary({
  task,
  tone = "blue",
}: {
  task: TaskDefinition;
  tone?: "blue" | "violet";
}) {
  const extras = [
    task.coinReward > 0 ? `${formatNumber(task.coinReward)} coins` : null,
    task.gemReward > 0 ? `${formatNumber(task.gemReward)} gems` : null,
  ].filter(Boolean);

  return (
    <div className="min-w-[4.75rem] text-right">
      <p
        className={cn(
          "whitespace-nowrap text-base font-medium text-white",
          tone === "violet" && "text-violet-300",
        )}
      >
        +{formatNumber(task.xpReward)}{" "}
        <span className={tone === "violet" ? "text-violet-400" : "text-[#3d87ff]"}>
          XP
        </span>
      </p>
      {extras.length > 0 && (
        <p className="truncate text-xs text-slate-400">{extras.join(" / ")}</p>
      )}
    </div>
  );
}

function QuestIconBadge({
  children,
  styles,
}: {
  children: ReactNode;
  styles: (typeof toneStyles)[QuestTone];
}) {
  return (
    <div
      className={cn(
        "flex size-13 items-center justify-center border",
        styles.badge,
      )}
      style={{
        clipPath:
          "polygon(25% 6%, 75% 6%, 100% 50%, 75% 94%, 25% 94%, 0 50%)",
      }}
    >
      {children}
    </div>
  );
}

function buildProgressionModals(
  task: TaskDefinition,
  result: CompletionResult,
  snapshot: GameSnapshot,
): ProgressionModalData[] {
  const modals: ProgressionModalData[] = [];

  if (task.kind === "boss") {
    modals.push({
      actionLabel: "Claim Reward",
      eyebrow: "Boss Defeated",
      id: `boss-${result.completion.id}`,
      rewardLabel: `+${formatNumber(result.completion.earnedXp)} XP`,
      subtitle: `You conquered ${task.title}.`,
      title: "Boss Defeated",
      variant: "boss",
    });
  }

  for (
    let level = result.overallLevelBefore + 1;
    level <= result.overallLevelAfter;
    level += 1
  ) {
    modals.push({
      actionLabel: "Continue",
      eyebrow: "Level Up",
      id: `level-${result.completion.id}-${level}`,
      level,
      rewardLabel: `Level ${level}`,
      stats: buildCompletionStats(result),
      subtitle: `You reached Level ${level}. Your power grows stronger.`,
      title: "Level Up!",
      variant: "level-up",
    });
  }

  for (const achievementKey of result.unlockedAchievements) {
    const achievement = snapshot.achievements.find(
      (candidate) => candidate.key === achievementKey,
    );

    if (!achievement) {
      continue;
    }

    modals.push(buildAchievementModal(achievement));
  }

  return modals;
}

function buildAchievementModal(
  achievement: AchievementDefinition,
): ProgressionModalData {
  const isBadge =
    achievement.category === "medal" ||
    achievement.category === "boss-trophy" ||
    achievement.category === "title";

  return {
    actionLabel: isBadge ? "Nice!" : "Awesome!",
    eyebrow: isBadge ? "Badge Earned" : "Achievement Unlocked",
    id: `achievement-${achievement.key}`,
    imageSrc: achievement.medalImage,
    rewardLabel: formatAchievementReward(achievement),
    subtitle: achievement.description,
    title: achievement.title,
    variant: isBadge ? "badge" : "achievement",
  };
}

function buildCompletionStats(result: CompletionResult) {
  return [
    { label: "XP", value: `+${formatNumber(result.completion.earnedXp)}` },
    {
      label: "Coins",
      value: `+${formatNumber(result.completion.earnedCoins)}`,
    },
    {
      label: "Gems",
      value: `+${formatNumber(result.completion.earnedGems)}`,
    },
  ];
}

function formatAchievementReward(achievement: AchievementDefinition) {
  const rewards = [
    achievement.coinReward > 0
      ? `+${formatNumber(achievement.coinReward)} coins`
      : null,
    achievement.gemReward > 0
      ? `+${formatNumber(achievement.gemReward)} gems`
      : null,
  ].filter(Boolean);

  return rewards.length ? rewards.join(" / ") : undefined;
}

function isTaskCompletedToday(
  task: TaskDefinition,
  completions: TaskCompletion[],
  today: string,
) {
  return completions.some((completion) => {
    if (completion.taskId !== task.id) {
      return false;
    }

    return task.kind === "daily"
      ? completion.completedForDate === today
      : true;
  });
}

function shouldShowTaskForTab(
  task: TaskDefinition,
  activeTab: QuestTab,
  completions: TaskCompletion[],
  today: string,
) {
  if (task.status === "archived") {
    return false;
  }

  if (activeTab === "Completed") {
    return isTaskCompletedToday(task, completions, today) || task.status === "completed";
  }

  if (task.status !== "active") {
    return false;
  }

  if (activeTab === "Daily") {
    return task.kind === "daily";
  }

  if (activeTab === "Goals") {
    return task.kind === "goal" && task.difficulty !== "hard";
  }

  if (activeTab === "Bosses") {
    return task.kind === "boss";
  }

  if (activeTab === "Challenges") {
    return task.kind === "goal" && task.difficulty === "hard";
  }

  return false;
}

function getEmptyStateMessage(activeTab: QuestTab) {
  const messages: Record<QuestTab, string> = {
    Daily: "No daily quests yet. Create one to build your streak.",
    Goals: "No active goals yet. Create a one-time quest to start moving.",
    Bosses: "No boss quests waiting. Create a boss when you need a serious fight.",
    Challenges: "No hard challenges yet. Hard goals will appear here.",
    Completed: "No completed quests yet today. Finish something and it will land here.",
  };

  return messages[activeTab];
}

function taskMatchesSearch(
  task: TaskDefinition,
  attributes: AttributeProgress[],
  searchQuery: string,
) {
  const normalizedQuery = searchQuery.trim().toLowerCase();

  if (!normalizedQuery) {
    return true;
  }

  const searchableText = [
    task.title,
    task.description,
    task.kind,
    task.difficulty,
    getAttributeLabel(task, attributes),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return searchableText.includes(normalizedQuery);
}

function getPrimaryAttribute(task: TaskDefinition): AttributeKey {
  return task.attributes[0]?.key ?? "discipline";
}

function getTaskAttributeVisual(
  task: TaskDefinition,
  attributes: Array<AttributeProgress>,
) {
  const primaryAttribute = getPrimaryAttribute(task);
  const storedAttribute = attributes.find(
    (attribute) => attribute.key === primaryAttribute,
  );

  return getAttributeVisual(storedAttribute ?? primaryAttribute);
}

function getAttributeLabel(
  task: TaskDefinition,
  attributes: Array<AttributeProgress>,
) {
  const labels = task.attributes.map((attribute) => {
    const storedAttribute = attributes.find(
      (candidate) => candidate.key === attribute.key,
    );

    return storedAttribute?.label ?? getAttributeFallbackLabel(attribute.key);
  });

  if (labels.length <= 1) {
    return labels[0] ?? "General";
  }

  return `${labels[0]} +${labels.length - 1}`;
}

function getAttributeFallbackLabel(key: AttributeKey) {
  if (isCoreAttributeKey(key)) {
    return coreAttributeLabels[key];
  }

  return key
    .replace(/^custom-/, "")
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ") || "Custom";
}
