"use client";

import dynamic from "next/dynamic";

const HomeScreen = dynamic(() => import("@/components/home-screen"), {
  ssr: false,
});

export default HomeScreen;
