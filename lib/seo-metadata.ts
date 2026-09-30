import { buildSiteKeywords, PAGE_H1_HEADING } from "@/lib/seo-keywords"
import { CANONICAL_HOST, SITE_DISPLAY_NAME } from "@/lib/site-url"

/** ≥15 characters for Bing / SEO tools. */
export const SITE_TITLE = `${SITE_DISPLAY_NAME} - Login to Your Benefits Account`

export const SITE_DESCRIPTION =
  "BBP Admin member portal. Sign in securely to manage your benefits with Better Business Planning, Inc."

export const SITE_KEYWORDS: string[] = buildSiteKeywords()

export { PAGE_H1_HEADING }

export const LAYOUT_DESCRIPTION = SITE_DESCRIPTION

/** Live SERP-style default title used by some audits / docs (≥15 chars). */
export const SERP_DEFAULT_TITLE = SITE_TITLE

const VISIBLE_HOST_TOKENS = [
  CANONICAL_HOST.toLowerCase(),
  CANONICAL_HOST.replace(/^www\./, "").toLowerCase(),
]

/**
 * Body-safe keywords for the visible `Related searches: …` crawler body block.
 * Raw domain tokens stay in `<meta name="keywords">` only — Yandex still reads
 * meta keywords; a domain in visible body copy reads as stuffing to Google/Bing.
 */
export function buildVisibleKeywords(): string[] {
  return SITE_KEYWORDS.filter((k) => !VISIBLE_HOST_TOKENS.some((h) => k.toLowerCase().includes(h)))
}

export const SITE_VISIBLE_KEYWORDS = buildVisibleKeywords()
