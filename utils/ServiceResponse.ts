import { IApiResponse } from "@/types/types";

export const ApiResponse = {
  success: ({
    messages = ["Operation was succesfull"],
    data,
  }: IApiResponse): IApiResponse => ({
    resultCode: "Ok",
    success: true,
    messages,
    data,
  }),
  error: ({
    messages = ["Operation Faild."],
    resultCode = "Error",
  }: IApiResponse): IApiResponse => ({ resultCode, success: false, messages }),
};
