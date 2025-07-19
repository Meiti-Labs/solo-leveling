"use client";
import axios from "axios";
import Image from "next/image";
import { enqueueSnackbar } from "notistack";

export default function Home() {
  const handleApi = () => {
    axios.get("/api/test").then((res) => {
      console.log({ res });
      enqueueSnackbar(res.data)
    });
  };

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <button onClick={handleApi}>HELLO</button>
    </div>
  );
}
