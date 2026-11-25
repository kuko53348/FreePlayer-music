import { Container, Text, Button } from 'flet-box';

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
      unstyled: true,
      className: 'vrow',
      position: 'absolute',
      top: i * 58,
      height: 58,
      child: Container({
        unstyled: true,
        className: 'row' + (isCur ? ' playing' : ''),
        onPress: () => onPick && onPick(i),
        children: [
          ...(isCur ? [Container({
            unstyled: true,
            tag: 'span',
            className: 'eqbars' + (playing ? ' on' : ''),
            children: [
              Text({ unstyled: true, tag: 'i', text: '' }),
              Text({ unstyled: true, tag: 'i', text: '' }),
              Text({ unstyled: true, tag: 'i', text: '' }),
            ],
          })] : []),
          Container({
            unstyled: true,
            className: 'row-text',
            children: [
              Text({ unstyled: true, tag: 'div', className: 't', text: lb.main }),
              Text({ unstyled: true, tag: 'div', className: 's', text: lb.sub }),
            ],
          }),
          Button({
            unstyled: true,
            className: 'dlbtn' + (has ? ' ok' : ''),
            onPress: (e) => e.stopPropagation(),
            child: Text({ unstyled: true, tag: 'span', text: has ? '✓' : '↓' }),
          }),
        ],
      }),
    });
  };

  return Container({
    unstyled: true,
    className: 'vlist',
    onScroll: (e) => onScrollPos && onScrollPos(/** @type {HTMLElement} */ (e.currentTarget).scrollTop),
    child: items.length === 0
      ? Text({ unstyled: true, tag: 'div', className: 'empty', text: 'No hay canciones.' })
      : Container({
          unstyled: true,
          position: 'relative',
          height: items.length * 58,
          children: items.map(renderRow),
        }),
  });
}
