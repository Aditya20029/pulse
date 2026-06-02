import type { Metadata } from "next";
import { JetBrains_Mono, Outfit } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ),
  title: "Pulse, Global News Intelligence Globe",
  description:
    "An interactive 3D globe visualizing breaking news in real time, with Claude-powered intelligence briefings. Built with Three.js, GDELT, Reddit, and 45+ live news feeds.",
  applicationName: "Pulse",
  keywords: [
    "news globe",
    "3D globe",
    "global news",
    "intelligence dashboard",
    "Three.js",
    "Claude AI",
    "GDELT",
    "data visualization",
  ],
  openGraph: {
    title: "Pulse, Global News Intelligence Globe",
    description:
      "Real-time world events on an interactive 3D Earth, with Claude-powered intelligence briefings.",
    type: "website",
    siteName: "Pulse",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pulse, Global News Intelligence Globe",
    description:
      "Real-time world events on an interactive 3D Earth, with Claude-powered intelligence briefings.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <body className="relative h-full min-h-full overflow-hidden">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
