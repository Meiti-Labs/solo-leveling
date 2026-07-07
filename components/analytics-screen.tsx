"use client";

import Link from "next/link";
import type { ComponentType } from "react";
import {
  ArrowRight,
  CheckSquare,
  CircleDollarSign,
  Gem,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import PageHeader from "@/components/page-header";
import type { GameSnapshot } from "@/hooks/use-game-snapshot";
import { useGameSnapshot } from "@/hooks/use-game-snapshot";
import type { CoreAttributeKey } from "@/lib/indexed-db/types";

type Period = "Daily" | "Weekly" | "Monthly" | "Yearly" | "Lifetime";

type StatCard = {
  helper: string;
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
};

type ChartPoint = {
  label: string;
  value: number;
};

type RadarPoint = {
  label: string;
  value: number;
};

const periods: Period[] = ["Daily", "Weekly", "Monthly", "Yearly", "Lifetime"];

const attributeOrder: CoreAttributeKey[] = [
  "strength",
  "intelligence",
  "discipline",
  "finance",
  "wisdom",
  "communication",
];

const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-US").format(value);

export default function AnalyticsScreen() {
  const { error, isLoading, refresh, snapshot } = useGameSnapshot();

  if (isLoading) {
    return (
      <main className="mx-auto min-h-[calc(100svh-8rem)] w-full max-w-md space-y-4 px-3 py-4">
        <PageHeader tabs={periods} title="Analytics" />
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            className="h-40 animate-pulse rounded-2xl border border-slate-800/80 bg-[#07111f]/70"
            key={index}
          />
        ))}
      </main>
    );
  }

  if (error || !snapshot) {
    return (
      <main className="mx-auto min-h-[calc(100svh-8rem)] w-full max-w-md space-y-4 px-3 py-4">
        <PageHeader tabs={periods} title="Analytics" />
        <section className="rounded-xl border border-rose-500/50 bg-rose-950/20 p-4 text-sm text-rose-100">
          Could not load analytics. {error?.message}
        </section>
      </main>
    );
  }

  const xpGrowth = buildXpGrowth(snapshot);
  const categoryGrowth = buildCategoryGrowth(snapshot);
  const stats = buildStats(snapshot);
  const todayXp = xpGrowth.at(-1)?.value ?? 0;
  const yesterdayXp = xpGrowth.at(-2)?.value ?? 0;
  const xpChange = calculateChange(todayXp, yesterdayXp);

  return (
    <main className="mx-auto min-h-[calc(100svh-8rem)] w-full max-w-md space-y-4 px-3 py-4">
      <PageHeader
        actions={[
          {
            label: "Refresh analytics",
            icon: <RefreshCw className="size-5" />,
            onClick: () => {
              refresh().catch(() => {
                // The hook stores the error for the UI.
              });
            },
          },
        ]}
        tabs={periods}
        title="Analytics"
      />
      <XpGrowthCard
        change={xpChange}
        points={xpGrowth}
        totalXp={snapshot.progress.overallXp}
      />
      <CategoryGrowthCard points={categoryGrowth} />
      <LevelRoadmapLink totalXp={snapshot.progress.overallXp} />
      <StatsGrid stats={stats} />
    </main>
  );
}

