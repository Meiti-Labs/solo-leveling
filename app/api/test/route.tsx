import { ApiResponse } from "@/utils/ServiceResponse";
import { NextRequest } from "next/server";

export const GET = (req: NextRequest) => {
    console.log("hello");
    return ApiResponse.success({messages: ["oh yes"]})
}