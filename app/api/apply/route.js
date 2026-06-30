import { NextResponse } from 'next/server';
import { getSql } from '@/lib/db';
import {
  normalizeHandle,
  isValidHandle,
  isValidWallet,
  isValidXLink,
  generateRefCode,
} from '@/lib/validate';

export async function POST(req) {
  try {
    const body = await req.json();
    const { xHandle, wallet, quoteLink, commentLink, quizScore, quizTimeMs, ref } = body;

    if (!isValidHandle(xHandle)) {
      return NextResponse.json(
        { error: 'that handle l00ks fake. dr0p the real @ y0u applied with.' },
        { status: 400 }
      );
    }
    if (!isValidWallet(wallet)) {
      return NextResponse.json(
        { error: 'that is n0t a 0x wallet. check it and try again.' },
        { status: 400 }
      );
    }
    if (!isValidXLink(quoteLink)) {
      return NextResponse.json(
        { error: 'qu0te link has t0 be an actual x.com/.../status/ link.' },
        { status: 400 }
      );
    }
    if (!isValidXLink(commentLink)) {
      return NextResponse.json(
        { error: 'c0mment link has t0 be an actual x.com/.../status/ link.' },
        { status: 400 }
      );
    }

    const handle = normalizeHandle(xHandle);
    const sql = getSql();

    const existing = await sql`
      SELECT id FROM applications WHERE LOWER(x_handle) = ${handle} OR LOWER(wallet) = ${wallet.toLowerCase()}
      LIMIT 1
    `;
    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'this handle 0r wallet already applied. 0ne sh0t per runner.' },
        { status: 409 }
      );
    }

    let refCode = generateRefCode();
    let attempts = 0;
    while (attempts < 5) {
      const clash = await sql`SELECT id FROM applications WHERE ref_code = ${refCode} LIMIT 1`;
      if (clash.length === 0) break;
      refCode = generateRefCode();
      attempts++;
    }

    let referredBy = null;
    if (ref && typeof ref === 'string' && ref.trim()) {
      const refCheck = await sql`SELECT ref_code FROM applications WHERE ref_code = ${ref.trim().toUpperCase()} LIMIT 1`;
      if (refCheck.length > 0) referredBy = ref.trim().toUpperCase();
    }

    await sql`
      INSERT INTO applications (x_handle, wallet, quote_link, comment_link, quiz_score, quiz_time_ms, ref_code, referred_by)
      VALUES (${handle}, ${wallet.toLowerCase()}, ${quoteLink}, ${commentLink}, ${quizScore || 0}, ${quizTimeMs || null}, ${refCode}, ${referredBy})
    `;

    const countRows = await sql`SELECT COUNT(*)::int AS count FROM applications`;
    const position = countRows[0]?.count || null;

    return NextResponse.json({ success: true, refCode, position });
  } catch (err) {
    console.error('apply error', err);
    return NextResponse.json(
      { error: 's0mething br0ke 0n 0ur end, n0t y0urs. try again in a sec.' },
      { status: 500 }
    );
  }
}
