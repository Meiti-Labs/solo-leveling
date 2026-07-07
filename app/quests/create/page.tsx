"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent, ReactNode } from "react";
import { useMemo, useState } from "react";
import { ArrowLeft, CalendarDays, Check, Plus } from "lucide-react";
import {
  getAttributeColorSchemeOption,
  getAttributeVisual,
} from "@/components/attribute-visuals";
import { Button } from "@/components/ui/button";
import { gameService } from "@/lib/game";
import type {
  AttributeKey,
  CoreAttributeKey,
  TaskDifficulty,
  TaskKind,
} from "@/lib/indexed-db/types";
import { ATTRIBUTE_KEYS } from "@/lib/indexed-db/types";
import { cn } from "@/lib/utils";
import { useGameSnapshot } from "@/hooks/use-game-snapshot";

type FormState = {
  coinReward: string;
  deadline: string;
  description: string;
  difficulty: Exclude<TaskDifficulty, "boss">;
  gemReward: string;
  kind: TaskKind;
  missedPenaltyXp: string;
  streakBonusEvery: string;
  streakBonusXp: string;
  title: string;
  xpReward: string;
};

const initialFormState: FormState = {
  coinReward: "0",
  deadline: "",
  description: "",
  difficulty: "easy",
  gemReward: "0",
  kind: "daily",
  missedPenaltyXp: "",
  streakBonusEvery: "7",
  streakBonusXp: "25",
  title: "",
  xpReward: "40",
};

type QuestPreset = {
  attributes: AttributeKey[];
  coinReward: string;
  description: string;
  difficulty: Exclude<TaskDifficulty, "boss">;
  gemReward: string;
  kind: TaskKind;
  label: string;
  missedPenaltyXp?: string;
  streakBonusEvery?: string;
  streakBonusXp?: string;
  title: string;
  xpReward: string;
};

const kindOptions: Array<{
  description: string;
  label: string;
  value: TaskKind;
}> = [
  {
    description: "Repeats every day and can build streak bonuses.",
    label: "Daily",
    value: "daily",
  },
  {
    description: "One-time quest that disappears after completion.",
    label: "Goal",
    value: "goal",
  },
  {
    description: "High-impact one-time quest with stronger XP pressure.",
    label: "Boss",
    value: "boss",
  },
];

const difficultyOptions: Array<{
  label: string;
  value: Exclude<TaskDifficulty, "boss">;
}> = [
  { label: "Easy", value: "easy" },
  { label: "Medium", value: "medium" },
  { label: "Hard", value: "hard" },
];

const questPresets: QuestPreset[] = [
  {
    attributes: ["strength"],
    coinReward: "8",
    description: "Move your body before the day steals your attention.",
    difficulty: "easy",
    gemReward: "0",
    kind: "daily",
    label: "Workout Daily",
    streakBonusEvery: "7",
    streakBonusXp: "25",
    title: "Morning Workout",
    xpReward: "40",
  },
  {
    attributes: ["intelligence", "wisdom"],
    coinReward: "0",
    description: "Train your mind with a focused reading block.",
    difficulty: "medium",
    gemReward: "1",
    kind: "daily",
    label: "Reading Daily",
    streakBonusEvery: "7",
    streakBonusXp: "25",
    title: "Read 20 Pages",
    xpReward: "45",
  },
  {
    attributes: ["finance"],
    coinReward: "60",
    description: "Save money toward a real-world reward.",
    difficulty: "medium",
    gemReward: "0",
    kind: "goal",
    label: "Savings Goal",
    title: "Save $100",
    xpReward: "220",
  },
  {
    attributes: ["discipline", "wisdom"],
    coinReward: "45",
    description: "A hard one-time challenge with meaningful pressure.",
    difficulty: "hard",
    gemReward: "2",
    kind: "goal",
    label: "Hard Challenge",
    missedPenaltyXp: "90",
    title: "7 Day No Sugar Challenge",
    xpReward: "300",
  },
  {
    attributes: ["discipline", "wisdom", "communication"],
    coinReward: "120",
    description: "Defeat the boss that holds you back.",
    difficulty: "hard",
    gemReward: "3",
    kind: "boss",
    label: "Boss Quest",
    missedPenaltyXp: "250",
    title: "Inner Procrastination",
    xpReward: "650",
  },
];

const fallbackAttributeLabels: Record<CoreAttributeKey, string> = {
  communication: "Communication",
  discipline: "Discipline",
  finance: "Finance",
  intelligence: "Intelligence",
  strength: "Strength",
  wisdom: "Wisdom",
};

