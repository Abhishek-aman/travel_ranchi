import { createTheme } from '@mui/material/styles'

declare module '@mui/material/styles' {
  interface Palette {
    hero: Palette['primary']
    surface: Palette['primary']
  }
  interface PaletteOptions {
    hero?: PaletteOptions['primary']
    surface?: PaletteOptions['primary']
  }
}

/** Deep teal + warm coral accent — distinct from the previous navy palette. */
export const appTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0F766E',
      light: '#14B8A6',
      dark: '#0D5C56',
      contrastText: '#fff',
    },
    secondary: {
      main: '#EA580C',
      light: '#FB923C',
      dark: '#C2410C',
      contrastText: '#fff',
    },
    success: { main: '#059669' },
    warning: { main: '#D97706' },
    error: { main: '#DC2626' },
    background: {
      default: '#F0FDFA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#0F172A',
      secondary: '#475569',
    },
    hero: {
      main: '#0F766E',
      light: '#14B8A6',
      dark: '#0D5C56',
      contrastText: '#fff',
    },
    surface: {
      main: '#CCFBF1',
      light: '#ECFDF5',
      dark: '#99F6E4',
      contrastText: '#0F172A',
    },
  },
  typography: {
    fontFamily: '"DM Sans", "Segoe UI", Helvetica, Arial, sans-serif',
    h1: { fontWeight: 700, letterSpacing: '-0.02em' },
    h2: { fontWeight: 700, letterSpacing: '-0.02em' },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { fontWeight: 600, textTransform: 'none' },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 10, paddingInline: 20 },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 16 },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
    },
  },
})
