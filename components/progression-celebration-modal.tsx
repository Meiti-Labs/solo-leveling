"use client";

import Image from "next/image";
import { Award, ShieldCheck, Skull, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type ProgressionModalVariant = "achievement" | "badge" | "boss" | "level-up";

type ProgressionModalStat = {
  label: string;
  value: string;
};

export type ProgressionModalData = {
  actionLabel: string;
  eyebrow: string;
  id: string;
  imageSrc?: string;
  level?: number;
  rewardLabel?: string;
  stats?: ProgressionModalStat[];
  subtitle: string;
  title: string;
  variant: ProgressionModalVariant;
};

type BadgeTier = "1-10" | "10-25" | "25-50" | "50-75" | "75-100" | "100+";

const fallbackMedal = "/images/medals/star-shield-medal.png";

const variantStyles: Record<
  ProgressionModalVariant,
  {
    accent: string;
    border: string;
    glow: string;
    imageGlow: string;
  }
> = {
  achievement: {
    accent: "text-emerald-300",
    border: "border-emerald-400/45",
    glow: "from-emerald-950/50 via-[#07111f] to-[#030914]",
    imageGlow: "drop-shadow-[0_0_30px_rgba(16,185,129,0.65)]",
  },
  badge: {
    accent: "text-violet-300",
    border: "border-violet-400/50",
    glow: "from-violet-950/50 via-[#07111f] to-[#030914]",
    imageGlow: "drop-shadow-[0_0_30px_rgba(168,85,247,0.7)]",
  },
  boss: {
    accent: "text-fuchsia-300",
    border: "border-fuchsia-400/50",
    glow: "from-fuchsia-950/45 via-[#100923] to-[#030914]",
    imageGlow: "drop-shadow-[0_0_34px_rgba(217,70,239,0.7)]",
  },
  "level-up": {
    accent: "text-[#78b4ff]",
    border: "border-[#2f8cff]/60",
    glow: "from-blue-950/55 via-[#07111f] to-[#030914]",
    imageGlow: "drop-shadow-[0_0_34px_rgba(47,140,255,0.85)]",
  },
};

export default function ProgressionCelebrationModal({
  modal,
  onContinue,
}: {
  modal: ProgressionModalData;
  onContinue: () => void;
}) {
  const styles = variantStyles[modal.variant];

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-[120] flex h-[100svh] max-h-[100svh] items-center justify-center overflow-hidden bg-[#010713]/96 px-4 py-3 backdrop-blur-xl"
      role="dialog"
    >
      <section
        className={cn(
          "relative flex h-full max-h-[calc(100svh-1.5rem)] w-full max-w-sm flex-col overflow-hidden rounded-[1.7rem] border bg-[#07111f] p-4 text-center shadow-[0_24px_70px_rgba(0,0,0,0.55),inset_0_1px_24px_rgba(99,148,216,0.08)]",
          styles.border,
        )}
      >
        <div className="absolute inset-0 bg-[url('/images/card-backgrounds/profile-header-card-bg.png')] bg-cover bg-center opacity-25" />
        <div className={cn("absolute inset-0 bg-gradient-to-b", styles.glow)} />
        <div className="pointer-events-none absolute inset-x-8 top-0 h-32 rounded-full bg-current opacity-10 blur-3xl" />

        <div className="relative flex min-h-0 flex-1 flex-col">
          <p className="shrink-0 text-xs font-bold uppercase tracking-[0.24em] text-slate-400">
            {modal.eyebrow}
          </p>

          <div className="mt-4 flex shrink-0 justify-center">
            <CelebrationVisual modal={modal} />
          </div>

          <div className="mt-5 min-h-0 space-y-2">
            <h2
              className={cn(
                "text-2xl font-semibold leading-tight tracking-[-0.03em]",
                modal.variant === "boss" ? styles.accent : "text-white",
              )}
            >
              {modal.title}
            </h2>
            <p className="mx-auto max-w-64 overflow-hidden text-sm leading-relaxed text-slate-400 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
              {modal.subtitle}
            </p>
          </div>

          {modal.rewardLabel && (
            <p
              className={cn(
                "mt-4 shrink-0 text-lg font-semibold",
                styles.accent,
              )}
            >
              {modal.rewardLabel}
            </p>
          )}

          {modal.stats?.length ? (
            <div className="mt-4 grid shrink-0 grid-cols-3 gap-2 rounded-2xl border border-slate-700/55 bg-[#030914]/55 p-2">
              {modal.stats.slice(0, 3).map((stat) => (
                <div key={stat.label}>
                  <p className="truncate text-[11px] text-slate-500">
                    {stat.label}
                  </p>
                  <p className="mt-1 truncate text-sm font-semibold text-white">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          ) : null}

          <div className="mt-auto shrink-0 pt-5">
            <Button
              className={cn(
                "h-12 w-full rounded-xl text-base font-semibold text-white shadow-[0_0_24px_rgba(47,140,255,0.35)]",
                modal.variant === "badge"
                  ? "bg-violet-600 hover:bg-violet-500"
                  : "bg-[#0d4fe0] hover:bg-[#155df0]",
              )}
              onClick={onContinue}
              type="button"
            >
              {modal.actionLabel}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function CelebrationVisual({ modal }: { modal: ProgressionModalData }) {
  const styles = variantStyles[modal.variant];
  const { formatNumber, t } = useI18n();

  if (modal.variant === "level-up") {
    const level = modal.level ?? 1;

    return (
      <div className="relative size-36">
        <Image
          alt={t("level.badgeAlt", { level: formatNumber(level) })}
          className={cn("object-contain", styles.imageGlow)}
          fill
          sizes="144px"
          src={`/images/level-badge-containers/${getBadgeTier(level)}.png`}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
          <span className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300">
            {t("level.label")}
          </span>
          <span className="text-4xl font-semibold leading-none text-white drop-shadow-[0_0_14px_rgba(92,160,255,0.95)]">
            {formatNumber(level)}
          </span>
        </div>
      </div>
    );
  }

  if (modal.variant === "boss") {
    return (
      <div className="relative flex size-40 items-end justify-center overflow-hidden rounded-[2rem] border border-fuchsia-400/35 bg-[#100923]">
        <Image
          alt={modal.title}
          className="object-cover opacity-80"
          fill
          sizes="160px"
          src="/images/card-backgrounds/boss-background-1.png"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#030914] via-transparent to-fuchsia-950/20" />
        <Skull className={cn("relative mb-8 size-20", styles.accent, styles.imageGlow)} />
      </div>
    );
  }

  const Icon = modal.variant === "badge" ? Award : ShieldCheck;

  return (
    <div className="relative size-36">
      <Image
        alt={modal.title}
        className={cn("object-contain", styles.imageGlow)}
        fill
        sizes="144px"
        src={modal.imageSrc ?? fallbackMedal}
      />
      {!modal.imageSrc && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon className={cn("size-16", styles.accent)} />
        </div>
      )}
      <Sparkles className={cn("absolute right-4 top-4 size-5", styles.accent)} />
    </div>
  );
}

function getBadgeTier(level: number): BadgeTier {
  if (level >= 100) return "100+";
  if (level >= 75) return "75-100";
  if (level >= 50) return "50-75";
  if (level >= 25) return "25-50";
  if (level >= 10) return "10-25";
  return "1-10";
}
