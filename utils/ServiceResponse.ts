import { IApiResponse } from "@/types/types";
import { NextResponse } from "next/server";

export const ApiResponse = {
  success: ({
    messages = ["Operation was successful"],
    data,
    status = 200,
  }: IApiResponse = {}) =>
    NextResponse.json(
      {
        resultCode: "Ok",
        success: true,
        messages,
        data,
      },
      { status }
    ),
  error: ({
    messages = ["Operation failed."],
    resultCode = "Error",
    status = 400,
  }: IApiResponse = {}) =>
    NextResponse.json({ resultCode, success: false, messages }, { status }),
};

export function ErrorHandler(err: unknown, ...arg: string[]) {
  console.log(err);
  const errorMessage = err instanceof Error ? err.message : String(err || "");
  return ApiResponse.error({ messages: [errorMessage, ...arg] });
}
