"use client";

import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  Boxes,
  ChevronRight,
  CircleDollarSign,
  Coffee,
  Crown,
  Gamepad2,
  Gem,
  Grid2X2,
  LockKeyhole,
  Mountain,
  Plus,
  Popcorn,
  Shirt,
  Smile,
  Sparkles,
  Utensils,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { rewardService } from "@/lib/game";
import { isOffDay, toAppDate } from "@/lib/game/date";
import type {
  Currency as GameCurrency,
  StoreReward,
} from "@/lib/indexed-db/types";
import { translateGameText, useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useGameSnapshot } from "@/hooks/use-game-snapshot";

type RewardTone = "gold" | "blue" | "red" | "purple" | "cyan" | "green";

type RewardVisual = {
  icon: ComponentType<{ className?: string }>;
  tone: RewardTone;
};

type StoreCategoryValue =
  | "all"
  | StoreReward["kind"]
  | StoreReward["currency"];

const categories = [
  { label: "All", value: "all", icon: Grid2X2 },
  { label: "Fun", value: "experience", icon: Smile },
  { label: "Digital", value: "digital", icon: Gamepad2 },
  { label: "Physical", value: "physical", icon: Shirt },
  { label: "Custom", value: "custom", icon: Sparkles },
  { label: "Premium", value: "gems", icon: Crown },
] satisfies Array<{
  label: string;
  value: StoreCategoryValue;
  icon: ComponentType<{ className?: string }>;
}>;

const toneStyles: Record<RewardTone, string> = {
  gold: "from-amber-500/25 to-yellow-950/35 text-amber-300",
  blue: "from-blue-500/25 to-blue-950/35 text-blue-300",
  red: "from-rose-500/25 to-rose-950/35 text-rose-300",
  purple: "from-violet-500/25 to-violet-950/35 text-violet-300",
  cyan: "from-cyan-500/25 to-cyan-950/35 text-cyan-300",
  green: "from-emerald-500/25 to-emerald-950/35 text-emerald-300",
};

const weekDayLabelKeys = [
  "store.weekday.sunday",
  "store.weekday.monday",
  "store.weekday.tuesday",
  "store.weekday.wednesday",
  "store.weekday.thursday",
  "store.weekday.friday",
  "store.weekday.saturday",
];

