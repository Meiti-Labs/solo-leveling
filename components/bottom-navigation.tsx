"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChartNoAxesColumn,
  ClipboardList,
  Compass,
  ShoppingBag,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigationItems = [
  {
    href: "/",
    label: "Profile",
    icon: Compass,
  },
  {
    href: "/quests",
    label: "Quests",
    icon: ClipboardList,
  },
  {
    href: "/store",
    label: "Store",
    icon: ShoppingBag,
  },
  {
    href: "/analytics",
    label: "Analytics",
    icon: ChartNoAxesColumn,
  },
  {
    href: "/hall-of-fame",
    label: "Hall of Fame",
    icon: Trophy,
  },
];

export default function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-5 z-50 px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
      <div className="mx-auto grid h-[86px] max-w-md grid-cols-5 items-center rounded-[28px] border border-slate-700/60 bg-[#07111f]/90 px-2 shadow-[0_0_0_1px_rgba(82,132,200,0.08),0_18px_45px_rgba(0,0,0,0.45),inset_0_1px_18px_rgba(99,148,216,0.08)] backdrop-blur-xl">
        {navigationItems.map((item) => {
          const isActive =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "group flex min-w-0 flex-col items-center justify-center gap-1.5 rounded-2xl px-1 py-2 font-sans text-[11px] font-medium transition-colors",
                isActive
                  ? "text-[#4f8cff]"
                  : "text-slate-400 hover:text-slate-200",
              )}
              href={item.href}
              key={item.href}
            >
              <span
                className={cn(
                  "relative flex size-8 items-center justify-center",
                  isActive &&
                    "drop-shadow-[0_0_12px_rgba(67,139,255,0.95)]",
                )}
              >
                {isActive && (
                  <span className="absolute inset-0 rounded-full bg-[#2f80ff]/20 blur-md" />
                )}
                <Icon
                  className={cn(
                    "relative size-7 stroke-[1.9]",
                    isActive ? "text-[#5aa0ff]" : "text-slate-400",
                  )}
                />
              </span>
              <span className="w-full truncate text-center">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
