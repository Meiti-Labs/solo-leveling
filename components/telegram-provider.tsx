"use client";

import dynamic from "next/dynamic";

const AppProvider = dynamic(() => import("@/components/app-wrapper"), {
  ssr: false,
});

export default function TelegramProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppProvider>{children}</AppProvider>;
}
