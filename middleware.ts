import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if(pathname.startsWith("/api/secure/")){
    const token = request.cookies.get("token")?.value || "";
    try{
        if(token)
        return NextResponse.next();
    } catch (error) {
        return new NextResponse(`${error as string}` , { status: 401 });
    }
  }
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: "/api/:path*",
};
