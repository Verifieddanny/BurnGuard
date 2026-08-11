import type { Metadata } from "next";
import { Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider, themeNoFlashScript } from "@/providers/theme-provider";
import { Analytics } from "@vercel/analytics/next"
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://burnguard.run";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "BurnGuard — Stop surprise AI API bills",
    template: "%s · BurnGuard",
  },
  description:
    "BurnGuard sits between your app and AI providers, tracking every dollar in real-time and blocking requests before you blow your budget.",
  applicationName: "BurnGuard",
  authors: [{ name: "BurnGuard Team", url: siteUrl }],
  keywords: [
    "AI spend guard",
    "OpenAI cost tracker",
    "Anthropic rate limit proxy",
    "LLM API proxy",
    "AI budget cap",
    "API cost firewall",
    "AI bill kill switch",
  ],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    title: "BurnGuard — Stop surprise AI API bills",
    description:
      "Real-time metering, hard budget caps, and a kill switch — sitting quietly between your app and every AI provider.",
    siteName: "BurnGuard",
    images: [
      {
        url: "/og-image.png", 
        width: 1200,
        height: 630,
        alt: "BurnGuard — The firewall for your AI spend",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BurnGuard — Stop surprise AI API bills",
    description:
      "Real-time metering, hard budget caps, and a kill switch — sitting quietly between your app and every AI provider.",
    images: ["/og-image.png"],
    creator: "@dannyclassi_c", 
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${bricolage.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: themeNoFlashScript }}
        />
      </head>
      <body className="min-h-full">
        <ThemeProvider>
          <QueryProvider>
            {children}
            <Toaster
              theme="system"
              position="bottom-right"
              toastOptions={{
                style: {
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                },
              }}
            />
          </QueryProvider>
        </ThemeProvider>
        <Analytics/>
      </body>
    </html>
  );
}
