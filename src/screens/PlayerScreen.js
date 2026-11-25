import { Container, Text, Button, Input, RangeInput } from 'flet-box';
import { Display } from '../components/Display.js';
import { SoundSheet } from '../components/SoundSheet.js';
import { VirtualList } from '../components/VirtualList.js';

const MOCK_TRACKS = [
  { key: 'ROCK/Queen/Bohemian Rhapsody.mp3', title: 'Bohemian Rhapsody', artist: 'Queen', album: 'A Night at the Opera' },
  { key: 'ROCK/Queen/Don\'t Stop Me Now.mp3', title: "Don't Stop Me Now", artist: 'Queen', album: 'Jazz' },
  { key: 'ROCK/Pink Floyd/Comfortably Numb.mp3', title: 'Comfortably Numb', artist: 'Pink Floyd', album: 'The Wall' },
  { key: 'REGGAETON/Bad Bunny/Titi Me Pregunto.mp3', title: 'Tití Me Preguntó', artist: 'Bad Bunny', album: 'Un Verano Sin Ti' },
  { key: 'REGGAETON/Feid/Normal.mp3', title: 'Normal', artist: 'Feid', album: 'Feliz Cumpleaños Ferxxo' },
  { key: 'ROMANTICA/Luis Miguel/La Incondicional.mp3', title: 'La Incondicional', artist: 'Luis Miguel', album: 'Busca Una Mujer' },
  { key: 'ROMANTICA/Ricardo Arjona/Mujeres.mp3', title: 'Mujeres', artist: 'Ricardo Arjona', album: 'Animal Nocturno' },
  { key: 'ELECTRONICA/Daft Punk/One More Time.mp3', title: 'One More Time', artist: 'Daft Punk', album: 'Discovery' },
  { key: 'ELECTRONICA/Avicii/Levels.mp3', title: 'Levels', artist: 'Avicii', album: 'Levels' },
  { key: 'POP/Michael Jackson/Billie Jean.mp3', title: 'Billie Jean', artist: 'Michael Jackson', album: 'Thriller' },
  { key: 'POP/The Weeknd/Blinding Lights.mp3', title: 'Blinding Lights', artist: 'The Weeknd', album: 'After Hours' },
  { key: 'ROCK/Soda Stereo/De Musica Ligera.mp3', title: 'De Música Ligera', artist: 'Soda Stereo', album: 'Canción Animal' },
];

