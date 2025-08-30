import { TelegramUser } from "@/types/types";
import { validate } from "@telegram-apps/init-data-node";
import { NextRequest } from "next/server";

export default function VerifyTelegramRequest(
  request: NextRequest
): TelegramUser | null {
  const initData =
    request.headers.get("authorization")?.replace(/^tma\s+/i, "") || "";
  validate(initData, process.env.TELEGRAM_BOT_TOKEN!);
  const params = new URLSearchParams(initData);
  const userRaw = params.get("user");
  const user = userRaw ? JSON.parse(userRaw) : null;
  return user;
}
