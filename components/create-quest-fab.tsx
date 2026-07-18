"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export default function CreateQuestFab() {
  const { t } = useI18n();
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const isScrollingUp = currentScrollY < lastScrollY.current;
      const isNearTop = currentScrollY < 24;

      setIsVisible(isNearTop || isScrollingUp);
      lastScrollY.current = currentScrollY;
    };

    lastScrollY.current = window.scrollY;
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+8.9rem)] z-40 flex justify-center px-3 transition-all duration-500 ease-out",
        isVisible
          ? "translate-y-0 scale-100 opacity-100 blur-0"
          : "pointer-events-none translate-y-8 scale-95 opacity-0 blur-sm",
      )}
    >
      <Button
        asChild
        className="h-11 rounded-full border border-[#2f8cff]/80 bg-[#0d4fe0] px-7 text-base font-medium text-white shadow-[0_0_22px_rgba(47,140,255,0.5),0_12px_26px_rgba(0,0,0,0.36),inset_0_1px_12px_rgba(255,255,255,0.14)] hover:bg-[#155df0]"
      >
        <Link href="/quests/create">
          <Plus className="size-5" />
          {t("action.createQuest")}
        </Link>
      </Button>
    </div>
  );
}
