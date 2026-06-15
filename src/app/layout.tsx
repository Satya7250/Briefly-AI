import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#8B5CF6",
};

export const metadata: Metadata = {
  title: "Briefly — AI-Powered Email & Calendar Workspace",
  description: "Manage Gmail and Google Calendar with AI-powered workflows, smart prioritization, meeting preparation, and executive briefings.",
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-64x64.png", sizes: "64x64", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.ico",
  },
  openGraph: {
    title: "Briefly — AI-Powered Email & Calendar Workspace",
    description: "Manage Gmail and Google Calendar with AI-powered workflows, smart prioritization, meeting preparation, and executive briefings.",
    images: [
      {
        url: "/log.png",
        width: 512,
        height: 512,
        alt: "Briefly Logo",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Briefly — AI-Powered Email & Calendar Workspace",
    description: "Manage Gmail and Google Calendar with AI-powered workflows, smart prioritization, meeting preparation, and executive briefings.",
    images: ["/log.png"],
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <TooltipProvider>{children}</TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
