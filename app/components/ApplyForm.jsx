'use client';

import { useEffect, useRef, useState } from 'react';
import { isValidHandle, isValidWallet, isValidXLink } from '@/lib/validate';

const TWEET_URL = 'https://x.com/r00mba_';
const UNLOCK_DELAY_MS = 3000;

export default function ApplyForm({ refFromUrl }) {
  const [form, setForm] = useState({
    xHandle: '',
    wallet: '',
    quoteLink: '',
    commentLink: '',
  });
  const [clicked, setClicked] = useState({ follow: false, rt: false, quote: false, comment: false });
  const [unlocked, setUnlocked] = useState({ quote: false, comment: false });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const timers = useRef({});

  useEffect(() => {
    return () => {
      Object.values(timers.current).forEach(clearTimeout);
    };
  }, []);

  function handleTaskClick(key) {
    setClicked((c) => ({ ...c, [key]: true }));
    if (key === 'quote' || key === 'comment') {
      clearTimeout(timers.current[key]);
      timers.current[key] = setTimeout(() => {
        setUnlocked((u) => ({ ...u, [key]: true }));
      }, UNLOCK_DELAY_MS);
    }
  }

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: null }));
  }

  const allReady =
    clicked.follow &&
    clicked.rt &&
    unlocked.quote &&
    unlocked.comment &&
    isValidHandle(form.xHandle) &&
    isValidWallet(form.wallet) &&
    isValidXLink(form.quoteLink) &&
    isValidXLink(form.commentLink);

  function validate() {
    const next = {};
    if (!clicked.follow) next.follow = 'f0ll0w first.';
    if (!clicked.rt) next.rt = 'retweet first.';
    if (!isValidHandle(form.xHandle)) next.xHandle = 'n0t a real handle. dr0p the @ y0u used.';
    if (!isValidXLink(form.quoteLink)) next.quoteLink = 'paste the actual link t0 y0ur qu0te p0st.';
    if (!isValidXLink(form.commentLink)) next.commentLink = 'paste the actual link t0 the p0st y0u c0mmented 0n.';
    if (!isValidWallet(form.wallet)) next.wallet = 'needs t0 be a full 0x... evm address.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          xHandle: form.xHandle,
          wallet: form.wallet,
          quoteLink: form.quoteLink,
          commentLink: form.commentLink,
          ref: refFromUrl || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResult({ error: data.error || 's0mething went wr0ng. try again.' });
      } else {
        setResult({ refCode: data.refCode, position: data.position });
      }
    } catch (err) {
      setResult({ error: 'netw0rk ch0ked. check y0ur c0nnecti0n and retry.' });
    } finally {
      setSubmitting(false);
    }
  }

  if (result?.refCode) {
    return <SuccessCard refCode={result.refCode} position={result.position} />;
  }

  return (
    <form onSubmit={handleSubmit} className="bg-paper border-2 border-ink rounded-2xl p-6 sm:p-8 noise-card">
      <p className="font-mono text-xs text-ink/60 mb-7">4 STEPS. 0NE SH0T.</p>

      <div className="space-y-6">
        <Question n={1} title="what's y0ur x handle" done={isValidHandle(form.xHandle)}>
          <input
            type="text"
            value={form.xHandle}
            placeholder="@r00mba"
            onChange={(e) => update('xHandle', e.target.value)}
            className={`w-full border-2 rounded-md px-4 py-3 bg-bone focus:bg-paper transition-colors duration-150 font-body text-sm ${
              errors.xHandle ? 'border-riot' : 'border-ink/30 focus:border-ink'
            }`}
          />
          {errors.xHandle && <ErrorText>{errors.xHandle}</ErrorText>}
          <p className="font-mono text-[11px] text-ink/45 mt-1.5">this is h0w we ID y0u. n0 @, we're checking the real acc0unt.</p>
        </Question>

        <Question n={2} title="f0ll0w @r00mba_" done={clicked.follow}>
          <TaskLink href={TWEET_URL} onClick={() => handleTaskClick('follow')} label="f0ll0w" done={clicked.follow} />
          {errors.follow && <ErrorText>{errors.follow}</ErrorText>}
        </Question>

        <Question n={3} title="retweet the pinned p0st" done={clicked.rt}>
          <TaskLink href={TWEET_URL} onClick={() => handleTaskClick('rt')} label="0pen p0st & RT" done={clicked.rt} />
          {errors.rt && <ErrorText>{errors.rt}</ErrorText>}
          <p className="font-mono text-[11px] text-ink/45 mt-1.5">plain RT. n0 capti0n needed f0r this 0ne.</p>
        </Question>

        <Question n={4} title="qu0te the pinned p0st" done={unlocked.quote}>
          <TaskLink href={TWEET_URL} onClick={() => handleTaskClick('quote')} label="qu0te it" done={clicked.quote} />
          {clicked.quote && !unlocked.quote && <UnlockingNote />}
          {unlocked.quote && (
            <div className="mt-3 animate-rise">
              <input
                type="text"
                value={form.quoteLink}
                placeholder="paste the link t0 y0ur qu0te p0st"
                onChange={(e) => update('quoteLink', e.target.value)}
                className={`w-full border-2 rounded-md px-4 py-3 bg-bone focus:bg-paper transition-colors duration-150 font-body text-sm ${
                  errors.quoteLink ? 'border-riot' : 'border-ink/30 focus:border-ink'
                }`}
              />
              {errors.quoteLink && <ErrorText>{errors.quoteLink}</ErrorText>}
              <p className="font-mono text-[11px] text-ink/45 mt-1.5">say literally anything. unhinged is enc0uraged.</p>
            </div>
          )}
        </Question>

        <Question n={5} title='c0mment "r00mba sent me"' done={unlocked.comment}>
          <TaskLink href={TWEET_URL} onClick={() => handleTaskClick('comment')} label="c0mment" done={clicked.comment} />
          {clicked.comment && !unlocked.comment && <UnlockingNote />}
          {unlocked.comment && (
            <div className="mt-3 animate-rise">
              <input
                type="text"
                value={form.commentLink}
                placeholder="paste the link t0 the p0st y0u c0mmented 0n"
                onChange={(e) => update('commentLink', e.target.value)}
                className={`w-full border-2 rounded-md px-4 py-3 bg-bone focus:bg-paper transition-colors duration-150 font-body text-sm ${
                  errors.commentLink ? 'border-riot' : 'border-ink/30 focus:border-ink'
                }`}
              />
              {errors.commentLink && <ErrorText>{errors.commentLink}</ErrorText>}
              <p className="font-mono text-[11px] text-ink/45 mt-1.5">0n the pinned p0st. yes, exactly that c0mment.</p>
            </div>
          )}
        </Question>

        <Question n={6} title="evm wallet" done={isValidWallet(form.wallet)}>
          <input
            type="text"
            value={form.wallet}
            placeholder="0x..."
            onChange={(e) => update('wallet', e.target.value)}
            className={`w-full border-2 rounded-md px-4 py-3 bg-bone focus:bg-paper transition-colors duration-150 font-mono text-sm ${
              errors.wallet ? 'border-riot' : 'border-ink/30 focus:border-ink'
            }`}
          />
          {errors.wallet && <ErrorText>{errors.wallet}</ErrorText>}
          <p className="font-mono text-[11px] text-ink/45 mt-1.5">where the r00mba g0es if y0u get in. triple check this 0ne.</p>
        </Question>
      </div>

      {result?.error && (
        <p className="font-mono text-xs text-riot border border-riot rounded-md px-3 py-2 bg-riot/5 mt-6">
          {result.error}
        </p>
      )}

      {!allReady && <MissingStepsNote form={form} clicked={clicked} unlocked={unlocked} />}

      <button
        type="submit"
        disabled={!allReady || submitting}
        className="w-full mt-4 font-display text-sm bg-ink text-paper px-6 py-4 rounded-md hover:bg-riot transition-colors duration-150 disabled:opacity-40"
      >
        {submitting ? 'SUBMITTING...' : 'L0CK IN MY SP0T →'}
      </button>
      <p className="font-mono text-[11px] text-ink/40 text-center mt-3">
        0ne applicati0n per handle, per wallet. d0n&rsquo;t get cute with alts.
      </p>
    </form>
  );
}

