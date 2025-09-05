"use client";
import { PiconRight, SolarInfoSquareOutline } from "@/components/icons/icons";
import { ShineBorder } from "@/components/magicui/shine-border";
import DialogButton from "@/components/shared/dialoge-button";
import QuestInfo from "@/components/shared/quest-info";
import Box from "@/components/ui/box";
import useGetData from "@/hooks/useGetData";
import { IQuest } from "@/models/quest.model";
import { userStore } from "@/store/userStore";
import Link from "next/link";

export default function Home() {
  const { quests } = userStore();
  return (
    <div className="flex flex-col   gap-10">
      {!!quests?.filter((q) => q.isDaily).length && (
        <section className="flex flex-col gap-5">
          <div className="flex  items-center  justify-between">
            <h2 className="text-md">Daily Quests</h2>
            <Link href={"/daily-quests"}>
              {" "}
              <PiconRight />{" "}
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {quests
              ?.filter((q) => q.isDaily)
              .map((q) => {
                return <QuestInfo {...q} key={q._id} />;
              })}
          </div>
        </section>
      )}
      {!!quests?.filter((q) => !q.isDaily).length && (
        <section className="flex flex-col gap-5">
          <div className="flex  items-center  justify-between">
            <h2 className="text-md">Special Quests</h2>
            <Link href={"/daily-quests"}>
              {" "}
              <PiconRight />{" "}
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {quests
              ?.filter((q) => !q.isDaily)
              .map((q) => {
                return <QuestInfo {...q} key={q._id} />;
              })}
          </div>
        </section>
      )}
      {!!quests?.filter((q) => !q.isDaily && q.isCompleted).length && (
        <section className="flex flex-col gap-5">
          <div className="flex  items-center  justify-between">
            <h2 className="text-md">Completed</h2>
            <Link href={"/daily-quests"}>
              {" "}
              <PiconRight />{" "}
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {quests
              ?.filter((q) => !q.isDaily)
              .map((q) => {
                return <QuestInfo {...q} key={q._id} />;
              })}
          </div>
        </section>
      )}
    </div>
  );
}
