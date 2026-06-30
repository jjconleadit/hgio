'use client';

import Link from 'next/link';
import ApplyForm from './ApplyForm';

export default function ApplySection({ refFromUrl }) {
  return (
    <section id="apply" className="px-5 py-20 sm:py-28 max-w-2xl mx-auto">
      <div className="text-center mb-10">
        <p className="font-mono text-xs text-riot mb-3">WHITELIST</p>
        <h2 className="font-display text-3xl sm:text-4xl mb-3">apply f0r WL</h2>
        <p className="font-body text-sm sm:text-base text-ink/60 max-w-md mx-auto">
          f0ur quick tasks, then y0u&rsquo;re in the queue.
        </p>
      </div>

      <ApplyForm refFromUrl={refFromUrl} />

      <div className="mt-6 text-center border-t border-ink/15 pt-6">
        <p className="font-mono text-xs text-ink/50">
          want pri0rity?{' '}
          <Link href="/studio" className="text-riot underline hover:no-underline">
            make s0mething at r00mba studi0
          </Link>{' '}
          &mdash; l0ud creative w0rk gets bumped up the line.
        </p>
      </div>
    </section>
  );
}
