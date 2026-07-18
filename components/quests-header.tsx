"use client";

import { ClipboardClock, Search } from "lucide-react";
import PageHeader from "@/components/page-header";
import { useI18n } from "@/lib/i18n";

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
  const { t } = useI18n();
  const tabLabelMap: Record<QuestTab, string> = {
    All: t("quest.all"),
    Avoid: t("quest.avoid"),
    Bosses: t("quest.bosses"),
    Challenges: t("quest.challenges"),
    Completed: t("common.completed"),
    Daily: t("quest.daily"),
    Goals: t("quest.goals"),
  };

  return (
    <PageHeader
      activeTab={activeTab}
      actions={[
        {
          label: t("quest.history"),
          icon: <ClipboardClock className="size-5" />,
          onClick: onHistoryClick,
        },
        {
          label: t("quest.search"),
          icon: <Search className="size-5" />,
          onClick: onSearchClick,
        },
      ]}
      onTabChange={(tab) => onTabChange(tab as QuestTab)}
      tabLabelMap={tabLabelMap}
      tabs={questTabs}
      title={t("common.quests")}
    />
  );
}
