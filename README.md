# r00mba

10,000 r00mbas. WL site with a quiz gate, a 4-task checklist application,
a Neon-backed database, and ref codes for tracking who's putting in work
for the project.

## 1. Install

```
npm install
```

## 2. Set up Neon

1. Go to your Neon project → **Connection Details** → copy the **pooled**
   connection string (it has `-pooler` in the hostname — use this one, not
   the direct one, since serverless functions need pooling).
2. Create `.env.local` in the project root:
   ```
   DATABASE_URL=postgresql://user:password@host-pooler.neon.tech/dbname?sslmode=require
   ```
3. Run the schema against your DB once:
   ```
   psql "$DATABASE_URL" -f schema.sql
   ```
   (No `psql` installed? Paste the contents of `schema.sql` into the Neon
   SQL Editor in your project dashboard instead — same effect.)

## 3. Run locally

```
npm run dev
```

Open `http://localhost:3000`.

## 4. Customize before launch

- **`app/components/ApplyForm.jsx`** — the `TWEET_URL` constant points at
  `https://x.com/r00mba_`. Swap it for the actual pinned post link once you
  have one. `UNLOCK_DELAY_MS` (3000) controls the delay before the proof
  link input appears after clicking a task link.
- **`app/components/Studio.jsx`** — the `BASES` array lists the 10 bases
  available in the editor. To add an 11th: drop the PNG in `public/art/`,
  add it to `BASES` in both `tools/segment.py` and `Studio.jsx`, then run
  `python3 tools/segment.py`.
- **`lib/accessories.js`** — the 15 accessories (eyewear/head/neck). Each
  has a `widthRatio` (size relative to its anchor) and optional
  `yOffsetRatio`/`offsetXRatio` for fine positioning. Add new ones the
  same way — pick an `anchor` of `eyes`, `head`, or `neck` and the
  placement math handles the rest.
- **`tools/segment.py`** — the offline segmentation pipeline. Only needs
  re-running when base art changes.
- **`app/components/Targets.jsx`** — the loose "what's next" list. Update
  as real plans firm up.
- **`app/layout.js`** — set `NEXT_PUBLIC_SITE_URL` in your env vars to your
  real domain so Open Graph / Twitter card images resolve correctly when
  shared.

## 5. Deploy

### Netlify
1. Push this repo to GitHub.
2. New site from Git → pick the repo → it auto-detects Next.js
   (`netlify.toml` is already set up with the Next.js plugin).
3. Add `DATABASE_URL` and `NEXT_PUBLIC_SITE_URL` under **Site settings →
   Environment variables**.
4. Deploy.

### Vercel
1. Push this repo to GitHub.
2. Import the repo in Vercel — Next.js is auto-detected, no config needed.
3. Add `DATABASE_URL` and `NEXT_PUBLIC_SITE_URL` under **Project Settings →
   Environment Variables**.
4. Deploy.

## How the WL flow works

1. **Application form** (`ApplyForm.jsx`) — one flowing list of 6
   questions (handle, follow, RT, quote, comment, wallet). The quote and
   comment questions only reveal their link-paste input 3 seconds after
   the person clicks the task link above it — the proof field lives
   directly under its own question. Submits to `/api/apply`. There is no
   quiz or game gating the form — anyone can apply immediately.
2. **`/api/apply`** validates everything server-side (handle format, wallet
   format, that links are real x.com/twitter.com status URLs), blocks
   duplicate handles/wallets, generates a unique ref code, and stores the
   application in Neon.
3. **Success card** — shows the applicant their queue position and ref
   code, with one-click share to X. The `referred_by` column in the DB lets
   you build a leaderboard later (there's a `referral_leaderboard` SQL view
   already set up in `schema.sql` for this).
4. Separately, a callout under the form (and a homepage promo section)
   point to **`/draw`** — making something in the Studio isn't required to
   apply, but it's framed as a way to earn priority when applications are
   reviewed manually.

## The r00mba STUDIO (creative tool)

Lives at `/draw`, separate from the homepage and from the WL application
— making something is never required to apply, it's just a way to earn
priority. Visiting `/draw` asks for an X handle (for priority tracking
later, not a gate) then opens the editor.

