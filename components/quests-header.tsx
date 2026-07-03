"use client";

import { ClipboardClock, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const questTabs = ["Daily", "Goals", "Bosses", "Challenges", "Completed"];

export default function QuestsHeader() {
  return (
    <header className="space-y-4 pt-2">
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-4xl font-semibold leading-none tracking-[-0.03em] text-white">
          Quests
        </h1>

        <div className="flex shrink-0 items-center gap-2">
          <QuestIconButton label="Quest history">
            <ClipboardClock className="size-5" />
          </QuestIconButton>
          <QuestIconButton label="Search quests">
            <Search className="size-5" />
          </QuestIconButton>
        </div>
      </div>

      <nav
        aria-label="Quest categories"
        className="-mx-3 overflow-x-auto px-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div className="flex min-w-max items-center gap-4">
          {questTabs.map((tab, index) => {
            const isActive = index === 0;

            return (
              <Button
                className={cn(
                  "h-9 rounded-xl px-5 text-base font-medium",
                  isActive
                    ? "border border-[#2f8cff]/70 bg-[#0d4fe0] text-white shadow-[0_0_18px_rgba(47,140,255,0.55),inset_0_1px_12px_rgba(255,255,255,0.12)] hover:bg-[#155df0]"
                    : "bg-transparent px-1 text-slate-400 hover:bg-transparent hover:text-slate-200",
                )}
                key={tab}
                type="button"
                variant={isActive ? "default" : "ghost"}
              >
                {tab}
              </Button>
            );
          })}
        </div>
      </nav>
    </header>
  );
}

function QuestIconButton({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <Button
      aria-label={label}
      className="size-12 rounded-2xl border border-slate-700/60 bg-[#07111f]/80 text-white shadow-[0_8px_24px_rgba(0,0,0,0.35),inset_0_1px_18px_rgba(99,148,216,0.08)] backdrop-blur-xl hover:bg-[#0b1728]"
      size="icon"
      type="button"
      variant="ghost"
    >
      {children}
    </Button>
  );
}
