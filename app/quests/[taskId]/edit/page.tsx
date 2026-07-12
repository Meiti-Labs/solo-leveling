"use client";

import { useParams } from "next/navigation";
import QuestFormScreen from "@/components/quest-form-screen";

export default function EditQuestPage() {
  const params = useParams<{ taskId: string }>();

  return <QuestFormScreen taskId={params.taskId} />;
}
