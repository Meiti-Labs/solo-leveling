import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import _user from "@/models/user.model";
import { ApiResponse } from "@/utils/ServiceResponse";
import { validate } from "@telegram-apps/init-data-node";


import crypto from "crypto";
import querystring from "node:querystring";

function validateTelegram(initData: string, botToken: string) {
  // Parse query string
  const params = querystring.parse(initData);

  const hashFromTelegram = params.hash as string;
  delete params.hash; // remove hash for HMAC calculation

  // Build data-check-string (sorted by key)
  const dataCheckString = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("\n");

  // Key = SHA256 of bot token
  const secretKey = crypto.createHash("sha256").update(botToken).digest();

  // Compute HMAC-SHA256
  const hmac = crypto.createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  // Compare hashes
  if (hmac !== hashFromTelegram) {
    throw new Error("Telegram signature invalid");
  }

  // Parse user JSON
  const user = JSON.parse(params.user as string);
  return user;
}


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

export async function GET(req: NextRequest) {
  const initData =
    req.headers.get("authorization")?.replace(/^tma\s+/i, "") || "";

  try {
    validateTelegram(initData, process.env.TELEGRAM_BOT_TOKEN!);
    return ApiResponse.success({ messages: ["verified"] });
  } catch (err) {
    console.log({ err, initData, });
    return ApiResponse.error({ messages: ["verification faild"] });
  }
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
      });

      return ApiResponse.success({
        messages: [`WELCOME ${user.username}`],
        data: user,
      });
    } else {
      const newUserEntity = new _user({
        telegramId: payload.user.id,
        username: payload.user.first_name,
      });
      const newUserData = (await newUserEntity.save()).toObject();
      return ApiResponse.success({
        messages: [`WELCOME ${newUserData.username}`],
        data: newUserData,
      });
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
