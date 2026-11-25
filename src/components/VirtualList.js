import { Container, Text, Button } from 'flet-box';
import { colors, fonts } from '../theme.js';

const topFolder = (key) => key.split('/').slice(0, -1).join('/') || key.split('/')[0] || '';
const labels = (t) => {
  const main = t.title || t.key.split('/').pop().replace(/\.[^.]+$/, '');
  const sub = [t.artist, t.album].filter(Boolean).join(' · ') || topFolder(t.key);
  return { main, sub };
};

export function VirtualList({ items, currentKey, playing, onPick, onScrollPos }) {
  const renderRow = (t, i) => {
    const lb = labels(t);
    const isCur = t.key === currentKey;
    const has = i < 4;
    return Container({
      unstyled: true, className: 'vrow',
      position: 'absolute', left: 0, right: 0, top: i * 58, height: 58,
      child: Container({
        unstyled: true, className: 'row' + (isCur ? ' playing' : ''),
        height: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '0 6px 0 12px',
        borderBottom: '1px solid rgba(255,255,255,0.03)', fontFamily: fonts.mono,
        transition: 'background .15s ease',
        onPress: () => onPick && onPick(i),
        children: [
          ...(isCur ? [Container({
            unstyled: true, tag: 'span', className: 'eqbars' + (playing ? ' on' : ''),
            display: 'flex', alignItems: 'flex-end', gap: 2, height: 14, width: 14, flex: 'none',
            children: [
              Container({ unstyled: true, tag: 'i', width: 3, height: 4, background: colors.amber, borderRadius: 1, boxShadow: `0 0 4px ${colors.amberGlow}` }),
              Container({ unstyled: true, tag: 'i', width: 3, height: 4, background: colors.amber, borderRadius: 1, boxShadow: `0 0 4px ${colors.amberGlow}` }),
              Container({ unstyled: true, tag: 'i', width: 3, height: 4, background: colors.amber, borderRadius: 1, boxShadow: `0 0 4px ${colors.amberGlow}` }),
            ],
          })] : []),
          Container({
            unstyled: true, className: 'row-text', flex: 1, minWidth: 0,
            children: [
              Text({ unstyled: true, tag: 'div', className: 't', text: lb.main, fontSize: 13, color: isCur ? colors.amber : '#c3c6ce', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textShadow: isCur ? `0 0 5px ${colors.amberGlow}` : 'none' }),
              Text({ unstyled: true, tag: 'div', className: 's', text: lb.sub, fontSize: 10, color: '#5f6470', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 3 }),
            ],
          }),
          Button({
            unstyled: true, className: 'dlbtn' + (has ? ' ok' : ''),
            width: 44, height: 40, background: 'none', border: 'none', color: has ? '#7ddc8a' : colors.muted,
            fontFamily: fonts.mono, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center',
            onPress: (e) => e.stopPropagation(),
            children: [Text({ unstyled: true, tag: 'span', text: has ? '✓' : '↓', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: '50%', fontSize: 12 })],
          }),
        ],
      }),
    });
  };

  return Container({
    unstyled: true, className: 'vlist',
    flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'thin', scrollbarColor: '#3a3d45 transparent',
    onScroll: (e) => onScrollPos && onScrollPos(/** @type {HTMLElement} */ (e.currentTarget).scrollTop),
    child: items.length === 0
      ? Container({ unstyled: true, className: 'empty', padding: '36px 24px', textAlign: 'center', color: '#5f6470', lineHeight: 1.7, fontFamily: fonts.mono, fontSize: 12, child: Text({ unstyled: true, tag: 'div', text: 'No hay canciones aquí.\nSi tienes internet, toca ACTUALIZAR.' }) })
      : Container({ unstyled: true, position: 'relative', height: items.length * 58, children: items.map(renderRow) }),
  });
}
