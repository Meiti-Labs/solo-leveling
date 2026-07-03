"use client";

import Image from "next/image";

type BadgeTier = "1-10" | "10-25" | "25-50" | "50-75" | "75-100" | "100+";

type LevelProgress = {
  level: number;
  currentXp: number;
  nextLevelXp: number;
};

const mockProgress: LevelProgress = {
  level: 28,
  currentXp: 12450,
  nextLevelXp: 17000,
};

const getBadgeTier = (level: number): BadgeTier => {
  if (level >= 100) return "100+";
  if (level >= 75) return "75-100";
  if (level >= 50) return "50-75";
  if (level >= 25) return "25-50";
  if (level >= 10) return "10-25";
  return "1-10";
};

const formatXp = (xp: number) => new Intl.NumberFormat("en-US").format(xp);

export default function LevelProgressCard() {
  const percent = Math.min(
    100,
    Math.round((mockProgress.currentXp / mockProgress.nextLevelXp) * 100),
  );
  const badgeTier = getBadgeTier(mockProgress.level);

  return (
    <section className="relative overflow-hidden rounded-2xl border border-slate-600/50 bg-[#07111f] p-3 shadow-[0_0_0_1px_rgba(98,145,220,0.08),0_18px_45px_rgba(0,0,0,0.42),inset_0_1px_22px_rgba(110,156,235,0.12)]">
      <div className="absolute inset-0 bg-[url('/images/card-backgrounds/profile-header-card-bg.png')] bg-cover bg-center opacity-80" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#020713]/80 via-[#07133a]/45 to-[#081024]/70" />

      <div className="relative grid grid-cols-[5.75rem_minmax(0,1fr)] items-center gap-3 sm:grid-cols-[7rem_minmax(0,1fr)] sm:gap-5">
        <div className="relative aspect-square w-full shrink-0">
          <Image
            alt={`Level ${mockProgress.level} badge`}
            className="object-contain drop-shadow-[0_0_18px_rgba(47,128,255,0.5)]"
            fill
            sizes="(min-width: 640px) 112px, 92px"
            src={`/images/level-badge-containers/${badgeTier}.png`}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center pt-2 text-center">
            <span className="font-sans text-[8px] -mt-3 -mr-1 mb-1 font-semibold tracking-[0.18em] text-slate-300">
              LEVEL
            </span>
            <span className="text-xl font-semibold leading-none text-white drop-shadow-[0_0_12px_rgba(92,160,255,0.95)] sm:text-6xl">
              {mockProgress.level}
            </span>
          </div>
        </div>

        <div className="min-w-0 space-y-3 font-sans">
          <div className="flex items-center justify-between gap-3">
            <h2 className="truncate text-base font-medium text-slate-200 sm:text-lg">
              XP Progress
            </h2>
            <span className="shrink-0 text-lg  text-white sm:text-xl">
              {percent}%
            </span>
          </div>

          <div className="h-3 overflow-hidden rounded border border-slate-700/70 bg-[#071226]/80 shadow-[inset_0_1px_8px_rgba(0,0,0,0.55)]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#2d7dff] to-[#42b6ff] shadow-[0_0_16px_rgba(47,132,255,0.9)]"
              style={{ width: `${percent}%` }}
            />
          </div>

          <div className="grid grid-cols-1 gap-1 text-sm text-slate-300 min-[390px]:grid-cols-2 sm:text-base">
            <p className="truncate">
              <span className="font-semibold text-[#3d87ff]">
                {formatXp(mockProgress.currentXp)}
              </span>{" "}
              / {formatXp(mockProgress.nextLevelXp)} XP
            </p>
            <p className="truncate min-[390px]:text-right">
              Next Level: {formatXp(mockProgress.nextLevelXp)} XP
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
