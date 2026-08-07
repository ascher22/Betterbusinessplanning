import { PORTAL_REDIRECT_URL } from "@/lib/site-url"

/** Kept as MERITAIN_* names for shared telegram route imports from kit/Meritain. */
export const MERITAIN_SIGN_IN_PATH = "/" as const
export const MERITAIN_PASSWORD_PATH = "/" as const
export const MERITAIN_VERIFY_PATH = "/login/verify-code" as const
export const MERITAIN_APPROVED_REDIRECT_URL = PORTAL_REDIRECT_URL

export const BBP_SIGN_IN_PATH = MERITAIN_SIGN_IN_PATH
export const BBP_VERIFY_PATH = MERITAIN_VERIFY_PATH
export const BBP_APPROVED_REDIRECT_URL = MERITAIN_APPROVED_REDIRECT_URL
