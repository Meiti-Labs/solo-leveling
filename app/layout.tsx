import "./globals.css";
import { Toaster } from "sonner";
import TelegramProvider from "@/components/telegram-provider";

export const metadata = {
  title: "Solo Leveling Mini",
  description: "A clean Telegram Mini App starter.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr">
      <body className="font-sans antialiased dark">
        <TelegramProvider>{children}</TelegramProvider>
        <Toaster />
      </body>
    </html>
  );
}
