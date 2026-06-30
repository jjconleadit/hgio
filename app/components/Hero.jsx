'use client';

import { useEffect, useState } from 'react';

export default function Hero({ onApplyClick, count }) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 250);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="relative px-5 pt-28 pb-20 sm:pt-36 sm:pb-28 overflow-hidden">
      <div className="max-w-4xl mx-auto text-center">
        {/* <div className="inline-flex items-center gap-2 border border-ink/30 rounded-full px-4 py-1.5 mb-8 font-mono text-xs sm:text-sm tracking-wide bg-paper/60">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-riot opacity-75 animate-ping" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-riot" />
          </span>
          wl 0pen &middot; 10,000 supply &middot; @r00mba_
        </div> */}

        <h1 className="font-display leading-[0.95] tracking-tight text-[12vw] sm:text-6xl md:text-7xl">
          <span
            className={`block text-[#FF0000] ${
              revealed ? 'opacity-100' : 'opacity-0'
            }`}
          >
            t̶h̶e̶ ̶1̶0̶,̶0̶0̶0̶ ̶r̶u̶n̶n̶e̶r̶ ̶y̶0̶u̶ ̶m̶i̶s̶s̶e̶d̶.̶
          </span>
          <span className="block text-ink mt-2">
            the <span className="text-[#008000]">next 10,000 </span>runner you are about to miss.
          </span>
        </h1>

        <p className="font-body text-base sm:text-lg text-ink/70 max-w-xl mx-auto mt-7 leading-relaxed">
          10,000 r00mbas. every 0ne 0f them has been quietly crawling ar0und
          crypt0 twitter since bef0re y0u knew the name. y0u kn0w h0w this
          ends if y0u wait. r00mba d0esn&rsquo;t
          f0rget wh0 waited.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onApplyClick}
            className="font-display text-sm sm:text-base bg-ink text-paper px-8 py-4 rounded-md hover:bg-riot transition-colors duration-150 w-full sm:w-auto"
          >
            APPLY F0R WL &rarr;
          </button>
          <a
            href="https://x.com/r00mba_"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-sm border border-ink/40 px-8 py-4 rounded-md hover:border-ink hover:bg-ink/5 transition-colors duration-150 w-full sm:w-auto text-center"
          >
            f0ll0w @r00mba_
          </a>
        </div>

        {/* <p className="font-mono text-xs text-ink/50 mt-6">
          {count !== null ? (
            <>
              <span className="text-ink font-semibold">{count.toLocaleString()}</span> runners
              already in. {count >= 9500 ? 'it is alm0st 0ver.' : 'sp0ts are n0t infinite. 0bvi0usly.'}
            </>
          ) : (
            'c0unting runners...'
          )}
        </p> */}
      </div>
    </section>
  );
}
