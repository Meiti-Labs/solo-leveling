import QuestsHeader from "@/components/quests-header";
import QuestListSection from "@/components/quest-list-section";

export default function QuestsPage() {
  return (
    <main className="mx-auto min-h-[calc(100svh-8rem)] w-full max-w-md space-y-4 px-3 py-4">
      <QuestsHeader />
      <QuestListSection />
    </main>
  );
}
