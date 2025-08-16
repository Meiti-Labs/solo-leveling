import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    jwt.verify(
      request.cookies.get("token")?.value || "",
      process.env.NEXT_PUBLIC_JWT_SECRET!
    );

    const userId = (await params).id; // <- dynamic segment
    return NextResponse.json({ message: `User ID is ${userId}` });
  } catch {
    return new NextResponse("Un", { status: 401 });
  }
}
