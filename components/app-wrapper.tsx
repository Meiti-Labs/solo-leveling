"use client";

import { useLaunchParams } from "@telegram-apps/sdk-react";
import { useEffect, useState } from "react";
import ApiService from "@/utils/ApiService";
import { IUserData, userStore } from "@/store/userStore";

import Header from "./shared/site-header";
import Footer from "./shared/site-footer";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { Button } from "./ui/button";
import { Toaster } from "sonner";

export type IProgress =
  | "Getting started"
  | "Verifiying Telegram Request"
  | "Verifying ID"
  | "Get Started";

export default function AppProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [progress, setProgress] = useState<IProgress>("Getting started");
  const [ready, setReady] = useState(false);

  const data = useLaunchParams();
  const { update } = userStore();

  useEffect(() => {
    if (data) {
      setProgress("Verifiying Telegram Request");
      ApiService.post<IUserData>(`/telegram/user/verify`, {
        ...data.tgWebAppData,
      }).then((res) => {
        setProgress("Verifying ID");
        if (res.resultCode == "Ok" && res.data) {
          setProgress("Get Started");
          update(res.data);
        }
      });
    }
  }, [data, update]);

  if (!ready) {
    return (
      <div className="bg-[url('/main.jpg')] bg-cover bg-center h-screen w-full relative flex flex-col justify-between ">
        <div className="h-32 mb-auto card-fade-bottom flex justify-center items-center">
          <span className="text-3xl">SOLO LEVELING</span>
        </div>
        <div className="h-80 p-5  card-fade-top ">
          <h1 className="text-5xl mb-3">
            YOUR <br /> <span className="text-[#BE99FE]">AWAKENING</span> <br />{" "}
            BEGINS NOW!
          </h1>
          <p className="text-[#dac8f7]">
            Walk your path. Take action. Conquer. Level up and become a legend.
          </p>
          <Button
            disabled={progress !== "Get Started"}
            className="bg-[#BE99FE]  uppercase rounded-4xl w-full h-14 mt-5  font-semibold font-sans text-lg"
            onClick={() => setReady(true)}
          >
            {progress} {progress !== "Get Started" && "..."}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[url('/main-bg.jpg')] bg-cover bg-center h-screen w-full relative flex flex-col ">
      <Header />
      <div className="p-5 flex-1">
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          {" "}
          {children}{" "}
        </LocalizationProvider>
      </div>

      <Footer />
    </div>
  );
}
