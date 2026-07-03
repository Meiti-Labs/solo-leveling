"use client";

import { useRawInitData } from "@telegram-apps/sdk-react";
import { useEffect } from "react";

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
    <div className="min-h-svh bg-background text-foreground">{children}</div>
  );
}
