import { Container, Text, Button, goTo } from 'flet-box';
import { colors, fonts } from '../theme.js';

const LinkButton = ({ label, url }) => Button({
  unstyled: true,
  text: label,
  width: '100%',
  textAlign: 'left',
  padding: '12px 14px',
  borderRadius: 10,
  border: `1px solid ${colors.line}`,
  background: 'linear-gradient(#252831, #1d2027)',
  color: colors.amber,
  fontSize: 12,
  fontFamily: fonts.mono,
  letterSpacing: 0.3,
  cursor: 'pointer',
  onPress: () => window.open(url, '_blank', 'noopener,noreferrer'),
});

const Section = ({ title, children }) => Container({
  unstyled: true,
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
  padding: 14,
  borderRadius: 12,
  border: `1px solid ${colors.line}`,
  background: 'linear-gradient(#20232b, #181a20)',
  children: [
    Text({
      unstyled: true, tag: 'div', text: title,
      fontSize: 10, letterSpacing: 2, fontWeight: '800', color: colors.muted,
      fontFamily: fonts.ui,
    }),
    ...children,
  ],
});

export const SettingsScreen = () => Container({
  unstyled: true,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: 14,
  padding: 'calc(env(safe-area-inset-top) + 12px) 14px calc(env(safe-area-inset-bottom) + 14px)',
  background: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.018) 0 1px, transparent 1px 3px), linear-gradient(180deg, #2a2c33, #1b1c21 40%, #16171b)',
  color: colors.text,
  fontFamily: fonts.ui,
  overflowY: 'auto',
  children: [
    Container({
      unstyled: true,
      display: 'flex', alignItems: 'center', gap: 10,
      children: [
        Button({
          unstyled: true,
          text: '←',
          width: 36, height: 36, borderRadius: 10,
          border: `1px solid ${colors.line}`,
          background: 'linear-gradient(#30333a, #22242a)',
          color: colors.amber, fontSize: 18, fontWeight: '700',
          onPress: () => goTo('/'),
        }),
        Text({
          unstyled: true, tag: 'div', text: 'AJUSTES / ABOUT',
          fontSize: 14, fontWeight: '800', letterSpacing: 2, color: colors.amber,
        }),
      ],
    }),

    Section({
      title: 'PROYECTO',
      children: [
        Text({
          unstyled: true, tag: 'p',
          text: 'FreePlayer-music es un fork/demo basado en el proyecto original Pixel Deck App. El objetivo es mostrar la capacidad de FletBox para construir interfaces móviles con estilo visual pulido, usando su API de widgets.',
          fontSize: 13, lineHeight: 1.65, color: colors.text, margin: 0,
        }),
      ],
    }),

    Section({
      title: 'REPOSITORIOS',
      children: [
        Text({ unstyled: true, tag: 'div', text: 'Repo original', fontSize: 11, color: colors.muted }),
        LinkButton({ label: 'github.com/carancibiap1993-bot/pixel-deck-app', url: 'https://github.com/carancibiap1993-bot/pixel-deck-app' }),
        Text({ unstyled: true, tag: 'div', text: 'Este fork', fontSize: 11, color: colors.muted, marginTop: 4 }),
        LinkButton({ label: 'github.com/kuko53348/FreePlayer-music', url: 'https://github.com/kuko53348/FreePlayer-music' }),
      ],
    }),

    Section({
      title: 'FLETBOX UI',
      children: [
        Text({
          unstyled: true, tag: 'p',
          text: 'FletBox es un framework UI en JavaScript para construir apps con widgets, props planas, estado reactivo y renderizado eficiente. Esta app sirve como demo de su capacidad para replicar interfaces complejas con componentes nativos del framework.',
          fontSize: 13, lineHeight: 1.65, color: colors.text, margin: 0,
        }),
        Text({ unstyled: true, tag: 'div', text: 'GitHub / Perfil', fontSize: 11, color: colors.muted }),
        LinkButton({ label: 'github.com/kuko53348', url: 'https://github.com/kuko53348' }),
        LinkButton({ label: 'FletBox UI · @flet-box', url: 'https://github.com/kuko53348/flet-box' }),
      ],
    }),

    Container({
      unstyled: true,
      padding: 12,
      borderRadius: 10,
      border: `1px dashed ${colors.amberDim}`,
      background: 'rgba(255,180,58,0.04)',
      child: Text({
        unstyled: true, tag: 'p',
        text: 'Demo construida con FletBox · FreePlayer-music',
        fontSize: 11, color: colors.muted, margin: 0, textAlign: 'center', fontFamily: fonts.mono,
      }),
    }),
  ],
});

export default SettingsScreen;
