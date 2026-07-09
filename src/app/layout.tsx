import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tiny Bounty",
  description: "Post a compact task bounty with task, reward note, deadline, note, wallet, and timestamp on Base.",
};

const defaultBaseAppId = "6a0ad2b01f1ccae4c221e8ec";
const configuredBaseAppId = process.env.NEXT_PUBLIC_BASE_APP_ID?.trim();
const baseAppId =
  configuredBaseAppId && !configuredBaseAppId.includes("replace_with")
    ? configuredBaseAppId
    : defaultBaseAppId;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>{baseAppId ? <meta name="base:app_id" content={baseAppId} /> : null}</head>
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
