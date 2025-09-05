import { connectDB } from "@/lib/db";
import VerifyTelegramRequest from "@/lib/telegram-validator";
import QuestModel from "@/models/quest.model";
import { questSchema } from "@/schemas/questSchema";
import { ApiResponse, ErrorHandler } from "@/utils/ServiceResponse";
import { NextRequest } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    await connectDB();
    const AuthUser = VerifyTelegramRequest(req);
    const userQuests = await QuestModel.find({
      userTelegramId: AuthUser?.id,
    });
    return ApiResponse.success({ data: userQuests });
  } catch (error) {
    return ErrorHandler(error);
  }
};

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const AuthUser = VerifyTelegramRequest(request);
    const data = await request.json();
    const validate = questSchema.safeParse(data);

    if (validate.success) {
      await new QuestModel({
        ...validate.data,
        userTelegramId: AuthUser?.id,
      }).save();
      return ApiResponse.success();
    } else {
      return ApiResponse.error({ messages: [validate.error.message] });
    }
  } catch (error) {
    return ErrorHandler(error);
  }
}
