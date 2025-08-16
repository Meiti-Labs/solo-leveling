"use client";

import { enqueueSnackbar } from "notistack";
import { useLaunchParams } from "@telegram-apps/sdk-react";
import { useEffect } from "react";
import ApiService from "@/utils/ApiService";
import { ObjectId } from "mongoose";

export interface IUserData {
  _id: ObjectId;
  telegramId: string;
  username: string;
  totalXP: number;
  level: number;
  cash: number;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}

export default function AppWrapper() {
  const data = useLaunchParams();
  const handleApi = async () => {
    try {
      if (data) {
        enqueueSnackbar(`User ID: ${data.tgWebAppData?.user?.id}`);
      } else {
        enqueueSnackbar("Telegram WebApp not available");
      }
    } catch (error) {
      enqueueSnackbar("An error occurred");
      console.error(error);
    }
  };

  useEffect(() => {
    if (data) {
      ApiService.post<IUserData>(`/telegram/user/verify`, {
        ...data.tgWebAppData,
      })
        .then((res) => {
          res.messages?.forEach((i) => {
            enqueueSnackbar(i);
          });
        })
        .catch((err) => {
          enqueueSnackbar(err);
        });
    }
  }, [data]);

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <button onClick={handleApi}>HELLO</button>
    </div>
  );
}
