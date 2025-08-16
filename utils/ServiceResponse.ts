import { IApiResponse } from "@/types/types";
import { NextResponse } from "next/server";

export const ApiResponse = {
  success: ({
    messages = ["Operation was successful"],
    data,
    status = 200
  }: IApiResponse = {}) => NextResponse.json({
    resultCode: "Ok",
    success: true,
    messages,
    data,
  }, {status}) ,
  error: ({
    messages = ["Operation failed."],
    resultCode = "Error",
    status = 400
  }: IApiResponse = {})  => NextResponse.json({ resultCode, success: false, messages }, {status}),
};
