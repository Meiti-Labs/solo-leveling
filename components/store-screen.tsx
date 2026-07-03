"use client";

import {
  BookOpen,
  Boxes,
  ChevronRight,
  CircleDollarSign,
  Coffee,
  Crown,
  Gamepad2,
  Gem,
  Grid2X2,
  HeartPulse,
  Mountain,
  Popcorn,
  Search,
  Shirt,
  Smile,
  Sparkles,
  Utensils,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Currency = "coins" | "gems";

type Reward = {
  title: string;
  description: string;
  price: number;
  currency: Currency;
  icon: React.ComponentType<{ className?: string }>;
  tone: "gold" | "blue" | "red" | "purple" | "cyan" | "green";
};

const balances = {
  coins: 1850,
  gems: 42,
};

const categories = [
  { label: "All", icon: Grid2X2, active: true },
  { label: "Fun", icon: Smile },
  { label: "Lifestyle", icon: Sparkles },
  { label: "Health", icon: HeartPulse },
  { label: "Learning", icon: BookOpen },
  { label: "Premium", icon: Crown },
];

const rewards: Reward[] = [
  {
    title: "Movie Night",
    description: "A perfect movie and chill night.",
    price: 500,
    currency: "coins",
    icon: Popcorn,
    tone: "gold",
  },
  {
    title: "Cheat Meal",
    description: "Enjoy your favorite meal.",
    price: 400,
    currency: "coins",
    icon: Utensils,
    tone: "red",
  },
  {
    title: "New Shoes",
    description: "Treat yourself.",
    price: 18,
    currency: "gems",
    icon: Shirt,
    tone: "blue",
  },
  {
    title: "Gaming Session",
    description: "2 hours of guilt-free gaming.",
    price: 300,
    currency: "coins",
    icon: Gamepad2,
    tone: "purple",
  },
  {
    title: "Coffee Break",
    description: "Premium cafe reward.",
    price: 120,
    currency: "coins",
    icon: Coffee,
    tone: "gold",
  },
  {
    title: "Day Trip",
    description: "Mini adventure outside the city.",
    price: 12,
    currency: "gems",
    icon: Mountain,
    tone: "cyan",
  },
];

const toneStyles: Record<Reward["tone"], string> = {
  gold: "from-amber-500/25 to-yellow-950/35 text-amber-300",
  blue: "from-blue-500/25 to-blue-950/35 text-blue-300",
  red: "from-rose-500/25 to-rose-950/35 text-rose-300",
  purple: "from-violet-500/25 to-violet-950/35 text-violet-300",
  cyan: "from-cyan-500/25 to-cyan-950/35 text-cyan-300",
  green: "from-emerald-500/25 to-emerald-950/35 text-emerald-300",
};

const formatAmount = (amount: number) =>
  new Intl.NumberFormat("en-US").format(amount);

export default function StoreScreen() {
  return (
    <main className="mx-auto min-h-[calc(100svh-8rem)] w-full max-w-md space-y-4 px-3 py-4">
      <StoreHeader />
      <FeaturedReward />
      <CategoryStrip />
      <RewardsList />
      <InventoryRow />
    </main>
  );
}

function StoreHeader() {
  return (
    <header className="flex items-center justify-between gap-3 pt-1">
      <h1 className="text-3xl font-semibold leading-none tracking-[-0.03em] text-white">
        Store
      </h1>

      <div className="flex min-w-0 shrink-0 items-center gap-2">
        <CurrencyPill currency="coins" value={balances.coins} />
        <CurrencyPill currency="gems" value={balances.gems} />
        <Button
          aria-label="Search rewards"
          className="size-10 rounded-full border border-slate-700/60 bg-[#07111f]/80 text-white shadow-[0_8px_24px_rgba(0,0,0,0.32),inset_0_1px_18px_rgba(99,148,216,0.08)] hover:bg-[#0b1728]"
          size="icon"
          type="button"
          variant="ghost"
        >
          <Search className="size-5" />
        </Button>
      </div>
    </header>
  );
}

function FeaturedReward() {
  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-medium text-white">Featured Reward</h2>
        <Button
          className="h-auto px-0 text-sm font-medium text-[#4f8cff] hover:text-[#78a8ff]"
          type="button"
          variant="link"
        >
          View All
        </Button>
      </div>

      <article className="relative min-h-36 overflow-hidden rounded-xl border border-[#2f8cff]/70 bg-[#07111f] p-5 shadow-[0_0_26px_rgba(47,140,255,0.22),inset_0_1px_20px_rgba(99,148,216,0.12)]">
        <div className="absolute inset-0 bg-[url('/images/card-backgrounds/profile-header-card-bg.png')] bg-cover bg-center opacity-85" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#060a15]/92 via-[#07133a]/42 to-[#120726]/50" />

        <div className="relative flex min-h-24 items-end justify-between gap-4">
          <div className="min-w-0 space-y-3">
            <div className="space-y-1">
              <h3 className="max-w-44 text-2xl font-semibold leading-none text-white">
                Weekend Getaway
              </h3>
              <p className="text-sm font-medium text-violet-300">
                Epic Reward <Sparkles className="ml-1 inline size-3" />
              </p>
            </div>
            <div className="flex items-center gap-2 text-xl font-semibold text-white">
              <GemIcon />
              <span>25</span>
            </div>
          </div>

          <Button
            aria-label="Open featured reward"
            className="size-10 shrink-0 rounded-full border border-slate-600/60 bg-slate-950/55 text-white hover:bg-slate-900/80"
            size="icon"
            type="button"
            variant="ghost"
          >
            <ChevronRight className="size-5" />
          </Button>
        </div>
      </article>
    </section>
  );
}

