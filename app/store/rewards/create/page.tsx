"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent, ReactNode } from "react";
import { useState } from "react";
import {
  ArrowLeft,
  CircleDollarSign,
  Gamepad2,
  Gem,
  Gift,
  Plus,
  Shirt,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { rewardService } from "@/lib/game";
import type { Currency, StoreReward } from "@/lib/indexed-db/types";
import { cn } from "@/lib/utils";

type RewardKind = StoreReward["kind"];

type FormState = {
  cost: string;
  description: string;
  kind: RewardKind;
  title: string;
};

const initialFormState: FormState = {
  cost: "20",
  description: "",
  kind: "experience",
  title: "",
};

const kindOptions: Array<{
  description: string;
  icon: ReactNode;
  label: string;
  value: RewardKind;
}> = [
  {
    description: "Movie night, day trip, cheat meal.",
    icon: <Sparkles className="size-5" />,
    label: "Experience",
    value: "experience",
  },
  {
    description: "Gaming session, digital treat, app time.",
    icon: <Gamepad2 className="size-5" />,
    label: "Digital",
    value: "digital",
  },
  {
    description: "Shoes, gear, phone, real-world purchases.",
    icon: <Shirt className="size-5" />,
    label: "Physical",
    value: "physical",
  },
  {
    description: "Anything personal that does not fit above.",
    icon: <Gift className="size-5" />,
    label: "Custom",
    value: "custom",
  },
];

export default function CreateRewardPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialFormState);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const currency = currencyForKind(form.kind);

  function updateField<Key extends keyof FormState>(
    key: Key,
    value: FormState[Key],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function createReward(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const title = form.title.trim();
    const cost = parsePositiveNumber(form.cost);

    if (!title) {
      setError("Give the reward a title.");
      return;
    }

    if (!cost || cost <= 0) {
      setError("Reward cost should be greater than zero.");
      return;
    }

    try {
      setIsSaving(true);
      await rewardService.createCustomReward({
        cost,
        currency,
        description: form.description.trim() || undefined,
        kind: form.kind,
        title,
      });
      router.push("/store");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not create this reward.",
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
          <Link aria-label="Back to store" href="/store">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-[#3d87ff]">New Reward</p>
          <h1 className="truncate text-2xl font-semibold leading-none tracking-[-0.03em] text-white">
            Custom Reward
          </h1>
        </div>
      </header>

      <form className="space-y-4" onSubmit={createReward}>
        <section className="space-y-3 rounded-2xl border border-slate-700/55 bg-[#07111f]/82 p-4 shadow-[0_10px_28px_rgba(0,0,0,0.28),inset_0_1px_18px_rgba(99,148,216,0.06)] backdrop-blur-xl">
          <LabeledField label="Reward title">
            <input
              className={inputClassName}
              onChange={(event) => updateField("title", event.target.value)}
              placeholder="Movie Night"
              value={form.title}
            />
          </LabeledField>

          <LabeledField label="Description">
            <textarea
              className={cn(inputClassName, "min-h-20 resize-none py-2")}
              onChange={(event) =>
                updateField("description", event.target.value)
              }
              placeholder="What are you allowed to enjoy?"
              value={form.description}
            />
          </LabeledField>
        </section>

        <section className="space-y-3">
          <SectionLabel>Reward Type</SectionLabel>
          <div className="grid grid-cols-2 gap-2">
            {kindOptions.map((option) => {
              const isActive = form.kind === option.value;
              const optionCurrency = currencyForKind(option.value);

              return (
                <button
                  className={cn(
                    "min-h-24 rounded-2xl border border-slate-700/55 bg-[#07111f]/82 p-3 text-left shadow-[inset_0_1px_18px_rgba(99,148,216,0.05)] transition",
                    isActive &&
                      "border-[#2f8cff]/80 bg-[#0d4fe0]/85 shadow-[0_0_20px_rgba(47,140,255,0.36)]",
                  )}
                  key={option.value}
                  onClick={() => updateField("kind", option.value)}
                  type="button"
                >
                  <span className="flex items-center gap-2 text-base font-semibold text-white">
                    {option.icon}
                    {option.label}
                  </span>
                  <span className="mt-1 block text-[11px] leading-snug text-slate-300">
                    {option.description}
                  </span>
                  <span className="mt-2 flex items-center gap-1 text-xs font-semibold text-slate-200">
                    <CurrencyIcon currency={optionCurrency} />
                    {optionCurrency}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="space-y-3 rounded-2xl border border-slate-700/55 bg-[#07111f]/82 p-4 shadow-[0_10px_28px_rgba(0,0,0,0.28),inset_0_1px_18px_rgba(99,148,216,0.06)] backdrop-blur-xl">
          <LabeledField label={`Cost in ${currency}`}>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                <CurrencyIcon currency={currency} />
              </span>
              <input
                className={cn(inputClassName, "pl-10")}
                inputMode="numeric"
                onChange={(event) => updateField("cost", event.target.value)}
                value={form.cost}
              />
            </div>
          </LabeledField>

          <p className="text-xs leading-relaxed text-slate-400">
            Physical rewards spend coins. Experience, digital, and custom
            rewards spend gems so real-world purchases stay separate from small
            personal treats.
          </p>
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
          {isSaving ? "Creating..." : "Create Reward"}
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

function CurrencyIcon({ currency }: { currency: Currency }) {
  return currency === "coins" ? (
    <span className="flex size-4 items-center justify-center rounded-full bg-amber-400 text-[0.6rem] text-amber-950 shadow-[0_0_8px_rgba(251,191,36,0.55)]">
      <CircleDollarSign className="size-3" />
    </span>
  ) : (
    <span className="flex size-4 items-center justify-center rounded-sm bg-cyan-400 text-cyan-950 shadow-[0_0_8px_rgba(34,211,238,0.55)]">
      <Gem className="size-3" />
    </span>
  );
}

function currencyForKind(kind: RewardKind): Currency {
  return kind === "physical" ? "coins" : "gems";
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
