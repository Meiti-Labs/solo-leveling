"use client";
import { Cinzel } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import dynamic from "next/dynamic";

const AppProvider = dynamic(() => import("@/components/app-wrapper"), {
  ssr: false,
});

const FontCinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${FontCinzel.className}  antialiased dark`}>
        <AppProvider>{children}</AppProvider>
        <Toaster />
      </body>
    </html>
  );
}
