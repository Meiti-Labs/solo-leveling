import { IQuestResponse } from "@/models/quest.model";
import * as React from "react";
import Task from "./task";
import Box from "../ui/box";
import DialogButton from "./dialoge-button";
import { SolarInfoSquareOutline } from "../icons/icons";

const QuestInfo: React.FunctionComponent<IQuestResponse> = (quest) => {
  return (
    <Box
      key={quest.title}
      className="p-3 gap-2 bg-purple-950/40 flex justify-between items-center"
    >
      <div className="flex flex-col gap-2">
        <span className="text-sm">{quest.title}</span>
        <span className="text-xs text-gray-400">{quest.tasks.length} Tasks</span>
      </div>
      <DialogButton
        description={`[${quest.description}]`}
        title={quest.title}
        dialogeClassName="rounded-none backdrop-blur-sm bg-white/10"
        buttonIcon={
          <SolarInfoSquareOutline
            width={25}
            height={25}
            className="size-custom"
          />
        }
      >
        {() => (
          <div>
            <h1 className="text-2xl text-center underline">Goal</h1>
            {quest.tasks.map((task) => {
              return (
                <Task {...task} key={task._id} questId={quest._id}/>
              );
            })}

            <p className="text-xs text-center mt-20 px-5">
              WARNING: Failure to complete the quests will result in appreciate
              penalty.
            </p>
          </div>
        )}
      </DialogButton>
    </Box>
  );
};

export default QuestInfo;