export default function CreateQuestPage() {
  const router = useRouter();
  const { snapshot } = useGameSnapshot();
  const [form, setForm] = useState<FormState>(initialFormState);
  const [selectedAttributes, setSelectedAttributes] = useState<AttributeKey[]>([
    "strength",
  ]);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const attributes = useMemo(() => {
    if (snapshot?.attributes.length) {
      return snapshot.attributes.map((attribute) => ({
        key: attribute.key,
        label: attribute.label,
      }));
    }

    return ATTRIBUTE_KEYS.map((key) => ({
      key,
      label: fallbackAttributeLabels[key],
    }));
  }, [snapshot]);

  const isOneTimeQuest = form.kind !== "daily";

  function updateField<Key extends keyof FormState>(
    key: Key,
    value: FormState[Key],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateKind(kind: TaskKind) {
    setForm((current) => ({
      ...current,
      deadline: kind === "daily" ? "" : current.deadline,
      difficulty: kind === "boss" ? "hard" : current.difficulty,
      kind,
      streakBonusEvery:
        kind === "daily" ? current.streakBonusEvery || "7" : current.streakBonusEvery,
      streakBonusXp:
        kind === "daily"
          ? current.streakBonusXp || String(Math.round(Number(current.xpReward || 0) * 0.5))
          : current.streakBonusXp,
    }));
  }

  function applyPreset(preset: QuestPreset) {
    setSelectedAttributes(preset.attributes);
    setForm((current) => ({
      ...current,
      coinReward: preset.coinReward,
      deadline: preset.kind === "daily" ? "" : current.deadline,
      description: preset.description,
      difficulty: preset.difficulty,
      gemReward: preset.gemReward,
      kind: preset.kind,
      missedPenaltyXp: preset.missedPenaltyXp ?? "",
      streakBonusEvery: preset.streakBonusEvery ?? current.streakBonusEvery,
      streakBonusXp: preset.streakBonusXp ?? current.streakBonusXp,
      title: preset.title,
      xpReward: preset.xpReward,
    }));
  }

  function applyPenaltyPercent(percent: number) {
    const xpReward = parsePositiveNumber(form.xpReward) ?? 0;
    updateField("missedPenaltyXp", String(Math.round(xpReward * percent)));
  }

  function applyDeadlineShortcut(daysFromNow?: number) {
    updateField(
      "deadline",
      daysFromNow ? toDateInputValue(addDays(new Date(), daysFromNow)) : "",
    );
  }

  function toggleAttribute(key: AttributeKey) {
    setSelectedAttributes((current) => {
      if (current.includes(key)) {
        return current.length === 1
          ? current
          : current.filter((attribute) => attribute !== key);
      }

      return [...current, key];
    });
  }

  async function createQuest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const title = form.title.trim();
    const xpReward = parsePositiveNumber(form.xpReward);
    const coinReward = parsePositiveNumber(form.coinReward);
    const gemReward = parsePositiveNumber(form.gemReward);
    const missedPenaltyXp =
      parsePositiveNumber(form.missedPenaltyXp) ?? Math.round((xpReward ?? 0) * 0.3);
    const streakBonusEvery = parsePositiveNumber(form.streakBonusEvery);
    const streakBonusXp = parsePositiveNumber(form.streakBonusXp);

    if (!title) {
      setError("Give the quest a title.");
      return;
    }

    if (!xpReward || xpReward <= 0) {
      setError("XP reward should be greater than zero.");
      return;
    }

    try {
      setIsSaving(true);
      await gameService.createTask({
        attributes: selectedAttributes.map((key) => ({ key, weight: 1 })),
        coinReward: coinReward ?? 0,
        deadline: isOneTimeQuest ? form.deadline || undefined : undefined,
        description: form.description.trim() || undefined,
        difficulty: form.kind === "boss" ? "boss" : form.difficulty,
        gemReward: gemReward ?? 0,
        isDefault: false,
        kind: form.kind,
        missedPenaltyXp,
        status: "active",
        streakBonusEvery: form.kind === "daily" ? streakBonusEvery ?? 7 : undefined,
        streakBonusXp:
          form.kind === "daily"
            ? streakBonusXp ?? Math.round(xpReward * 0.5)
            : undefined,
        title,
        xpReward,
      });
      router.push("/quests");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not create this quest.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="mx-auto min-h-[calc(100svh-8rem)] w-full max-w-md space-y-4 px-3 py-4">
      <header className="flex items-center justify-between gap-3 pt-2">
        <Button
          asChild
          className="size-11 rounded-2xl border border-slate-700/60 bg-[#07111f]/80 text-white shadow-[0_8px_24px_rgba(0,0,0,0.35),inset_0_1px_18px_rgba(99,148,216,0.08)] hover:bg-[#0b1728]"
          size="icon"
          variant="ghost"
        >
          <Link aria-label="Back to quests" href="/quests">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-[#3d87ff]">New Quest</p>
          <h1 className="truncate text-2xl font-semibold leading-none tracking-[-0.03em] text-white">
            Create Quest
          </h1>
        </div>
      </header>

      <form className="space-y-4" onSubmit={createQuest}>
        <section className="space-y-3">
          <SectionLabel>Quick Presets</SectionLabel>
          <div className="-mx-3 overflow-x-auto px-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex min-w-max gap-2">
              {questPresets.map((preset) => (
                <button
                  className="min-h-20 w-36 rounded-2xl border border-slate-700/55 bg-[#07111f]/82 p-3 text-left shadow-[inset_0_1px_18px_rgba(99,148,216,0.05)] transition hover:border-[#2f8cff]/60 hover:bg-[#0b1728]"
                  key={preset.label}
                  onClick={() => applyPreset(preset)}
                  type="button"
                >
                  <span className="block text-sm font-semibold text-white">
                    {preset.label}
                  </span>
                  <span className="mt-1 block text-xs capitalize text-slate-400">
                    {preset.kind === "goal" && preset.difficulty === "hard"
                      ? "challenge"
                      : preset.kind}
                  </span>
                  <span className="mt-2 block text-xs font-semibold text-[#4f8cff]">
                    +{preset.xpReward} XP
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-3 rounded-2xl border border-slate-700/55 bg-[#07111f]/82 p-4 shadow-[0_10px_28px_rgba(0,0,0,0.28),inset_0_1px_18px_rgba(99,148,216,0.06)] backdrop-blur-xl">
          <LabeledField label="Quest title">
            <input
              className={inputClassName}
              onChange={(event) => updateField("title", event.target.value)}
              placeholder="Morning workout"
              value={form.title}
            />
          </LabeledField>

          <LabeledField label="Description">
            <textarea
              className={cn(inputClassName, "min-h-20 resize-none py-2")}
              onChange={(event) =>
                updateField("description", event.target.value)
              }
              placeholder="What does completing this prove?"
              value={form.description}
            />
          </LabeledField>
        </section>

        <section className="space-y-3">
          <SectionLabel>Quest Type</SectionLabel>
          <div className="grid grid-cols-3 gap-2">
            {kindOptions.map((option) => {
              const isActive = form.kind === option.value;

              return (
                <button
                  className={cn(
                    "min-h-24 rounded-2xl border border-slate-700/55 bg-[#07111f]/82 p-3 text-left shadow-[inset_0_1px_18px_rgba(99,148,216,0.05)] transition",
                    isActive &&
                      "border-[#2f8cff]/80 bg-[#0d4fe0]/85 shadow-[0_0_20px_rgba(47,140,255,0.36)]",
                  )}
                  key={option.value}
                  onClick={() => updateKind(option.value)}
                  type="button"
                >
                  <span className="block text-base font-semibold text-white">
                    {option.label}
                  </span>
                  <span className="mt-1 block text-[11px] leading-snug text-slate-300">
                    {option.description}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="space-y-3">
          <SectionLabel>Attributes</SectionLabel>
          <div className="grid grid-cols-2 gap-2">
            {attributes.map((attribute) => {
              const isSelected = selectedAttributes.includes(attribute.key);
              const visual = getAttributeVisual(attribute);
              const colorScheme = getAttributeColorSchemeOption(visual.color);
              const Icon = visual.icon;

              return (
                <button
                  className={cn(
                    "flex h-14 items-center justify-between gap-2 rounded-xl border border-slate-700/55 bg-[#07111f]/82 px-3 text-sm font-medium text-slate-300 transition",
                    isSelected &&
                      "border-[#2f8cff]/80 bg-[#0d4fe0]/35 text-white shadow-[0_0_18px_rgba(47,140,255,0.22)]",
                  )}
                  key={attribute.key}
                  onClick={() => toggleAttribute(attribute.key)}
                  type="button"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-xl border",
                        colorScheme.badge,
                      )}
                    >
                      <Icon
                        className={cn("size-4 stroke-[2.3]", colorScheme.icon)}
                      />
                    </span>
                    <span className="truncate">{attribute.label}</span>
                  </span>
                  {isSelected && <Check className="size-4 text-emerald-300" />}
                </button>
              );
            })}
          </div>
        </section>

        <section className="space-y-3 rounded-2xl border border-slate-700/55 bg-[#07111f]/82 p-4 shadow-[0_10px_28px_rgba(0,0,0,0.28),inset_0_1px_18px_rgba(99,148,216,0.06)] backdrop-blur-xl">
          <div className="grid grid-cols-3 gap-2">
            <LabeledField label="XP">
              <input
                className={inputClassName}
                inputMode="numeric"
                onChange={(event) => updateField("xpReward", event.target.value)}
                value={form.xpReward}
              />
            </LabeledField>
            <LabeledField label="Coins">
              <input
                className={inputClassName}
                inputMode="numeric"
                onChange={(event) =>
                  updateField("coinReward", event.target.value)
                }
                value={form.coinReward}
              />
            </LabeledField>
            <LabeledField label="Gems">
              <input
                className={inputClassName}
                inputMode="numeric"
                onChange={(event) => updateField("gemReward", event.target.value)}
                value={form.gemReward}
              />
            </LabeledField>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <LabeledField label="Difficulty">
              <select
                className={inputClassName}
                disabled={form.kind === "boss"}
                onChange={(event) =>
                  updateField(
                    "difficulty",
                    event.target.value as FormState["difficulty"],
                  )
                }
                value={form.kind === "boss" ? "hard" : form.difficulty}
              >
                {difficultyOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </LabeledField>

            <LabeledField label="XP loss">
              <input
                className={inputClassName}
                inputMode="numeric"
                onChange={(event) =>
                  updateField("missedPenaltyXp", event.target.value)
                }
                placeholder="Auto"
                value={form.missedPenaltyXp}
              />
            </LabeledField>
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            {[
              { label: "Light", value: 0.2 },
              { label: "Normal", value: 0.3 },
              { label: "Severe", value: 0.5 },
              { label: "Boss", value: 0.75 },
            ].map((option) => (
              <Button
                className="h-9 rounded-xl border border-slate-700/60 bg-[#030914]/70 px-2 text-xs font-medium text-slate-300 hover:bg-[#0b1728] hover:text-white"
                key={option.label}
                onClick={() => applyPenaltyPercent(option.value)}
                type="button"
                variant="ghost"
              >
                {option.label}
              </Button>
            ))}
          </div>

          {form.kind === "daily" && (
            <div className="grid grid-cols-2 gap-2 rounded-xl border border-emerald-500/25 bg-emerald-950/10 p-3">
              <LabeledField label="Streak every">
                <input
                  className={inputClassName}
                  inputMode="numeric"
                  onChange={(event) =>
                    updateField("streakBonusEvery", event.target.value)
                  }
                  value={form.streakBonusEvery}
                />
              </LabeledField>
              <LabeledField label="Bonus XP">
                <input
                  className={inputClassName}
                  inputMode="numeric"
                  onChange={(event) =>
                    updateField("streakBonusXp", event.target.value)
                  }
                  value={form.streakBonusXp}
                />
              </LabeledField>
              <p className="col-span-2 text-xs leading-relaxed text-emerald-100/70">
                Daily quests repeat tomorrow. Missing one on a normal day breaks
                streak and applies the XP loss above.
              </p>
            </div>
          )}

          {isOneTimeQuest && (
            <div className="space-y-2">
              <LabeledField label="Deadline">
                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
                  <input
                    className={cn(inputClassName, "pl-9")}
                    onChange={(event) =>
                      updateField("deadline", event.target.value)
                    }
                    type="date"
                    value={form.deadline}
                  />
                </div>
              </LabeledField>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { label: "None", value: undefined },
                  { label: "3d", value: 3 },
                  { label: "7d", value: 7 },
                  { label: "30d", value: 30 },
                ].map((option) => (
                  <Button
                    className="h-9 rounded-xl border border-slate-700/60 bg-[#030914]/70 px-2 text-xs font-medium text-slate-300 hover:bg-[#0b1728] hover:text-white"
                    key={option.label}
                    onClick={() => applyDeadlineShortcut(option.value)}
                    type="button"
                    variant="ghost"
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </section>

        {error && (
          <p className="rounded-xl border border-rose-500/50 bg-rose-950/25 px-3 py-2 text-sm text-rose-100">
            {error}
          </p>
        )}

        <Button
          className="h-12 w-full rounded-full border border-[#2f8cff]/80 bg-[#0d4fe0] text-base font-semibold text-white shadow-[0_0_22px_rgba(47,140,255,0.5),0_12px_26px_rgba(0,0,0,0.36),inset_0_1px_12px_rgba(255,255,255,0.14)] hover:bg-[#155df0]"
          disabled={isSaving}
          type="submit"
        >
          <Plus className="size-5" />
          {isSaving ? "Creating..." : "Create Quest"}
        </Button>
      </form>
    </main>
  );
}

const inputClassName =
  "h-11 w-full rounded-xl border border-slate-700/70 bg-[#030914]/80 px-3 text-base text-white outline-none transition placeholder:text-slate-600 focus:border-[#2f8cff]/80 focus:ring-2 focus:ring-[#2f8cff]/20 disabled:opacity-70";

function LabeledField({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium uppercase tracking-[0.08em] text-slate-400">
        {label}
      </span>
      {children}
    </label>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return <h2 className="text-lg font-semibold text-white">{children}</h2>;
}

function parsePositiveNumber(value: string) {
  if (!value.trim()) {
    return null;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }

  return Math.round(parsed);
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
