import { SITE_DESCRIPTION } from "@/lib/seo-metadata"
import {
  SITE_DISPLAY_NAME,
  SITE_HOMEPAGE_CANONICAL,
  SITE_ORIGIN,
  canonicalHostFromOrigin,
} from "@/lib/site-url"

function buildAlternateNames(): string[] {
  const host = canonicalHostFromOrigin()
  return [
    `${SITE_DISPLAY_NAME} Login`,
    SITE_DISPLAY_NAME,
    host.toLowerCase(),
  ]
}

export function StructuredData() {
  const websiteId = `${SITE_ORIGIN}/#website`
  const webpageId = `${SITE_ORIGIN}/#webpage`

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": websiteId,
        name: SITE_DISPLAY_NAME,
        alternateName: buildAlternateNames(),
        url: SITE_HOMEPAGE_CANONICAL,
        description: SITE_DESCRIPTION,
        inLanguage: "en-US",
        publisher: {
          "@type": "Organization",
          name: SITE_DISPLAY_NAME,
          url: SITE_ORIGIN,
          logo: {
            "@type": "ImageObject",
            url: `${SITE_ORIGIN}/og-image.png`,
            width: 1200,
            height: 630,
          },
        },
        potentialAction: {
          "@type": "LoginAction",
          target: {
            "@type": "EntryPoint",
            url: SITE_HOMEPAGE_CANONICAL,
          },
          name: `Sign in to ${SITE_DISPLAY_NAME}`,
        },
      },
      {
        "@type": "WebPage",
        "@id": webpageId,
        url: SITE_HOMEPAGE_CANONICAL,
        name: `${SITE_DISPLAY_NAME} login`,
        description: SITE_DESCRIPTION,
        isPartOf: { "@id": websiteId },
        about: { "@id": websiteId },
        inLanguage: "en-US",
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: `${SITE_ORIGIN}/og-image.png`,
        },
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}