### How recoloring actually works

Each of the 10 base art pieces ships with a pre-computed **segmentation
mask** (`public/masks/<base>.json`) built by `tools/segment.py`. The
mask tags every pixel of the source art as background / hair /
outer_garment / inner_garment / accent / outline / skin, so the editor
can recolor *just* the hair, or *just* the jacket, without touching
anything else — no trait layers needed, since these are finished
single-image artworks.

The segmentation pipeline (`tools/segment.py`) does, in order:
1. Detects the art's specific outline ink color (rather than assuming
   pure black), so dark fill colors like navy hair don't get swallowed
   as outline.
2. Flood-fills connected regions by color similarity, with a stricter
   tolerance specifically for the background (detected from canvas
   corners) to stop smooth gradients bridging background into a pale
   hair highlight.
3. Classifies regions into slots using POSITION (where a region starts/
   ends vertically), not just color — this is what correctly identifies
   long hair that drapes past the shoulders as "hair," not "outer
   garment."
4. Protects skin tones AND a computed face bounding box from ever being
   assigned a colorable slot, so facial details (eyebrows, mouth shadow)
   never get recolored even when their color happens to be ambiguous
   with hair or fabric.
5. Folds shading/highlight fragments into their parent slot by spatial
   containment, so a shadow streak inside hair moves to the new color
   along with the rest of the hair instead of being flattened.
6. Run-length-encodes the final per-pixel mask before writing JSON
   (roughly 5x smaller than a flat array).

This is genuinely heuristic, not perfect: 9 of the 10 bases have fully
working hair + at least one garment slot; 1 base (`r00mba_291`) has a
hair color that's colorimetrically identical to this art style's skin
tone, so its hair stays fixed (no bleeding, just not recolorable). A
couple of bases have partial garment detection on heavily speckled
patterns (camo-style jackets). None of this causes visible bleeding or
crashes — verified by rendering every base individually, not assumed.

To regenerate masks after adding new base art:
```
python3 tools/segment.py
```

### Recoloring at runtime

`lib/maskRecolor.js` reads the mask + a target hex color per slot, and
for every matching pixel shifts hue/saturation to the target while
PRESERVING that pixel's lightness offset from the slot's original fill.
This is what keeps shading detail looking like shading on the new color,
rather than flattening the whole slot to one flat tone.

### Accessories

`lib/accessories.js` defines 15 items (5 eyewear, 6 head, 4 neck) as
inline SVGs. Each declares which anchor it keys off of:
- `eyes` -> uses the mask's `eyeLineY` / `faceCenterX` / `faceWidth`
- `head` -> uses `hairTopY` / `hairCenterX` / `hairWidth`
- `neck` -> uses `faceBottomY` / `faceCenterX` / `faceWidth`

This is why clicking an item drops it already correctly sized and
positioned on whichever base is selected, with no manual resizing
needed — the anchor data comes from the same segmentation pass that
powers recoloring. All accessories are colorable via the same picker UI
as the base art slots. There's a single flat list per category (no
separate "meme" vs "r00mba" tabs).

### Known fixed bug

An earlier version crashed with `Cannot read properties of null
(reading 'offsetX')` when dragging items — `dragState.current` could be
nulled by a pointer-up event between a pointer-move firing and its
deferred React state update running. Fixed by capturing `offsetX`/
`offsetY` into local consts synchronously in the event handler, before
the `setLayers` callback, rather than reading them from the ref inside
the (possibly delayed) callback.

## Notes on the bot-detection angle

Given the patterns from your past whitelist forms, a few things worth
doing once applications start coming in:

- The `applications` table has a `created_at` timestamp on every row —
  useful for the same timing-pattern forensics you've run before (bursts
  of submissions seconds apart from different handles = bot ring).
- Consider hashing IPs server-side (there's an unused `ip_hash` column
  already in the schema) if you want another signal without storing raw
  IPs.
- The quiz reflex time (`quiz_time_ms`) is stored per applicant — inhumanly
  fast, identical times across "different" people is a decent bot tell
  too, for free.
