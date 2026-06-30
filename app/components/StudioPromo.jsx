'use client';

import { useState } from 'react';
import Link from 'next/link';

const PREVIEW_ARTS = ['/art/r00mba_995.png', '/art/r00mba_817.png', '/art/r00mba_209.png'];

export default function StudioPromo() {
  const [hoverIdx, setHoverIdx] = useState(null);

  return (
    <section className="px-5 py-20 sm:py-24 max-w-4xl mx-auto" id="studio-promo">
      <div className="bg-ink text-paper rounded-2xl p-8 sm:p-12 text-center relative overflow-hidden">
        <p className="font-mono text-xs text-mustard mb-3">R00MBA STUDI0</p>
        <h2 className="font-display text-3xl sm:text-4xl mb-4">
          remix 0ne. make it y0urs. p0st it.
        </h2>
        <p className="font-body text-sm sm:text-base text-paper/70 max-w-md mx-auto mb-7 leading-relaxed">
          rec0l0r a r00mba, give it a line t0 say, d0wnl0ad it. l0ud creative w0rk gets pri0rity 0n the WL.
        </p>

        <div className="flex justify-center gap-3 mb-8">
          {PREVIEW_ARTS.map((src, i) => (
            <div
              key={src}
              onMouseEnter={() => setHoverIdx(i)}
              onMouseLeave={() => setHoverIdx(null)}
              className={`w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden border-2 border-paper/30 transition-transform duration-200 ${
                hoverIdx === i ? 'scale-110 border-riot' : ''
              }`}
            >
              <img src={src} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>

        <Link
          href="/studio"
          className="inline-block font-display text-sm bg-paper text-ink px-8 py-4 rounded-md hover:bg-riot hover:text-paper transition-colors duration-150"
        >
          0PEN THE STUDI0 &rarr;
        </Link>
      </div>
    </section>
  );
}
