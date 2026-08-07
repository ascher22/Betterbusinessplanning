"use client"

import { Button } from "@/components/ui/button"
import { BBP_SECONDARY_BUTTON_CLASS } from "@/lib/wealthcare-button-styles"
import { ArrowLeft } from "lucide-react"

export function BackButton() {
  return (
    <Button
      className={`${BBP_SECONDARY_BUTTON_CLASS} px-8 py-6 min-w-[140px] cursor-pointer`}
      onClick={() => (typeof window !== "undefined" ? window.history.back() : undefined)}
    >
      <ArrowLeft className="w-5 h-5 mr-2" />
      BACK
    </Button>
  )
}