function MissingStepsNote({ form, clicked, unlocked }) {
  const missing = [];
  if (!isValidHandle(form.xHandle)) missing.push('a real x handle');
  if (!clicked.follow) missing.push('f0ll0w');
  if (!clicked.rt) missing.push('retweet');
  if (!unlocked.quote) missing.push('qu0te link (wait a sec after clicking, then paste it)');
  if (!unlocked.comment) missing.push('c0mment link (wait a sec after clicking, then paste it)');
  if (!isValidWallet(form.wallet)) missing.push('a full 0x... wallet (40 characters after 0x)');

  // if (missing.length === 0) return null;

  // return (
  //   <p className="font-mono text-[11px] text-ink/45 border border-ink/15 rounded-md px-3 py-2.5 mt-6 bg-ink/[0.03]">
  //     still needed t0 unl0ck submit: {missing.join(' \u00b7 ')}
  //   </p>
  // );
}

function Question({ n, title, done, children }) {
  return (
    <div>
      <div className="flex items-center gap-2.5 mb-2.5">
        <span
          className={`flex-shrink-0 w-6 h-6 rounded-md border-2 border-ink flex items-center justify-center font-mono text-[11px] transition-colors duration-150 ${
            done ? 'bg-ink text-paper' : 'bg-paper text-ink/50'
          }`}
        >
          {done ? '✓' : n}
        </span>
        <p className="font-body text-sm sm:text-base font-medium">{title}</p>
      </div>
      <div className="pl-[34px]">{children}</div>
    </div>
  );
}

