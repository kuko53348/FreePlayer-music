// database/themes.js
// The app's whole design system lives here. Every value is measured with the
// framework's own `color().contrastRatio()` against the surface it is written on:
// the number sits next to the pair that needs it, because a token that cannot
// carry AA text is decoration, not a color.
import { applyAccentPreference, registerPalette } from 'flet-box';

export const lightColors = {
    // The brand a new app shows is neutral: no hue, the page's own ink. White on
    // this fill measures 17.85:1 and the fill as words on this page measures the
    // same, so a button, an active tab and a link all pass in both directions
    // before anyone has chosen a color. The reader changes it on the Preferences
    // screen (`ThemePicker`), which paints a hue and remembers it.
    primary: '#0f172a',
    secondary: '#8b5cf6',
    success: '#10b981',
    warning: '#f59e0b',
    // The error signal: a badge, a border, an icon. 3.76:1 as words on this page,
    // so it is never the label of a button.
    danger: '#ef4444',
    // The readable red, both ways: 6.47:1 as words on white, 6.47:1 with white
    // written on it, 5.42:1 inside `errorBg`. Use it for the words and the plate.
    dangerStrong: '#b91c1c',
    // The readable green and amber: 5.48:1 and 5.02:1, in both directions, so
    // they may be a label, an icon that carries meaning, or a plate.
    successStrong: '#047857',
    warningStrong: '#b45309',
    // `*Plate` is the fill white words sit on. On this page it is the same tone
    // as the matching Strong, and it is a separate name because on a dark page the
    // two part ways: the readable red goes light, the plate goes dark.
    dangerPlate: '#b91c1c',
    successPlate: '#047857',
    warningPlate: '#b45309',
    // `info` (#3b82f6) carries white at 3.68:1, so a filled chip or a tooltip in
    // the info hue needs this one: 6.70:1 in both directions.
    infoStrong: '#1d4ed8',
    infoPlate: '#1d4ed8',
    info: '#3b82f6',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#0f172a',
    textSecondary: '#64748b',
    textDisabled: '#94a3b8',
    border: '#e2e8f0',
    overlay: 'rgba(0, 0, 0, 0.5)',
    shadow: 'rgba(0, 0, 0, 0.1)',
    // What to write on a brand fill, and the soft plate that replaces
    // `colors.primary + '15'`. The plate is a lifted gray rather than a tint of
    // a hue, because the brand has no hue: the page ink sits on it at 14.56:1, and
    // since the neutral brand *is* that ink a chip written in `colors.primary`
    // measures the same. One limit: `textSecondary` below (#64748b) on this plate
    // is 3.88:1, so a caption inside a `primaryBg` area uses `colors.text`.
    onPrimary: '#ffffff',
    primaryBg: '#e7e8ea',
    // The translucent surface for a card with `backdropFilter`. A token, so the
    // app never hand-writes an `rgba()` the clean-UI gate would reject.
    glass: 'rgba(255, 255, 255, 0.66)',
    glassBorder: 'rgba(255, 255, 255, 0.75)',
    error: '#ff3b30',
    errorBg: '#ffe5e5',
    successBg: '#e5f5e5',
    warningBg: '#fff5e5',
    infoBg: '#e5f5ff',
    divider: '#eeeeee',
    card: '#ffffff'
};

export const darkColors = {
    // The other half of the same neutral: here the brand is the page's near-white
    // ink. It reads 12.02:1 on this background and 9.85:1 on a card, so it is
    // legal as words and as a glyph, and it carries its own label below.
    primary: '#cbd5e1',
    secondary: '#a78bfa',
    success: '#34d399',
    warning: '#fbbf24',
    // On a dark page the light red is the readable one: 6.45:1 against the
    // background. The plate a person presses goes the other way.
    danger: '#f87171',
    // `*Strong` is the answer to "what may I write words in?" and on this page
    // that is the light end of the ladder: 9.41:1, 11.71:1, 12.38:1 on the
    // background — all AA, and a step clearer than the signal tone above.
    dangerStrong: '#fca5a5',
    successStrong: '#6ee7b7',
    warningStrong: '#fcd34d',
    // `*Plate` is the fill with white words on it, and that has to go dark here:
    // 10.02:1, 9.11:1, 9.07:1. These are the tones that used to hide inside
    // `*Strong`, which is why a delete written in `dangerStrong` was invisible.
    dangerPlate: '#7f1d1d',
    successPlate: '#14532d',
    warningPlate: '#78350f',
    infoStrong: '#93c5fd',
    infoPlate: '#1e40af',
    info: '#60a5fa',
    background: '#0f172a',
    surface: '#1e293b',
    text: '#f1f5f9',
    textSecondary: '#94a3b8',
    textDisabled: '#64748b',
    border: '#334155',
    overlay: 'rgba(0, 0, 0, 0.6)',
    shadow: 'rgba(0, 0, 0, 0.3)',
    // #cbd5e1 is a light fill: white on it is 1.48:1, so its words are the page's
    // own near-black and measure 13.40:1. The plate sits one step off the page
    // (1.18:1) and one very quiet step off a card (1.03:1), which is what a brand
    // with no hue costs: a tinted banner works on the background, and on a card
    // the mark is `colors.border` or the ink itself. Ink on the plate: 13.81:1,
    // secondary ink 5.90:1, the brand 10.19:1.
    onPrimary: '#09090b',
    primaryBg: '#252629',
    glass: 'rgba(30, 41, 59, 0.66)',
    glassBorder: 'rgba(226, 232, 240, 0.22)',
    error: '#f87171',
    errorBg: '#3b1113',
    successBg: '#0c2f22',
    warningBg: '#33230a',
    infoBg: '#12263c',
    divider: '#1e293b',
    card: '#1e293b'
};

// Declaring a palette paints nothing by itself: every widget reads the
// framework's live `colors`, so the tokens have to be registered into it.
// Registration deliberately does not pick a theme — whether the app is dark is
// the reader's answer (`setTheme`, `toggleTheme`), not the designer's.
registerPalette('light', lightColors);
registerPalette('dark', darkColors);

// The palette above answers what a theme *is*; the accent layer is what the reader
// picks, and it owns exactly three tokens: `primary`, `onPrimary` and
// `primaryBg`. A new app opens on `neutral` — the same three values the palettes
// carry, so the two layers agree and nothing repaints a frame after boot.
//
// `applyAccentPreference` is the app's verb, not the reader's: it paints only when
// nobody has chosen yet and writes no preference down, so the Preferences screen's
// `ThemePicker` opens with the neutral square marked as the answer, and a hue
// picked on a previous visit still wins over this line. `setAccent` would answer
// for the reader and overwrite their choice on every load.
//
// An app with a brand of its own keeps the three tokens above and changes the id
// here to a family it registers with `registerAccent`.
applyAccentPreference('neutral');
