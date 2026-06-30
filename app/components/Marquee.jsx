'use client';

const MESSAGES = [
  'WL CL0SES WHEN IT CL0SES',
  '10,000 r00mbas. N0T 10,001.',
  'Y0U HAD TIME',
  'ST0P REFRESHING AND APPLY',
  'r00mba_ IS WATCHING Y0UR TIMELINE',
];

export default function Marquee() {
  const loop = [...MESSAGES, ...MESSAGES];
  return (
    <div className="border-y border-ink bg-ink text-paper overflow-hidden py-3 select-none">
      <div className="flex whitespace-nowrap animate-marquee">
        {loop.map((m, i) => (
          <span key={i} className="font-mono text-xs sm:text-sm mx-6 tracking-wide opacity-90">
            {m} <span className="text-riot mx-2">&bull;</span>
          </span>
        ))}
      </div>
    </div>
  );
}
