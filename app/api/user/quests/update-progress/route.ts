import { connectDB } from "@/lib/db";
import VerifyTelegramRequest from "@/lib/telegram-validator";
import QuestModel, { IQuestModel, ITask } from "@/models/quest.model";
import UserModel from "@/models/user.model";
import { updateQuestSchema } from "@/schemas/questSchema";
import { ApiResponse, ErrorHandler } from "@/utils/ServiceResponse";
import { NextRequest } from "next/server";

export const PUT = async (req: NextRequest) => {
  try {
    await connectDB();
    VerifyTelegramRequest(req);
    const data = await req.json();
    const validate = updateQuestSchema.parse(data);

    const quest = await QuestModel.findById(validate.questId);

    if (!quest) throw new Error("Quest not found");

    const currentTask = quest.tasks.id(validate.taskId);

    if (!currentTask) throw new Error("Task not found");

    // if (currentTask.isCompleted) {
    //   throw new Error("Completed task cannot be updated");
    // }

    const doneTask = currentTask.totalProgress <= validate.progress;

    if (doneTask) {
      currentTask.isCompleted = true;
      currentTask.completedAt = new Date();
      currentTask.doneProgress = currentTask.totalProgress;
    }

    const isDoneAll = quest?.tasks.every((i: ITask) => i.isCompleted);
    if (isDoneAll) {
      quest.isCompleted = true;
      quest.completedAt = new Date();
    }

    await quest.save();
    if (isDoneAll) {
      const totalXpGainedFromThisQuest = (quest.tasks as ITask[]).reduce(
        (acc, task) => acc + (task.xp || 0),
        0
      );

      const user = await UserModel.findOneAndUpdate(
        { telegramId: quest.userTelegramId },
        { $inc: { totalXP: totalXpGainedFromThisQuest } },
        { new: true }
      );
      if (!user) throw new Error("User not found");
    }

    return ApiResponse.success({ messages: ["Progress is updated"] });
  } catch (error) {
    return ErrorHandler(error);
  }
};
