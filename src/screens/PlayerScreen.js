import { Audio, Container, Text, Button, Input, RangeInput } from 'flet-box';
import { Display } from '../components/Display.js';
import { SoundSheet } from '../components/SoundSheet.js';
import { VirtualList } from '../components/VirtualList.js';
import { colors, fonts } from '../theme.js';

const DEMO_SRCS = [
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
];

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
].map((t, i) => ({ ...t, src: DEMO_SRCS[i % DEMO_SRCS.length] }));

const topFolder = (key) => key.split('/')[0] || 'MÚSICA';
const fmtTime = (s) => {
  if (!isFinite(s) || s < 0) return '0:00';
  const m = Math.floor(s / 60), sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, '0')}`;
};

export const PlayerScreen = () => {
  let playing = false;
  let tab = 'cloud';
  let folder = '';
  let search = '';
  let shuffle = false;
  let repeat = 'off';
  let party = false;
  let compact = false;
  let qi = 0;
  let showRemaining = false;
  let pos = 0;
  let dur = 0;
  let soundSheet;

  /** @type {any} */
  let audio;
  /** @type {HTMLInputElement | undefined} */
  let seekRef;
  /** @type {HTMLElement | undefined} */
  let seekCurEl;
  /** @type {HTMLElement | undefined} */
  let seekDurEl;

  const getVisible = () => {
    const words = search.toLowerCase().split(' ').filter(Boolean);
    let base = tab === 'downloads' ? MOCK_TRACKS.slice(0, 4) : MOCK_TRACKS;
    if (tab === 'cloud' && folder) base = base.filter((t) => topFolder(t.key) === folder);
    if (words.length) base = base.filter((t) => words.every((w) => `${t.title} ${t.artist} ${t.album} ${t.key}`.toLowerCase().includes(w)));
    return base;
  };

  /** @type {any} */ let appEl;
  /** @type {any} */ let playBtn;
  /** @type {any} */ let shuffleBtn;
  /** @type {any} */ let repeatBtn;
  /** @type {any} */ let fiestaBtn;
  /** @type {any} */ let tabsWrap;
  /** @type {any} */ let chipsWrap;
  /** @type {any} */ let plBar;
  /** @type {any} */ let listMount;
  /** @type {any} */ let displayEl;
  /** @type {any} */ let clockEl;
  /** @type {any} */ let stateEl;
  /** @type {any} */ let marqueeSpan;
  /** @type {any} */ let lampMix;
  /** @type {any} */ let partyTag;

  const current = () => MOCK_TRACKS[qi] || MOCK_TRACKS[0];

  const updateSeekUI = () => {
    const pct = dur > 0 ? (pos / dur) * 100 : 0;
    if (seekRef) {
      seekRef.value = String(Math.round((pct / 100) * 1000));
      seekRef.style.setProperty('--p', pct + '%');
    }
    if (seekCurEl) seekCurEl.textContent = fmtTime(pos);
    if (seekDurEl) seekDurEl.textContent = fmtTime(dur);
    if (clockEl) clockEl.textContent = showRemaining ? '-' + fmtTime(Math.max(0, dur - pos)) : fmtTime(pos).padStart(5, '0');
  };

  const loadTrack = (index, autoplay = false) => {
    qi = ((index % MOCK_TRACKS.length) + MOCK_TRACKS.length) % MOCK_TRACKS.length;
    const track = current();
    pos = 0;
    dur = 0;
    if (audio) {
      audio.src = track.src;
      audio.load?.();
      if (autoplay) { audio.playAudio?.(); playing = true; }
      else { audio.pauseAudio?.(); playing = false; }
    }
    syncPlayer();
    rerenderPlaylist();
  };

  const nextTrack = () => {
    if (shuffle || party) {
      let next = qi;
      if (MOCK_TRACKS.length > 1) while (next === qi) next = Math.floor(Math.random() * MOCK_TRACKS.length);
      loadTrack(next, true); return;
    }
    if (qi >= MOCK_TRACKS.length - 1) {
      if (repeat === 'all') loadTrack(0, true);
      else { playing = false; audio?.pauseAudio?.(); syncPlayer(); }
      return;
    }
    loadTrack(qi + 1, true);
  };

  const prevTrack = () => {
    if (pos > 3) { audio?.seekTo?.(0); pos = 0; updateSeekUI(); return; }
    loadTrack(qi - 1, true);
  };

  function rerenderPlaylist() {
    const visible = getVisible();
    const filtered = !!(search || folder);
    tabsWrap?.querySelectorAll('.tab[data-tab]').forEach((b) => b.classList.toggle('on', b.dataset.tab === tab));

    chipsWrap.style.display = tab === 'cloud' ? 'flex' : 'none';
    chipsWrap.innerHTML = '';
    chipsWrap.appendChild(Button({
      unstyled: true, className: 'chip' + (!folder ? ' on' : ''),
      text: `TODAS · ${MOCK_TRACKS.length}`,
      height: 28, padding: '0 10px', borderRadius: 14, border: '1px solid #000',
      background: !folder ? colors.amber : '#17181d',
      color: !folder ? '#120d06' : colors.muted,
      fontSize: 11, whiteSpace: 'nowrap', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis',
      fontWeight: !folder ? '700' : '400',
      onPress: () => { folder = ''; rerenderPlaylist(); },
    }));
    const folders = [...new Set(MOCK_TRACKS.map((t) => topFolder(t.key)))]
      .map((f) => [f, MOCK_TRACKS.filter((t) => topFolder(t.key) === f).length])
      .sort((a, b) => a[0].localeCompare(b[0], 'es', { numeric: true }));
    folders.forEach(([f, n]) => {
      const on = folder === f;
      chipsWrap.appendChild(Button({
        unstyled: true, className: 'chip' + (on ? ' on' : ''),
        text: `${f} · ${n}`,
        height: 28, padding: '0 10px', borderRadius: 14, border: '1px solid #000',
        background: on ? colors.amber : '#17181d', color: on ? '#120d06' : colors.muted,
        fontSize: 11, whiteSpace: 'nowrap', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis',
        fontWeight: on ? '700' : '400',
        onPress: () => { folder = folder === f ? '' : f; rerenderPlaylist(); },
      }));
    });

    plBar.innerHTML = '';
    plBar.appendChild(Text({ unstyled: true, tag: 'span', className: 'count', text: `${visible.length} ${visible.length === 1 ? 'canción' : 'canciones'}`, fontFamily: fonts.mono, fontSize: 11, color: colors.muted }));
    if (tab === 'cloud' && filtered && visible.length > 0) {
      plBar.appendChild(Button({ unstyled: true, className: 'pill', text: '↓ DESCARGAR ESTAS', height: 30, padding: '0 12px', borderRadius: 15, border: '1px solid #000', background: 'linear-gradient(#30333a, #22242a)', color: colors.muted, fontSize: 10, letterSpacing: 1, fontWeight: '700', marginLeft: 'auto' }));
    } else if (tab === 'cloud' && !filtered) {
      plBar.appendChild(Button({ unstyled: true, className: 'pill', text: '↻ ACTUALIZAR', height: 30, padding: '0 12px', borderRadius: 15, border: '1px solid #000', background: 'linear-gradient(#30333a, #22242a)', color: colors.muted, fontSize: 10, letterSpacing: 1, fontWeight: '700', marginLeft: 'auto' }));
    }

    listMount.innerHTML = '';
    listMount.appendChild(VirtualList({
      items: visible, currentKey: current().key, playing,
      onPick: (i) => { const real = MOCK_TRACKS.findIndex((t) => t.key === visible[i].key); if (real >= 0) loadTrack(real, true); },
      onScrollPos: (y) => { const next = y > 80; if (next !== compact) { compact = next; appEl.classList.toggle('compact', compact); } },
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
    marqueeSpan.textContent = `${qi + 1}. ${cur.title.toUpperCase()}`;
    marqueeSpan.className = 'track-in' + (marqueeSpan.textContent.length > 34 ? ' scroll' : '');
    updateSeekUI();
    const pc = soundSheet?.querySelector('.party-card');
    if (pc) { pc.classList.toggle('on', party); const pt = pc.querySelector('.party-title'); if (pt) pt.textContent = `🎉 MODO FIESTA ${party ? 'ACTIVADO' : ''}`; }
  }

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

  audio = Audio({
    src: current().src,
    onTimeUpdate: (currentTime, durationTime) => { pos = currentTime || 0; if (durationTime) dur = durationTime; updateSeekUI(); },
    onLoad: (d) => { dur = d || dur; updateSeekUI(); },
    onPlay: () => { playing = true; syncPlayer(); rerenderPlaylist(); },
    onPause: () => { playing = false; syncPlayer(); rerenderPlaylist(); },
    onEnd: () => { if (repeat === 'one') { audio.seekTo?.(0); audio.playAudio?.(); return; } nextTrack(); },
  });
  audio.style.display = 'none';

  const pillBase = { unstyled: true, height: 30, padding: '0 12px', borderRadius: 15, border: '1px solid #000', background: 'linear-gradient(#30333a, #22242a)', fontSize: 10, letterSpacing: 1, fontWeight: '700', whiteSpace: 'nowrap' };

  appEl = Container({
    unstyled: true, className: 'app' + (party ? ' party' : ''),
    height: '100%', display: 'flex', flexDirection: 'column', gap: 10,
    padding: 'calc(env(safe-area-inset-top) + 8px) 12px calc(env(safe-area-inset-bottom) + 10px)',
    background: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.018) 0 1px, transparent 1px 3px), linear-gradient(180deg, #2a2c33, #1b1c21 40%, #16171b)',
    color: colors.text, fontFamily: fonts.ui, fontSize: 14, overflow: 'hidden', userSelect: 'none',
    children: [
      Container({
        unstyled: true, tag: 'header', className: 'titlebar',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 26,
        children: [
          Text({
            unstyled: true, tag: 'span', className: 'brand',
            letterSpacing: 2, fontWeight: '300', fontSize: 14, color: '#e6e8ee',
            children: [document.createTextNode('FreePlayer'), Text({ unstyled: true, tag: 'b', text: '-music', fontWeight: '800', color: colors.amber })],
          }),
          Text({ unstyled: true, tag: 'span', className: 'maker', text: 'SOLIDPIXEL · HI-FI', fontSize: 9, letterSpacing: 2, color: colors.muted }),
        ],
      }),
      displayEl,
      Container({
        unstyled: true, className: 'seekrow',
        display: 'flex', alignItems: 'center', gap: 8, fontFamily: fonts.mono, fontSize: 11, color: colors.muted,
        children: [
          Text({ unstyled: true, tag: 'span', text: '0:00', ref: (el) => { seekCurEl = /** @type {HTMLElement} */ (el); } }),
          RangeInput({
            min: 0, max: 1000, value: 0, flex: 1,
            ref: (el) => { seekRef = /** @type {HTMLInputElement} */ (el); el.style.setProperty('--p', '0%'); },
            onInput: (e) => {
              const input = /** @type {HTMLInputElement} */ (e.target);
              const pct = Number(input.value) / 1000;
              input.style.setProperty('--p', (pct * 100) + '%');
              if (dur > 0) { const next = pct * dur; pos = next; audio.seekTo?.(next); updateSeekUI(); }
            },
          }),
          Text({ unstyled: true, tag: 'span', text: '0:00', ref: (el) => { seekDurEl = /** @type {HTMLElement} */ (el); } }),
        ],
      }),
      Container({
        unstyled: true, tag: 'section', className: 'transport',
        display: 'flex', flexDirection: 'column', gap: 8,
        children: [
          Container({
            unstyled: true, className: 'keys',
            display: 'flex', justifyContent: 'center', gap: 12,
            children: [
              Button({ unstyled: true, className: 'key', text: '⏮', width: 72, height: 52, borderRadius: 12, border: '1px solid #000', background: 'linear-gradient(#3a3d45, #24262c)', color: '#dfe2ea', fontSize: 18, onPress: prevTrack }),
              Button({ unstyled: true, className: 'key play', text: '▶', width: 92, height: 52, borderRadius: 12, border: '1px solid #000', background: 'linear-gradient(#3a3d45, #24262c)', color: colors.amber, fontSize: 20, ref: (el) => { playBtn = el; }, onPress: () => { if (playing) audio.pauseAudio?.(); else audio.playAudio?.(); } }),
              Button({ unstyled: true, className: 'key', text: '⏭', width: 72, height: 52, borderRadius: 12, border: '1px solid #000', background: 'linear-gradient(#3a3d45, #24262c)', color: '#dfe2ea', fontSize: 18, onPress: nextTrack }),
            ],
          }),
          Container({
            unstyled: true, className: 'toggles',
            display: 'flex', justifyContent: 'space-between', gap: 6,
            children: [
              Button({ ...pillBase, className: 'pill', text: 'ALEAT.', flex: 1, ref: (el) => { shuffleBtn = el; }, onPress: () => { shuffle = !shuffle; syncPlayer(); } }),
              Button({ ...pillBase, className: 'pill', text: 'REP: NO', flex: 1, ref: (el) => { repeatBtn = el; }, onPress: () => { repeat = ({ off: 'all', all: 'one', one: 'off' })[repeat]; syncPlayer(); } }),
              Button({ ...pillBase, className: 'pill', text: 'EQ', flex: 1, onPress: () => soundSheet.open() }),
              Button({ ...pillBase, className: 'pill fiesta', text: 'FIESTA', flex: 1, ref: (el) => { fiestaBtn = el; }, onPress: () => { party = !party; syncPlayer(); } }),
            ],
          }),
        ],
      }),
      Container({
        unstyled: true, tag: 'section', className: 'playlist',
        flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column',
        background: '#0d0e11', border: '1px solid #000', borderRadius: 12,
        boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.8)', overflow: 'hidden',
        children: [
          Container({
            unstyled: true, className: 'tabs',
            display: 'flex', gap: 4, padding: '8px 8px 0',
            ref: (el) => { tabsWrap = el; },
            children: [
              Button({ unstyled: true, className: 'tab on', text: '☁ NUBE', height: 34, padding: '0 12px', borderRadius: '9px 9px 0 0', border: '1px solid #000', borderBottom: 'none', fontSize: 11, letterSpacing: 1.2, fontWeight: '800', onPress: () => { tab = 'cloud'; rerenderPlaylist(); } }),
              Button({ unstyled: true, className: 'tab', text: '↓ DESCARGAS (4)', height: 34, padding: '0 12px', borderRadius: '9px 9px 0 0', border: '1px solid #000', borderBottom: 'none', fontSize: 11, letterSpacing: 1.2, fontWeight: '800', onPress: () => { tab = 'downloads'; rerenderPlaylist(); } }),
              Button({ unstyled: true, className: 'tab cfg', text: '⚙', height: 34, padding: '0 12px', borderRadius: '9px 9px 0 0', border: '1px solid #000', borderBottom: 'none', fontSize: 15, marginLeft: 'auto', onPress: () => {} }),
            ],
          }),
          Container({
            unstyled: true, className: 'pl-head',
            display: 'flex', gap: 6, padding: 8, background: '#22242b', position: 'relative',
            child: Input({
              bare: true, type: 'search', placeholder: 'Buscar artista, canción o carpeta',
              width: '100%', height: 36, borderRadius: 8, border: '1px solid #000', background: '#121317', color: colors.text,
              padding: '0 34px 0 10px', fontSize: 14, outline: 'none',
              onInput: (val) => { search = val; rerenderPlaylist(); },
            }),
          }),
          Container({ unstyled: true, className: 'chips', display: 'flex', gap: 6, overflowX: 'auto', padding: '0 8px 8px', background: '#22242b', ref: (el) => { chipsWrap = el; } }),
          Container({ unstyled: true, className: 'pl-bar', display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderBottom: '1px solid #1d1f25', ref: (el) => { plBar = el; } }),
          Container({ unstyled: true, ref: (el) => { listMount = el; el.style.display = 'contents'; } }),
        ],
      }),
    ],
  });

  soundSheet = SoundSheet({ open: false, onClose: () => {}, party, onToggleParty: (on) => { party = on; syncPlayer(); } });
  appEl.appendChild(soundSheet);
  appEl.appendChild(audio);

  const tabBtns = tabsWrap ? tabsWrap.querySelectorAll('.tab') : [];
  if (tabBtns[0]) tabBtns[0].dataset.tab = 'cloud';
  if (tabBtns[1]) tabBtns[1].dataset.tab = 'downloads';

  rerenderPlaylist();
  syncPlayer();
  return appEl;
};

export default PlayerScreen;
