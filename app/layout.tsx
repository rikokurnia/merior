import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { Providers } from "./providers";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "Merior",
  description: "Privacy-Preserving AI Triage & Priority Yield Queues",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full antialiased bg-[#204287]", "font-sans", geist.variable)}
    >
      <body className="min-h-full flex flex-col font-sans text-[#D5E8F0] selection:bg-[#BCD3E9] selection:text-[#204287]">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
