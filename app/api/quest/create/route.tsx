import { connectDB } from "@/lib/db";
import QuestModel from "@/models/quest.model";
import { questSchema } from "@/schemas/questSchema";
import { ApiResponse } from "@/utils/ServiceResponse";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const data = await request.json();
    const validate = questSchema.safeParse(data);

    if (validate.success) {
      await new QuestModel(validate.data).save();
      return ApiResponse.success();
    } else {
      return ApiResponse.error({ messages: [validate.error.message] });
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : String(error || "Unknown error");

    return ApiResponse.error({ messages: [message] });
  }
}
