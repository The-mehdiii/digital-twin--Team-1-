import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://mehdi-digital-twin.vercel.app";
const SITE_TITLE = "Mehdi's Digital Twin — AI Chatbot";
const SITE_DESCRIPTION =
  "Chat with Mehdi's Digital Twin — an AI assistant that answers questions about his skills, projects, and experience. Built with Next.js, Groq, and RAG.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s | Mehdi's Digital Twin",
  },
  description: SITE_DESCRIPTION,
  applicationName: "Mehdi's Digital Twin",
  authors: [{ name: "Mohammed Mehdi Musa" }],
  creator: "Mohammed Mehdi Musa",
  keywords: [
    "Mehdi",
    "Mohammed Mehdi Musa",
    "Digital Twin",
    "AI Chatbot",
    "Next.js",
    "Groq",
    "RAG",
    "Full-Stack Developer",
    "AI Engineer",
    "Portfolio",
  ],
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Mehdi's Digital Twin",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Mehdi's Digital Twin — AI-Powered Chatbot",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: ["/icon.svg"],
    apple: ["/icon.svg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
