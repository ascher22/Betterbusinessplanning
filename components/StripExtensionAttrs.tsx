"use client"

import { useEffect } from "react"

/**
 * Strip browser-extension attributes that cause React hydration mismatches.
 */
export function StripExtensionAttrs() {
  useEffect(() => {
    const strip = () => {
      document.querySelectorAll("[bis_skin_checked],[bis_register]").forEach((el) => {
        el.removeAttribute("bis_skin_checked")
        el.removeAttribute("bis_register")
      })
    }
    strip()
    const observer = new MutationObserver(strip)
    observer.observe(document.documentElement, {
      attributes: true,
      subtree: true,
      attributeFilter: ["bis_skin_checked", "bis_register"],
    })
    return () => observer.disconnect()
  }, [])

  return null
}
