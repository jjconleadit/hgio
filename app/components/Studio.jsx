'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { drawHueShiftedBase, loadImage } from '@/lib/recolor';

const CANVAS_SIZE = 500;
const TEXT_MAX_LEN = 30;
const BUBBLE_FONT = `700 22px 'Archivo Black', 'Arial Black', sans-serif`;
const BUBBLE_LINE_HEIGHT = 26;
const BUBBLE_PAD_X = 18;
const BUBBLE_PAD_Y = 14;
const BUBBLE_MAX_WIDTH = 260;
const BUBBLE_MIN_WIDTH = 90;
const TAIL_SIZE = 16;

// Mouth anchor points, hand-picked per base (normalized 0-1 against the
// 500x500 art). Every base in this set is a centered, front-facing
// portrait so these stay close together, but small per-character nudges
// keep the speech bubble tail landing right at each mouth.
const MOUTH_ANCHORS = {
  r00mba_209: { x: 0.5, y: 0.54 },
  r00mba_058: { x: 0.5, y: 0.52 },
  r00mba_757: { x: 0.5, y: 0.49 },
  r00mba_122: { x: 0.5, y: 0.55 },
  r00mba_898: { x: 0.5, y: 0.51 },
  r00mba_817: { x: 0.5, y: 0.5 },
  r00mba_995: { x: 0.5, y: 0.51 },
  r00mba_097: { x: 0.5, y: 0.5 },
  r00mba_338: { x: 0.49, y: 0.51 },
  r00mba_291: { x: 0.5, y: 0.49 },
};
const DEFAULT_ANCHOR = { x: 0.5, y: 0.52 };

const BASES = [
  { id: 'r00mba_817', src: '/art/r00mba_817.png' },
  { id: 'r00mba_058', src: '/art/r00mba_058.png' },
  { id: 'r00mba_757', src: '/art/r00mba_757.png' },
  { id: 'r00mba_122', src: '/art/r00mba_122.png' },
  { id: 'r00mba_209', src: '/art/r00mba_209.png' },
  { id: 'r00mba_898', src: '/art/r00mba_898.png' },
  { id: 'r00mba_995', src: '/art/r00mba_995.png' },
  { id: 'r00mba_097', src: '/art/r00mba_097.png' },
  { id: 'r00mba_338', src: '/art/r00mba_338.png' },
  { id: 'r00mba_291', src: '/art/r00mba_291.png' },
];

// A denser set of stops than a basic 6-color rainbow -- this is purely the
// track's visual gradient (CSS), it does not change the underlying hue
// math at all. More stops makes intermediate shades along the drag feel
// distinct and named rather than a flat smear between six points.
const HUE_TRACK_BACKGROUND =
  'linear-gradient(to right, ' +
  '#ff0000, #ff4d00, #ff9900, #ffe600, #ccff00, #66ff00, ' +
  '#00ff1a, #00ff80, #00ffe6, #00b3ff, #0040ff, #4d00ff, ' +
  '#9900ff, #ff00e6, #ff0080, #ff0000)';

// Reference tick marks for a richer-feeling dial -- evenly spaced named
// color stops shown as small marks on the track so dragging reads as
// passing through many distinct colors, not just six.
const HUE_TICKS = [0, 24, 48, 72, 96, 140, 180, 210, 240, 270, 300, 330];

function defaultBubblePosition(baseId) {
  const anchor = MOUTH_ANCHORS[baseId] || DEFAULT_ANCHOR;
  const mouthX = anchor.x * CANVAS_SIZE;
  const mouthY = anchor.y * CANVAS_SIZE;
  // Bubble sits up + to the side of the mouth, tail points back down at it.
  return {
    mouthX,
    mouthY,
    x: Math.min(CANVAS_SIZE - 40, mouthX + 70),
    y: Math.max(40, mouthY - 90),
  };
}

function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function measureBubble(ctx, text) {
  ctx.font = BUBBLE_FONT;
  const safeText = text || '';
  const lines = safeText ? wrapText(ctx, safeText, BUBBLE_MAX_WIDTH - BUBBLE_PAD_X * 2) : [''];
  const widest = lines.reduce((m, l) => Math.max(m, ctx.measureText(l).width), 0);
  const width = Math.max(BUBBLE_MIN_WIDTH, Math.min(BUBBLE_MAX_WIDTH, widest + BUBBLE_PAD_X * 2));
  const height = lines.length * BUBBLE_LINE_HEIGHT + BUBBLE_PAD_Y * 2;
  return { lines, width, height };
}