function CategoryStrip() {
  return (
    <section className="space-y-2">
      <h2 className="px-1 text-sm font-medium text-white">Categories</h2>
      <div className="-mx-3 overflow-x-auto px-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex min-w-max gap-2">
          {categories.map((category) => {
            const Icon = category.icon;

            return (
              <Button
                className={cn(
                  "flex h-16 w-16 flex-col gap-1 rounded-xl border text-xs font-medium",
                  category.active
                    ? "border-[#2f8cff]/80 bg-[#0d4fe0] text-white shadow-[0_0_18px_rgba(47,140,255,0.45),inset_0_1px_12px_rgba(255,255,255,0.12)] hover:bg-[#155df0]"
                    : "border-slate-700/60 bg-[#07111f]/80 text-slate-300 hover:bg-[#0b1728] hover:text-white",
                )}
                key={category.label}
                type="button"
                variant={category.active ? "default" : "ghost"}
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

function RewardsList() {
  return (
    <section className="space-y-2">
      <h2 className="px-1 text-sm font-medium text-white">Rewards</h2>
      <div className="space-y-1.5">
        {rewards.map((reward) => (
          <RewardRow key={reward.title} reward={reward} />
        ))}
      </div>
    </section>
  );
}

function RewardRow({ reward }: { reward: Reward }) {
  const Icon = reward.icon;

  return (
    <article className="grid grid-cols-[4.25rem_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-slate-700/55 bg-[#07111f]/82 p-2.5 font-sans shadow-[0_8px_22px_rgba(0,0,0,0.24),inset_0_1px_16px_rgba(99,148,216,0.05)] backdrop-blur-xl">
      <div
        className={cn(
          "flex size-14 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br",
          toneStyles[reward.tone],
        )}
      >
        <Icon className="size-7 stroke-[2.1]" />
      </div>

      <div className="min-w-0 space-y-1">
        <h3 className="truncate text-base font-medium leading-tight text-white">
          {reward.title}
        </h3>
        <p className="truncate text-xs text-slate-400">{reward.description}</p>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <div className="flex min-w-14 items-center justify-end gap-1.5 text-base font-medium text-white">
          <CurrencyIcon currency={reward.currency} />
          <span>{formatAmount(reward.price)}</span>
        </div>
        <ChevronRight className="size-5 text-white" />
      </div>
    </article>
  );
}

function InventoryRow() {
  return (
    <article className="grid grid-cols-[4.25rem_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-slate-700/55 bg-[#07111f]/82 p-2.5 font-sans shadow-[0_8px_22px_rgba(0,0,0,0.24),inset_0_1px_16px_rgba(99,148,216,0.05)] backdrop-blur-xl">
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
          12
        </span>
        <ChevronRight className="size-5 text-white" />
      </div>
    </article>
  );
}

function CurrencyPill({
  currency,
  value,
}: {
  currency: Currency;
  value: number;
}) {
  return (
    <div className="flex h-7 items-center gap-1.5 rounded-lg border border-slate-700/60 bg-[#07111f]/80 px-2 text-sm font-medium text-white">
      <CurrencyIcon currency={currency} />
      <span>{formatAmount(value)}</span>
    </div>
  );
}

function CurrencyIcon({ currency }: { currency: Currency }) {
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
