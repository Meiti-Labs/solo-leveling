"use client";

import { enqueueSnackbar } from "notistack";
import { useLaunchParams } from "@telegram-apps/sdk-react";
import { useEffect, useState } from "react";
import ApiService from "@/utils/ApiService";
import { ObjectId } from "mongoose";
import { Progress } from "./ui/progress";
import { userStore } from "@/app/store/userStore";

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
  const [progress, setProgress] = useState<number>(0);
  const data = useLaunchParams();
  const { user, update } = userStore();

  useEffect(() => {
    if (data) {
      setProgress(25);
      ApiService.post<IUserData>(`/telegram/user/verify`, {
        ...data.tgWebAppData,
      })
        .then((res) => {
          setProgress(55);
          setProgress(99);
          if (res.resultCode == "Ok" && res.data) {
            setProgress(100);
            update(res.data);
          }
          res.messages?.forEach((i) => {
            enqueueSnackbar(i);
          });
        })
        .catch((err) => {
          enqueueSnackbar(err);
        });
    }
  }, [data]);

  if (!user) {
    return (
      <div className="bg-[url('/login-bg.png')] bg-cover bg-center h-screen w-full relative ">
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 flex justify-center items-center flex-col h-full">
          <h1 className="text-4xl font-semi-bold">Welcome</h1>
          <p className="text-7xl font-bold mt-4">SHINOBI</p>
          <div className="flex justify-center items-center flex-col gap-4 -mb-32 mt-32 w-60">
            <Progress value={progress} className="h-6 border-4 border-black" />
            <p className="text-2xl font-semibold">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      WELCOM {user.username}
    </div>
  );
}
