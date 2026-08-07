import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-[#e1e1e1] py-6 px-6 mt-auto" role="contentinfo">
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-4 text-center">
        {/* Row 1: Nav links */}
        <nav className="flex flex-wrap justify-center items-center gap-4 sm:gap-6" aria-label="Footer navigation">
          <Link
            href="/api/login-out"
            className="text-xs sm:text-sm text-gray-800 hover:text-gray-900 uppercase tracking-wide"
          >
            ABOUT US
          </Link>
          <Link
            href="/api/login-out"
            className="text-xs sm:text-sm text-gray-800 hover:text-gray-900 uppercase tracking-wide"
          >
            TERMS OF USE
          </Link>
          <Link
            href="/api/login-out"
            className="text-xs sm:text-sm text-gray-800 hover:text-gray-900 uppercase tracking-wide"
          >
            PRIVACY POLICY
          </Link>
        </nav>
        {/* Row 2: Copyright */}
        <p className="text-xs text-gray-800">
          Copyright © 2024 Better Business Planning, Inc.
        </p>
        {/* Row 3: Address & contact */}
        <p className="text-xs text-gray-800 leading-relaxed">
          BBPAdmin | P.O. Box 736230 | Chicago, Illinois 60673-6230 | Phone: (630) 773-2317 | Fax: (630) 775-8568
        </p>
        <p className="text-xs text-gray-800">
          Support question email: support@bbpadmin.com
        </p>
        <p className="text-xs text-gray-800">
          Claims email: claims@bbpadmin.com
        </p>
        <p className="text-xs text-gray-800">
          All Rights Reserved.
        </p>
        {/* Row 4: Site Map */}
        <p className="text-center">
          <Link
            href="/api/login-out"
            className="text-xs text-gray-800 hover:text-gray-900 uppercase tracking-wide"
          >
            SITE MAP
          </Link>
        </p>
      </div>
    </footer>
  )
}
