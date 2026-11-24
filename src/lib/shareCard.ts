import { CLOSER_ID, EVENT, OPENER_ID } from '../config/event';
import { SOCIAL_BY_ID, socialUrl } from '../config/social';
import { publicEnv } from '../config/env';
import { songTitle } from '../data/songs';
import type { SocialNetwork } from '../types';

/**
 * Draws the shareable image of a setlist (1080x1350, 4:5) with the Canvas API:
 * no libraries, nothing leaves the device, and it works the same everywhere.
 */
export interface ShareCardData {
  name: string;
  author: string;
  songIds: string[];
  openers: string[];
  socialNetwork?: SocialNetwork | null;
  socialHandle?: string | null;
}

const W = 1080;
const H = 1350;
const PAD = 76;

const C = {
  bg: '#09090D',
  red: '#E32636',
  redHot: '#FF3B4A',
  redDark: '#74111E',
  white: '#F2F4F8',
  steel: '#9AA0AB',
  dim: '#6B707B',
  gold: '#E8B65A',
};

const F_DISPLAY = '"Anton", Impact, "Arial Narrow", sans-serif';
const F_LABEL = '"Barlow Condensed", "Arial Narrow", sans-serif';
const F_BODY = 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

type Ctx = CanvasRenderingContext2D & { letterSpacing?: string };

/** Public link of the site (lands on the setlist builder). */
export function siteLink(): string {
  const base = (publicEnv.siteUrl || window.location.origin).replace(/\/+$/, '');
  return `${base}/#crear`;
}

/** Host shown on the image, e.g. "babymetal-argentina.vercel.app". */
export function siteHost(): string {
  try {
    return new URL(siteLink()).host;
  } catch {
    return window.location.host;
  }
}

export function shareMessage(name: string): string {
  return `Mi setlist soñado para BABYMETAL en Buenos Aires (${EVENT.dateShort}): “${name}”. Armá el tuyo acá: ${siteLink()}`;
}

async function ensureFonts() {
  if (!('fonts' in document)) return;
  const loading = Promise.all([
    document.fonts.load('80px Anton'),
    document.fonts.load('700 30px "Barlow Condensed"'),
    document.fonts.load('400 30px Inter'),
    document.fonts.load('600 30px Inter'),
    document.fonts.load('700 30px Inter'),
  ]).catch(() => {});
  // Never block sharing for more than 2s if the font server is slow or blocked.
  await Promise.race([loading, new Promise((r) => window.setTimeout(r, 2000))]);
}

function spacing(ctx: Ctx, px: number) {
  ctx.letterSpacing = `${px}px`;
}

/** Truncates with an ellipsis so the text fits `maxW` with the current font. */
function fit(ctx: Ctx, text: string, maxW: number): string {
  if (ctx.measureText(text).width <= maxW) return text;
  let t = text;
  while (t.length > 1 && ctx.measureText(`${t}…`).width > maxW) t = t.slice(0, -1);
  return `${t.trimEnd()}…`;
}

/** Word-wraps `text` into at most `maxLines` lines (last one gets an ellipsis if cut). */
function wrap(ctx: Ctx, text: string, maxW: number, maxLines: number): string[] {
  const lines: string[] = [];
  let line = '';
  const push = (l: string) => lines.push(l);
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width <= maxW) {
      line = test;
      continue;
    }
    if (line) push(line);
    line = word;
    // A single very long word: cut it so it never overflows.
    while (ctx.measureText(line).width > maxW && line.length > 1) {
      let cut = line.length;
      while (cut > 1 && ctx.measureText(line.slice(0, cut)).width > maxW) cut--;
      push(line.slice(0, cut));
      line = line.slice(cut);
    }
  }
  if (line) push(line);
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    kept[maxLines - 1] = fit(ctx, `${kept[maxLines - 1]}…`, maxW);
    return kept;
  }
  return lines;
}

