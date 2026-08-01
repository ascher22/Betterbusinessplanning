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
    default: "Login  | BBP",
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
    "BBP benefits login",
    "better business planning inc login",
    "wealthcare portal betterbusinessplanning",
    "BBP mobile app login",
    "third party benefits administrator Illinois",
    "FSA administrator Itasca IL",
    "employee benefits administrator Chicago",
    "Alegeus WealthCare participant portal",
    "Better Business Planning FSA login",
    "BBP FSA account balance",
    "BBP Admin HSA login",
    "Better Business Planning HRA portal",
    "BBP COBRA login",
    "Better Business Planning benefits card",
    "FSA claim submission portal",
    "flexible spending account reimbursement portal",
    "Better Business Planning login",
    "BBP Admin login",
    "bbpadmin login",
    "Better Business Planning participant portal",
    "WealthCare Portal login",
    "BBP WealthCare Portal",
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
        url: "/1785580680466_image.webp",
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
    images: ["1785580680466_image.webp"],
  },
  icons: {
    icon: "/1785580680466_image.webp",
    shortcut: "/1785580680466_image.webp",
    apple: "/1785580680466_image.webp",
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
