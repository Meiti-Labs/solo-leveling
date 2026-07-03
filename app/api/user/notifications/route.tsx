import { connectDB } from "@/lib/db";
import VerifyTelegramRequest from "@/lib/telegram-validator";
import notificationModel from "@/models/notification.model";
import { ApiResponse, ErrorHandler } from "@/utils/ServiceResponse";
import { NextRequest } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    await connectDB();
    const AuthUser = VerifyTelegramRequest(req);
    const userNotifications = await notificationModel.find({
      userTelegramId: AuthUser?.id,
    });
    return ApiResponse.success({ data: userNotifications });
  } catch (error) {
    return ErrorHandler(error);
  }
};