export default function StoreScreen() {
  const { error, isLoading, refresh, snapshot } = useGameSnapshot();
  const { formatNumber, language, t } = useI18n();
  const [purchasingRewardId, setPurchasingRewardId] = useState<string | null>(
    null,
  );
  const [activeCategory, setActiveCategory] =
    useState<StoreCategoryValue>("all");
  const [notice, setNotice] = useState<string | null>(null);
  const [selectedReward, setSelectedReward] = useState<StoreReward | null>(
    null,
  );

  const rewards = useMemo(() => {
    if (!snapshot) {
      return [];
    }

    return snapshot.rewards
      .filter((reward) => !reward.isArchived)
      .sort((first, second) => second.updatedAt.localeCompare(first.updatedAt));
  }, [snapshot]);

  const featuredReward =
    rewards.find((reward) => reward.currency === "gems") ?? rewards[0] ?? null;
  const filteredRewards = useMemo(
    () =>
      rewards.filter((reward) => {
        if (activeCategory === "all") {
          return true;
        }

        if (activeCategory === "coins" || activeCategory === "gems") {
          return reward.currency === activeCategory;
        }

        return reward.kind === activeCategory;
      }),
    [activeCategory, rewards],
  );
  const activeCategoryLabel =
    categories.find((category) => category.value === activeCategory)?.label ??
    "Rewards";
  const coins = snapshot?.progress.coins ?? 0;
  const gems = snapshot?.progress.gems ?? 0;
  const inventoryCount = snapshot?.rewardPurchases.length ?? 0;
  const weeklyOffDay = snapshot?.progress.weeklyOffDay ?? 5;
  const isStoreOpen = snapshot ? isOffDay(toAppDate(), weeklyOffDay) : false;
  const freeDayLabel = t(weekDayLabelKeys[weeklyOffDay] ?? "store.freeDay");

  async function purchaseReward(reward: StoreReward) {
    try {
      setNotice(null);
      setPurchasingRewardId(reward.id);
      await rewardService.purchase(reward.id);
      await refresh();
      setNotice(
        t("store.addedInventory", {
          title: translateGameText(reward.title, language) ?? reward.title,
        }),
      );
      setSelectedReward(null);
    } catch (caughtError) {
      setNotice(
        caughtError instanceof Error
          ? caughtError.message
          : t("error.purchaseReward"),
      );
    } finally {
      setPurchasingRewardId(null);
    }
  }

  return (
    <main className="mx-auto min-h-[calc(100svh-8rem)] w-full max-w-md space-y-4 px-3 py-4">
      <StoreHeader coins={coins} formatNumber={formatNumber} gems={gems} t={t} />

      {notice && (
        <p className="rounded-xl border border-[#2f8cff]/45 bg-blue-950/25 px-3 py-2 text-sm text-blue-100">
          {notice}
        </p>
      )}

      {error && (
        <p className="rounded-xl border border-rose-500/50 bg-rose-950/25 px-3 py-2 text-sm text-rose-100">
          {t("error.loadStore", { message: error.message })}
        </p>
      )}

      {isLoading ? (
        <StoreSkeleton />
      ) : (
        <>
          <StoreStatusCard
            freeDayLabel={freeDayLabel}
            isStoreOpen={isStoreOpen}
            t={t}
          />
          {featuredReward && (
            <FeaturedReward
              onSelect={() => setSelectedReward(featuredReward)}
              reward={featuredReward}
              formatNumber={formatNumber}
              language={language}
              t={t}
            />
          )}
          <CategoryStrip
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            t={t}
          />
          <RewardsList
            categoryLabel={activeCategoryLabel}
            coins={coins}
            formatNumber={formatNumber}
            gems={gems}
            language={language}
            onSelect={setSelectedReward}
            rewards={filteredRewards}
            t={t}
          />
          <InventoryRow count={inventoryCount} t={t} />
          {selectedReward && (
            <RewardDetailDialog
              coins={coins}
              formatNumber={formatNumber}
              freeDayLabel={freeDayLabel}
              gems={gems}
              isPurchasing={purchasingRewardId === selectedReward.id}
              isStoreOpen={isStoreOpen}
              language={language}
              onClose={() => setSelectedReward(null)}
              onPurchase={() => purchaseReward(selectedReward)}
              reward={selectedReward}
              t={t}
            />
          )}
        </>
      )}
    </main>
  );
}

function StoreHeader({
  coins,
  formatNumber,
  gems,
  t,
}: {
  coins: number;
  formatNumber: (value: number) => string;
  gems: number;
  t: (key: string) => string;
}) {
  return (
    <header className="flex items-center justify-between gap-3 pt-1">
      <h1 className="text-3xl font-semibold leading-none tracking-[-0.03em] text-white">
        {t("common.store")}
      </h1>

      <div className="flex min-w-0 shrink-0 items-center gap-2">
        <CurrencyPill currency="coins" formatNumber={formatNumber} value={coins} />
        <CurrencyPill currency="gems" formatNumber={formatNumber} value={gems} />
        <Button
          asChild
          className="size-10 rounded-full border border-[#2f8cff]/60 bg-[#07111f]/80 text-white shadow-[0_8px_24px_rgba(0,0,0,0.32),inset_0_1px_18px_rgba(99,148,216,0.08)] hover:bg-[#0b1728]"
          size="icon"
          variant="ghost"
        >
          <Link aria-label={t("action.createCustomReward")} href="/store/rewards/create">
            <Plus className="size-5" />
          </Link>
        </Button>
      </div>
    </header>
  );
}

