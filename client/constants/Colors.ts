/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Brand = {
  primary: '#2F5FE0',      // azul cobalto saturado — tem presença
  primaryDark: '#1B3E99',  // índigo escuro — pressed, sombra, links
  surface: '#ffffff',
  background: '#F7F9FC',   // quase branco, só um traço de azul
  text: '#101828',         // navy quase preto — texto de alto contraste
  textMuted: '#5B6B82',
  border: '#D6DEEA',
  error: '#E0433B',
};

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};