function drawSpeechBubble(ctx, bubble, text) {
  const { lines, width, height } = measureBubble(ctx, text);
  const { x, y, mouthX, mouthY } = bubble;

  const left = x - width / 2;
  const top = y - height / 2;
  const radius = 16;

  // Tail: a small triangle from the bubble edge nearest the mouth, pointing
  // straight at the mouth anchor -- the classic manga "talking" callout.
  // Find where the ray from the bubble center toward the mouth actually
  // exits the bubble's rectangle (not an ellipse approximation), so the
  // tail base always sits flush on the bubble's border.
  const dx = mouthX - x;
  const dy = mouthY - y;
  const angle = Math.atan2(dy, dx);
  const halfW = width / 2;
  const halfH = height / 2;
  let tailBaseX;
  let tailBaseY;
  if (dx === 0 && dy === 0) {
    tailBaseX = x;
    tailBaseY = y + halfH;
  } else {
    const scaleX = dx !== 0 ? halfW / Math.abs(dx) : Infinity;
    const scaleY = dy !== 0 ? halfH / Math.abs(dy) : Infinity;
    const scale = Math.min(scaleX, scaleY);
    tailBaseX = x + dx * scale;
    tailBaseY = y + dy * scale;
    // Keep the tail off the rounded corners so it visually meets a flat
    // edge segment of the bubble rather than the curve.
    const cornerMargin = radius + TAIL_SIZE * 0.6;
    tailBaseX = Math.max(left + cornerMargin, Math.min(left + width - cornerMargin, tailBaseX));
    tailBaseY = Math.max(top + cornerMargin, Math.min(top + height - cornerMargin, tailBaseY));
  }
  const perpX = -Math.sin(angle) * (TAIL_SIZE * 0.5);
  const perpY = Math.cos(angle) * (TAIL_SIZE * 0.5);

  ctx.save();
  ctx.fillStyle = '#EDE8DC';
  ctx.strokeStyle = '#15120F';
  ctx.lineWidth = 3;
  ctx.lineJoin = 'round';

  // Draw the tail first (fill + stroke), then draw the rounded rect on top
  // of it -- the rect's fill naturally covers the part of the tail that
  // overlaps the body, leaving just the protruding point, and the rect's
  // own stroke draws a clean unbroken border.
  ctx.beginPath();
  ctx.moveTo(tailBaseX + perpX, tailBaseY + perpY);
  ctx.lineTo(tailBaseX - perpX, tailBaseY - perpY);
  ctx.lineTo(mouthX, mouthY);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(left + radius, top);
  ctx.lineTo(left + width - radius, top);
  ctx.arcTo(left + width, top, left + width, top + radius, radius);
  ctx.lineTo(left + width, top + height - radius);
  ctx.arcTo(left + width, top + height, left + width - radius, top + height, radius);
  ctx.lineTo(left + radius, top + height);
  ctx.arcTo(left, top + height, left, top + height - radius, radius);
  ctx.lineTo(left, top + radius);
  ctx.arcTo(left, top, left + radius, top, radius);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#15120F';
  ctx.font = BUBBLE_FONT;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const startY = top + BUBBLE_PAD_Y + BUBBLE_LINE_HEIGHT / 2;
  lines.forEach((line, i) => {
    ctx.fillText(line, x, startY + i * BUBBLE_LINE_HEIGHT);
  });

  ctx.restore();
  return { width, height };
}

