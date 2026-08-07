/** BBP WealthCare portal button chrome (navy / blue brand). */

export const WEALTHCARE_BUTTON_BORDER = "border border-[#bec5c2] rounded-none" as const

export const WEALTHCARE_PRIMARY_BUTTON_SHADOW =
  "shadow-[0_0_3px_0_#141c4d]" as const

export const WEALTHCARE_NEUTRAL_BUTTON_SHADOW =
  "shadow-[0_0_3px_0_#bec5c2]" as const

export const WEALTHCARE_BUTTON_CHROME = [
  WEALTHCARE_BUTTON_BORDER,
  WEALTHCARE_PRIMARY_BUTTON_SHADOW,
].join(" ")

export const WEALTHCARE_NEUTRAL_BUTTON_CLASS = [
  WEALTHCARE_BUTTON_BORDER,
  WEALTHCARE_NEUTRAL_BUTTON_SHADOW,
].join(" ")

/** Primary action (Sign In, E-MAIL, TEXT, VERIFY, Next). */
export const BBP_PRIMARY_BUTTON_CLASS = [
  "bg-[#141c4d] hover:bg-[#407ec9] text-white transition-colors rounded-none disabled:opacity-70",
  WEALTHCARE_BUTTON_CHROME,
].join(" ")

/** Secondary action (Register, BACK, CANCEL). */
export const BBP_SECONDARY_BUTTON_CLASS = [
  "bg-[#407ec9] hover:bg-[#141c4d] text-white transition-colors rounded-none disabled:opacity-70",
  WEALTHCARE_NEUTRAL_BUTTON_CLASS,
].join(" ")
