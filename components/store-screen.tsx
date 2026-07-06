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

const formatAmount = (amount: number) =>
  new Intl.NumberFormat("en-US").format(amount);

const weekDayLabels = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function StoreScreen() {
  const { error, isLoading, refresh, snapshot } = useGameSnapshot();
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
  const freeDayLabel = weekDayLabels[weeklyOffDay] ?? "your free day";

  async function purchaseReward(reward: StoreReward) {
    try {
      setNotice(null);
      setPurchasingRewardId(reward.id);
      await rewardService.purchase(reward.id);
      await refresh();
      setNotice(`${reward.title} added to inventory.`);
      setSelectedReward(null);
    } catch (caughtError) {
      setNotice(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not purchase this reward.",
      );
    } finally {
      setPurchasingRewardId(null);
    }
  }

  return (
    <main className="mx-auto min-h-[calc(100svh-8rem)] w-full max-w-md space-y-4 px-3 py-4">
      <StoreHeader coins={coins} gems={gems} />

      {notice && (
        <p className="rounded-xl border border-[#2f8cff]/45 bg-blue-950/25 px-3 py-2 text-sm text-blue-100">
          {notice}
        </p>
      )}

      {error && (
        <p className="rounded-xl border border-rose-500/50 bg-rose-950/25 px-3 py-2 text-sm text-rose-100">
          Could not load store data. {error.message}
        </p>
      )}

      {isLoading ? (
        <StoreSkeleton />
      ) : (
        <>
          <StoreStatusCard
            freeDayLabel={freeDayLabel}
            isStoreOpen={isStoreOpen}
          />
          {featuredReward && (
            <FeaturedReward
              onSelect={() => setSelectedReward(featuredReward)}
              reward={featuredReward}
            />
          )}
          <CategoryStrip
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
          <RewardsList
            categoryLabel={activeCategoryLabel}
            coins={coins}
            gems={gems}
            onSelect={setSelectedReward}
            rewards={filteredRewards}
          />
          <InventoryRow count={inventoryCount} />
          {selectedReward && (
            <RewardDetailDialog
              coins={coins}
              freeDayLabel={freeDayLabel}
              gems={gems}
              isPurchasing={purchasingRewardId === selectedReward.id}
              isStoreOpen={isStoreOpen}
              onClose={() => setSelectedReward(null)}
              onPurchase={() => purchaseReward(selectedReward)}
              reward={selectedReward}
            />
          )}
        </>
      )}
    </main>
  );
}

function StoreHeader({ coins, gems }: { coins: number; gems: number }) {
  return (
    <header className="flex items-center justify-between gap-3 pt-1">
      <h1 className="text-3xl font-semibold leading-none tracking-[-0.03em] text-white">
        Store
      </h1>

      <div className="flex min-w-0 shrink-0 items-center gap-2">
        <CurrencyPill currency="coins" value={coins} />
        <CurrencyPill currency="gems" value={gems} />
        <Button
          asChild
          className="size-10 rounded-full border border-[#2f8cff]/60 bg-[#07111f]/80 text-white shadow-[0_8px_24px_rgba(0,0,0,0.32),inset_0_1px_18px_rgba(99,148,216,0.08)] hover:bg-[#0b1728]"
          size="icon"
          variant="ghost"
        >
          <Link aria-label="Create custom reward" href="/store/rewards/create">
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
}: {
  freeDayLabel: string;
  isStoreOpen: boolean;
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
            {isStoreOpen ? "Free Day Store Open" : "Store Closed"}
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-slate-300">
            {isStoreOpen
              ? "Today is your free day. Purchases are open."
              : `Purchases are only available on ${freeDayLabel}. You can still browse rewards and track how close you are.`}
          </p>
        </div>
      </div>
    </section>
  );
}

function FeaturedReward({
  onSelect,
  reward,
}: {
  onSelect: () => void;
  reward: StoreReward;
}) {
  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-medium text-white">Featured Reward</h2>
        <Button
          asChild
          className="h-auto px-0 text-sm font-medium text-[#4f8cff] hover:text-[#78a8ff]"
          variant="link"
        >
          <Link href="/store/rewards/create">Create Custom</Link>
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
                {reward.title}
              </h3>
              <p className="text-sm font-medium text-violet-300">
                {formatRewardKind(reward.kind)}{" "}
                <Sparkles className="ml-1 inline size-3" />
              </p>
            </div>
            <div className="flex items-center gap-2 text-xl font-semibold text-white">
              <CurrencyIcon currency={reward.currency} />
              <span>{formatAmount(reward.cost)}</span>
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
}: {
  activeCategory: StoreCategoryValue;
  onCategoryChange: (category: StoreCategoryValue) => void;
}) {
  return (
    <section className="space-y-2">
      <h2 className="px-1 text-sm font-medium text-white">Categories</h2>
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
                {category.label}
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
  gems,
  onSelect,
  rewards,
}: {
  categoryLabel: string;
  coins: number;
  gems: number;
  onSelect: (reward: StoreReward) => void;
  rewards: StoreReward[];
}) {
  return (
    <section className="space-y-2">
      <h2 className="px-1 text-sm font-medium text-white">Rewards</h2>
      <div className="space-y-1.5">
        {rewards.length === 0 ? (
          <p className="rounded-xl border border-slate-700/55 bg-[#07111f]/82 p-4 text-sm text-slate-300">
            {categoryLabel === "All"
              ? "No rewards yet."
              : `No ${categoryLabel.toLowerCase()} rewards yet.`}{" "}
            Create one to make the grind worth spending.
          </p>
        ) : (
          rewards.map((reward) => (
            <RewardRow
              canAfford={canAfford(reward, coins, gems)}
              key={reward.id}
              onSelect={() => onSelect(reward)}
              reward={reward}
            />
          ))
        )}
      </div>
    </section>
  );
}

