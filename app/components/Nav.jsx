'use client';

import Link from 'next/link';

export default function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b-2 border-ink bg-bone/90 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-5 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-display text-lg sm:text-xl tracking-tight">
          <img
            src="/logo-mark.png"
            alt=""
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-ink object-cover"
          />
          r00mba
        </Link>

        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/"
            className="font-mono text-xs sm:text-sm border border-ink/30 rounded-md px-3 sm:px-4 py-2 hover:border-ink hover:bg-ink/5 transition-colors duration-150"
          >
            h0me
          </Link>
          <Link
            href="/studio"
            className="font-mono text-xs sm:text-sm border border-ink/30 rounded-md px-3 sm:px-4 py-2 hover:border-ink hover:bg-ink/5 transition-colors duration-150"
          >
            studi0
          </Link>
          <Link
            href="/apply"
            className="font-display text-xs sm:text-sm bg-ink text-paper rounded-md px-3 sm:px-4 py-2 hover:bg-riot transition-colors duration-150"
          >
            apply
          </Link>
        </nav>
      </div>
    </header>
  );
}
