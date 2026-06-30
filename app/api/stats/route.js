import { NextResponse } from 'next/server';
import { getSql } from '@/lib/db';

export async function GET() {
  try {
    const sql = getSql();
    const rows = await sql`SELECT COUNT(*)::int AS count FROM applications`;
    return NextResponse.json({ count: rows[0]?.count || 0 });
  } catch (err) {
    console.error('stats error', err);
    // Fail soft — front end shows a static fallback rather than breaking.
    return NextResponse.json({ count: null });
  }
}