function RewardRow({
  canAfford,
  onSelect,
  reward,
}: {
  canAfford: boolean;
  onSelect: () => void;
  reward: StoreReward;
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
          {reward.title}
        </h3>
        <p className="truncate text-xs text-slate-400">
          {reward.description ?? formatRewardKind(reward.kind)}
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
          <span>{formatAmount(reward.cost)}</span>
        </div>
        <ChevronRight className="size-5 text-white" />
      </div>
    </button>
  );
}

function InventoryRow({ count }: { count: number }) {
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
          Inventory
        </h3>
        <p className="truncate text-xs text-slate-400">
          See your owned rewards
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
  freeDayLabel,
  gems,
  isPurchasing,
  isStoreOpen,
  onClose,
  onPurchase,
  reward,
}: {
  coins: number;
  freeDayLabel: string;
  gems: number;
  isPurchasing: boolean;
  isStoreOpen: boolean;
  onClose: () => void;
  onPurchase: () => void;
  reward: StoreReward;
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
              Savings Goal
            </p>
            <h2 className="mt-1 truncate text-2xl font-semibold tracking-[-0.03em] text-white">
              {reward.title}
            </h2>
          </div>
          <Button
            aria-label="Close reward details"
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
                {isStoreOpen ? "Store Open" : "Store Closed"}
              </span>
              <span className="text-xs font-medium text-slate-400">
                {isStoreOpen ? "Open today" : `Opens ${freeDayLabel}`}
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
                {formatRewardKind(reward.kind)}
              </p>
              <h3 className="truncate text-2xl font-semibold leading-tight text-white">
                {reward.title}
              </h3>
              <p className="overflow-hidden text-sm leading-relaxed text-slate-400 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
                {reward.description ??
                  "Keep earning until this reward is ready to claim."}
              </p>
            </div>

            <div className="mt-4 shrink-0 space-y-2 sm:mt-5">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-semibold text-white">
                  {formatAmount(balance)} / {formatAmount(reward.cost)}
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
                label="Balance"
                value={
                  <span className="inline-flex items-center gap-1.5">
                    <CurrencyIcon currency={reward.currency} />
                    {formatAmount(balance)}
                  </span>
                }
              />
              <DetailStat
                label="Remaining"
                value={
                  remaining === 0 ? (
                    "Ready"
                  ) : (
                    <span className="inline-flex items-center gap-1.5">
                      <CurrencyIcon currency={reward.currency} />
                      {formatAmount(remaining)}
                    </span>
                  )
                }
              />
            </div>

            <div className="mt-4 shrink-0 rounded-2xl border border-slate-700/55 bg-[#030914]/55 p-3 sm:mt-5">
              <p className="text-xs text-slate-500">Motivation</p>
              <p className="mt-1 overflow-hidden text-sm leading-relaxed text-slate-200 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
                You&apos;re doing great. Keep completing quests and claim it on
                your free day.
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
                  isPurchasing,
                  isStoreOpen,
                  remaining,
                  reward,
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
  isPurchasing,
  isStoreOpen,
  remaining,
  reward,
}: {
  freeDayLabel: string;
  isPurchasing: boolean;
  isStoreOpen: boolean;
  remaining: number;
  reward: StoreReward;
}) {
  if (isPurchasing) {
    return "Purchasing...";
  }

  if (!isStoreOpen) {
    return `Store opens on ${freeDayLabel}`;
  }

  if (remaining > 0) {
    return `${formatAmount(remaining)} ${reward.currency} left`;
  }

  return "Purchase Reward";
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
  value,
}: {
  currency: GameCurrency;
  value: number;
}) {
  return (
    <div className="flex h-7 items-center gap-1.5 rounded-lg border border-slate-700/60 bg-[#07111f]/80 px-2 text-sm font-medium text-white">
      <CurrencyIcon currency={currency} />
      <span>{formatAmount(value)}</span>
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

function formatRewardKind(kind: StoreReward["kind"]) {
  const labels: Record<StoreReward["kind"], string> = {
    custom: "Custom Reward",
    digital: "Digital Reward",
    experience: "Experience Reward",
    physical: "Physical Reward",
  };

  return labels[kind];
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