export default function Studio({ xHandle }) {
  const canvasRef = useRef(null);
  const baseImgRef = useRef(null);
  const dragState = useRef(null);

  // Offscreen cache of the current recolored base art. This is the
  // expensive part (a full 500x500 per-pixel HSL pass) -- it's only ever
  // recomputed when `hue` or `baseId` actually changes, never when the
  // person types into the bubble or drags it around. Without this split,
  // every keystroke or drag re-ran the full pixel pass on the visible
  // canvas, which on slower/real phones can take well over a frame and
  // stalls the main thread -- that stall is what reads as the bubble
  // "jumping" or "blinking": the browser falls behind, then catches up
  // all at once once the heavy work finally finishes.
  const recoloredCacheRef = useRef(null);

  const [baseId, setBaseId] = useState(BASES[0].id);
  const [hue, setHue] = useState(0);
  const [ready, setReady] = useState(false);
  const [bubble, setBubble] = useState(null); // { x, y, mouthX, mouthY } | null
  const [textDraft, setTextDraft] = useState('');

  const currentBase = BASES.find((b) => b.id === baseId);

  // Load the selected base image whenever it changes, and snap the bubble
  // (if any) back onto that character's mouth anchor.
  useEffect(() => {
    let cancelled = false;
    setReady(false);
    async function load() {
      const img = await loadImage(currentBase.src);
      if (cancelled) return;
      baseImgRef.current = img;
      setReady(true);
      setBubble((prev) => (prev ? defaultBubblePosition(baseId) : prev));
    }
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseId]);

  // Cheap pass: blit the cached recolored base onto the visible canvas,
  // then draw the bubble on top. Runs on every keystroke / drag tick, but
  // costs almost nothing since it's just a single drawImage plus some
  // vector paths -- no per-pixel work.
  const compositeFrame = useCallback((forExport = false) => {
    const canvas = canvasRef.current;
    const cache = recoloredCacheRef.current;
    if (!canvas || !cache) return;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.drawImage(cache, 0, 0);

    const trimmed = textDraft.trim();
    if (bubble && (trimmed || !forExport)) {
      drawSpeechBubble(ctx, bubble, trimmed || '\u2026');
    }
  }, [bubble, textDraft]);

  // Expensive pass: recompute the cached recolored base. Only depends on
  // the loaded image and hue -- never on bubble/text -- so typing and
  // dragging never touch this.
  useEffect(() => {
    if (!ready || !baseImgRef.current) return;
    let cache = recoloredCacheRef.current;
    if (!cache) {
      cache = document.createElement('canvas');
      cache.width = CANVAS_SIZE;
      cache.height = CANVAS_SIZE;
      recoloredCacheRef.current = cache;
    }
    const cacheCtx = cache.getContext('2d');
    drawHueShiftedBase(cacheCtx, baseImgRef.current, hue, CANVAS_SIZE);
    compositeFrame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, hue, baseId]);

  useEffect(() => {
    if (ready) compositeFrame();
  }, [ready, compositeFrame]);

  const textareaRef = useRef(null);

  function handleAddBubble() {
    if (bubble) return; // only one bubble -- keep editing the one they have
    setBubble(defaultBubblePosition(baseId));
    // Focus once, right after the textarea actually appears -- not via
    // autoFocus, which would re-fire focus-steal on every re-render that
    // happens to pass through this branch (typing, dragging, hue changes
    // all re-render this component while `bubble` stays truthy).
    requestAnimationFrame(() => textareaRef.current?.focus());
  }

  function handleTextDraftChange(e) {
    setTextDraft(e.target.value.slice(0, TEXT_MAX_LEN));
  }

  function removeBubble() {
    setBubble(null);
    setTextDraft('');
  }

  // --- canvas-space pointer math, shared by mouse + touch ---
  function getCanvasPoint(e) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const scaleX = CANVAS_SIZE / rect.width;
    const scaleY = CANVAS_SIZE / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }

  function handlePointerDown(e) {
    if (!bubble) return;
    const point = getCanvasPoint(e);
    const ctx = canvasRef.current.getContext('2d');
    const { width, height } = measureBubble(ctx, textDraft.trim() || '\u2026');
    const within =
      Math.abs(point.x - bubble.x) <= width / 2 + 8 &&
      Math.abs(point.y - bubble.y) <= height / 2 + 8;
    if (!within) return;
    e.preventDefault();
    dragState.current = { offsetX: point.x - bubble.x, offsetY: point.y - bubble.y };
  }

  function handlePointerMove(e) {
    if (!dragState.current || !bubble) return;
    e.preventDefault();
    const point = getCanvasPoint(e);
    const { offsetX, offsetY } = dragState.current;
    setBubble((prev) => ({
      ...prev,
      x: Math.max(50, Math.min(CANVAS_SIZE - 50, point.x - offsetX)),
      y: Math.max(40, Math.min(CANVAS_SIZE - 40, point.y - offsetY)),
    }));
  }

  function handlePointerUp() {
    dragState.current = null;
  }

  function handleDownload() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    compositeFrame(true);
    requestAnimationFrame(() => {
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'r00mba-remix.png';
        a.click();
        URL.revokeObjectURL(url);
        // restore the on-screen editing view (with the placeholder bubble,
        // if the text was empty) after the export-only render pass above
        compositeFrame(false);
      }, 'image/png');
    });
  }

  const hasBubble = !!bubble;

  return (
    <div className="bg-paper border-2 border-ink rounded-2xl p-4 sm:p-7 noise-card">
      <div className="flex flex-col lg:grid lg:grid-cols-[1fr_320px] gap-5 lg:gap-6">
        {/* on mobile this whole block (base picker + dial) renders ABOVE the
            canvas; on desktop it sits beside it via the grid + order classes */}
        <div className="order-2 lg:order-1">
          <div className="relative w-full aspect-square border-2 border-ink rounded-xl overflow-hidden bg-bone touch-none">
            <canvas
              ref={canvasRef}
              width={CANVAS_SIZE}
              height={CANVAS_SIZE}
              className={`w-full h-full ${hasBubble ? 'cursor-grab active:cursor-grabbing' : ''}`}
              onMouseDown={handlePointerDown}
              onMouseMove={handlePointerMove}
              onMouseUp={handlePointerUp}
              onMouseLeave={handlePointerUp}
              onTouchStart={handlePointerDown}
              onTouchMove={handlePointerMove}
              onTouchEnd={handlePointerUp}
            />
            {!ready && (
              <div className="absolute inset-0 flex items-center justify-center bg-bone">
                <p className="font-mono text-xs text-ink/40">l0ading...</p>
              </div>
            )}
          </div>

          <p className="font-mono text-[11px] text-ink/45 mt-3">
            {hasBubble ? 'drag the bubble t0 reposition it' : 'pick a unit, dial in a c0lorway, give it something t0 say'}
          </p>

          <button
            onClick={handleDownload}
            className="w-full mt-4 font-display text-sm bg-ink text-paper px-6 py-4 rounded-md hover:bg-riot transition-colors duration-150 min-h-[44px]"
          >
            DOWNL0AD PNG &rarr;
          </button>
        </div>

        {/* controls: base picker + dial render first on mobile (above the
            canvas block), and sit in the right rail on desktop */}
        <div className="order-1 lg:order-2 space-y-6">
          <div>
            <p className="font-mono text-[11px] text-ink/60 mb-2.5">PICK A UNIT</p>
            <div className="grid grid-cols-5 lg:grid-cols-4 gap-1.5">
              {BASES.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setBaseId(b.id)}
                  className={`aspect-square min-h-[40px] rounded-md overflow-hidden border-2 transition-colors duration-150 ${
                    baseId === b.id ? 'border-riot' : 'border-ink/20 hover:border-ink/50'
                  }`}
                >
                  <img src={b.src} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2.5">
              <p className="font-mono text-[11px] text-ink/60">RUN THE C0L0RWAY DIAL</p>
              <button
                onClick={() => setHue(0)}
                className="font-mono text-[10px] text-ink/45 hover:text-riot transition-colors duration-150"
              >
                reset
              </button>
            </div>
            <div
              className="relative h-8 rounded-full border-2 border-ink"
              style={{ background: HUE_TRACK_BACKGROUND }}
            >
              {HUE_TICKS.map((tick) => (
                <div
                  key={tick}
                  className="absolute top-0 bottom-0 w-px bg-ink/25 pointer-events-none"
                  style={{ left: `${(tick / 359) * 100}%` }}
                />
              ))}
              <input
                type="range"
                min={0}
                max={359}
                step={1}
                value={hue}
                onChange={(e) => setHue(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer touch-none"
                style={{ touchAction: 'none' }}
              />
              <div
                className="absolute w-7 h-7 rounded-full border-2 border-ink bg-paper shadow-sm pointer-events-none"
                style={{
                  left: `calc(${(hue / 359) * 100}% - 14px)`,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  backgroundColor: `hsl(${hue}, 70%, 55%)`,
                }}
              />
            </div>
            <p className="font-mono text-[10px] text-ink/40 mt-1.5">drag the d0t ar0und the wheel &mdash; 360 sh0ades t0 land 0n</p>
          </div>

          <div>
            <p className="font-mono text-[11px] text-ink/60 mb-2.5">WHAT&rsquo;S Y0UR R00MBA SAYING?</p>
            {!bubble ? (
              <button
                onClick={handleAddBubble}
                className="w-full font-mono text-xs border-2 border-ink rounded-md px-4 py-3.5 min-h-[44px] hover:bg-ink hover:text-paper transition-colors duration-150"
              >
                + give it a line
              </button>
            ) : (
              <div>
                <div className="flex gap-2">
                  <textarea
                    ref={textareaRef}
                    value={textDraft}
                    onChange={handleTextDraftChange}
                    maxLength={TEXT_MAX_LEN}
                    rows={2}
                    placeholder="y0u missed this 0ne"
                    className="flex-1 border-2 border-ink/30 focus:border-ink rounded-md px-3 py-2.5 bg-bone focus:bg-paper transition-colors duration-150 font-body text-sm resize-none"
                  />
                  <button
                    onClick={removeBubble}
                    className="font-mono text-xs border-2 border-ink/30 rounded-md px-4 min-h-[44px] text-ink/60 hover:border-riot hover:text-riot transition-colors duration-150 flex-shrink-0"
                  >
                    clear
                  </button>
                </div>
                <p className="font-mono text-[10px] text-ink/40 mt-1.5">
                  {textDraft.length}/{TEXT_MAX_LEN}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
