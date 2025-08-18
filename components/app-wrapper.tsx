"use client";

import { enqueueSnackbar } from "notistack";
import { useLaunchParams } from "@telegram-apps/sdk-react";
import { useEffect, useState } from "react";
import ApiService from "@/utils/ApiService";
import { ObjectId } from "mongoose";
import { Progress } from "./ui/progress";
import { userStore } from "@/app/store/userStore";
import { Icon } from "@iconify/react";
import {

  CardDescription,

  CardTitle,
} from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { AnimatedCircularProgressBar } from "./ui/animated-circular-progress-bar";
import BadgeMedal from "./shared/badge-level";
import { ChartLineInteractive } from "./charts/chart-line-interactive";

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
    <div className="bg-[url('/login-bg.png')] bg-cover bg-center h-screen w-full relative overflow-y-auto flex flex-col gap-10 p-6">
      <div className="fixed inset-0 bg-black/50" />
      <div className="flex justify-between items-center relative z-10">
        <div className="flex gap-4 items-center">
          <Avatar className="w-14 h-14">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div className="">
            <CardTitle className="text-md">HELLO</CardTitle>{" "}
            <CardDescription className="text-xl text-white font-bold">
              {user.username}
            </CardDescription>
          </div>
        </div>

        <div className=" p-4 rounded-lg h-full gap-2 items-center flex text-xl font-semibold">
          {" "}
          <span>
            <Icon icon="fluent-emoji-flat:coin" fontSize={28} />{" "}
          </span>{" "}
          <span>1,250</span>{" "}
        </div>
      </div>
      <div className=" h-full p-0 relative z-10 ">
        <div className=" h-full flex flex-col  gap-5 ">
          <div className="flex gap-3">
            <div className="flex-1">
              <AnimatedCircularProgressBar
                gaugePrimaryColor="#0594ed"
                gaugeSecondaryColor="black"
                value={50}
              />
            </div>
            <div className="glass flex-1 col-centered gap-1 h-44">
              <span>LEVEL</span>
              <BadgeMedal value={12} />
            </div>
          </div>
          <div className="flex gap-3">
            <div className="col-centered glass gap-1 flex-1 py-4">
              <span>TASKS</span>
              <span className="flex gap-3 centered text-2xl">
                <Icon icon="fluent-color:checkbox-16" /> <span>7/10</span>
              </span>
            </div>
            <div className="col-centered glass gap-3 flex-1 py-4">
              <span>GOALS</span>
              <Progress value={10} className="w-32" />
              <Progress value={30} className="w-32" />
            </div>
          </div>
          <div className="glass p-4">
            RECENT PROGRESS
            <ChartLineInteractive />
          </div>
        </div>
      </div>
    </div>
  );
}
