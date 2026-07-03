"use client";

import {
  BookOpen,
  Check,
  Coins,
  Dumbbell,
  Shield,
  Skull,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type QuestDifficulty = "Easy" | "Medium" | "Hard" | "Boss";
type QuestTone = "red" | "purple" | "green" | "gold" | "boss";

type Quest = {
  id: string;
  title: string;
  attribute: string;
  difficulty: QuestDifficulty;
  xpReward: number;
  completed: boolean;
  type: "normal" | "boss";
  tone: QuestTone;
  icon: React.ComponentType<{ className?: string }>;
  bossBackground?: string;
};

const bossQuestTemplate: Quest = {
  id: "inner-procrastination",
  title: "Inner Procrastination",
  attribute: "Boss Quest",
  difficulty: "Boss",
  xpReward: 1200,
  completed: false,
  type: "boss",
  tone: "boss",
  icon: Skull,
  bossBackground: "/images/card-backgrounds/boss-background-1.png",
};

const dailyQuests: Quest[] = [
  {
    id: "morning-workout",
    title: "Morning Workout",
    attribute: "Strength",
    difficulty: "Easy",
    xpReward: 300,
    completed: true,
    type: "normal",
    tone: "red",
    icon: Dumbbell,
  },
  {
    id: "read-pages",
    title: "Read 20 Pages",
    attribute: "Intelligence",
    difficulty: "Medium",
    xpReward: 350,
    completed: true,
    type: "normal",
    tone: "purple",
    icon: BookOpen,
  },
  {
    id: "no-sugar",
    title: "No Sugar Day",
    attribute: "Discipline",
    difficulty: "Medium",
    xpReward: 300,
    completed: true,
    type: "normal",
    tone: "green",
    icon: Shield,
  },
  {
    id: "save-money",
    title: "Save $20",
    attribute: "Finance",
    difficulty: "Easy",
    xpReward: 300,
    completed: true,
    type: "normal",
    tone: "gold",
    icon: Coins,
  },
  bossQuestTemplate,
];

const toneStyles: Record<
  QuestTone,
  {
    badge: string;
    icon: string;
    dot: string;
    text: string;
  }
> = {
  red: {
    badge: "border-rose-500/80 bg-rose-950/25 shadow-[0_0_22px_rgba(244,63,94,0.18)]",
    icon: "text-rose-400",
    dot: "bg-emerald-400",
    text: "text-slate-400",
  },
  purple: {
    badge: "border-violet-500/80 bg-violet-950/25 shadow-[0_0_22px_rgba(139,92,246,0.18)]",
    icon: "text-violet-400",
    dot: "bg-violet-400",
    text: "text-violet-300",
  },
  green: {
    badge: "border-emerald-500/80 bg-emerald-950/25 shadow-[0_0_22px_rgba(16,185,129,0.18)]",
    icon: "text-emerald-400",
    dot: "bg-emerald-400",
    text: "text-slate-400",
  },
  gold: {
    badge: "border-amber-500/80 bg-amber-950/25 shadow-[0_0_22px_rgba(245,158,11,0.18)]",
    icon: "text-amber-300",
    dot: "bg-emerald-400",
    text: "text-slate-400",
  },
  boss: {
    badge: "border-fuchsia-500/80 bg-fuchsia-950/25 shadow-[0_0_24px_rgba(217,70,239,0.24)]",
    icon: "text-fuchsia-400",
    dot: "bg-fuchsia-400",
    text: "text-fuchsia-300",
  },
};

const formatXp = (xp: number) => new Intl.NumberFormat("en-US").format(xp);

export default function QuestListSection() {
  return (
    <section className="space-y-2">
      {dailyQuests.map((quest) => (
        <QuestCard key={quest.id} quest={quest} />
      ))}
    </section>
  );
}

function QuestCard({ quest }: { quest: Quest }) {
  if (quest.type === "boss") {
    return <BossQuestCard quest={quest} />;
  }

  return <NormalQuestCard quest={quest} />;
}

function NormalQuestCard({ quest }: { quest: Quest }) {
  const Icon = quest.icon;
  const styles = toneStyles[quest.tone];

  return (
    <article className="grid grid-cols-[4.25rem_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-slate-700/55 bg-[#07111f]/82 p-3 font-sans shadow-[0_10px_28px_rgba(0,0,0,0.28),inset_0_1px_18px_rgba(99,148,216,0.06)] backdrop-blur-xl">
      <QuestIconBadge styles={styles}>
        <Icon className={cn("size-6 stroke-[2.3]", styles.icon)} />
      </QuestIconBadge>

      <div className="min-w-0 space-y-1">
        <h2 className="truncate text-base font-medium leading-tight text-white">
          {quest.title}
        </h2>
        <p className="truncate text-sm text-slate-400">{quest.attribute}</p>
        <div className="flex items-center gap-1.5 text-sm">
          <span className={cn("size-2 rounded-full", styles.dot)} />
          <span className={styles.text}>{quest.difficulty}</span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-5">
        <p className="whitespace-nowrap text-base font-medium text-white">
          +{formatXp(quest.xpReward)}{" "}
          <span className="text-[#3d87ff]">XP</span>
        </p>
        <Button
          aria-label={quest.completed ? "Quest completed" : "Complete quest"}
          className="size-11 rounded-full border border-emerald-400/80 bg-emerald-950/20 text-emerald-300 shadow-[0_0_18px_rgba(16,185,129,0.45)] hover:bg-emerald-950/40"
          size="icon"
          type="button"
          variant="ghost"
        >
          <Check className="size-6" />
        </Button>
      </div>
    </article>
  );
}

function BossQuestCard({ quest }: { quest: Quest }) {
  const Icon = quest.icon;
  const styles = toneStyles[quest.tone];

  return (
    <article className="relative grid grid-cols-[4.25rem_minmax(0,1fr)_auto] items-center gap-3 overflow-hidden rounded-xl border border-fuchsia-500/30 bg-[#07111f] p-3 font-sans shadow-[0_10px_28px_rgba(0,0,0,0.28),inset_0_1px_18px_rgba(217,70,239,0.1)]">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-50"
        style={{ backgroundImage: `url(${quest.bossBackground})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#080816]/90 via-[#120929]/75 to-[#070b16]/90" />

      <div className="relative">
        <QuestIconBadge styles={styles}>
          <Icon className={cn("size-6 stroke-[2.3]", styles.icon)} />
        </QuestIconBadge>
      </div>

      <div className="relative min-w-0 space-y-1">
        <h2 className="truncate text-base font-medium leading-tight text-white">
          {quest.title}
        </h2>
        <p className="truncate text-sm text-fuchsia-200/80">{quest.attribute}</p>
        <div className="flex items-center gap-1.5 text-sm">
          <span className={cn("size-2 rounded-full", styles.dot)} />
          <span className={styles.text}>{quest.difficulty}</span>
        </div>
      </div>

      <p className="relative whitespace-nowrap text-base font-medium text-white">
        +{formatXp(quest.xpReward)} <span className="text-[#d946ef]">XP</span>
      </p>
    </article>
  );
}

function QuestIconBadge({
  children,
  styles,
}: {
  children: React.ReactNode;
  styles: (typeof toneStyles)[QuestTone];
}) {
  return (
    <div
      className={cn("flex size-13 items-center justify-center border", styles.badge)}
      style={{
        clipPath:
          "polygon(25% 6%, 75% 6%, 100% 50%, 75% 94%, 25% 94%, 0 50%)",
      }}
    >
      {children}
    </div>
  );
}

export { bossQuestTemplate };
