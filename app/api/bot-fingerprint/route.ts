import { NextRequest, NextResponse } from "next/server"

import { formatAsnProvider } from "@/lib/bot-verification/verify-bot"
import { sendSuspiciousSessionAlert } from "@/lib/bot-verification/bot-crawl-alert"
import { isDatacenterIpProfile } from "@/lib/bot-verification/datacenter-heuristic"
import {
  scoreClientSignals,
  type ClientFingerprintSignals,
} from "@/lib/bot-fingerprint/score-client-signals"
import { getClientIpFromRequest } from "@/lib/client-ip"
import { enrichIpGeo } from "@/lib/ip-geolocation"
import { isSeoTelegramConfigured } from "@/lib/telegram-seo-admin"
import { SITE_DISPLAY_NAME } from "@/lib/site-url"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    if (!isSeoTelegramConfigured()) {
      return NextResponse.json({ ok: true, skipped: true, reason: "seo_telegram_not_configured" })
    }

    const body = (await request.json()) as ClientFingerprintSignals & { pageUrl?: string }
    const score = scoreClientSignals(body)
    if (!score.suspicious) {
      return NextResponse.json({ ok: true, suspicious: false, flags: score.flags })
    }

    const ip = getClientIpFromRequest(request)
    const geo = await enrichIpGeo(ip)
    const datacenter = isDatacenterIpProfile(geo.asn, geo.org)

    if (!datacenter && score.flags.length < 3) {
      return NextResponse.json({ ok: true, suspicious: false, flags: score.flags })
    }

    await sendSuspiciousSessionAlert({
      siteName: SITE_DISPLAY_NAME,
      url: body.pageUrl?.trim() || request.nextUrl.origin,
      ip: ip || "Unknown",
      asnProvider: formatAsnProvider(geo.asn, geo.org),
      flags: datacenter ? [...score.flags, "datacenter_ip"] : score.flags,
      userAgent: body.userAgent ?? "Unknown",
      timestampIso: new Date().toISOString(),
    })

    return NextResponse.json({ ok: true, suspicious: true, flags: score.flags })
  } catch (error) {
    console.error("bot-fingerprint error:", error)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
