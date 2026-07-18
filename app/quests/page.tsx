"use client";

import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import QuestsHeader from "@/components/quests-header";
import type { QuestTab } from "@/components/quests-header";
import QuestListSection from "@/components/quest-list-section";
import CreateQuestFab from "@/components/create-quest-fab";
import TodayStreakCard from "@/components/today-streak-card";
import { useI18n } from "@/lib/i18n";

export default function QuestsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<QuestTab>("All");
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [questRevision, setQuestRevision] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const { t } = useI18n();

  return (
    <main className="mx-auto min-h-[calc(100svh-8rem)] w-full max-w-md space-y-4 px-3 py-4">
      <QuestsHeader
        activeTab={activeTab}
        onHistoryClick={() => router.push("/quests/history")}
        onSearchClick={() => setIsSearchVisible((current) => !current)}
        onTabChange={setActiveTab}
      />
      {isSearchVisible && (
        <section className="flex items-center gap-2 rounded-2xl border border-slate-700/55 bg-[#07111f]/82 p-2 shadow-[0_10px_28px_rgba(0,0,0,0.28),inset_0_1px_18px_rgba(99,148,216,0.06)] backdrop-blur-xl">
          <Search className="ml-2 size-5 shrink-0 text-slate-400" />
          <input
            autoFocus
            className="h-10 min-w-0 flex-1 bg-transparent text-base text-white outline-none placeholder:text-slate-600"
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder={t("quest.searchPlaceholder")}
            value={searchQuery}
          />
          {searchQuery && (
            <Button
              aria-label={t("action.clearQuestSearch")}
              className="size-9 rounded-xl text-slate-300 hover:bg-slate-800/80 hover:text-white"
              onClick={() => setSearchQuery("")}
              size="icon"
              type="button"
              variant="ghost"
            >
              <X className="size-4" />
            </Button>
          )}
        </section>
      )}
      <TodayStreakCard revision={questRevision} />
      <QuestListSection
        activeTab={activeTab}
        onQuestChanged={() => setQuestRevision((current) => current + 1)}
        searchQuery={searchQuery}
      />
      <CreateQuestFab />
    </main>
  );
}