function StoreStatusCard({
  freeDayLabel,
  isStoreOpen,
  t,
}: {
  freeDayLabel: string;
  isStoreOpen: boolean;
  t: (key: string, params?: Record<string, number | string>) => string;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border p-4 shadow-[0_10px_28px_rgba(0,0,0,0.28),inset_0_1px_18px_rgba(99,148,216,0.06)] backdrop-blur-xl",
        isStoreOpen
          ? "border-emerald-400/45 bg-emerald-950/18"
          : "border-amber-400/45 bg-amber-950/15",
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-2xl border",
            isStoreOpen
              ? "border-emerald-400/45 bg-emerald-950/25 text-emerald-300"
              : "border-amber-400/45 bg-amber-950/25 text-amber-200",
          )}
        >
          {isStoreOpen ? (
            <Sparkles className="size-5" />
          ) : (
            <LockKeyhole className="size-5" />
          )}
        </div>
        <div className="min-w-0">
          <h2 className="text-lg font-semibold leading-tight text-white">
            {isStoreOpen ? t("store.statusOpen") : t("store.closed")}
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-slate-300">
            {isStoreOpen
              ? t("store.openBody")
              : t("store.closedBody", { day: freeDayLabel })}
          </p>
        </div>
      </div>
    </section>
  );
}

function FeaturedReward({
  formatNumber,
  language,
  onSelect,
  reward,
  t,
}: {
  formatNumber: (value: number) => string;
  language: "en" | "fa";
  onSelect: () => void;
  reward: StoreReward;
  t: (key: string) => string;
}) {
  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-medium text-white">{t("store.featuredReward")}</h2>
        <Button
          asChild
          className="h-auto px-0 text-sm font-medium text-[#4f8cff] hover:text-[#78a8ff]"
          variant="link"
        >
          <Link href="/store/rewards/create">{t("action.createCustom")}</Link>
        </Button>
      </div>

      <button
        className="relative min-h-36 w-full overflow-hidden rounded-xl border border-[#2f8cff]/70 bg-[#07111f] p-5 text-left shadow-[0_0_26px_rgba(47,140,255,0.22),inset_0_1px_20px_rgba(99,148,216,0.12)] transition hover:border-[#5aa0ff]"
        onClick={onSelect}
        type="button"
      >
        <div className="absolute inset-0 bg-[url('/images/card-backgrounds/profile-header-card-bg.png')] bg-cover bg-center opacity-85" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#060a15]/92 via-[#07133a]/42 to-[#120726]/50" />

        <div className="relative flex min-h-24 items-end justify-between gap-4">
          <div className="min-w-0 space-y-3">
            <div className="space-y-1">
              <h3 className="max-w-44 text-2xl font-semibold leading-none text-white">
                {translateGameText(reward.title, language)}
              </h3>
              <p className="text-sm font-medium text-violet-300">
                {formatRewardKind(reward.kind, t)}{" "}
                <Sparkles className="ml-1 inline size-3" />
              </p>
            </div>
            <div className="flex items-center gap-2 text-xl font-semibold text-white">
              <CurrencyIcon currency={reward.currency} />
              <span>{formatNumber(reward.cost)}</span>
            </div>
          </div>

          <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-slate-600/60 bg-slate-950/55 text-white">
            <ChevronRight className="size-5" />
          </span>
        </div>
      </button>
    </section>
  );
}