function LevelRoadmapLink({ totalXp }: { totalXp: number }) {
  return (
    <Link
      className="block rounded-2xl border border-[#2f8cff]/45 bg-[#07111f]/82 p-4 shadow-[0_10px_28px_rgba(0,0,0,0.28),inset_0_1px_18px_rgba(99,148,216,0.06)] transition hover:border-[#5aa0ff]/70 hover:bg-[#0b1728]/90"
      href="/analytics/levels"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-[#5aa0ff]">Level Roadmap</p>
          <h2 className="mt-1 truncate text-xl font-semibold text-white">
            XP Milestones to Level 200
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Current XP: {formatNumber(totalXp)}
          </p>
        </div>
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-[#2f8cff]/45 bg-blue-950/25 text-[#78b4ff]">
          <ArrowRight className="size-5" />
        </span>
      </div>
    </Link>
  );
}

function XpGrowthCard({
  change,
  points,
  totalXp,
}: {
  change: string;
  points: ChartPoint[];
  totalXp: number;
}) {
  return (
    <section className="rounded-2xl border border-slate-700/55 bg-[#07111f]/82 p-4 shadow-[0_10px_28px_rgba(0,0,0,0.28),inset_0_1px_18px_rgba(99,148,216,0.06)] backdrop-blur-xl">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-white">XP Growth</h2>
          <p className="flex items-center gap-1.5 text-sm text-slate-300">
            <TrendingUp className="size-4 fill-emerald-400 text-emerald-400" />
            <span className="font-semibold text-emerald-400">{change}</span>
            <span>vs yesterday</span>
          </p>
        </div>
        <p className="shrink-0 text-2xl font-semibold text-white">
          {formatNumber(totalXp)} XP
        </p>
      </div>

      <LineChart points={points} />
    </section>
  );
}

function LineChart({ points: sourcePoints }: { points: ChartPoint[] }) {
  const width = 360;
  const height = 190;
  const padding = { top: 10, right: 12, bottom: 30, left: 38 };
  const maxValue = Math.max(100, ...sourcePoints.map((item) => item.value));
  const roundedMaxValue = roundChartMax(maxValue);
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const divisor = Math.max(1, sourcePoints.length - 1);

  const points = sourcePoints.map((item, index) => {
    const x = padding.left + (index / divisor) * chartWidth;
    const y =
      padding.top +
      chartHeight -
      (item.value / roundedMaxValue) * chartHeight;

    return { ...item, x, y };
  });

  const linePath = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
  const areaPath = `${linePath} L ${points.at(-1)?.x} ${
    padding.top + chartHeight
  } L ${points[0].x} ${padding.top + chartHeight} Z`;
  const yTicks = Array.from({ length: 6 }, (_, index) =>
    Math.round(roundedMaxValue * ((5 - index) / 5)),
  );

  return (
    <svg
      aria-label="XP growth line chart"
      className="h-auto w-full overflow-visible"
      role="img"
      viewBox={`0 0 ${width} ${height}`}
    >
      <defs>
        <linearGradient id="xp-area" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#2f80ff" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#2f80ff" stopOpacity="0.04" />
        </linearGradient>
      </defs>

      {yTicks.map((tick) => {
        const y =
          padding.top + chartHeight - (tick / roundedMaxValue) * chartHeight;

        return (
          <g key={tick}>
            <text
              fill="#94a3b8"
              fontSize="9"
              textAnchor="end"
              x={padding.left - 8}
              y={y + 3}
            >
              {formatTick(tick)}
            </text>
            <line
              stroke="#334155"
              strokeDasharray="3 4"
              strokeOpacity="0.45"
              x1={padding.left}
              x2={padding.left + chartWidth}
              y1={y}
              y2={y}
            />
          </g>
        );
      })}

      <path d={areaPath} fill="url(#xp-area)" />
      <path
        d={linePath}
        fill="none"
        stroke="#2f80ff"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />

      {points.map((point) => (
        <circle
          cx={point.x}
          cy={point.y}
          fill="#57b5ff"
          key={`${point.label}-dot`}
          r="3"
        />
      ))}

      {points.map((point) => (
        <text
          fill="#94a3b8"
          fontSize="9"
          key={point.label}
          textAnchor="middle"
          x={point.x}
          y={height - 8}
        >
          {point.label}
        </text>
      ))}
    </svg>
  );
}

function CategoryGrowthCard({ points }: { points: RadarPoint[] }) {
  return (
    <section className="rounded-2xl border border-slate-700/55 bg-[#07111f]/82 p-4 shadow-[0_10px_28px_rgba(0,0,0,0.28),inset_0_1px_18px_rgba(99,148,216,0.06)] backdrop-blur-xl">
      <h2 className="mb-2 text-xl font-semibold text-white">Category Growth</h2>
      <RadarChart points={points} />
    </section>
  );
}

function RadarChart({ points }: { points: RadarPoint[] }) {
  const width = 340;
  const height = 240;
  const center = { x: 170, y: 126 };
  const radius = 76;
  const rings = [0.25, 0.5, 0.75, 1];

  const axisPoints = points.map((item, index) => {
    const angle = -Math.PI / 2 + (index / points.length) * Math.PI * 2;
    return {
      ...item,
      angle,
      x: center.x + Math.cos(angle) * radius,
      y: center.y + Math.sin(angle) * radius,
      valueX: center.x + Math.cos(angle) * radius * (item.value / 100),
      valueY: center.y + Math.sin(angle) * radius * (item.value / 100),
      labelX: center.x + Math.cos(angle) * (radius + 34),
      labelY: center.y + Math.sin(angle) * (radius + 24),
    };
  });

  const valuePath = axisPoints
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.valueX} ${point.valueY}`)
    .join(" ");

  return (
    <svg
      aria-label="Category growth radar chart"
      className="h-auto w-full"
      role="img"
      viewBox={`0 0 ${width} ${height}`}
    >
      <defs>
        <radialGradient id="radar-fill" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#2f80ff" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#2f80ff" stopOpacity="0.12" />
        </radialGradient>
      </defs>

      {rings.map((ring) => {
        const ringPath = points
          .map((_, index) => {
            const angle = -Math.PI / 2 + (index / points.length) * Math.PI * 2;
            const x = center.x + Math.cos(angle) * radius * ring;
            const y = center.y + Math.sin(angle) * radius * ring;

            return `${index === 0 ? "M" : "L"} ${x} ${y}`;
          })
          .join(" ");

        return (
          <path
            d={`${ringPath} Z`}
            fill="none"
            key={ring}
            stroke="#334155"
            strokeOpacity="0.65"
          />
        );
      })}

      {axisPoints.map((point) => (
        <line
          key={point.label}
          stroke="#334155"
          strokeOpacity="0.55"
          x1={center.x}
          x2={point.x}
          y1={center.y}
          y2={point.y}
        />
      ))}

      <path
        d={`${valuePath} Z`}
        fill="url(#radar-fill)"
        stroke="#2f80ff"
        strokeLinejoin="round"
        strokeWidth="2"
      />

      {axisPoints.map((point) => (
        <circle
          cx={point.valueX}
          cy={point.valueY}
          fill="#57b5ff"
          key={`${point.label}-dot`}
          r="3"
        />
      ))}

      {axisPoints.map((point) => (
        <text
          fill="#a5b4c9"
          fontSize="10"
          key={point.label}
          textAnchor={
            point.label === "Strength" || point.label === "Finance"
              ? "middle"
              : point.label === "Communication" || point.label === "Wisdom"
                ? "end"
                : "start"
          }
          x={point.labelX}
          y={point.labelY}
        >
          {point.label}
        </text>
      ))}
    </svg>
  );
}

function StatsGrid({ stats }: { stats: StatCard[] }) {
  return (
    <section className="grid grid-cols-2 gap-3">
      {stats.map((stat) => (
        <AnalyticsStatCard key={stat.label} stat={stat} />
      ))}
    </section>
  );
}

function AnalyticsStatCard({ stat }: { stat: StatCard }) {
  const Icon = stat.icon;

  return (
    <article className="rounded-2xl border border-slate-700/55 bg-[#07111f]/82 p-4 font-sans shadow-[0_10px_28px_rgba(0,0,0,0.28),inset_0_1px_18px_rgba(99,148,216,0.06)] backdrop-blur-xl">
      <div className="mb-3 flex size-12 items-center justify-center rounded-xl border border-[#2f8cff]/30 bg-blue-950/20 text-[#4f8cff]">
        <Icon className="size-6" />
      </div>
      <p className="truncate text-sm text-slate-400">{stat.label}</p>
      <p className="mt-1 text-3xl font-semibold leading-none text-white">
        {stat.value}
      </p>
      <p className="mt-2 flex items-center gap-1 text-sm font-medium text-emerald-400">
        <TrendingUp className="size-3 fill-emerald-400" />
        {stat.helper}
      </p>
    </article>
  );
}

function buildXpGrowth(snapshot: GameSnapshot): ChartPoint[] {
  const xpByDate = snapshot.taskCompletions.reduce<Record<string, number>>(
    (dates, completion) => {
      dates[completion.completedForDate] =
        (dates[completion.completedForDate] ?? 0) + completion.earnedXp;
      return dates;
    },
    {},
  );

  return getLastDates(7).map((date) => ({
    label: formatChartDate(date),
    value: xpByDate[date] ?? 0,
  }));
}

function buildCategoryGrowth(snapshot: GameSnapshot): RadarPoint[] {
  return attributeOrder.map((key) => {
    const attribute = snapshot.attributes.find((item) => item.key === key);

    return {
      label: attribute?.label ?? capitalize(key),
      value: attribute?.level.progressPercent ?? 0,
    };
  });
}

function buildStats(snapshot: GameSnapshot): StatCard[] {
  const bossesCompleted = snapshot.taskCompletions.filter(
    (completion) => completion.taskKind === "boss",
  ).length;
  const today = getDateKey(new Date());
  const todayCompletions = snapshot.taskCompletions.filter(
    (completion) => completion.completedForDate === today,
  ).length;

  return [
    {
      label: "Tasks Completed",
      value: formatNumber(snapshot.taskCompletions.length),
      helper: `${formatNumber(todayCompletions)} today`,
      icon: CheckSquare,
    },
    {
      label: "Wallet",
      value: formatNumber(snapshot.progress.coins),
      helper: `${formatNumber(snapshot.progress.gems)} gems`,
      icon: CircleDollarSign,
    },
    {
      label: "Bosses Defeated",
      value: formatNumber(bossesCompleted),
      helper: "toward 20/year",
      icon: ShieldCheck,
    },
    {
      label: "Rewards Claimed",
      value: formatNumber(snapshot.rewardPurchases.length),
      helper: `${formatNumber(snapshot.progress.currentStreak)} day streak`,
      icon: Gem,
    },
  ];
}

function calculateChange(today: number, yesterday: number) {
  if (today === 0 && yesterday === 0) {
    return "0%";
  }

  if (yesterday === 0) {
    return "+100%";
  }

  const change = ((today - yesterday) / yesterday) * 100;
  const prefix = change >= 0 ? "+" : "";

  return `${prefix}${change.toFixed(1)}%`;
}

function getLastDates(count: number) {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (count - 1 - index));
    return getDateKey(date);
  });
}

function getDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatChartDate(dateKey: string) {
  const date = new Date(`${dateKey}T00:00:00`);

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
  }).format(date);
}

function formatTick(value: number) {
  if (value >= 1000) {
    return `${Math.round(value / 1000)}K`;
  }

  return String(value);
}

function roundChartMax(value: number) {
  if (value <= 100) {
    return 100;
  }

  const magnitude = 10 ** Math.floor(Math.log10(value));
  return Math.ceil(value / magnitude) * magnitude;
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
