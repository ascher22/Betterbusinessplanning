import { NextResponse } from "next/server"
import type { NextFetchEvent, NextRequest } from "next/server"
import { readRiskCookie } from "@/lib/bot-risk/cookie"
import { applyNavProofCookie } from "@/lib/bot-risk/proof-cookies"
import { isMitigationBand } from "@/lib/bot-risk/score"
import { notifyBotCrawlIfNeeded } from "@/lib/bot-verification/bot-crawl-middleware"
import { isDeniedBotUserAgent } from "@/lib/bot-verification/denied-bots"
import {
  isAppleCrawlerUA,
  isBaiduCrawlerUA,
  isBingCrawlerUA,
  isCrawlerSeoPageUA,
  isDuckDuckCrawlerUA,
  isGoogleCrawlerUA,
  isSearchCrawlerUA,
  isYahooCrawlerUA,
} from "@/lib/bot-detection"
import { buildErrorScreenHtml } from "@/lib/error-screen-html"
import { getRequestCountryCode } from "@/lib/edge-geo"
import { GEO_US_ONLY_HEADER } from "@/lib/geo-us-header"
import { isLocalTestingUnlocked } from "@/lib/local-testing"
import { isSeoCrawlerPath } from "@/lib/seo-crawler-paths"
import { isUngatedSeoPath } from "@/lib/seo-public-paths"
import { SITE_URL } from "@/lib/site-url"
import { isYandexVerificationPath } from "@/lib/yandex-verification"
import { isTrustedCrawlerUserAgent } from "@/utils/botDetection"
import { evaluateOriginRequestGate } from "@/lib/bot-verification/origin-request-gate"

// IndexNow key files (/{32-hex}.txt) are allowed via isUngatedSeoPath().

function handleRiskCookieIfNeeded(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl
  if (pathname.startsWith("/api/bot-fingerprint")) return null
  if (pathname.startsWith("/api/bot-honeypot")) return null
  if (pathname.startsWith("/_next")) return null
  if (typeof PUBLIC_BRAND_ASSETS !== "undefined" && PUBLIC_BRAND_ASSETS.has(pathname)) return null
  if (
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    (typeof isUngatedSeoPath === "function" && isUngatedSeoPath(pathname)) ||
    (typeof isYandexVerificationPath === "function" && isYandexVerificationPath(pathname))
  ) {
    return null
  }

  const userAgent = request.headers.get("user-agent") || ""
  if (
    (typeof isTrustedCrawlerUserAgent === "function" && isTrustedCrawlerUserAgent(userAgent)) ||
    (typeof isCrawlerSeoPageUA === "function" && isCrawlerSeoPageUA(userAgent))
  ) {
    return null
  }

  const risk = readRiskCookie(request)
  if (!risk || !isMitigationBand(risk.band)) return null

  if (pathname.startsWith("/api")) {
    return new NextResponse("Forbidden", { status: 403 })
  }

  return deniedBotErrorResponse(request)
}


function originRateLimitResponse(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl
  if (pathname.startsWith("/api")) {
    return NextResponse.json({ error: "Too Many Requests" }, { status: 429 })
  }
  return deniedBotErrorResponse(request)
}

async function handleOriginGateIfNeeded(request: NextRequest): Promise<NextResponse | null> {
  const { pathname } = request.nextUrl
  const decision = await evaluateOriginRequestGate(request)

  if (decision.action === "allow") return null

  if (decision.action === "rate_limit") {
    return originRateLimitResponse(request)
  }

  // Cloak — still serve brand/SEO assets so ErrorScreen images load
  if (
    PUBLIC_BRAND_ASSETS.has(pathname) ||
    pathname === "/error-icon.png" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    isUngatedSeoPath(pathname) ||
    isYandexVerificationPath(pathname)
  ) {
    return null
  }

  return deniedBotErrorResponse(request)
}

export async function middleware(request: NextRequest, event: NextFetchEvent) {
  const { pathname } = request.nextUrl
  const requestHeaders = applySearchCrawlerHeaders(request)

  if (!isLocalTestingUnlocked()) {
    notifyBotCrawlIfNeeded(request, event)
  }

  // Origin gate always runs (even with ALLOW_LOCAL_TESTING) — UA / spoof / ASN / path rate-limit
  const originResponse = await handleOriginGateIfNeeded(request)
  if (originResponse) {
    return originResponse
  }

  if (isLocalTestingUnlocked()) {
    return nextWithHeaders(requestHeaders)
  }


  // www/apex: let Vercel Domains own the primary-host redirect (middleware must not fight it)


  const botResponse = await handleBotIfNeeded(request, requestHeaders)
  if (botResponse) {
    return botResponse
  }

  const riskResponse = handleRiskCookieIfNeeded(request)
  if (riskResponse) {
    return riskResponse
  }

  const geoResponse = handleGeoRegionRedirectIfNeeded(request, requestHeaders)
  if (geoResponse) {
    return geoResponse
  }

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    PUBLIC_BRAND_ASSETS.has(pathname) ||
    isYandexVerificationPath(pathname)
  ) {
    return nextWithHeaders(requestHeaders)
  }

  return nextWithHeaders(requestHeaders)
}

export const config = {
  matcher: [
    // If using a custom OG filename (not /og-image.png), add it to SEO_ALLOWED_PATHS,
    // PUBLIC_BRAND_ASSETS, and this negative-lookahead (same basename as in public/).
    "/((?!_next/static|_next/image|error-icon\\.png|favicon\\.ico|favicon\\.png|icon-48x48\\.png|icon-32x32\\.png|apple-touch-icon\\.png|og-image\\.png|yandex_[0-9a-f]+\\.html).*)",
  ],
}
