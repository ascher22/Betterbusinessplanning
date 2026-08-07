import { buildSiteKeywords, PAGE_H1_HEADING } from "@/lib/seo-keywords"
import { SITE_DISPLAY_NAME } from "@/lib/site-url"

/** ≥15 characters for Bing / SEO tools. */
export const SITE_TITLE = "BBP - Login to Your Benefits Account"

export const SITE_DESCRIPTION =
  "BBP Admin member portal. Sign in securely to manage your benefits with Better Business Planning, Inc."

export const SITE_KEYWORDS: string[] = buildSiteKeywords()

export { PAGE_H1_HEADING }

export const LAYOUT_DESCRIPTION = SITE_DESCRIPTION

/** Live SERP-style default title used by some audits / docs. */
export const SERP_DEFAULT_TITLE = `Login | ${SITE_DISPLAY_NAME}`
