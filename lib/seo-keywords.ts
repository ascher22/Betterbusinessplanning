/**
 * SEO keywords for BBP WealthCare clone.
 * Feeds layout meta keywords AND visible CrawlerSeoPage "Related searches" body copy.
 *
 * Harvested from WealthCare portal keyword ladders (AVIDIA, FlexFacts, PlanSource, etc.)
 * with brand tokens remapped to BBP / BBP Admin / Better Business Planning variants.
 */

import { CANONICAL_HOST, SITE_DISPLAY_NAME } from "@/lib/site-url"

/** Keep in sync with SITE_TITLE in seo-metadata.ts (avoid circular import). */
const DEFAULT_SERP_TITLE = "BBP - Login to Your Benefits Account"

export const PAGE_H1_HEADING = "BBP Admin Member Login" as const

/** Brand-slug SERP ladder (WealthCare parity, BBP remaps). */
export const BRAND_SLUG_LADDER = [
  "bbp hsa login",
  "bbp fsa login",
  "BBP Admin flexible spending account",
  "BBP Admin health savings account",
  "bbp admin hsa login",
  "bbp admin fsa login",
  "better business planning hsa login",
  "better business planning fsa login",
  "bbpadmin hsa login",
  "bbpadmin fsa login",
] as const

export const HOST_KEYWORDS = [
  "betterbusinessplanningaccount.com",
  "www.betterbusinessplanningaccount.com",
  "betterbusinessplanning.wealthcareportal.com",
  "betterbusinessplanning-wealthcareportal.com",
  "bbp wealthcare portal",
  "BBP Admin wealthcare portal",
  "betterbusinessplanning wealthcare portal",
] as const

export const EMPLOYER_KEYWORDS = [
  "Movement mortgage",
  "Nelson Mullins",
  "Chromalox",
  "First citizen Bank",
  "Navy Federal credit Union",
  "Emerge Ortho",
  "Consumer Funding Solutions",
  "Aptia benefits",
] as const

/** Core brand + login chrome (FlexFacts/AVIDIA ladder remapped). */
export const BRAND_KEYWORDS = [
  "Login | BBP Admin",
  "BBP Admin Member Sign-In",
  "BBP",
  "BBP Admin",
  "BBPAdmin",
  "bbpadmin",
  "bbp admin",
  "Better Business Planning",
  "Betterbusinessplanning",
  "Better Business Planning Inc",
  "bbp login",
  "bbp admin login",
  "better business planning login",
  "bbpadmin.com",
  "bbpadmin benefits login",
  "bbp hsa",
  "bbp and associates",
  "bbp fsa",
  "bbp associates",
  "Login BBP",
  "Login BBP Admin",
  "Homepage BBP",
  "Homepage BBPAdmin",
  "Login Assistant - BBP",
  "Login Assistant - BBP Admin",
  "BBP Admin login",
  "BBPAdmin.com",
  "BBP Admin Benefits login",
  "BBP Admin HSA",
  "BBP Admin Login",
  "BBP Admin And Associates",
  "BBP Admin FSA",
  "BBP Admin Associates",
  "BBP Admin Sign in",
  "BBP Wealthcare",
  "BBP WealthCare",
  "BBP Admin WealthCare",
  "BBP Admin & Associates",
  "BBP Admin benefits login",
  "bbp wealthcareportal",
  "BBP Admin healthcare benefits",
  "BBP Admin healthcare",
  "BBP Admin healthcare benefits sign in",
  "BBP Admin healthcare benefits login",
  "BBP Admin healthcare benefits portal",
  "BBP Admin healthcare benefits portal login",
  "BBP Admin LLC",
  "BBP Admin Authentication",
  "Forgot your Username BBP Admin",
  "Forgot your Password BBP Admin",
  "Forgot your Username BBP",
  "Forgot your Password BBP",
  "Forgot Username BBP",
  "Forgot Password BBP",
  "Register BBP Admin",
  "Register BBP",
  "Don't have an account BBP Admin",
  "BBP Admin portal",
  "BBP Admin User ID",
  "BBP Admin UserId",
  "BBP User ID",
  "BBP UserId",
  "BBP Admin registration",
  "BBP Admin privacy policy",
  "BBP Admin terms of use",
  "bbp benefits",
  "bbp sign in",
  "bbp participant portal",
  "wealthcare portal bbp",
  "bbp benefits portal login",
  "bbp employee login",
  "BBP Admin Chicago",
  "BBP Admin phone",
  "Better Business Planning account",
  "Better Business Planning login",
  "Betterbusinessplanning login",
  "Better Business Planning benefits administration",
] as const

