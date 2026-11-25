import { Container, Text, Button, RangeInput } from 'flet-box';

const EQ_LABELS = ['32', '64', '125', '250', '500', '1K', '2K', '4K', '8K', '16K'];
const PRESETS = ['PLANO', 'ROCK', 'POP', 'VOZ', 'BAJO+', 'DJ'];
const XFADES = [[0, 'NO'], [3, '3 s'], [6, '6 s'], [10, '10 s']];

export function SoundSheet({ open, onClose, party, onToggleParty }) {
  /** @type {HTMLElement | undefined} */
  let wrapRef;

  const close = () => { wrapRef?.classList.remove('open'); onClose && onClose(); };
  const openSheet = () => { wrapRef?.classList.add('open'); };

  const mkBand = (label, value, cls = '') => Container({
    unstyled: true,
    className: 'band ' + cls,
    children: [
      Text({ unstyled: true, tag: 'span', className: 'db', text: (value > 0 ? '+' : '') + Number(value).toFixed(0) }),
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
      Text({ unstyled: true, tag: 'label', text: label }),
    ],
  });

  const bands = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  const wrap = /** @type {any} */ (Container({
    unstyled: true,
    className: 'sheet-wrap' + (open ? ' open' : ''),
    ref: (el) => { wrapRef = /** @type {HTMLElement} */ (el); },
    onPress: (e) => { if (e.target === wrapRef) close(); },
    child: Container({
      unstyled: true,
      className: 'sheet',
      onPress: (e) => e.stopPropagation(),
      children: [
        Container({ unstyled: true, className: 'grabber' }),
        Container({
          unstyled: true,
          className: 'sheet-head',
          children: [
            Text({ unstyled: true, tag: 'h3', text: 'SONIDO' }),
            Button({ unstyled: true, className: 'pill', text: 'LISTO', onPress: close }),
          ],
        }),
        Text({ unstyled: true, tag: 'div', className: 'section-title', text: 'TRANSICIÓN ENTRE CANCIONES' }),
        Container({
          unstyled: true,
          className: 'seg',
          children: XFADES.map(([v, l], i) => Button({
            unstyled: true,
            className: i === 1 ? 'on' : '',
            text: String(l),
            onPress: (e) => {
              const btn = /** @type {HTMLElement} */ (e.currentTarget);
              btn.parentElement?.querySelectorAll('button').forEach((b) => b.classList.remove('on'));
              btn.classList.add('on');
            },
          })),
        }),
        Button({
          unstyled: true,
          className: 'party-card' + (party ? ' on' : ''),
          onPress: (e) => {
            const card = /** @type {HTMLElement} */ (e.currentTarget);
            const onNow = card.classList.toggle('on');
            const title = card.querySelector('.party-title');
            if (title) title.textContent = `🎉 MODO FIESTA ${onNow ? 'ACTIVADO' : ''}`;
            onToggleParty && onToggleParty(onNow);
          },
          children: [
            Text({ unstyled: true, tag: 'span', className: 'party-title', text: `🎉 MODO FIESTA ${party ? 'ACTIVADO' : ''}` }),
            Text({ unstyled: true, tag: 'span', className: 'party-desc', text: 'Mezcla larga estilo DJ (cambio de graves entre canciones), orden aleatorio sin repetir y luces que siguen el ritmo.' }),
          ],
        }),
        Container({
          unstyled: true,
          className: 'section-title eq-title',
          children: [
            Text({ unstyled: true, tag: 'span', text: 'ECUALIZADOR' }),
            Button({
              unstyled: true,
              className: 'pill small on',
              text: 'ON',
              onPress: (e) => {
                const btn = /** @type {HTMLElement} */ (e.currentTarget);
                const onNow = btn.classList.toggle('on');
                btn.textContent = onNow ? 'ON' : 'OFF';
                wrap.querySelector('.eq-bands')?.classList.toggle('off', !onNow);
              },
            }),
          ],
        }),
        Container({
          unstyled: true,
          className: 'presets',
          children: PRESETS.map((p) => Button({ unstyled: true, className: 'chip', text: p })),
        }),
        Container({
          unstyled: true,
          className: 'eq-bands',
          children: [
            mkBand('PRE', 0, 'pre'),
            ...EQ_LABELS.map((l, i) => mkBand(l, bands[i])),
            mkBand('MASTER', 0, 'master'),
          ],
        }),
        Text({ unstyled: true, tag: 'p', className: 'sheet-hint', text: 'Doble toque en un control lo deja en 0. Un limitador protege el sonido para que no se sature aunque subas el MASTER.' }),
      ],
    }),
  }));

  wrap.open = openSheet;
  wrap.close = close;
  return wrap;
}