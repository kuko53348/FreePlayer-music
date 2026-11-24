import { WidgetFactory } from 'flet-box';

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
    const has = i < 4; // mock: first 4 downloaded
    const dim = false;
    return WidgetFactory('div', {
      className: 'vrow',
      style: { top: (i * 58) + 'px', height: '58px' },
      child: WidgetFactory('div', {
        className: 'row' + (isCur ? ' playing' : '') + (dim ? ' dim' : ''),
        onClick: () => onPick && onPick(i),
        children: [
          ...(isCur ? [WidgetFactory('span', {
            className: 'eqbars' + (playing ? ' on' : ''),
            children: [WidgetFactory('i'), WidgetFactory('i'), WidgetFactory('i')],
          })] : []),
          WidgetFactory('div', {
            className: 'row-text',
            children: [
              WidgetFactory('div', { className: 't', text: lb.main }),
              WidgetFactory('div', { className: 's', text: lb.sub }),
            ],
          }),
          WidgetFactory('button', {
            className: 'dlbtn' + (has ? ' ok' : ''),
            onClick: (e) => e.stopPropagation(),
            child: WidgetFactory('span', { text: has ? '✓' : '↓' }),
          }),
        ],
      }),
    });
  };

  const list = WidgetFactory('div', {
    className: 'vlist',
    onScroll: (e) => onScrollPos && onScrollPos(e.currentTarget.scrollTop),
    child: items.length === 0
      ? WidgetFactory('div', { className: 'empty', text: 'No hay canciones.' })
      : WidgetFactory('div', {
          style: { height: (items.length * 58) + 'px', position: 'relative' },
          children: items.map(renderRow),
        }),
  });

  return list;
}
