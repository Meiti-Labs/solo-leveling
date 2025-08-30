import { validate } from "@telegram-apps/init-data-node";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ApiResponse } from "./utils/ServiceResponse";

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/api/secure/")) {
    const initData =
      request.headers.get("authorization")?.replace(/^tma\s+/i, "") || "";

    if (initData) {
      return NextResponse.next();
    } else {
      return ApiResponse.error({ messages: ["Telegram initial data faild"] });
    }
  }
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: "/api/:path*",
};