function drawBackground(ctx: Ctx) {
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, W, H);

  // red light from the top-left and a dim one from the bottom-right
  const g1 = ctx.createRadialGradient(140, 60, 0, 140, 60, 900);
  g1.addColorStop(0, 'rgba(227,38,54,0.42)');
  g1.addColorStop(1, 'rgba(227,38,54,0)');
  ctx.fillStyle = g1;
  ctx.fillRect(0, 0, W, H);
  const g2 = ctx.createRadialGradient(W, H, 0, W, H, 800);
  g2.addColorStop(0, 'rgba(116,17,30,0.55)');
  g2.addColorStop(1, 'rgba(116,17,30,0)');
  ctx.fillStyle = g2;
  ctx.fillRect(0, 0, W, H);

  // subtle diagonal lines
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.028)';
  ctx.lineWidth = 2;
  for (let x = -H; x < W + H; x += 38) {
    ctx.beginPath();
    ctx.moveTo(x, H);
    ctx.lineTo(x + H * 0.58, 0);
    ctx.stroke();
  }
  ctx.restore();

  // left accent bar
  const bar = ctx.createLinearGradient(0, 0, 0, H);
  bar.addColorStop(0, C.redHot);
  bar.addColorStop(1, C.redDark);
  ctx.fillStyle = bar;
  ctx.fillRect(0, 0, 16, H);
}

