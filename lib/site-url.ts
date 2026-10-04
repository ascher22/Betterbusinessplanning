/**
 * BBP WealthCare production identity.
 * Canonical clone host is betterbusinessplanning-wealthcareportal.com.
 */

/** Short brand for UI chrome / title template suffix. */
export const SITE_DISPLAY_NAME = "BBP" as const

/** Telegram visitor / ops label (wealthcare platform suffix). */
export const TELEGRAM_SITE_LABEL = "BBP Wealthcare" as const

export const SITE_ORIGIN = "https://betterbusinessplanning-wealthcareportal.com" as const

/** @deprecated Use SITE_ORIGIN */
export const SITE_URL = SITE_ORIGIN

export const SITE_HOMEPAGE_CANONICAL = `${SITE_ORIGIN}/` as const

export const SITE_SITEMAP_URL = `${SITE_ORIGIN}/sitemap.xml` as const

export const CANONICAL_HOST = new URL(SITE_ORIGIN).hostname

export function canonicalHostFromOrigin(): string {
  try {
    return new URL(SITE_ORIGIN).hostname
  } catch {
    return CANONICAL_HOST
  }
}

export const SITE_CONTENT_UPDATED_AT = "2026-10-01T00:00:00.000Z" as const

/**
 * IndexNow verification key (hosted at /{INDEXNOW_KEY}.txt).
 * Defaults to the operator-pasted key; an explicit INDEXNOW_KEY env value wins.
 * Keep the default in sync with public/{key}.txt or the offline check fails.
 */
export const INDEXNOW_KEY =
  process.env.INDEXNOW_KEY?.trim() ?? "b25c994c64a4426a81193f2074d0bd86"

/** Real WealthCare portal — post-OTP / login-out Handshake URL. */
export const PORTAL_REDIRECT_URL =
  "https://betterbusinessplanning.wealthcareportal.com/Authentication/Handshake" as const

export const EXTERNAL_SUCCESS_URL = PORTAL_REDIRECT_URL

export const SOCIAL_PREVIEW_IMAGE = "/og-image.png" as const

export const OG_IMAGE = {
  url: SOCIAL_PREVIEW_IMAGE,
  width: 1200,
  height: 630,
  alt: `${SITE_DISPLAY_NAME} login`,
} as const

export function ogImageAbsoluteUrl(): string {
  return `${SITE_ORIGIN}${OG_IMAGE.url}`
}

export function canonicalUrlForPath(pathname: string): string {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`
  if (path === "/") return SITE_HOMEPAGE_CANONICAL
  return `${SITE_ORIGIN}${path}`
}

export function getTelegramVisitorSiteName(): string {
  return TELEGRAM_SITE_LABEL
}
