"use client";

import Image from "next/image";
import { Bell, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AvatarTier = "begginer" | "apprantice" | "master" | "legend";

type PlayerProfile = {
  name: string;
  title: string;
  rank: string;
  level: number;
  unreadNotifications: number;
};

const mockPlayer: PlayerProfile = {
  name: "Shadow",
  title: "The Disciplined One",
  rank: "A-Rank Awakener",
  level: 28,
  unreadNotifications: 3,
};

const getAvatarTier = (level: number): AvatarTier => {
  if (level >= 75) return "legend";
  if (level >= 25) return "master";
  if (level >= 10) return "apprantice";
  return "begginer";
};

export default function HomeHeader() {
  const avatarTier = getAvatarTier(mockPlayer.level);
  const hasUnread = mockPlayer.unreadNotifications > 0;

  return (
    <header className="flex w-full items-center gap-3 py-3 sm:gap-4">
      <div className="relative size-21 shrink-0 sm:size-32">
        <Image
          alt={`${mockPlayer.name} avatar`}
          className="object-contain drop-shadow-[0_0_22px_rgba(37,116,255,0.35)]"
          fill
          priority
          sizes="(min-width: 640px) 128px, 96px"
          src={`/images/avatars/${avatarTier}.png`}
        />
        <span className="absolute bottom-1 right-[1] flex h-[26%] min-h-7 w-[30%] min-w-8 items-center justify-center text-sm font-semibold leading-none text-white drop-shadow-[0_0_8px_rgba(92,151,255,0.9)] sm:text-3xl">
          {mockPlayer.level}
        </span>
      </div>

      <div className="min-w-0 flex-1 space-y-1.5">
        <h1 className="truncate text-md font-semibold leading-none text-white ">
          {mockPlayer.name}
        </h1>
        <p className="truncate font-sans text-xs leading-tight text-slate-400 ">
          {mockPlayer.title}
        </p>
        <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-indigo-400/10 bg-indigo-950/55 px-3 py-1 text-sm font-semibold text-indigo-200 shadow-[0_0_20px_rgba(79,70,229,0.18)] sm:text-base">
          {/* <Sparkles className="size-4 shrink-0 fill-indigo-300/20 text-indigo-300" /> */}
          <span className="truncate text-[10px]">{mockPlayer.rank}</span>
        </div>
      </div>

      <div className="grid shrink-0 grid-cols-1 gap-2 min-[380px]:grid-cols-2">
        <HeaderIconButton label="Notifications" hasBadge={hasUnread}>
          <Bell className="size-6 sm:size-7" />
        </HeaderIconButton>
        <HeaderIconButton label="Messages">
          <Mail className="size-6 sm:size-7" />
        </HeaderIconButton>
      </div>
    </header>
  );
}

function HeaderIconButton({
  children,
  hasBadge = false,
  label,
}: {
  children: React.ReactNode;
  hasBadge?: boolean;
  label: string;
}) {
  return (
    <Button
      aria-label={label}
      className={cn(
        "relative size-12 rounded-2xl border border-slate-700/60 bg-[#07111f]/80 text-white shadow-[0_8px_24px_rgba(0,0,0,0.35),inset_0_1px_18px_rgba(99,148,216,0.08)] backdrop-blur-xl hover:bg-[#0b1728] sm:size-16 sm:rounded-[22px]",
      )}
      size="icon"
      type="button"
      variant="ghost"
    >
      {children}
      {hasBadge && (
        <span className="absolute right-2 top-2 size-3 rounded-full bg-[#3b82ff] shadow-[0_0_12px_rgba(59,130,255,0.9)] sm:size-4" />
      )}
    </Button>
  );
}