const topFolder = (key) => key.split('/')[0] || 'MÚSICA';
const fmtTime = (s) => {
  if (!isFinite(s) || s < 0) return '0:00';
  const m = Math.floor(s / 60), sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, '0')}`;
};

export const PlayerScreen = () => {
  let playing = true;
  let tab = 'cloud';
  let folder = '';
  let search = '';
  let shuffle = false;
  let repeat = 'all';
  let party = false;
  let compact = false;
  let qi = 0;
  let showRemaining = false;
  let soundSheet;

  const getVisible = () => {
    const words = search.toLowerCase().split(' ').filter(Boolean);
    let base = tab === 'downloads' ? MOCK_TRACKS.slice(0, 4) : MOCK_TRACKS;
    if (tab === 'cloud' && folder) base = base.filter((t) => topFolder(t.key) === folder);
    if (words.length) base = base.filter((t) => words.every((w) => `${t.title} ${t.artist} ${t.album} ${t.key}`.toLowerCase().includes(w)));
    return base;
  };

  let appEl, playBtn, shuffleBtn, repeatBtn, fiestaBtn;
  let tabsWrap, chipsWrap, plBar, listMount, displayEl;
  let clockEl, stateEl, marqueeSpan, lampMix, partyTag;

  const current = () => MOCK_TRACKS[qi] || MOCK_TRACKS[0];
  const pos = 83;
  const dur = 354;

  function rerenderPlaylist() {
    const visible = getVisible();
    const filtered = !!(search || folder);
    tabsWrap?.querySelectorAll('.tab[data-tab]').forEach((b) => b.classList.toggle('on', b.dataset.tab === tab));

    chipsWrap.style.display = tab === 'cloud' ? 'flex' : 'none';
    chipsWrap.innerHTML = '';
    const all = Button({ unstyled: true, className: 'chip' + (!folder ? ' on' : ''), text: `TODAS · ${MOCK_TRACKS.length}`, onPress: () => { folder = ''; rerenderPlaylist(); } });
    chipsWrap.appendChild(all);
    const folders = [...new Set(MOCK_TRACKS.map((t) => topFolder(t.key)))]
      .map((f) => [f, MOCK_TRACKS.filter((t) => topFolder(t.key) === f).length])
      .sort((a, b) => a[0].localeCompare(b[0], 'es', { numeric: true }));
    folders.forEach(([f, n]) => {
      chipsWrap.appendChild(Button({ unstyled: true, className: 'chip' + (folder === f ? ' on' : ''), text: `${f} · ${n}`, onPress: () => { folder = folder === f ? '' : f; rerenderPlaylist(); } }));
    });

    plBar.innerHTML = '';
    plBar.appendChild(Text({ unstyled: true, tag: 'span', className: 'count', text: `${visible.length} ${visible.length === 1 ? 'canción' : 'canciones'}` }));
    if (tab === 'cloud' && filtered && visible.length > 0) {
      plBar.appendChild(Button({ unstyled: true, className: 'pill', text: '↓ DESCARGAR ESTAS' }));
    } else if (tab === 'cloud' && !filtered) {
      plBar.appendChild(Button({ unstyled: true, className: 'pill', text: '↻ ACTUALIZAR' }));
    }

    listMount.innerHTML = '';
    listMount.appendChild(VirtualList({
      items: visible,
      currentKey: current().key,
      playing,
      onPick: (i) => {
        const real = MOCK_TRACKS.findIndex((t) => t.key === visible[i].key);
        if (real >= 0) qi = real;
        playing = true;
        syncPlayer();
        rerenderPlaylist();
      },
      onScrollPos: (y) => {
        const next = y > 80;
        if (next !== compact) { compact = next; appEl.classList.toggle('compact', compact); }
      },
    }));
  }

  function syncPlayer() {
    const cur = current();
    playBtn.textContent = playing ? '❚❚' : '▶';
    playBtn.classList.toggle('active', playing);
    shuffleBtn.classList.toggle('on', shuffle || party);
    shuffleBtn.disabled = party;
    repeatBtn.classList.toggle('on', repeat !== 'off');
    repeatBtn.textContent = ({ off: 'REP: NO', all: 'REP: TODO', one: 'REP: UNA' })[repeat];
    fiestaBtn.classList.toggle('on', party);
    appEl.classList.toggle('party', party);
    displayEl.classList.toggle('party', party);
    displayEl.classList.toggle('on', playing);
    stateEl.textContent = playing ? '▶' : '❚❚';
    stateEl.classList.toggle('blink', playing);
    lampMix.classList.toggle('on', party);
    if (partyTag) partyTag.style.display = party ? '' : 'none';
    clockEl.textContent = showRemaining ? '-' + fmtTime(dur - pos) : fmtTime(pos).padStart(5, '0');
    marqueeSpan.textContent = `${qi + 1}. ${cur.title.toUpperCase()}`;
    marqueeSpan.className = 'track-in' + (marqueeSpan.textContent.length > 34 ? ' scroll' : '');
    const pc = soundSheet?.querySelector('.party-card');
    if (pc) { pc.classList.toggle('on', party); const pt = pc.querySelector('.party-title'); if (pt) pt.textContent = `🎉 MODO FIESTA ${party ? 'ACTIVADO' : ''}`; }
  }

  const pct = (pos / dur) * 100;

  displayEl = Display({
    title: `${qi + 1}. ${current().title.toUpperCase()}`,
    trackKey: current().key,
    time: pos, duration: dur, playing, mixing: party, source: 'cloud', offline: false, party,
    showRemaining, onToggleTime: () => { showRemaining = !showRemaining; syncPlayer(); },
    onExpand: () => { compact = false; appEl.classList.remove('compact'); const v = listMount.querySelector('.vlist'); if (v) v.scrollTo({ top: 0, behavior: 'smooth' }); },
  });

  clockEl = displayEl.querySelector('.clock');
  stateEl = displayEl.querySelector('.state');
  marqueeSpan = displayEl.querySelector('.marquee span');
  lampMix = displayEl.querySelectorAll('.lamp')[2];
  partyTag = displayEl.querySelector('.party-tag');

  appEl = Container({
    unstyled: true,
    className: 'app' + (party ? ' party' : ''),
    children: [
      Container({
        unstyled: true,
        tag: 'header',
        className: 'titlebar',
        children: [
          Text({
            unstyled: true, tag: 'span', className: 'brand',
            children: [document.createTextNode('PIXEL'), Text({ unstyled: true, tag: 'b', text: 'DECK' })],
          }),
          Text({ unstyled: true, tag: 'span', className: 'maker', text: 'SOLIDPIXEL · HI-FI' }),
        ],
      }),
      displayEl,
      Container({
        unstyled: true,
        className: 'seekrow',
        children: [
          Text({ unstyled: true, tag: 'span', text: fmtTime(pos) }),
          RangeInput({
            min: 0, max: 1000, value: Math.round(pct * 10),
            ref: (el) => { el.style.setProperty('--p', pct + '%'); },
          }),
          Text({ unstyled: true, tag: 'span', text: fmtTime(dur) }),
        ],
      }),
      Container({
        unstyled: true,
        tag: 'section',
        className: 'transport',
        children: [
          Container({
            unstyled: true,
            className: 'keys',
            children: [
              Button({ unstyled: true, className: 'key', text: '⏮', onPress: () => { qi = (qi - 1 + MOCK_TRACKS.length) % MOCK_TRACKS.length; playing = true; syncPlayer(); rerenderPlaylist(); } }),
              Button({ unstyled: true, className: 'key play active', text: '❚❚', ref: (el) => { playBtn = el; }, onPress: () => { playing = !playing; syncPlayer(); rerenderPlaylist(); } }),
              Button({ unstyled: true, className: 'key', text: '⏭', onPress: () => { qi = (qi + 1) % MOCK_TRACKS.length; playing = true; syncPlayer(); rerenderPlaylist(); } }),
            ],
          }),
          Container({
            unstyled: true,
            className: 'toggles',
            children: [
              Button({ unstyled: true, className: 'pill', text: 'ALEAT.', ref: (el) => { shuffleBtn = el; }, onPress: () => { shuffle = !shuffle; syncPlayer(); } }),
              Button({ unstyled: true, className: 'pill on', text: 'REP: TODO', ref: (el) => { repeatBtn = el; }, onPress: () => { repeat = ({ off: 'all', all: 'one', one: 'off' })[repeat]; syncPlayer(); } }),
              Button({ unstyled: true, className: 'pill on', text: 'EQ', onPress: () => soundSheet.open() }),
              Button({ unstyled: true, className: 'pill fiesta', text: 'FIESTA', ref: (el) => { fiestaBtn = el; }, onPress: () => { party = !party; syncPlayer(); } }),
            ],
          }),
        ],
      }),
      Container({
        unstyled: true,
        tag: 'section',
        className: 'playlist',
        children: [
          Container({
            unstyled: true,
            className: 'tabs',
            ref: (el) => { tabsWrap = el; },
            children: [
              Button({ unstyled: true, className: 'tab on', text: '☁ NUBE', onPress: () => { tab = 'cloud'; rerenderPlaylist(); } }),
              Button({ unstyled: true, className: 'tab', text: '↓ DESCARGAS (4)', onPress: () => { tab = 'downloads'; rerenderPlaylist(); } }),
              Button({ unstyled: true, className: 'tab cfg', text: '⚙' }),
            ],
          }),
          Container({
            unstyled: true,
            className: 'pl-head',
            child: Input({
              bare: true,
              type: 'search',
              placeholder: 'Buscar artista, canción o carpeta',
              onInput: (val) => { search = val; rerenderPlaylist(); },
            }),
          }),
          Container({ unstyled: true, className: 'chips', ref: (el) => { chipsWrap = el; } }),
          Container({ unstyled: true, className: 'pl-bar', ref: (el) => { plBar = el; } }),
          Container({ unstyled: true, ref: (el) => { listMount = el; el.style.display = 'contents'; } }),
        ],
      }),
    ],
  });

  soundSheet = SoundSheet({ open: false, onClose: () => {}, party, onToggleParty: (on) => { party = on; syncPlayer(); } });
  appEl.appendChild(soundSheet);

  const tabBtns = tabsWrap.querySelectorAll('.tab');
  if (tabBtns[0]) tabBtns[0].dataset.tab = 'cloud';
  if (tabBtns[1]) tabBtns[1].dataset.tab = 'downloads';

  rerenderPlaylist();
  syncPlayer();
  return appEl;
};

export default PlayerScreen;
