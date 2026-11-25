import { Container, Text, Canvas } from 'flet-box';

const fmtTime = (s) => {
  if (!isFinite(s) || s < 0) return '0:00';
  const m = Math.floor(s / 60), sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, '0')}`;
};

export function Display({ title, trackKey, time, duration, playing, mixing, source, offline, party, showRemaining, onToggleTime, onExpand }) {
  const clock = showRemaining && isFinite(duration) ? '-' + fmtTime(duration - time) : fmtTime(time).padStart(5, '0');
  let specRef, vuRef, shellRef;
  let raf;

  const startDraw = () => {
    if (!specRef || !vuRef || !shellRef) return;
    const sc = specRef, vc = vuRef, shell = shellRef;
    const gs = sc.getContext('2d'), gv = vc.getContext('2d');
    const BARS = 26;
    const lv = new Float32Array(BARS), pk = new Float32Array(BARS);
    const vu = { l: 0, r: 0, pl: 0, pr: 0, hl: 0, hr: 0 };

    const fit = (c) => {
      const dpr = window.devicePixelRatio || 1;
      const w = c.clientWidth, h = c.clientHeight;
      if (!w || !h) return [0, 0];
      if (c.width !== Math.round(w * dpr)) { c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); }
      c.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);
      return [w, h];
    };
    const color = (l) => (l > 0.82 ? '#ff6a3a' : l > 0.58 ? '#ffc04a' : '#ffa62b');

    const draw = () => {
      const t = performance.now() / 1000;
      const active = shell.classList.contains('on');
      const partyOn = shell.classList.contains('party');
      const [w = 0, h = 0] = fit(sc);
      gs.clearRect(0, 0, w, h);
      const gap = 3, bw = (w - gap * (BARS - 1)) / BARS, seg = 4;
      for (let i = 0; i < BARS; i++) {
        const base = active ? (0.25 + 0.55 * Math.abs(Math.sin(t * 1.7 + i * 0.45)) * (0.5 + 0.5 * Math.sin(t * 0.7 + i * 0.18))) : 0.02;
        const v = base;
        lv[i] = v > lv[i] ? v : lv[i] * 0.86 + v * 0.14;
        const bh = Math.round((lv[i] * h) / seg) * seg;
        pk[i] = Math.max(pk[i] - 0.45, bh);
        const x = i * (bw + gap);
        for (let y = h - seg; y >= h - bh; y -= seg) {
          gs.fillStyle = color(1 - y / h);
          gs.fillRect(x, y + 1, bw, seg - 1.5);
        }
        gs.globalAlpha = 0.12; gs.fillStyle = '#ffa62b'; gs.fillRect(x, h - 2, bw, 2); gs.globalAlpha = 1;
        if (pk[i] > 2) { gs.fillStyle = '#ffd48a'; gs.fillRect(x, h - pk[i] - 2, bw, 1.5); }
      }

      const [vw = 0, vh = 0] = fit(vc);
      gv.clearRect(0, 0, vw, vh);
      const targetL = active ? 0.35 + 0.45 * Math.abs(Math.sin(t * 2.1)) : 0;
      const targetR = active ? 0.32 + 0.45 * Math.abs(Math.sin(t * 2.1 + 0.5)) : 0;
      vu.l = targetL > vu.l ? vu.l + (targetL - vu.l) * 0.6 : vu.l * 0.92;
      vu.r = targetR > vu.r ? vu.r + (targetR - vu.r) * 0.6 : vu.r * 0.92;
      const now = performance.now();
      if (vu.l >= vu.pl) { vu.pl = vu.l; vu.hl = now; } else if (now - vu.hl > 900) vu.pl *= 0.97;
      if (vu.r >= vu.pr) { vu.pr = vu.r; vu.hr = now; } else if (now - vu.hr > 900) vu.pr *= 0.97;
      const rowH = (vh - 4) / 2, segW = 5, segs = Math.floor((vw - 16) / segW);
      /** @type {[number, number, string][]} */
      ([[vu.l, vu.pl, 'L'], [vu.r, vu.pr, 'R']]).forEach(([val, peak, lbl], row) => {
        const y = row * (rowH + 4);
        gv.fillStyle = '#c7892b'; gv.font = '8px monospace'; gv.fillText(lbl, 0, y + rowH - 1);
        const lit = Math.round(val * segs), pkSeg = Math.round(peak * segs);
        for (let s = 0; s < segs; s++) {
          const f = s / segs;
          const on = s < lit || s === pkSeg - 1;
          gv.globalAlpha = on ? 0.95 : 0.1;
          gv.fillStyle = f > 0.88 ? '#ff4a3a' : f > 0.7 ? '#ffc04a' : '#ffa62b';
          gv.fillRect(10 + s * segW, y, segW - 1.5, rowH);
        }
        gv.globalAlpha = 1;
      });

      const beat = active && partyOn ? (0.4 + 0.6 * Math.abs(Math.sin(t * 4))) : 0;
      shell.style.setProperty('--beat', beat.toFixed(3));
      raf = requestAnimationFrame(draw);
    };
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(draw);
  };

  const shell = Container({
    tag: 'section',
    unstyled: true,
    className: 'display' + (party ? ' party' : '') + (playing ? ' on' : ''),
    ref: (el) => { shellRef = el; startDraw(); },
    children: [
      Container({
        unstyled: true,
        className: 'display-top',
        children: [
          Text({ unstyled: true, tag: 'span', className: 'state' + (playing ? ' blink' : ''), text: playing ? '▶' : title ? '❚❚' : '■' }),
          Text({ unstyled: true, tag: 'span', className: 'clock', text: clock, onPress: onToggleTime }),
          Container({
            unstyled: true,
            className: 'lamps',
            children: [
              Text({ unstyled: true, tag: 'span', className: 'lamp' + (source === 'cloud' ? ' on blue' : ''), text: 'NUBE' }),
              Text({ unstyled: true, tag: 'span', className: 'lamp' + (source === 'local' ? ' on' : ''), text: 'EN EL TELÉFONO' }),
              Text({ unstyled: true, tag: 'span', className: 'lamp' + (mixing ? ' on green' : ''), text: 'MEZCLANDO' }),
              Text({ unstyled: true, tag: 'span', className: 'lamp' + (offline ? ' on red' : ''), text: 'SIN SEÑAL' }),
            ],
          }),
        ],
      }),
      Container({
        unstyled: true,
        className: 'marquee',
        onPress: onExpand,
        child: Text({
          unstyled: true,
          tag: 'span',
          className: 'track-in' + (title && title.length > 34 ? ' scroll' : ''),
          text: title || 'PIXEL DECK · ELIGE UNA CANCIÓN',
        }),
      }),
      Canvas({ className: 'meter', ref: (el) => { specRef = el; startDraw(); } }),
      Canvas({ className: 'vu', ref: (el) => { vuRef = el; startDraw(); } }),
      Text({ unstyled: true, tag: 'div', className: 'party-tag', text: 'MODO FIESTA', display: party ? 'block' : 'none' }),
    ],
  });

  return shell;
}
