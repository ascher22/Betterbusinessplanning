import { buildSiteKeywords, PAGE_H1_HEADING } from "@/lib/seo-keywords"

/** ≥15 characters for Bing / SEO tools. */
export const SITE_TITLE = "BBP - Login to Your Benefits Account"

export const SITE_DESCRIPTION =
  "BBP Admin member portal. Sign in securely to manage your benefits with Better Business Planning, Inc."

export const SITE_KEYWORDS: string[] = buildSiteKeywords()

export { PAGE_H1_HEADING }

export const LAYOUT_DESCRIPTION = SITE_DESCRIPTION

/** Live SERP-style default title used by some audits / docs (≥15 chars). */
export const SERP_DEFAULT_TITLE = SITE_TITLE
