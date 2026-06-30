// Light validation — strict enough to block junk, loose enough to not annoy real applicants.

export function normalizeHandle(raw) {
  if (!raw) return '';
  let h = raw.trim();
  h = h.replace(/^https?:\/\/(www\.)?(x|twitter)\.com\//i, '');
  h = h.replace(/^@/, '');
  h = h.split('/')[0].split('?')[0];
  return h.toLowerCase();
}

export function isValidHandle(raw) {
  const h = normalizeHandle(raw);
  return /^[a-z0-9_]{1,15}$/.test(h);
}

export function isValidWallet(raw) {
  if (!raw) return false;
  return /^0x[a-fA-F0-9]{40}$/.test(raw.trim());
}

export function isValidXLink(raw) {
  if (!raw) return false;
  try {
    const url = new URL(raw.trim());
    const host = url.hostname.replace(/^www\./, '');
    if (host !== 'x.com' && host !== 'twitter.com') return false;
    // must look like a status link
    return /\/status\/\d+/.test(url.pathname);
  } catch {
    return false;
  }
}

const REF_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // no 0/O/1/I/L confusion

export function generateRefCode() {
  let code = 'RMB-';
  for (let i = 0; i < 5; i++) {
    code += REF_ALPHABET[Math.floor(Math.random() * REF_ALPHABET.length)];
  }
  return code;
}
