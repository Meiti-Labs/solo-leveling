import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import _user from "@/models/user.model";
import { ApiResponse } from "@/utils/ServiceResponse";

interface TelegramUser {
  first_name: string;
  id: number;
}

interface TelegramAuthData {
  auth_date: string; // or Date if you parse it
  hash: string;
  signature: string;
  user: TelegramUser;
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const payload: TelegramAuthData = await req.json();

    const user = await _user.findOne({ telegramId: payload.user.id });
    if (user) {
      const token = jwt.sign(payload, process.env.NEXT_PUBLIC_JWT_SECRET!, {
        expiresIn: 60 * 60,
      });

      const userCookie = cookies();
      (await userCookie).set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "development",
      });

      return ApiResponse.success({messages: [`WELCOME ${user.username}`], data: user });
    } else {
      const newUserEntity = new _user({
        telegramId: payload.user.id,
        username: payload.user.first_name,
      });
      const newUserData = (await newUserEntity.save()).toObject();
      return ApiResponse.success({messages: [`WELCOME ${newUserData.username}`], data: newUserData });
    }
  } catch (err) {
    if (process.env.NODE_ENV === "production") {

      console.log({ err });

      return ApiResponse.error();
    } else {
      return NextResponse.json(
        ApiResponse.error({ messages: [err as string] }),
        { status: 400 }
      );
    }
  }

  // Return JSON response
}
