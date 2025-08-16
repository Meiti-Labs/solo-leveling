"use client";

import { enqueueSnackbar } from "notistack";
import { useLaunchParams } from "@telegram-apps/sdk-react";
import { useEffect } from "react";
import axios from "axios";

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
      axios.post(`${window.location.origin}/api/telegram/user/verify`, { ...data.tgWebAppData }).then((res) => {
        console.log(res);
      });
    }
  }, [data]);

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <button onClick={handleApi}>HELLO</button>
    </div>
  );
}
