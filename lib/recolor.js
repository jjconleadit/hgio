// Simple global hue-shift recolor.
//
// These base images are finished illustrations, not layered trait sheets,
// so there's no clean way to recolor "just the jacket" or "just the hair"
// without per-pixel segmentation -- and segmentation on art like this
// produces patchy, broken-looking edges. Instead we rotate the HUE of the
// whole image as one operation, which shifts hair/jacket/background
// together into a new but internally consistent colorway.
//
// To keep linework and highlights from going muddy, we skip the hue
// rotation only on pixels that are truly near-black (ink outlines) or
// truly near-white (highlight dots/strokes), gated on LIGHTNESS rather
// than saturation. Saturation is an unreliable signal here -- several of
// the base art pieces use deliberately muted/desaturated background
// colors (greys, dusty pinks, etc.) that read as "low saturation" even
// though they are clearly colors, not ink. Gating on saturation caused
// those backgrounds to be skipped entirely and never recolor. Lightness
// cleanly separates "this is basically black" / "this is basically
// white" from "this is a color, however muted" -- every pixel in between
// gets its hue rotated, and only true ink/highlight pixels stay fixed.

const DARK_SKIP_THRESHOLD = 0.1; // lightness below this = treated as ink, left alone
const LIGHT_SKIP_THRESHOLD = 0.95; // lightness above this = treated as highlight, left alone

function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return [h, s, l];
}

function hslToRgb(h, s, l) {
  if (s === 0) {
    const v = Math.round(l * 255);
    return [v, v, v];
  }
  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const r = hue2rgb(p, q, h + 1 / 3);
  const g = hue2rgb(p, q, h);
  const b = hue2rgb(p, q, h - 1 / 3);
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

/**
 * Draws `img` onto `ctx` at (canvasSize x canvasSize), then applies a
 * global hue rotation of `hueDegrees` degrees to every pixel that isn't
 * near-black ink or a near-white highlight. Saturation and lightness are
 * left untouched on shifted pixels -- only hue rotates.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {HTMLImageElement} img - already-loaded base image
 * @param {number} hueDegrees - 0-360
 * @param {number} canvasSize - width/height of the square canvas
 */
export function drawHueShiftedBase(ctx, img, hueDegrees, canvasSize) {
  ctx.clearRect(0, 0, canvasSize, canvasSize);
  ctx.drawImage(img, 0, 0, canvasSize, canvasSize);

  // 0 degrees is a no-op -- skip the pixel pass entirely for speed and to
  // guarantee an exact, unmodified render of the original art.
  if (!hueDegrees) return;

  const hueShift = ((hueDegrees % 360) + 360) % 360 / 360;

  const imageData = ctx.getImageData(0, 0, canvasSize, canvasSize);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    if (a === 0) continue;

    const [h, s, l] = rgbToHsl(r, g, b);
    if (l < DARK_SKIP_THRESHOLD || l > LIGHT_SKIP_THRESHOLD) continue;

    let newH = h + hueShift;
    newH -= Math.floor(newH);

    const [nr, ng, nb] = hslToRgb(newH, s, l);
    data[i] = nr;
    data[i + 1] = ng;
    data[i + 2] = nb;
  }

  ctx.putImageData(imageData, 0, 0);
}

export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