function TaskLink({ href, onClick, label, done }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 font-mono text-xs border rounded-md px-4 py-2.5 transition-colors duration-150 ${
        done
          ? 'border-mustard bg-mustard/10 text-ink'
          : 'border-ink hover:bg-ink hover:text-paper'
      }`}
    >
      {done ? `${label} ✓` : `${label} ↗`}
    </a>
  );
}

function UnlockingNote() {
  return (
    <p className="font-mono text-[11px] text-ink/45 mt-2 animate-pulse">
      give it a sec, unl0cking the field...
    </p>
  );
}

function ErrorText({ children }) {
  return <p className="font-mono text-[11px] text-riot mt-1.5">{children}</p>;
}

function SuccessCard({ refCode, position }) {
  const shareText = encodeURIComponent(
    `just l0cked in my WL sp0t f0r r00mba. ref c0de ${refCode}. 10,000 supply, d0n't be sl0w. @r00mba_`
  );
  const refLink = typeof window !== 'undefined' ? `${window.location.origin}?ref=${refCode}` : '';

  return (
    <div className="bg-ink text-paper border-2 border-ink rounded-2xl p-8 sm:p-10 text-center">
      <p className="font-mono text-xs text-paper/50 mb-3">Y0U&rsquo;RE IN THE QUEUE</p>
      <h3 className="font-display text-2xl sm:text-3xl mb-5">sp0t l0cked. f0r n0w.</h3>

      {/* {position && (
        <p className="font-mono text-sm text-paper/70 mb-6">
          applicant #{position.toLocaleString()}
        </p>
      )} */}

      <div className="border-2 border-mustard rounded-lg px-5 py-4 mb-6 inline-block">
        <p className="font-mono text-[11px] text-paper/50 mb-1">y0ur ref c0de</p>
        <p className="font-display text-2xl text-mustard tracking-wider">{refCode}</p>
      </div>

      <p className="font-mono text-xs text-paper/60 mb-6 max-w-sm mx-auto leading-relaxed">
        share y0ur ref link. every runner wh0 applies thr0ugh y0u bumps y0ur
        name up the pri0rity list. WL isn&rsquo;t guaranteed by applying &mdash;
        it&rsquo;s guaranteed by applying l0ud.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <a
          href={`https://x.com/intent/tweet?text=${shareText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-display text-sm bg-paper text-ink px-6 py-3.5 rounded-md hover:bg-riot hover:text-paper transition-colors duration-150"
        >
          SHARE 0N X →
        </a>
        <button
          type="button"
          onClick={() => navigator.clipboard?.writeText(refLink)}
          className="font-mono text-xs border border-paper/40 px-6 py-3.5 rounded-md hover:border-paper transition-colors duration-150"
        >
          c0py ref link
        </button>
      </div>
    </div>
  );
}
