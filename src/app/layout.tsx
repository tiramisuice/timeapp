import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import BottomNav from "../components/BottomNav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TimeBoard",
  description: "Minimalist Time Tracker",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "TimeBoard",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Prevent zooming on inputs/taps
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 text-gray-900 h-screen overflow-hidden flex flex-col`}>
        {/* Main Content Area - scrollable */}
        <main className="flex-1 overflow-y-auto pb-20">
          {children}
        </main>
        
        {/* Navigation */}
        <BottomNav />
        
        {/* Service Worker Registration Script */}
        <ScriptRegisterSW />
      </body>
    </html>
  );
}

// Client component for SW registration
import ScriptRegisterSW from "../components/ScriptRegisterSW";
