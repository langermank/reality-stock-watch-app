import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Variable names must match the @theme mappings in globals.css
// (--font-sans/--font-mono read --font-geist-sans/--font-geist-mono).
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Reality Stock Watch",
  description: "The 24/7 Big Brother stock market game",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "RSW",
  },
};

export const viewport: Viewport = {
  // Matches the app surface (bg-neutral-950) so the PWA chrome blends in.
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
  // Required for env(safe-area-inset-*) to be non-zero in standalone mode.
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-full bg-neutral-950 text-neutral-50">{children}</body>
    </html>
  );
}