function CategoryStrip({
  activeCategory,
  onCategoryChange,
  t,
}: {
  activeCategory: StoreCategoryValue;
  onCategoryChange: (category: StoreCategoryValue) => void;
  t: (key: string) => string;
}) {
  return (
    <section className="space-y-2">
      <h2 className="px-1 text-sm font-medium text-white">{t("common.categories")}</h2>
      <div className="-mx-3 overflow-x-auto px-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex min-w-max gap-2">
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = category.value === activeCategory;

            return (
              <Button
                className={cn(
                  "flex h-16 w-16 flex-col gap-1 rounded-xl border text-xs font-medium",
                  isActive
                    ? "border-[#2f8cff]/80 bg-[#0d4fe0] text-white shadow-[0_0_18px_rgba(47,140,255,0.45),inset_0_1px_12px_rgba(255,255,255,0.12)] hover:bg-[#155df0]"
                    : "border-slate-700/60 bg-[#07111f]/80 text-slate-300 hover:bg-[#0b1728] hover:text-white",
                )}
                key={category.label}
                onClick={() => onCategoryChange(category.value)}
                type="button"
                variant={isActive ? "default" : "ghost"}
              >
                <Icon className="size-5" />
                {getCategoryLabel(category.label, t)}
              </Button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function RewardsList({
  categoryLabel,
  coins,
  formatNumber,
  gems,
  language,
  onSelect,
  rewards,
  t,
}: {
  categoryLabel: string;
  coins: number;
  formatNumber: (value: number) => string;
  gems: number;
  language: "en" | "fa";
  onSelect: (reward: StoreReward) => void;
  rewards: StoreReward[];
  t: (key: string, params?: Record<string, number | string>) => string;
}) {
  return (
    <section className="space-y-2">
      <h2 className="px-1 text-sm font-medium text-white">{t("common.rewards")}</h2>
      <div className="space-y-1.5">
        {rewards.length === 0 ? (
          <p className="rounded-xl border border-slate-700/55 bg-[#07111f]/82 p-4 text-sm text-slate-300">
            {categoryLabel === "All"
              ? t("store.noRewards")
              : t("store.noCategoryRewards", {
                  category: getCategoryLabel(categoryLabel, t).toLowerCase(),
                })}{" "}
            {t("store.createWorth")}
          </p>
        ) : (
          rewards.map((reward) => (
            <RewardRow
              canAfford={canAfford(reward, coins, gems)}
              formatNumber={formatNumber}
              key={reward.id}
              language={language}
              onSelect={() => onSelect(reward)}
              reward={reward}
              t={t}
            />
          ))
        )}
      </div>
    </section>
  );
}

function RewardRow({
  canAfford,
  formatNumber,
  language,
  onSelect,
  reward,
  t,
}: {
  canAfford: boolean;
  formatNumber: (value: number) => string;
  language: "en" | "fa";
  onSelect: () => void;
  reward: StoreReward;
  t: (key: string) => string;
}) {
  const visual = getRewardVisual(reward);
  const Icon = visual.icon;

  return (
    <button
      className="grid w-full grid-cols-[4.25rem_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-slate-700/55 bg-[#07111f]/82 p-2.5 text-left font-sans shadow-[0_8px_22px_rgba(0,0,0,0.24),inset_0_1px_16px_rgba(99,148,216,0.05)] backdrop-blur-xl transition hover:border-[#2f8cff]/55 hover:bg-[#0b1728]/90"
      onClick={onSelect}
      type="button"
    >
      <div
        className={cn(
          "flex size-14 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br",
          toneStyles[visual.tone],
        )}
      >
        <Icon className="size-7 stroke-[2.1]" />
      </div>

      <div className="min-w-0 space-y-1">
        <h3 className="truncate text-base font-medium leading-tight text-white">
          {translateGameText(reward.title, language)}
        </h3>
        <p className="truncate text-xs text-slate-400">
          {translateGameText(reward.description, language) ?? formatRewardKind(reward.kind, t)}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <div
          className={cn(
            "flex min-w-14 items-center justify-end gap-1.5 text-base font-medium text-white",
            !canAfford && "text-slate-500",
          )}
        >
          <CurrencyIcon currency={reward.currency} />
          <span>{formatNumber(reward.cost)}</span>
        </div>
        <ChevronRight className="size-5 text-white" />
      </div>
    </button>
  );
}

function InventoryRow({
  count,
  t,
}: {
  count: number;
  t: (key: string) => string;
}) {
  return (
    <Link
      className="grid grid-cols-[4.25rem_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-slate-700/55 bg-[#07111f]/82 p-2.5 font-sans shadow-[0_8px_22px_rgba(0,0,0,0.24),inset_0_1px_16px_rgba(99,148,216,0.05)] backdrop-blur-xl transition hover:border-[#2f8cff]/55 hover:bg-[#0b1728]/90"
      href="/store/inventory"
    >
      <div className="flex size-14 items-center justify-center rounded-full border border-[#2f8cff]/40 bg-blue-950/30 text-[#5aa0ff]">
        <Boxes className="size-7" />
      </div>
      <div className="min-w-0 space-y-1">
        <h3 className="truncate text-base font-medium leading-tight text-white">
          {t("common.inventory")}
        </h3>
        <p className="truncate text-xs text-slate-400">
          {t("store.inventoryBody")}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <span className="rounded-lg border border-slate-700/60 bg-slate-950/50 px-3 py-1 text-sm font-medium text-[#5aa0ff]">
          {count}
        </span>
        <ChevronRight className="size-5 text-white" />
      </div>
    </Link>
  );
}

function RewardDetailDialog({
  coins,
  formatNumber,
  freeDayLabel,
  gems,
  isPurchasing,
  isStoreOpen,
  language,
  onClose,
  onPurchase,
  reward,
  t,
}: {
  coins: number;
  formatNumber: (value: number) => string;
  freeDayLabel: string;
  gems: number;
  isPurchasing: boolean;
  isStoreOpen: boolean;
  language: "en" | "fa";
  onClose: () => void;
  onPurchase: () => void;
  reward: StoreReward;
  t: (key: string, params?: Record<string, number | string>) => string;
}) {
  const visual = getRewardVisual(reward);
  const Icon = visual.icon;
  const balance = reward.currency === "coins" ? coins : gems;
  const remaining = Math.max(0, reward.cost - balance);
  const progressPercent = reward.cost
    ? Math.min(100, Math.round((balance / reward.cost) * 100))
    : 100;
  const canPurchase = isStoreOpen && remaining === 0 && !isPurchasing;

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-[100] h-[100svh] max-h-[100svh] overflow-hidden bg-[#010713]/95 px-3 py-3 backdrop-blur-xl"
      role="dialog"
    >
      <div className="mx-auto flex h-full min-h-0 w-full max-w-md flex-col">
        <header className="mb-3 flex shrink-0 items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
              {t("store.savingsGoal")}
            </p>
            <h2 className="mt-1 truncate text-2xl font-semibold tracking-[-0.03em] text-white">
              {translateGameText(reward.title, language)}
            </h2>
          </div>
          <Button
            aria-label={t("action.closeRewardDetails")}
            className="size-10 rounded-full border border-slate-700/70 bg-[#07111f]/80 text-white hover:bg-[#0b1728]"
            onClick={onClose}
            size="icon"
            type="button"
            variant="ghost"
          >
            <X className="size-5" />
          </Button>
        </header>

        <section className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[1.75rem] border border-slate-700/70 bg-[#07111f] p-3 shadow-[0_0_32px_rgba(47,140,255,0.16),inset_0_1px_22px_rgba(99,148,216,0.08)] sm:p-4">
          <div className="absolute inset-0 bg-[url('/images/card-backgrounds/profile-header-card-bg.png')] bg-cover bg-center opacity-35" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#07111f]/82 via-[#07111f]/95 to-[#030914]" />

          <div className="relative flex min-h-0 flex-1 flex-col">
            <div className="flex shrink-0 items-center justify-between gap-3">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
                  isStoreOpen
                    ? "border-emerald-400/45 bg-emerald-950/25 text-emerald-300"
                    : "border-amber-400/45 bg-amber-950/25 text-amber-200",
                )}
              >
                {isStoreOpen ? (
                  <Sparkles className="size-3.5" />
                ) : (
                  <LockKeyhole className="size-3.5" />
                )}
                {isStoreOpen ? t("store.open") : t("store.closed")}
              </span>
              <span className="text-xs font-medium text-slate-400">
                {isStoreOpen ? t("store.openToday") : t("store.opensDay", { day: freeDayLabel })}
              </span>
            </div>

            <div className="my-4 flex shrink-0 justify-center sm:my-6">
              <div
                className={cn(
                  "flex size-28 items-center justify-center rounded-[1.5rem] bg-gradient-to-br shadow-[0_18px_50px_rgba(0,0,0,0.35)] sm:size-32",
                  toneStyles[visual.tone],
                )}
              >
                <Icon className="size-16 stroke-[1.7] sm:size-20" />
              </div>
            </div>

            <div className="min-h-0 space-y-1">
              <p className="text-sm font-medium text-[#5aa0ff]">
                {formatRewardKind(reward.kind, t)}
              </p>
              <h3 className="truncate text-2xl font-semibold leading-tight text-white">
                {translateGameText(reward.title, language)}
              </h3>
              <p className="overflow-hidden text-sm leading-relaxed text-slate-400 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
                {translateGameText(reward.description, language) ??
                  t("store.keepEarning")}
              </p>
            </div>

            <div className="mt-4 shrink-0 space-y-2 sm:mt-5">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-semibold text-white">
                  {formatNumber(balance)} / {formatNumber(reward.cost)}
                </span>
                <span className="text-slate-400">{progressPercent}%</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-800/85 shadow-[inset_0_1px_5px_rgba(0,0,0,0.55)]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#2f8cff] to-violet-400"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div className="mt-4 grid shrink-0 grid-cols-2 gap-2 sm:mt-5">
              <DetailStat
                label={t("common.balance")}
                value={
                  <span className="inline-flex items-center gap-1.5">
                    <CurrencyIcon currency={reward.currency} />
                    {formatNumber(balance)}
                  </span>
                }
              />
              <DetailStat
                label={t("common.remaining")}
                value={
                  remaining === 0 ? (
                    t("store.ready")
                  ) : (
                    <span className="inline-flex items-center gap-1.5">
                      <CurrencyIcon currency={reward.currency} />
                      {formatNumber(remaining)}
                    </span>
                  )
                }
              />
            </div>

            <div className="mt-4 shrink-0 rounded-2xl border border-slate-700/55 bg-[#030914]/55 p-3 sm:mt-5">
              <p className="text-xs text-slate-500">{t("common.motivation")}</p>
              <p className="mt-1 overflow-hidden text-sm leading-relaxed text-slate-200 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
                {t("store.motivationBody")}
              </p>
            </div>

            <div className="mt-auto shrink-0 pt-4 sm:pt-5">
              <Button
                className="h-12 w-full rounded-xl bg-[#0d4fe0] text-base font-semibold text-white shadow-[0_0_22px_rgba(47,140,255,0.35)] hover:bg-[#155df0] disabled:border disabled:border-slate-700/70 disabled:bg-slate-900/70 disabled:text-slate-500 disabled:shadow-none"
                disabled={!canPurchase}
                onClick={onPurchase}
                type="button"
              >
                {getPurchaseButtonLabel({
                  freeDayLabel,
                  formatNumber,
                  isPurchasing,
                  isStoreOpen,
                  remaining,
                  reward,
                  t,
                })}
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function DetailStat({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-700/55 bg-[#030914]/55 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

function getPurchaseButtonLabel({
  freeDayLabel,
  formatNumber,
  isPurchasing,
  isStoreOpen,
  remaining,
  reward,
  t,
}: {
  freeDayLabel: string;
  formatNumber: (value: number) => string;
  isPurchasing: boolean;
  isStoreOpen: boolean;
  remaining: number;
  reward: StoreReward;
  t: (key: string, params?: Record<string, number | string>) => string;
}) {
  if (isPurchasing) {
    return t("store.purchasing");
  }

  if (!isStoreOpen) {
    return t("store.opensDay", { day: freeDayLabel });
  }

  if (remaining > 0) {
    return t("store.left", {
      amount: formatNumber(remaining),
      currency: t(reward.currency === "coins" ? "common.coins" : "common.gems"),
    });
  }

  return t("action.purchaseReward");
}

function StoreSkeleton() {
  return (
    <div className="space-y-3">
      <div className="h-36 animate-pulse rounded-xl border border-slate-800/80 bg-[#07111f]/70" />
      <div className="h-16 animate-pulse rounded-xl border border-slate-800/80 bg-[#07111f]/70" />
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          className="h-20 animate-pulse rounded-xl border border-slate-800/80 bg-[#07111f]/70"
          key={index}
        />
      ))}
    </div>
  );
}

function CurrencyPill({
  currency,
  formatNumber,
  value,
}: {
  currency: GameCurrency;
  formatNumber: (value: number) => string;
  value: number;
}) {
  return (
    <div className="flex h-7 items-center gap-1.5 rounded-lg border border-slate-700/60 bg-[#07111f]/80 px-2 text-sm font-medium text-white">
      <CurrencyIcon currency={currency} />
      <span>{formatNumber(value)}</span>
    </div>
  );
}

function CurrencyIcon({ currency }: { currency: GameCurrency }) {
  return currency === "coins" ? <CoinIcon /> : <GemIcon />;
}

function CoinIcon() {
  return (
    <span className="flex size-4 items-center justify-center rounded-full bg-amber-400 text-[0.6rem] text-amber-950 shadow-[0_0_8px_rgba(251,191,36,0.55)]">
      <CircleDollarSign className="size-3" />
    </span>
  );
}

function GemIcon() {
  return (
    <span className="flex size-4 items-center justify-center rounded-sm bg-cyan-400 text-cyan-950 shadow-[0_0_8px_rgba(34,211,238,0.55)]">
      <Gem className="size-3" />
    </span>
  );
}

function canAfford(reward: StoreReward, coins: number, gems: number) {
  return reward.currency === "coins" ? coins >= reward.cost : gems >= reward.cost;
}

function formatRewardKind(kind: StoreReward["kind"], t: (key: string) => string) {
  const labels: Record<StoreReward["kind"], string> = {
    custom: t("store.customReward"),
    digital: t("store.digitalReward"),
    experience: t("store.experienceReward"),
    physical: t("store.physicalReward"),
  };

  return labels[kind];
}

function getCategoryLabel(label: string, t: (key: string) => string) {
  const labels: Record<string, string> = {
    All: t("quest.all"),
    Custom: t("attribute.custom"),
    Digital: t("store.digital"),
    Fun: t("store.fun"),
    Physical: t("store.physical"),
    Premium: t("store.premium"),
    Rewards: t("common.rewards"),
  };

  return labels[label] ?? label;
}

function getRewardVisual(reward: StoreReward): RewardVisual {
  const title = reward.title.toLowerCase();

  if (title.includes("movie")) {
    return { icon: Popcorn, tone: "gold" };
  }

  if (title.includes("meal") || title.includes("food")) {
    return { icon: Utensils, tone: "red" };
  }

  if (title.includes("shoe") || title.includes("gear")) {
    return { icon: Shirt, tone: "blue" };
  }

  if (title.includes("game")) {
    return { icon: Gamepad2, tone: "purple" };
  }

  if (title.includes("coffee")) {
    return { icon: Coffee, tone: "gold" };
  }

  if (title.includes("trip") || title.includes("getaway")) {
    return { icon: Mountain, tone: "cyan" };
  }

  if (reward.kind === "physical") {
    return { icon: Shirt, tone: "blue" };
  }

  if (reward.kind === "digital") {
    return { icon: Gamepad2, tone: "purple" };
  }

  if (reward.kind === "experience") {
    return { icon: Sparkles, tone: "cyan" };
  }

  return { icon: Crown, tone: "green" };
}
