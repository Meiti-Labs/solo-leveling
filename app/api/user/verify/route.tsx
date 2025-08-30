import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import _user from "@/models/user.model";
import { ApiResponse, ErrorHandler } from "@/utils/ServiceResponse";
import VerifyTelegramRequest from "@/lib/telegram-validator";


export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const AuthUser = VerifyTelegramRequest(req);
    const user = await _user.findOne({ telegramId: AuthUser?.id });
    if (user) {
      return ApiResponse.success({
        messages: [`WELCOME ${user.username}`],
        data: user,
      });
    } else {
      const newUserEntity = new _user({
        telegramId: AuthUser?.id,
        username: AuthUser?.username || AuthUser?.first_name,
      });
      const newUserData = (await newUserEntity.save()).toObject();
      return ApiResponse.success({
        messages: [`WELCOME ${newUserData.username}`],
        data: newUserData,
      });
    }
  } catch (err) {
    return ErrorHandler(err);
  }
}
