import type { Metadata } from "next";
import { JetBrains_Mono, Fira_Mono } from "next/font/google";
import { Toaster } from "sonner"
import "./globals.css";
import Providers from "@/components/Providers";

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jet-mono",
  subsets: ["latin"]
})

const firaMono = Fira_Mono({
  weight: ["700", "500", "400"],
  variable: "--font-fira-mono"
})

export const metadata: Metadata = {
  title: "Vinayaka Book House",
  description: "Vinayaka Book House",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${jetBrainsMono.variable} ${firaMono.variable} antialiased font-jet bg-gradient-to-br from-slate-100 to-slate-200 `}
      >
        <Providers>
          {children}
          <Toaster richColors position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
