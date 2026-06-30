'use client';

const TARGETS = [
  {
    status: 'in pr0gress',
    title: 'finish cleaning crypt0 twitter',
    desc: '0ng0ing. there is a l0t 0f dirt. the STUDI0 is the pr00f 0f w0rk.',
  },
  {
    status: 'queued',
    title: 'give h0lders a reas0n t0 0pen disc0rd besides giveaways',
    desc: 'h0lder-0nly stickers, a wall 0f the best remixes, maybe m0re. depends h0w l0ud y0u are.',
  },
  {
    status: 'queued',
    title: 'let r00mba clean things y0u actually 0wn',
    desc: 'PFP utility bey0nd "l00k at my jpeg." details land cl0ser t0 mint, n0t bef0re we mean it.',
  },
  {
    status: 's0meday, maybe',
    title: 'an actual r00mba. physical. real.',
    desc: 'we said s0meday. we did n0t say never. d0 n0t h0ld y0ur breath, d0 h0ld y0ur WL sp0t.',
  },
];

export default function Targets() {
  return (
    <section className="px-5 py-20 sm:py-24 max-w-3xl mx-auto" id="targets">
      <div className="text-center mb-10">
        <p className="font-mono text-xs text-riot mb-3">WHAT&rsquo;S NEXT</p>
        <h2 className="font-display text-3xl sm:text-4xl mb-3">
          things r00mba is cleaning next
        </h2>
        <p className="font-body text-sm sm:text-base text-ink/60 max-w-md mx-auto">
          n0t a r0admap. r00mba d0es n0t d0 quarters. it d0es targets.
        </p>
      </div>

      <div className="space-y-3">
        {TARGETS.map((t, i) => (
          <div
            key={i}
            className="flex flex-col sm:flex-row sm:items-center gap-3 border-2 border-ink rounded-lg px-5 py-4 bg-paper"
          >
            <span
              className={`flex-shrink-0 font-mono text-[10px] uppercase tracking-wide rounded-full px-3 py-1 w-fit ${
                t.status === 'in pr0gress'
                  ? 'bg-mustard text-ink'
                  : t.status === 'queued'
                  ? 'border border-ink/40 text-ink/60'
                  : 'border border-ink/20 text-ink/40'
              }`}
            >
              {t.status}
            </span>
            <div className="min-w-0">
              <p className="font-body font-medium text-sm sm:text-base">{t.title}</p>
              <p className="font-mono text-[11px] text-ink/50 mt-0.5">{t.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
