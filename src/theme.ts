import { Platform } from 'react-native';

export const colors = {
  black: '#000000',
  white: '#ffffff',
  text: '#0a0a0a',
  faint: '#a3a3a3',
  border: '#e5e5e5',
  surface: '#f5f5f5',
  danger: '#dc2626',
};

export const fonts = {
  /** iOS resolves bundled fonts by PostScript name, Android by file name in assets/fonts. */
  urdu: Platform.select({ ios: 'Jameel Noori Nastaleeq', default: 'JameelNooriNastaleeq' }),
};
