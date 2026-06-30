'use client';

import { useEffect, useState } from 'react';
import Hero from './Hero';
import Marquee from './Marquee';
import StudioPromo from './StudioPromo';
import Targets from './Targets';
import ApplySection from './ApplySection';
import Footer from './Footer';
import Nav from './Nav';

/**
 * The full homepage body, shared by `/` and `/apply`.
 *
 * `/apply` renders this exact same content (not a redirect, not a
 * different page) and additionally scrolls to the apply section on
 * mount -- so hitting /apply directly drops you on the homepage,
 * already scrolled to the whitelist form, with no full page reload
 * involved anywhere in getting there.
 *
 * @param {boolean} scrollToApplyOnMount - if true, smooth-scrolls to
 *   the #apply section once the page has mounted.
 */
export default function HomeContent({ scrollToApplyOnMount = false }) {
  const [count, setCount] = useState(null);
  const [refFromUrl, setRefFromUrl] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) setRefFromUrl(ref.toUpperCase());

    fetch('/api/stats')
      .then((r) => r.json())
      .then((d) => setCount(d.count))
      .catch(() => setCount(null));
  }, []);

  useEffect(() => {
    if (!scrollToApplyOnMount) return;
    // Slight delay so layout has settled (fonts/images can shift section
    // heights right after mount) before we scroll to the target.
    const t = setTimeout(() => {
      document.getElementById('apply')?.scrollIntoView({ behavior: 'smooth' });
    }, 80);
    return () => clearTimeout(t);
  }, [scrollToApplyOnMount]);

  function scrollToApply() {
    document.getElementById('apply')?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <main>
      <Nav />
      <Hero onApplyClick={scrollToApply} count={count} />
      <Marquee />
      <StudioPromo />
      <Targets />
      <ApplySection refFromUrl={refFromUrl} />
      <Footer />
    </main>
  );
}
