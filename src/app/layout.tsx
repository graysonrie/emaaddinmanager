"use client";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { WindowChrome } from "@/components/window-chrome";
import UpdaterPopup from "./dashboard/components/updater-popup";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          forcedTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex flex-col h-full w-full">
            <WindowChrome />
            <div className="flex-1 flex flex-col min-h-0">{children}</div>

            <UpdaterPopup />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
