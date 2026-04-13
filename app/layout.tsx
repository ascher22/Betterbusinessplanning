import type React from "react";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

const CANONICAL_LOGIN_URL =
  "https://betterbusinessplanning.wealthcareportal.com/Authentication/Handshake";
const SITE_DOMAIN = "betterbusinessplanning.wealthcareportal.com";
const SITE_BRAND = "Better Business Planning";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || CANONICAL_LOGIN_URL,
  ),
  title: {
    default: "Better Business Planning - Login",
    template: "%s | Better Business Planning",
  },
  keywords: [
    "Better Business Planning",
    "Wealthcare Portal",
    "betterbusinessplanning.wealthcareportal.com",
    "benefits login",
    "employee benefits portal",
    "handshake authentication",
    "account access",
  ],
  description: `${SITE_BRAND} – ${SITE_DOMAIN}. Access your account, manage benefits, and sign in securely through Better Business Planning.`,

  authors: [{ name: "Better Business Planning" }],
  creator: "Better Business Planning",
  publisher: "Better Business Planning",
  applicationName: SITE_BRAND,
  referrer: "origin-when-cross-origin",
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
    title: "Better Business Planning - Login",
    description: `${SITE_BRAND} at ${SITE_DOMAIN}. Access your account, manage benefits, and sign in securely through Better Business Planning.`,
    siteName: SITE_BRAND,
    url: CANONICAL_LOGIN_URL,
    images: [
      {
        url: "/favicon-32x32.png",
        width: 32,
        height: 32,
        alt: `${SITE_BRAND}`,
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Better Business Planning - Login",
    description: `${SITE_BRAND} at ${SITE_DOMAIN}. Access your account, manage benefits, and sign in securely through Better Business Planning.`,
    images: ["/favicon-32x32.png"],
  },
  icons: {
    icon: "/favicon-32x32.png",
    shortcut: "/favicon-32x32.png",
    apple: "/favicon-32x32.png",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
  themeColor: "#254650",
  category: "Business",
  alternates: {
    canonical: CANONICAL_LOGIN_URL,
    languages: {
      "en-US": CANONICAL_LOGIN_URL,
    },
  },
  other: {
    "geo.region": "US",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_BRAND,
  url: CANONICAL_LOGIN_URL,
  description:
    "Better Business Planning account sign in portal. Login to manage benefits, view account resources, and access your Better Business Planning profile.",
  publisher: {
    "@type": "Organization",
    name: "Better Business Planning",
  },
  inLanguage: "en-US",
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", url: CANONICAL_LOGIN_URL },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-US">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${geist.className} font-sans antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
