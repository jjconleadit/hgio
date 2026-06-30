import { neon } from '@neondatabase/serverless';

let _sql = null;

/**
 * Lazy getter for the Neon SQL client.
 * Never instantiate at module load time — Next.js build steps execute
 * route files without env vars present, which throws if neon() runs eagerly.
 */
export function getSql() {
  if (!_sql) {
    if (!process.env.DATABASE_URL) {
      throw new Error(
        'DATABASE_URL is not set. Add it in your Netlify/Vercel environment variables.'
      );
    }
    _sql = neon(process.env.DATABASE_URL);
  }
  return _sql;
}
