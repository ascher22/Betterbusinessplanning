import { NextResponse } from "next/server"

import { EXTERNAL_SUCCESS_URL } from "@/lib/site-url"

export async function GET() {
  const redirectUrl = EXTERNAL_SUCCESS_URL
  const safeUrl = redirectUrl.replace(/"/g, "&quot;").replace(/</g, "&lt;")
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><meta http-equiv="refresh" content="0;url=${safeUrl}"/><script>window.top.location.href=${JSON.stringify(redirectUrl)};</script></head><body>Redirecting…</body></html>`
  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate",
      Pragma: "no-cache",
    },
  })
}
