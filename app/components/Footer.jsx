export default function Footer() {
  return (
    <footer className="border-t-2 border-ink px-5 py-10 mt-10">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="font-display text-lg">r00mba</div>
        <p className="font-mono text-xs text-ink/50 text-center">
          10,000 r00mbas. just d0n&rsquo;t miss this 0ne.
        </p>
        <a
          href="https://x.com/r00mba_"
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-xs border border-ink rounded-md px-4 py-2 hover:bg-ink hover:text-paper transition-colors duration-150"
        >
          @r00mba_ ↗
        </a>
      </div>
    </footer>
  );
}