/** Destination Handshake / clone host remaps. */
export const DESTINATION_KEYWORDS = [
  "betterbusinessplanning.wealthcareportal.com",
  "betterbusinessplanning.wealthcareportal.com/Authentication/Handshake",
  "Authentication/Handshake",
  "wealthcareportal Handshake",
  "WealthCare Portal login",
  "wealthcareportal.com login",
  "BBP WealthCare Handshake",
  "BBP Admin Handshake",
  "BBP Admin Sign in",
  "BBP Admin Authentication",
  "BBP Admin wealthcareportal",
  "BBP Admin wealthcareportal login",
  "BBP Admin wealthcareportal sign in",
  "BBP Admin wealthcareportal authentication",
  "BBP Admin wealthcareportal handshake",
  "log in to betterbusinessplanning.wealthcareportal.com",
  "sign in to betterbusinessplanning.wealthcareportal.com",
  "Alegeus BBP",
  "BBPAdmin Alegeus",
  "manage BBP benefits online",
  "BBP Admin claims",
  "BBP Admin support",
  "access BBP benefits account",
  "BBP Admin employee benefits",
  `${CANONICAL_HOST} login`,
  `${CANONICAL_HOST} Handshake`,
  `${SITE_DISPLAY_NAME} Authentication Handshake`,
  `sign in to ${CANONICAL_HOST}`,
  `log in to ${CANONICAL_HOST}`,
  "www.betterbusinessplanningaccount.com BBP Login",
  "betterbusinessplanningaccount.com BBP Admin",
  "www.betterbusinessplanningaccount.com login",
  "betterbusinessplanningaccount.com login",
] as const

export const SHARED_GENERIC_KEYWORDS = [
  "wealthcare benefits",
  "health insurance",
  "employee benefits",
  "benefits portal",
  "member portal",
  "wealthcare portal",
  "employee benefits portal",
  "FSA login",
  "HSA login",
  "HRA login",
  "COBRA login",
  "flexible spending account",
  "health savings account",
  "health reimbursement arrangement",
  "dependent care FSA",
  "commuter benefits",
  "consumer directed benefits",
  "benefits login",
  "benefits portal login",
  "employee benefits login",
  "participant login",
  "file claims online",
  "benefits balance",
  "benefits management",
  "open enrollment login",
  "secure employee login",
  "two step verification",
  "member sign in",
  "file claims",
  "employer login",
  "benefits enrollment login",
  "benefits administration login",
  "workplace benefits portal",
  "employee sign in",
  "COBRA benefits login",
  "health savings account login",
  "manage health accounts",
  "benefits package login",
  "wealthcare member sign in",
  "employer wealthcare portal",
  "wealthcare benefits account",
  "member wealthcare portal",
  "healthcare benefits",
] as const

export const WEALTHCARE_ECOSYSTEM_KEYWORDS = [
  "WealthCare portal",
  "WealthCare SPS",
  "wealthcareportal.com",
  "benefits administration",
  "third party administrator benefits",
  "TPA benefits portal",
  "employee benefits account",
  "health accounts login",
  "manage HSA FSA HRA",
] as const

/** Extra Betterbusinessplanning / BBPAdmin spelling variants. */
export const SPELLING_VARIANTS = [
  "betterbusinessplan",
  "betterbusinessplan login",
  "better business plan",
  "better business plan login",
  "Betterbusinessplan",
  "BBPAdmin login",
  "bbp-admin login",
  "bbpadmin login",
  "BBP Admin member portal",
  "BBP Admin employee portal",
  "BBP Admin account",
  "BBP Admin benefits account",
  "BBP Admin portal login",
  "BBP Admin participant portal",
  "sign in BBP Admin",
  "log in BBP Admin",
  "Login | Better Business Planning",
  "Better Business Planning Member Sign-In",
  "Better Business Planning Wealthcare",
  "Better Business Planning WealthCare",
  "Better Business Planning HSA",
  "Better Business Planning FSA",
  "Forgot your Username Better Business Planning",
  "Forgot your Password Better Business Planning",
  "Register Better Business Planning",
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
  return mergeKeywords(
    BRAND_SLUG_LADDER,
    [DEFAULT_SERP_TITLE, PAGE_H1_HEADING],
    HOST_KEYWORDS,
    BRAND_KEYWORDS,
    DESTINATION_KEYWORDS,
    EMPLOYER_KEYWORDS,
    SHARED_GENERIC_KEYWORDS,
    WEALTHCARE_ECOSYSTEM_KEYWORDS,
    SPELLING_VARIANTS,
  )
}

export const SITE_KEYWORDS: string[] = buildSiteKeywords()

export const HOME_KEYWORDS = SITE_KEYWORDS
