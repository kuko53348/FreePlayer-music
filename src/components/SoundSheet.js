import { WidgetFactory } from 'flet-box';

const EQ_LABELS = ['32', '64', '125', '250', '500', '1K', '2K', '4K', '8K', '16K'];
const PRESETS = ['PLANO', 'ROCK', 'POP', 'VOZ', 'BAJO+', 'DJ'];
const XFADES = [[0, 'NO'], [3, '3 s'], [6, '6 s'], [10, '10 s']];

export function SoundSheet({ open, onClose, party, onToggleParty }) {
  let wrapRef;
  const close = () => { wrapRef?.classList.remove('open'); onClose && onClose(); };
  const openSheet = () => { wrapRef?.classList.add('open'); };

  const mkBand = (label, value, cls = '') => WidgetFactory('div', {
    className: 'band ' + cls,
    children: [
      WidgetFactory('span', { className: 'db', text: (value > 0 ? '+' : '') + Number(value).toFixed(0) }),
      WidgetFactory('input', {
        type: 'range', min: '-12', max: '12', step: '0.5', value: String(value),
        onInput: (e) => {
          const db = e.target.parentElement.querySelector('.db');
          const v = parseFloat(e.target.value);
          if (db) db.textContent = (v > 0 ? '+' : '') + v.toFixed(0);
        },
        onDblClick: (e) => { e.target.value = '0'; const db = e.target.parentElement.querySelector('.db'); if (db) db.textContent = '0'; },
      }),
      WidgetFactory('label', { text: label }),
    ],
  });

  const bands = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  const wrap = WidgetFactory('div', {
    className: 'sheet-wrap' + (open ? ' open' : ''),
    ref: (el) => { wrapRef = el; },
    onClick: (e) => { if (e.target === wrapRef) close(); },
    child: WidgetFactory('div', {
      className: 'sheet',
      onClick: (e) => e.stopPropagation(),
      children: [
        WidgetFactory('div', { className: 'grabber' }),
        WidgetFactory('div', {
          className: 'sheet-head',
          children: [
            WidgetFactory('h3', { text: 'SONIDO' }),
            WidgetFactory('button', { className: 'pill', text: 'LISTO', onClick: close }),
          ],
        }),

        WidgetFactory('div', { className: 'section-title', text: 'TRANSICIÓN ENTRE CANCIONES' }),
        WidgetFactory('div', {
          className: 'seg',
          children: XFADES.map(([v, l], i) => WidgetFactory('button', {
            className: i === 1 ? 'on' : '',
            text: l,
            onClick: (e) => {
              e.currentTarget.parentElement.querySelectorAll('button').forEach((b) => b.classList.remove('on'));
              e.currentTarget.classList.add('on');
            },
          })),
        }),

        WidgetFactory('button', {
          className: 'party-card' + (party ? ' on' : ''),
          onClick: (e) => {
            const on = e.currentTarget.classList.toggle('on');
            const title = e.currentTarget.querySelector('.party-title');
            if (title) title.textContent = `🎉 MODO FIESTA ${on ? 'ACTIVADO' : ''}`;
            onToggleParty && onToggleParty(on);
          },
          children: [
            WidgetFactory('span', { className: 'party-title', text: `🎉 MODO FIESTA ${party ? 'ACTIVADO' : ''}` }),
            WidgetFactory('span', { className: 'party-desc', text: 'Mezcla larga estilo DJ (cambio de graves entre canciones), orden aleatorio sin repetir y luces que siguen el ritmo.' }),
          ],
        }),

        WidgetFactory('div', {
          className: 'section-title eq-title',
          children: [
            document.createTextNode('ECUALIZADOR'),
            WidgetFactory('button', {
              className: 'pill small on',
              text: 'ON',
              onClick: (e) => {
                const on = e.currentTarget.classList.toggle('on');
                e.currentTarget.textContent = on ? 'ON' : 'OFF';
                wrap.querySelector('.eq-bands')?.classList.toggle('off', !on);
              },
            }),
          ],
        }),
        WidgetFactory('div', {
          className: 'presets',
          children: PRESETS.map((p) => WidgetFactory('button', { className: 'chip', text: p })),
        }),
        WidgetFactory('div', {
          className: 'eq-bands',
          children: [
            mkBand('PRE', 0, 'pre'),
            ...EQ_LABELS.map((l, i) => mkBand(l, bands[i])),
            mkBand('MASTER', 0, 'master'),
          ],
        }),
        WidgetFactory('p', { className: 'sheet-hint', text: 'Doble toque en un control lo deja en 0. Un limitador protege el sonido para que no se sature aunque subas el MASTER.' }),
      ],
    }),
  });

  wrap.open = openSheet;
  wrap.close = close;
  return wrap;
}
