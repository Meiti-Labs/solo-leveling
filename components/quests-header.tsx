"use client";

import { ClipboardClock, Search } from "lucide-react";
import PageHeader from "@/components/page-header";

const questTabs = [
  "All",
  "Daily",
  "Goals",
  "Bosses",
  "Challenges",
  "Avoid",
  "Completed",
] as const;

export type QuestTab = (typeof questTabs)[number];

export default function QuestsHeader({
  activeTab,
  onHistoryClick,
  onSearchClick,
  onTabChange,
}: {
  activeTab: QuestTab;
  onHistoryClick: () => void;
  onSearchClick: () => void;
  onTabChange: (tab: QuestTab) => void;
}) {
  return (
    <PageHeader
      activeTab={activeTab}
      actions={[
        {
          label: "Quest history",
          icon: <ClipboardClock className="size-5" />,
          onClick: onHistoryClick,
        },
        {
          label: "Search quests",
          icon: <Search className="size-5" />,
          onClick: onSearchClick,
        },
      ]}
      onTabChange={(tab) => onTabChange(tab as QuestTab)}
      tabs={questTabs}
      title="Quests"
    />
  );
}
