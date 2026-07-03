"use client";

import { useRawInitData } from "@telegram-apps/sdk-react";
import { useEffect } from "react";
import BottomNavigation from "@/components/bottom-navigation";

export default function AppProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const rawInitData = useRawInitData();

  useEffect(() => {
    if (rawInitData) {
      localStorage.setItem("tma", rawInitData);
    }
  }, [rawInitData]);

  return (
    <div className="min-h-svh bg-background pb-28 text-foreground">
      {children}
      <BottomNavigation />
    </div>
  );
}