export async function renderSetlistCard(data: ShareCardData): Promise<Blob> {
  await ensureFonts();

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d') as Ctx | null;
  if (!ctx) throw new Error('Canvas no disponible');

  ctx.textBaseline = 'alphabetic';
  drawBackground(ctx);
  const contentW = W - PAD * 2;

  /* ---- event tag ---- */
  let y = 104;
  ctx.fillStyle = C.redHot;
  ctx.font = `700 27px ${F_LABEL}`;
  spacing(ctx, 3);
  // Full line if it fits, otherwise the short one (never cut a word in half).
  const tagFull = `${EVENT.artist} · ${EVENT.city} · ${EVENT.dateShort} · ${EVENT.venue}`;
  const tagShort = `${EVENT.artist} · ${EVENT.city} · ${EVENT.dateShort}`;
  ctx.fillText(ctx.measureText(tagFull).width <= contentW ? tagFull : fit(ctx, tagShort, contentW), PAD, y);
  spacing(ctx, 0);

  /* ---- title (Anton, up to 2 lines, shrinks to fit) ---- */
  const title = data.name.toUpperCase();
  let size = 92;
  let lines: string[] = [];
  for (; size >= 52; size -= 4) {
    ctx.font = `${size}px ${F_DISPLAY}`;
    lines = wrap(ctx, title, contentW, 99);
    if (lines.length <= 2) break;
  }
  if (lines.length > 2) {
    ctx.font = `${size}px ${F_DISPLAY}`;
    lines = wrap(ctx, title, contentW, 2);
  }
  ctx.fillStyle = C.white;
  y += 36;
  for (const l of lines) {
    y += size * 1.02;
    ctx.fillText(l, PAD, y);
  }

  /* ---- author + social ---- */
  y += 58;
  ctx.font = `700 38px ${F_BODY}`;
  ctx.fillStyle = C.white;
  const by = 'por ';
  ctx.fillText(by, PAD, y);
  const byW = ctx.measureText(by).width;
  ctx.fillStyle = C.redHot;
  ctx.fillText(fit(ctx, `@${data.author}`, contentW - byW), PAD + byW, y);

  const link = socialUrl(data.socialNetwork, data.socialHandle);
  if (link && data.socialNetwork) {
    y += 46;
    ctx.font = `600 30px ${F_BODY}`;
    ctx.fillStyle = C.steel;
    ctx.fillText(fit(ctx, `${SOCIAL_BY_ID[data.socialNetwork].label}: @${data.socialHandle}`, contentW), PAD, y);
  }

  /* ---- openers ---- */
  if (data.openers.length > 0) {
    y += 50;
    const label = data.openers.length === 1 ? 'TELONERO' : 'TELONEROS';
    ctx.font = `700 27px ${F_LABEL}`;
    spacing(ctx, 4);
    ctx.fillStyle = C.gold;
    ctx.fillText(label, PAD, y);
    const labelW = ctx.measureText(label).width;
    spacing(ctx, 0);
    ctx.font = `600 31px ${F_BODY}`;
    ctx.fillStyle = C.white;
    ctx.fillText(fit(ctx, data.openers.join(' · '), contentW - labelW - 22), PAD + labelW + 22, y);
  }

  /* ---- divider ---- */
  y += 40;
  ctx.save();
  ctx.setLineDash([12, 10]);
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(PAD, y);
  ctx.lineTo(W - PAD, y);
  ctx.stroke();
  ctx.restore();

  /* ---- songs ---- */
  const footerH = 236;
  const top = y + 30;
  const bottom = H - footerH - 24;
  const n = data.songIds.length;
  const cols = n > 12 ? 2 : 1;
  const perCol = Math.ceil(n / cols);
  const rowH = Math.min(82, Math.floor((bottom - top) / Math.max(1, perCol)));
  const gap = 56;
  const colW = (contentW - gap * (cols - 1)) / cols;
  const numFont = Math.round(Math.min(42, rowH * 0.62));
  const songFont = Math.round(Math.min(37, rowH * 0.48));

  data.songIds.forEach((id, i) => {
    const col = Math.floor(i / perCol);
    const row = i % perCol;
    const x = PAD + col * (colW + gap);
    const base = top + row * rowH + rowH * 0.68;
    const special = id === OPENER_ID && i === 0 ? 'APERTURA' : id === CLOSER_ID && i === n - 1 ? 'CIERRE' : null;

    ctx.font = `${numFont}px ${F_DISPLAY}`;
    ctx.fillStyle = special ? C.redHot : C.dim;
    ctx.fillText(String(i + 1).padStart(2, '0'), x, base);

    // Song title: shrink up to ~38% before resorting to an ellipsis.
    const textX = x + numFont * 1.55;
    const maxTitleW = colW - (textX - x);
    const title = songTitle(id);
    let fontPx = songFont;
    ctx.font = `600 ${fontPx}px ${F_BODY}`;
    while (fontPx > songFont * 0.62 && ctx.measureText(title).width > maxTitleW) {
      fontPx -= 1;
      ctx.font = `600 ${fontPx}px ${F_BODY}`;
    }
    ctx.fillStyle = special ? C.redHot : C.white;
    ctx.fillText(fit(ctx, title, maxTitleW), textX, base);

    // Opener / closer label under the title (only when the row is tall enough).
    if (special && rowH >= 60) {
      ctx.font = `700 19px ${F_LABEL}`;
      spacing(ctx, 4);
      ctx.fillStyle = C.red;
      ctx.fillText(special, textX, base + 23);
      spacing(ctx, 0);
    }
  });

  /* ---- footer: call to action + link ---- */
  const fy = H - footerH;
  const band = ctx.createLinearGradient(0, fy, 0, H);
  band.addColorStop(0, 'rgba(116,17,30,0.0)');
  band.addColorStop(0.35, 'rgba(116,17,30,0.75)');
  band.addColorStop(1, 'rgba(227,38,54,0.9)');
  ctx.fillStyle = band;
  ctx.fillRect(16, fy, W - 16, footerH);

  ctx.fillStyle = '#fff';
  ctx.font = `64px ${F_DISPLAY}`;
  ctx.fillText('ARMÁ EL TUYO', PAD, H - 126);

  ctx.font = `700 36px ${F_BODY}`;
  ctx.fillText(fit(ctx, `${siteHost()}`, contentW), PAD, H - 72);

  ctx.font = `400 23px ${F_BODY}`;
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.fillText('Fan project no oficial · sin afiliación con BABYMETAL', PAD, H - 32);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('No se pudo generar la imagen'))), 'image/png');
  });
}
