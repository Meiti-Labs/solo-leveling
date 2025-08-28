import { connectDB } from "@/lib/db";
import QuestModel from "@/models/quest.model";
import { ApiResponse } from "@/utils/ServiceResponse";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const data = await request.json();

    console.log({ data });
    const newQuest = new QuestModel({
      userTelegramId: data?.userTelegramId,
      title: data?.title,
      description: data.description,
      isDaily: data.isDaily,
      deadline: data.deadline,
      achievement: data.achievement,
      tasks: data.tasks,
    });

    await newQuest.save();
    return ApiResponse.success();
  } catch (error) {
    console.log({ error });
    return ApiResponse.error();
  }
}
