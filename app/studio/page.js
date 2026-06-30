'use client';

import { useState } from 'react';
import Studio from '../components/Studio';
import Nav from '../components/Nav';
import { isValidHandle } from '@/lib/validate';

export default function StudioPage() {
  const [handle, setHandle] = useState('');
  const [submittedHandle, setSubmittedHandle] = useState(null);
  const [error, setError] = useState(null);

  function handleSubmit(e) {
    e.preventDefault();
    if (!isValidHandle(handle)) {
      setError('drop a real @ handle, n0 spaces 0r symb0ls.');
      return;
    }
    setSubmittedHandle(handle.replace(/^@/, ''));
  }

  return (
    <main className="min-h-screen">
      <Nav />
      <div className="px-4 sm:px-5 py-10 sm:py-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 sm:mb-10">
            <p className="font-mono text-xs text-riot mb-3">R00MBA STUDI0</p>
            <h1 className="font-display text-3xl sm:text-5xl mb-3">
              remix 0ne. make it y0urs. p0st it.
            </h1>
            <p className="font-body text-sm sm:text-base text-ink/60 max-w-lg mx-auto leading-relaxed">
              pick a unit, run it thr0ugh the c0l0rway dial, give it a line t0
              say, d0wnl0ad it. l0ud creative w0rk
              gets pri0rity when applicati0ns are reviewed.
            </p>
          </div>

          {!submittedHandle ? (
            <div className="max-w-sm mx-auto bg-paper border-2 border-ink rounded-2xl p-6 sm:p-8 noise-card">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block font-mono text-[11px] text-ink/60 mb-1.5">
                    y0ur x handle
                  </label>
                  <input
                    type="text"
                    value={handle}
                    onChange={(e) => {
                      setHandle(e.target.value);
                      setError(null);
                    }}
                    placeholder="@r00mba"
                    className={`w-full border-2 rounded-md px-4 py-3 bg-bone focus:bg-paper transition-colors duration-150 font-body text-sm ${
                      error ? 'border-riot' : 'border-ink/30 focus:border-ink'
                    }`}
                  />
                  {error && <p className="font-mono text-[11px] text-riot mt-1.5">{error}</p>}
                  <p className="font-mono text-[11px] text-ink/45 mt-1.5">
                    s0 we kn0w wh0 made it when it&rsquo;s time t0 hand 0ut pri0rity.
                  </p>
                </div>
                <button
                  type="submit"
                  className="w-full font-display text-sm bg-ink text-paper px-6 py-4 rounded-md hover:bg-riot transition-colors duration-150"
                >
                  START CREATING &rarr;
                </button>
              </form>
            </div>
          ) : (
            <>
              <p className="text-center font-mono text-xs text-ink/50 mb-6">
                creating as <span className="text-ink font-semibold">@{submittedHandle}</span>
              </p>
              <Studio xHandle={submittedHandle} />
            </>
          )}
        </div>
      </div>
    </main>
  );
}
