import { Container, Text, Canvas } from 'flet-box';
import { colors, fonts } from '../theme.js';

const fmtTime = (s) => {
  if (!isFinite(s) || s < 0) return '0:00';
  const m = Math.floor(s / 60), sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, '0')}`;
};

export function Display({ title, trackKey, time, duration, playing, mixing, source, offline, party, showRemaining, onToggleTime, onExpand }) {
  const clock = showRemaining && isFinite(duration) ? '-' + fmtTime(duration - time) : fmtTime(time).padStart(5, '0');
  /** @type {HTMLCanvasElement | undefined} */
  let specRef;
  /** @type {HTMLCanvasElement | undefined} */
  let vuRef;
  /** @type {HTMLElement | undefined} */
  let shellRef;
  /** @type {number | undefined} */
  let raf;

  const startDraw = () => {
    if (!specRef || !vuRef || !shellRef || raf) return;
    const sc = specRef, vc = vuRef, shell = shellRef;
    const gs = sc.getContext('2d'), gv = vc.getContext('2d');
    if (!gs || !gv) return;
    const BARS = 26;
    const lv = new Float32Array(BARS), pk = new Float32Array(BARS);
    const vu = { l: 0, r: 0, pl: 0, pr: 0 };

    const fit = (/** @type {HTMLCanvasElement} */ c) => {
      const dpr = window.devicePixelRatio || 1;
      const w = c.clientWidth, h = c.clientHeight;
      if (!w || !h) return [0, 0];
      const bw = Math.round(w * dpr), bh = Math.round(h * dpr);
      if (c.width !== bw || c.height !== bh) { c.width = bw; c.height = bh; }
      const ctx = c.getContext('2d');
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return [w, h];
    };

    const drawSpec = (t) => {
      if (!gs) return;
      const [w = 0, h = 0] = fit(sc);
      gs.clearRect(0, 0, w, h);
      const active = shell.classList.contains('on');
      const festa = shell.classList.contains('party');
      const bass = active ? (0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 0.0024))) : 0;
      const beat = festa ? Math.pow(Math.max(0, Math.sin(t * 0.0065)), 4) : 0;
      shell.style.setProperty('--beat', beat.toFixed(3));
      shell.classList.toggle('limit', active && (0.55 + bass * 0.5 + beat * 0.2) > 0.92);
      const gap = 2, bw = (w - gap * (BARS - 1)) / BARS;
      for (let i = 0; i < BARS; i++) {
        const f = i / BARS;
        let tgt = 0;
        if (active) {
          const wave = 0.5 + 0.5 * Math.sin(t * 0.003 + i * 0.55) * Math.cos(t * 0.0017 + i * 0.22);
          tgt = Math.min(1, (0.18 + (1 - f) * 0.65 * bass + f * 0.45 * (1 - bass * 0.5)) * wave + beat * (1 - f) * 0.35);
        }
        lv[i] += (tgt - lv[i]) * (tgt > lv[i] ? 0.45 : 0.07);
        pk[i] = Math.max(lv[i], pk[i] - 0.003);
        const x = i * (bw + gap), bh = lv[i] * h, y = h - bh;
        gs.fillStyle = `rgba(255,180,60,${0.25 + lv[i] * 0.75})`;
        gs.fillRect(x, y, bw, bh);
        gs.fillStyle = '#ffe0a0';
        gs.fillRect(x, Math.max(0, h - pk[i] * h - 2), bw, 2);
      }
    };

    const drawVu = (t) => {
      if (!gv) return;
      const [vw = 0, vh = 0] = fit(vc);
      gv.clearRect(0, 0, vw, vh);
      const active = shell.classList.contains('on');
      const festa = shell.classList.contains('party');
      const base = active ? 0.25 + 0.45 * (0.5 + 0.5 * Math.sin(t * 0.0021)) : 0;
      const kick = festa && active ? Math.pow(Math.max(0, Math.sin(t * 0.0065)), 3) * 0.28 : 0;
      const tl = Math.min(1, base + 0.08 * Math.sin(t * 0.0041) + kick);
      const tr = Math.min(1, base + 0.08 * Math.sin(t * 0.0041 + 0.9) + kick * 0.9);
      vu.l += (tl - vu.l) * 0.25; vu.r += (tr - vu.r) * 0.25;
      vu.pl = Math.max(vu.l, vu.pl - 0.004); vu.pr = Math.max(vu.r, vu.pr - 0.004);
      gv.font = '9px ui-monospace, monospace'; gv.textBaseline = 'middle';
      /** @type {[number, number, string][]} */
      ([[vu.l, vu.pl, 'L'], [vu.r, vu.pr, 'R']]).forEach(([val, peak, lbl], row) => {
        const y = 3 + row * 9, bw = vw - 16;
        gv.fillStyle = 'rgba(255,180,60,0.25)'; gv.fillText(lbl, 0, y + 2);
        for (let i = 0; i < 24; i++) {
          const f = i / 24, on = val > f;
          gv.fillStyle = !on ? 'rgba(255,180,60,0.08)' : f > 0.84 ? '#ff5a4a' : '#ffb43a';
          gv.fillRect(12 + i * (bw / 24), y, bw / 24 - 1, 5);
        }
        gv.fillStyle = '#ffe0a0'; gv.fillRect(12 + peak * bw - 1, y - 1, 2, 7);
      });
    };

    const loop = (t) => { drawSpec(t); drawVu(t); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
  };

  const lampBase = {
    fontSize: 8, border: `1px solid ${colors.amberDim}`, padding: '1px 5px',
    borderRadius: 3, opacity: 0.25, letterSpacing: 1, color: colors.amber,
    textShadow: 'none', transition: 'opacity .25s ease, color .25s ease, border-color .25s ease, text-shadow .25s ease',
  };
  const lampOn = (color, borderOn, shadow) => ({ opacity: 1, color, border: `1px solid ${borderOn}`, textShadow: shadow });

  const shell = Container({
    unstyled: true,
    tag: 'section',
    className: 'display' + (party ? ' party' : '') + (playing ? ' on' : ''),
    ref: (el) => { shellRef = /** @type {HTMLElement} */ (el); startDraw(); },
    background: 'radial-gradient(ellipse at 50% 0%, #22180a, #120d06 70%)',
    borderRadius: 12,
    padding: '10px 12px 8px', fontFamily: fonts.mono, color: colors.amber,
    textShadow: `0 0 6px ${colors.amberGlow}`, position: 'relative',
    children: [
      Container({
        unstyled: true, className: 'display-top',
        display: 'flex', alignItems: 'center', gap: 8,
        children: [
          Text({ unstyled: true, tag: 'span', className: 'state' + (playing ? ' blink' : ''), text: playing ? '▶' : title ? '❚❚' : '■', width: 14, fontSize: 12 }),
          Text({ unstyled: true, tag: 'span', className: 'clock', text: clock, fontSize: 38, fontWeight: '700', letterSpacing: 1, fontVariantNumeric: 'tabular-nums', cursor: 'pointer', padding: '0 2px', onPress: onToggleTime }),
          Container({
            unstyled: true, className: 'lamps',
            marginLeft: 'auto', display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'flex-end',
            children: [
              Text({ unstyled: true, tag: 'span', className: 'lamp' + (source === 'cloud' ? ' on blue' : ''), text: 'NUBE', ...lampBase, ...(source === 'cloud' ? lampOn(colors.blue, '#35547a', '0 0 6px rgba(120,180,255,0.6)') : {}) }),
              Text({ unstyled: true, tag: 'span', className: 'lamp' + (source === 'local' ? ' on' : ''), text: 'LOCAL', ...lampBase, ...(source === 'local' ? { opacity: 1 } : {}) }),
              Text({ unstyled: true, tag: 'span', className: 'lamp' + (mixing ? ' on green' : ''), text: 'MIX', ...lampBase, ...(mixing ? lampOn('#7ddc8a', '#2c5a33', '0 0 6px rgba(125,220,138,0.6)') : {}) }),
              Text({ unstyled: true, tag: 'span', className: 'lamp' + (offline ? ' on red' : ''), text: 'SIN SEÑAL', ...lampBase, ...(offline ? lampOn(colors.red, '#7a2a22', '0 0 6px rgba(255,90,74,0.6)') : {}) }),
            ],
          }),
        ],
      }),
      Container({
        unstyled: true, className: 'marquee',
        overflow: 'hidden', whiteSpace: 'nowrap', fontSize: 13, borderBottom: `1px dashed ${colors.amberDim}`, padding: '6px 0 4px', minHeight: 30, cursor: 'pointer',
        onPress: onExpand,
        child: Text({ unstyled: true, tag: 'span', className: 'track-in' + (title && title.length > 34 ? ' scroll' : ''), text: title || 'FREEPLAYER-MUSIC · ELIGE UNA CANCIÓN', display: 'inline-block' }),
      }),
      Canvas({ className: 'meter', width: '100%', height: 40, bufferWidth: 520, bufferHeight: 78, ref: (el) => { specRef = /** @type {HTMLCanvasElement} */ (el); startDraw(); }, display: 'block', marginTop: 8 }),
      Canvas({ className: 'vu', width: '100%', height: 18, bufferWidth: 520, bufferHeight: 40, ref: (el) => { vuRef = /** @type {HTMLCanvasElement} */ (el); startDraw(); }, display: 'block', marginTop: 6 }),
      Text({ unstyled: true, tag: 'div', className: 'party-tag', text: 'MODO FIESTA', position: 'absolute', right: 12, bottom: 6, fontSize: 8, letterSpacing: 2, color: colors.amber, textShadow: `0 0 6px ${colors.amberGlow}`, display: party ? 'block' : 'none' }),
    ],
  });

  /** @type {any} */ (shell)._cleanup = () => { if (raf) cancelAnimationFrame(raf); };
  return shell;
}
