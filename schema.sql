-- Run this once against your Neon database before going live.
-- psql "$DATABASE_URL" -f schema.sql

CREATE TABLE IF NOT EXISTS applications (
  id            SERIAL PRIMARY KEY,
  x_handle      TEXT NOT NULL,
  wallet        TEXT NOT NULL,
  quote_link    TEXT NOT NULL,
  comment_link  TEXT NOT NULL,
  quiz_score    INTEGER NOT NULL DEFAULT 0,
  quiz_time_ms  INTEGER,
  ref_code      TEXT UNIQUE NOT NULL,
  referred_by   TEXT,
  ip_hash       TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS applications_x_handle_idx
  ON applications (LOWER(x_handle));

CREATE UNIQUE INDEX IF NOT EXISTS applications_wallet_idx
  ON applications (LOWER(wallet));

CREATE INDEX IF NOT EXISTS applications_referred_by_idx
  ON applications (referred_by);

-- Quick view for a leaderboard of who's pulled in the most ref signups
CREATE OR REPLACE VIEW referral_leaderboard AS
  SELECT referred_by AS ref_code, COUNT(*) AS pulled_in
  FROM applications
  WHERE referred_by IS NOT NULL
  GROUP BY referred_by
  ORDER BY pulled_in DESC;
