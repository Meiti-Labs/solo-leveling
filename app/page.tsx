"use client"
import dynamic from "next/dynamic";

const AppWrapper = dynamic(() => import("@/components/app-wrapper"), {
    ssr: false,
  });

export default function Home() {
  

  return <AppWrapper />;
}
