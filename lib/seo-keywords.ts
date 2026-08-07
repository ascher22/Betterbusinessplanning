/**
 * SEO keywords for BBP WealthCare clone.
 * Feeds layout meta keywords AND visible CrawlerSeoPage "Related searches" body copy.
 *
 * DESTINATION_KEYWORDS are derived from the final redirect URL
 * (betterbusinessplanning.wealthcareportal.com/Authentication/Handshake)
 * remapped onto this site. Additive only — never replaces CORE_KEYWORDS.
 */

import { CANONICAL_HOST, SITE_DISPLAY_NAME } from "@/lib/site-url"

export const PAGE_H1_HEADING = "BBP Login" as const

const CORE_KEYWORDS = [
  "BBP",
  "BBP Admin",
  "Better Business Planning",
  "Better Business Planning Inc",
  "BBP login",
  "BBP Admin login",
  "BBP sign in",
  "BBP portal",
  "BBP account",
  "BBP member login",
  "BBP benefits login",
  "BBP Admin benefits",
  "BBP Wealthcare",
  "BBP WealthCare portal",
  "bbpadmin.com",
  "BBPAdmin login",
  "Better Business Planning login",
  "sign in BBP",
  "BBP employee portal",
  "BBP member portal",
  "BBP benefits account",
  "BBP HSA",
  "BBP FSA",
  "BBP Admin Chicago",
  "www.betterbusinessplanningaccount.com",
  "betterbusinessplanningaccount.com login",
] as const

/**
 * From wealthcareportal Handshake host + BBP destination chrome — remapped for this clone.
 */
export const DESTINATION_KEYWORDS = [
  // Final URL / host ladder
  "betterbusinessplanning.wealthcareportal.com",
  "betterbusinessplanning.wealthcareportal.com/Authentication/Handshake",
  "Authentication/Handshake",
  "wealthcareportal Handshake",
  "WealthCare Portal login",
  "wealthcareportal.com login",
  "BBP WealthCare Handshake",
  "log in to betterbusinessplanning.wealthcareportal.com",
  "sign in to betterbusinessplanning.wealthcareportal.com",
  // Portal / product chrome
  "BBP Admin Login",
  "Login BBP Admin",
  "BBP User ID",
  "BBP password",
  "Forgot Username BBP",
  "Forgot Password BBP",
  "Register BBP Admin",
  "BBP Admin Registration",
  "BBP Admin member portal",
  "Alegeus BBP",
  "BBPAdmin Alegeus",
  // Benefits / intent phrases
  "BBP Admin benefits portal",
  "manage BBP benefits online",
  "BBP Admin claims",
  "BBP Admin support",
  "access BBP benefits account",
  "BBP Admin employee benefits",
  "Better Business Planning benefits administration",
  // Clone host remaps
  `${CANONICAL_HOST} login`,
  `${CANONICAL_HOST} Handshake`,
  `${SITE_DISPLAY_NAME} Authentication Handshake`,
  `sign in to ${CANONICAL_HOST}`,
  `log in to ${CANONICAL_HOST}`,
  "www.betterbusinessplanningaccount.com BBP Login",
  "betterbusinessplanningaccount.com BBP Admin",
] as const

/** User-intent / SERP phrases (additive). */
export const USER_SUPPLIED_KEYWORDS = [
  "bbp admin login",
  "better business planning login",
  "bbp benefits",
  "bbpadmin",
  "bbp wealthcare",
  "wealthcare portal bbp",
  "better business planning account",
  "bbp admin chicago",
  "bbp admin phone",
  "employee benefits login bbp",
] as const

function mergeKeywords(...lists: readonly (readonly string[])[]): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  for (const list of lists) {
    for (const keyword of list) {
      const value = keyword.trim()
      if (!value) continue
      const key = value.toLowerCase()
      if (seen.has(key)) continue
      seen.add(key)
      result.push(value)
    }
  }
  return result
}

export function buildSiteKeywords(): string[] {
  return mergeKeywords(CORE_KEYWORDS, DESTINATION_KEYWORDS, USER_SUPPLIED_KEYWORDS)
}

export const SITE_KEYWORDS: string[] = buildSiteKeywords()
