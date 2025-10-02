import type { Metadata, Viewport } from "next";
import "./globals.css";
import PerformanceMonitor from "@/components/PerformanceMonitor";
import ErrorBoundary from "@/components/ErrorBoundary";
import Navigation from "@/components/Navigation";
import { Analytics } from '@vercel/analytics/next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://diet4me.life";
const siteName = "Diet4Me";
const siteTitle = "Diet4Me – AI-Powered Personalized Weekly Meal Plans";
const siteDescription =
  "Generate a clean, nutritionist-style weekly meal plan instantly. Enter your profile and get a tailored 7-day plan with meals and hydration guidance.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: siteName,
  title: {
    default: siteTitle,
    template: "%s | Diet4Me",
  },
  description: siteDescription,
  keywords: [
    "diet plan",
    "meal planner",
    "weekly meal plan",
    "AI diet",
    "nutrition",
    "BMI",
    "Blueprint diet",
  ],
  authors: [{ name: siteName }],
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName,
    title: siteTitle,
    description: siteDescription,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Diet4Me – Personalized Weekly Meal Plans",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: siteUrl,
  },
  icons: {
    icon: [{ url: "/logo.png", type: "image/png", sizes: "any" }],
    shortcut: ["/logo.png"],
    apple: [{ url: "/logo.png", sizes: "180x180" }],
  },
};

// 👇 Viewport settings prevent input zooming on iOS/Android
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, // <-- prevents Safari from zooming inputs
  viewportFit: "cover",
  themeColor: "#0a0a0a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: siteName,
    applicationCategory: "HealthApplication",
    url: siteUrl,
    description: siteDescription,
    offers: { "@type": "Offer", price: 0, priceCurrency: "USD" },
    operatingSystem: "Web",
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Preload critical resources */}
        <link rel="preload" href="/logo.png" as="image" type="image/png" />
        <link rel="dns-prefetch" href="https://generativelanguage.googleapis.com" />
        <link rel="preconnect" href="https://generativelanguage.googleapis.com" crossOrigin="anonymous" />
      </head>
      <body className="font-helvetica antialiased">
        <ErrorBoundary>
          <PerformanceMonitor />
          <Navigation />
          {children}
          <Analytics />
        </ErrorBoundary>
      </body>
    </html>
  );
}
