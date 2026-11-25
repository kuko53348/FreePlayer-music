import { Container, Text, Button, RangeInput } from 'flet-box';
import { colors, fonts } from '../theme.js';

const EQ_LABELS = ['32', '64', '125', '250', '500', '1K', '2K', '4K', '8K', '16K'];
const PRESETS = ['PLANO', 'ROCK', 'POP', 'VOZ', 'BAJO+', 'DJ'];
const XFADES = [[0, 'NO'], [3, '3 s'], [6, '6 s'], [10, '10 s']];

export function SoundSheet({ open, onClose, party, onToggleParty }) {
  /** @type {HTMLElement | undefined} */
  let wrapRef;

  const close = () => { wrapRef?.classList.remove('open'); onClose && onClose(); };
  const openSheet = () => { wrapRef?.classList.add('open'); };

  const mkBand = (label, value, cls = '') => Container({
    unstyled: true, className: 'band ' + cls,
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1, minWidth: 0,
    children: [
      Text({ unstyled: true, tag: 'span', className: 'db', text: (value > 0 ? '+' : '') + Number(value).toFixed(0), fontFamily: fonts.mono, fontSize: 8, color: '#8a7a5a', height: 10 }),
      RangeInput({
        min: -12, max: 12, step: 0.5, value,
        onInput: (e) => {
          const input = /** @type {HTMLInputElement} */ (e.target);
          const db = input.parentElement?.querySelector('.db');
          const v = parseFloat(input.value);
          if (db) db.textContent = (v > 0 ? '+' : '') + v.toFixed(0);
        },
        onDblClick: (e) => {
          const input = /** @type {HTMLInputElement} */ (e.target);
          input.value = '0';
          const db = input.parentElement?.querySelector('.db');
          if (db) db.textContent = '0';
        },
      }),
      Text({ unstyled: true, tag: 'label', text: label, fontFamily: fonts.mono, fontSize: 8, color: cls ? colors.amber : colors.muted }),
    ],
  });

  const bands = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  const wrap = /** @type {any} */ (Container({
    unstyled: true, className: 'sheet-wrap' + (open ? ' open' : ''),
    position: 'fixed', inset: 0, zIndex: 25, background: 'rgba(0,0,0,0)', pointerEvents: open ? 'auto' : 'none',
    ref: (el) => { wrapRef = /** @type {HTMLElement} */ (el); },
    onPress: (e) => { if (e.target === wrapRef) close(); },
    child: Container({
      unstyled: true, className: 'sheet',
      position: 'absolute', left: 0, right: 0, bottom: 0, maxHeight: '88%', overflowY: 'auto',
      background: 'linear-gradient(#2a2c33, #1b1c21)', borderTop: '1px solid #000', borderRadius: '18px 18px 0 0',
      padding: '8px 14px calc(env(safe-area-inset-bottom) + 18px)',
      boxShadow: '0 -10px 40px rgba(0,0,0,0.6)',
      onPress: (e) => e.stopPropagation(),
      children: [
        Container({ unstyled: true, className: 'grabber', width: 40, height: 4, borderRadius: 2, background: '#4a4d56', margin: '4px auto 10px' }),
        Container({
          unstyled: true, className: 'sheet-head',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8,
          children: [
            Text({ unstyled: true, tag: 'h3', text: 'SONIDO', margin: 0, color: colors.amber, letterSpacing: 3, fontSize: 15 }),
            Button({ unstyled: true, className: 'pill', text: 'LISTO', height: 30, padding: '0 12px', borderRadius: 15, border: '1px solid #000', background: 'linear-gradient(#30333a, #22242a)', color: colors.muted, fontSize: 10, letterSpacing: 1, fontWeight: '700', onPress: close }),
          ],
        }),
        Text({ unstyled: true, tag: 'div', className: 'section-title', text: 'TRANSICIÓN ENTRE CANCIONES', fontSize: 10, letterSpacing: 2, color: colors.muted, margin: '14px 0 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }),
        Container({
          unstyled: true, className: 'seg',
          display: 'flex', background: '#121317', border: '1px solid #000', borderRadius: 10, padding: 3, gap: 3,
          children: XFADES.map(([v, l], i) => Button({
            unstyled: true, className: i === 1 ? 'on' : '',
            text: String(l), flex: 1, height: 34, border: 'none', borderRadius: 8,
            background: i === 1 ? '#2e3037' : 'transparent', color: i === 1 ? colors.amber : colors.muted,
            fontWeight: '700', fontSize: 12,
            onPress: (e) => {
              const btn = /** @type {HTMLElement} */ (e.currentTarget);
              btn.parentElement?.querySelectorAll('button').forEach((b) => { b.classList.remove('on'); b.style.background = 'transparent'; b.style.color = colors.muted; });
              btn.classList.add('on'); btn.style.background = '#2e3037'; btn.style.color = colors.amber;
            },
          })),
        }),
        Button({
          unstyled: true, className: 'party-card' + (party ? ' on' : ''),
          display: 'block', width: '100%', marginTop: 12, textAlign: 'left', padding: 12, borderRadius: 12,
          border: '1px solid #000', background: '#17181d', color: colors.text,
          onPress: (e) => {
            const card = /** @type {HTMLElement} */ (e.currentTarget);
            const onNow = card.classList.toggle('on');
            const title = card.querySelector('.party-title');
            if (title) title.textContent = `🎉 MODO FIESTA ${onNow ? 'ACTIVADO' : ''}`;
            onToggleParty && onToggleParty(onNow);
          },
          children: [
            Text({ unstyled: true, tag: 'span', className: 'party-title', text: `🎉 MODO FIESTA ${party ? 'ACTIVADO' : ''}`, display: 'block', fontWeight: '800', letterSpacing: 1, fontSize: 13, color: party ? '#fff' : colors.muted }),
            Text({ unstyled: true, tag: 'span', className: 'party-desc', text: 'Mezcla larga estilo DJ (cambio de graves entre canciones), orden aleatorio sin repetir y luces que siguen el ritmo.', display: 'block', fontSize: 11, color: '#6c707a', marginTop: 4, lineHeight: 1.45 }),
          ],
        }),
        Container({
          unstyled: true, className: 'section-title eq-title',
          fontSize: 10, letterSpacing: 2, color: colors.muted, margin: '14px 0 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          children: [
            Text({ unstyled: true, tag: 'span', text: 'ECUALIZADOR' }),
            Button({
              unstyled: true, className: 'pill small on', text: 'ON',
              height: 24, padding: '0 10px', borderRadius: 15, border: '1px solid #000', background: 'linear-gradient(#30333a, #22242a)', color: colors.amber, fontSize: 10, letterSpacing: 1, fontWeight: '700',
              onPress: (e) => {
                const btn = /** @type {HTMLElement} */ (e.currentTarget);
                const onNow = btn.classList.toggle('on');
                btn.textContent = onNow ? 'ON' : 'OFF';
                btn.style.color = onNow ? colors.amber : colors.muted;
                wrap.querySelector('.eq-bands')?.classList.toggle('off', !onNow);
              },
            }),
          ],
        }),
        Container({
          unstyled: true, className: 'presets',
          display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 8,
          children: PRESETS.map((p) => Button({ unstyled: true, className: 'chip', text: p, height: 28, padding: '0 10px', borderRadius: 14, border: '1px solid #000', background: '#17181d', color: colors.muted, fontSize: 11, whiteSpace: 'nowrap' })),
        }),
        Container({
          unstyled: true, className: 'eq-bands',
          display: 'flex', justifyContent: 'space-between', gap: 2, padding: '8px 2px', background: '#121317', border: '1px solid #000', borderRadius: 12, transition: 'opacity .2s ease',
          children: [mkBand('PRE', 0, 'pre'), ...EQ_LABELS.map((l, i) => mkBand(l, bands[i])), mkBand('MASTER', 0, 'master')],
        }),
        Text({ unstyled: true, tag: 'p', className: 'sheet-hint', text: 'Doble toque en un control lo deja en 0. Un limitador protege el sonido para que no se sature aunque subas el MASTER.', fontSize: 11, color: '#6c707a', lineHeight: 1.5, margin: '10px 2px 0' }),
      ],
    }),
  }));

  wrap.open = openSheet;
  wrap.close = close;
  return wrap;
}
