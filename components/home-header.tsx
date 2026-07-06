"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Bell, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UserProfile } from "@/lib/indexed-db/types";
import { cn } from "@/lib/utils";

type AvatarTier = "begginer" | "apprantice" | "master" | "legend";

const getAvatarTier = (level: number): AvatarTier => {
  if (level >= 75) return "legend";
  if (level >= 25) return "master";
  if (level >= 10) return "apprantice";
  return "begginer";
};

export default function HomeHeader({
  level,
  unreadNotifications = 0,
  profile,
}: {
  level: number;
  unreadNotifications?: number;
  profile?: UserProfile;
}) {
  const displayName = getDisplayName(profile);
  const avatarTier = getAvatarTier(level);

  return (
    <header className="flex w-full items-center gap-3 py-3 sm:gap-4">
      <div className="relative size-21 shrink-0 sm:size-32">
        <Image
          alt={`${displayName} avatar`}
          className="object-contain drop-shadow-[0_0_22px_rgba(37,116,255,0.35)]"
          fill
          priority
          sizes="(min-width: 640px) 128px, 96px"
          src={`/images/avatars/${avatarTier}.png`}
        />
        <span className="absolute bottom-1 right-[1] flex h-[26%] min-h-7 w-[30%] min-w-8 items-center justify-center text-sm font-semibold leading-none text-white drop-shadow-[0_0_8px_rgba(92,151,255,0.9)] sm:text-3xl">
          {level}
        </span>
      </div>

      <div className="min-w-0 flex-1 space-y-1.5">
        <h1 className="truncate text-md font-semibold leading-none text-white ">
          {displayName}
        </h1>
        <p className="truncate font-sans text-xs leading-tight text-slate-400 ">
          {getHunterTitle(level)}
        </p>
        <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-indigo-400/10 bg-indigo-950/55 px-3 py-1 text-sm font-semibold text-indigo-200 shadow-[0_0_20px_rgba(79,70,229,0.18)] sm:text-base">
          <span className="truncate text-[10px]">{getHunterRank(level)}</span>
        </div>
      </div>

      <div className="grid shrink-0 grid-cols-1 gap-2 min-[380px]:grid-cols-2">
        <HeaderIconButton
          hasBadge={unreadNotifications > 0}
          href="/notifications"
          label="Notifications"
        >
          <Bell className="size-6 sm:size-7" />
        </HeaderIconButton>
        <HeaderIconButton href="/settings" label="Settings">
          <Settings className="size-6 sm:size-7" />
        </HeaderIconButton>
      </div>
    </header>
  );
}

function HeaderIconButton({
  children,
  hasBadge = false,
  href,
  label,
}: {
  children: ReactNode;
  hasBadge?: boolean;
  href?: string;
  label: string;
}) {
  const content = (
    <>
      {children}
      {hasBadge && (
        <span className="absolute right-2 top-2 size-3 rounded-full bg-[#3b82ff] shadow-[0_0_12px_rgba(59,130,255,0.9)] sm:size-4" />
      )}
    </>
  );
  const className = cn(
    "relative size-12 rounded-2xl border border-slate-700/60 bg-[#07111f]/80 text-white shadow-[0_8px_24px_rgba(0,0,0,0.35),inset_0_1px_18px_rgba(99,148,216,0.08)] backdrop-blur-xl hover:bg-[#0b1728] sm:size-16 sm:rounded-[22px]",
  );

  if (href) {
    return (
      <Button asChild className={className} size="icon" variant="ghost">
        <Link aria-label={label} href={href}>
          {content}
        </Link>
      </Button>
    );
  }

  return (
    <Button
      aria-label={label}
      className={className}
      size="icon"
      type="button"
      variant="ghost"
    >
      {content}
    </Button>
  );
}

function getDisplayName(profile?: UserProfile) {
  const fullName = [profile?.firstName, profile?.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  return fullName || profile?.username || "Shadow";
}

function getHunterTitle(level: number) {
  if (level >= 100) return "The Legendary One";
  if (level >= 75) return "The Relentless One";
  if (level >= 50) return "The Awakened One";
  if (level >= 25) return "The Disciplined One";
  if (level >= 10) return "The Rising One";
  return "New Hunter";
}

function getHunterRank(level: number) {
  if (level >= 100) return "Legendary Awakener";
  if (level >= 75) return "S-Rank Awakener";
  if (level >= 50) return "A-Rank Awakener";
  if (level >= 25) return "B-Rank Awakener";
  if (level >= 10) return "C-Rank Awakener";
  return "E-Rank Awakener";
}
