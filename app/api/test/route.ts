import { connectDB } from "@/lib/db"
import { NextResponse } from "next/server";



export const GET = async () => {
    await connectDB();

    return NextResponse.json("hello next api!!!")
}