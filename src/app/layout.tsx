import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { Metal_Mania } from "next/font/google";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const metalMania = Metal_Mania({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-metal-mania",
});

export const metadata: Metadata = {
  title: "FELO",
  description: "Bogota aun no tiene un soberano",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${metalMania.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
