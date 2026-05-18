'use client';

import { createTheme, ThemeOptions } from '@mui/material/styles';

// Olentia brand colors — Minimal Dark (Metronic-inspired)
const olentiaColors = {
  primary: {
    main: '#D4793F',
    light: '#E8A06A',
    dark: '#B55E2B',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#9E9E9E',
    light: '#BDBDBD',
    dark: '#757575',
    contrastText: '#FFFFFF',
  },
  cream: '#F5E6D3',
  gold: '#C9A227',
  rust: '#D4793F',
  background: {
    default: '#121212',     // Page bg — warm dark
    paper: '#1A1A1A',       // Card/surface bg
    sidebar: '#161616',     // Sidebar bg
    hover: '#222222',       // Hover state
    elevated: '#1E1E1E',    // Elevated surfaces
  },
  text: {
    primary: '#F5E6D3',     // Cream white (brand)
    secondary: '#9E9E9E',   // Warm gray
    disabled: '#555555',
  },
  border: 'rgba(255,255,255,0.08)',
  success: '#13DEB9',
  error: '#FA896B',
  warning: '#FFAE1F',
  info: '#539BFF',
};

const themeOptions: ThemeOptions = {
  palette: {
    mode: 'dark',
    primary: olentiaColors.primary,
    secondary: olentiaColors.secondary,
    background: {
      default: olentiaColors.background.default,
      paper: olentiaColors.background.paper,
    },
    text: {
      primary: olentiaColors.text.primary,
      secondary: olentiaColors.text.secondary,
      disabled: olentiaColors.text.disabled,
    },
    success: { main: olentiaColors.success, light: '#1B3C48', dark: '#0DAA92' },
    warning: { main: olentiaColors.warning, light: '#4D3A2A', dark: '#CC8B19' },
    error: { main: olentiaColors.error, light: '#4B313D', dark: '#C86E55' },
    info: { main: olentiaColors.info, light: '#223662', dark: '#4280CC' },
    divider: olentiaColors.border,
    grey: {
      50: '#161616',
      100: '#1A1A1A',
      200: '#222222',
      300: '#333333',
      400: '#555555',
      500: '#777777',
      600: '#999999',
      700: '#BBBBBB',
      800: '#DDDDDD',
      900: '#F5F5F5',
    },
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
    h1: { fontSize: '2.25rem', fontWeight: 700, lineHeight: 1.2 },
    h2: { fontSize: '1.875rem', fontWeight: 600, lineHeight: 1.3 },
    h3: { fontSize: '1.5rem', fontWeight: 600, lineHeight: 1.3 },
    h4: { fontSize: '1.25rem', fontWeight: 600, lineHeight: 1.4 },
    h5: { fontSize: '1.125rem', fontWeight: 600, lineHeight: 1.4 },
    h6: { fontSize: '1rem', fontWeight: 600, lineHeight: 1.5 },
    subtitle1: { fontSize: '1rem', fontWeight: 500 },
    subtitle2: { fontSize: '0.875rem', fontWeight: 500 },
    body1: { fontSize: '0.9375rem', lineHeight: 1.5 },
    body2: { fontSize: '0.8125rem', lineHeight: 1.5 },
    button: { textTransform: 'none', fontWeight: 600, fontSize: '0.875rem' },
    caption: { fontSize: '0.75rem', color: olentiaColors.text.secondary },
  },
  shape: { borderRadius: 7 },
  shadows: [
    'none',
    'rgb(145 158 171 / 10%) 0px 0px 2px 0px, rgb(145 158 171 / 5%) 0px 12px 24px -4px',
    'rgb(145 158 171 / 10%) 0px 0px 2px 0px, rgb(145 158 171 / 5%) 0px 12px 24px -4px',
    'rgb(145 158 171 / 10%) 0px 0px 2px 0px, rgb(145 158 171 / 5%) 0px 12px 24px -4px',
    'rgb(145 158 171 / 10%) 0px 0px 2px 0px, rgb(145 158 171 / 5%) 0px 12px 24px -4px',
    'rgb(145 158 171 / 10%) 0px 0px 2px 0px, rgb(145 158 171 / 5%) 0px 12px 24px -4px',
    'rgb(145 158 171 / 10%) 0px 0px 2px 0px, rgb(145 158 171 / 5%) 0px 12px 24px -4px',
    'rgb(145 158 171 / 10%) 0px 0px 2px 0px, rgb(145 158 171 / 5%) 0px 12px 24px -4px',
    'rgb(145 158 171 / 15%) 0px 0px 2px 0px, rgb(145 158 171 / 8%) 0px 12px 24px -4px',
    'rgb(145 158 171 / 15%) 0px 0px 2px 0px, rgb(145 158 171 / 8%) 0px 12px 24px -4px',
    'rgb(145 158 171 / 15%) 0px 0px 2px 0px, rgb(145 158 171 / 8%) 0px 12px 24px -4px',
    'rgb(145 158 171 / 15%) 0px 0px 2px 0px, rgb(145 158 171 / 8%) 0px 12px 24px -4px',
    'rgb(145 158 171 / 15%) 0px 0px 2px 0px, rgb(145 158 171 / 8%) 0px 12px 24px -4px',
    'rgb(145 158 171 / 15%) 0px 0px 2px 0px, rgb(145 158 171 / 8%) 0px 12px 24px -4px',
    'rgb(145 158 171 / 15%) 0px 0px 2px 0px, rgb(145 158 171 / 8%) 0px 12px 24px -4px',
    'rgb(145 158 171 / 15%) 0px 0px 2px 0px, rgb(145 158 171 / 8%) 0px 12px 24px -4px',
    'rgb(145 158 171 / 15%) 0px 0px 2px 0px, rgb(145 158 171 / 8%) 0px 12px 24px -4px',
    'rgb(145 158 171 / 15%) 0px 0px 2px 0px, rgb(145 158 171 / 8%) 0px 12px 24px -4px',
    'rgb(145 158 171 / 15%) 0px 0px 2px 0px, rgb(145 158 171 / 8%) 0px 12px 24px -4px',
    'rgb(145 158 171 / 15%) 0px 0px 2px 0px, rgb(145 158 171 / 8%) 0px 12px 24px -4px',
    'rgb(145 158 171 / 15%) 0px 0px 2px 0px, rgb(145 158 171 / 8%) 0px 12px 24px -4px',
    'rgb(145 158 171 / 15%) 0px 0px 2px 0px, rgb(145 158 171 / 8%) 0px 12px 24px -4px',
    'rgb(145 158 171 / 15%) 0px 0px 2px 0px, rgb(145 158 171 / 8%) 0px 12px 24px -4px',
    'rgb(145 158 171 / 15%) 0px 0px 2px 0px, rgb(145 158 171 / 8%) 0px 12px 24px -4px',
    'rgb(145 158 171 / 15%) 0px 0px 2px 0px, rgb(145 158 171 / 8%) 0px 12px 24px -4px',
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: olentiaColors.background.default,
          scrollbarColor: `${olentiaColors.background.hover} transparent`,
          '&::-webkit-scrollbar': { width: 6 },
          '&::-webkit-scrollbar-track': { background: 'transparent' },
          '&::-webkit-scrollbar-thumb': { background: olentiaColors.background.hover, borderRadius: 3 },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 7, padding: '8px 16px', boxShadow: 'none', '&:hover': { boxShadow: 'none' } },
        containedPrimary: {
          backgroundColor: olentiaColors.primary.main,
          '&:hover': { backgroundColor: olentiaColors.primary.dark },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 7,
          boxShadow: 'rgb(145 158 171 / 10%) 0px 0px 2px 0px, rgb(145 158 171 / 5%) 0px 12px 24px -4px',
          border: 'none',
          backgroundColor: olentiaColors.background.paper,
        },
      },
    },
    MuiPaper: {
      styleOverrides: { root: { borderRadius: 7, backgroundImage: 'none' } },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase',
            letterSpacing: '0.5px', color: olentiaColors.text.secondary,
            borderBottom: `1px solid ${olentiaColors.border}`,
            backgroundColor: 'transparent',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderBottom: `1px solid ${olentiaColors.border}`, padding: '12px 16px' },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: { '&:hover': { backgroundColor: `${olentiaColors.background.hover} !important` } },
      },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 500, borderRadius: 6 } },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 7,
            '& fieldset': { borderColor: olentiaColors.border },
            '&:hover fieldset': { borderColor: olentiaColors.text.secondary },
            '&.Mui-focused fieldset': { borderColor: olentiaColors.primary.main },
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { borderRadius: 7 },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: { borderRadius: 7 },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: { backgroundColor: olentiaColors.background.sidebar, border: 'none' },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 7, marginBottom: 2, padding: '8px 10px',
          color: olentiaColors.text.secondary,
          '&:hover': { backgroundColor: olentiaColors.background.hover, color: olentiaColors.text.primary },
          '&.Mui-selected': {
            backgroundColor: `rgba(212,121,63,0.15)`, color: olentiaColors.primary.main,
            '& .MuiListItemIcon-root': { color: olentiaColors.primary.main },
            '&:hover': { backgroundColor: `rgba(212,121,63,0.22)` },
          },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: { root: { color: olentiaColors.text.secondary, minWidth: 36 } },
    },
    MuiAppBar: {
      styleOverrides: {
        root: { backgroundColor: olentiaColors.background.default, borderBottom: `1px solid ${olentiaColors.border}`, backgroundImage: 'none', boxShadow: 'none' },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { backgroundColor: olentiaColors.background.paper, border: `1px solid ${olentiaColors.border}` },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: { backgroundColor: olentiaColors.background.paper, border: `1px solid ${olentiaColors.border}` },
      },
    },
    MuiDivider: {
      styleOverrides: { root: { borderColor: olentiaColors.border } },
    },
    MuiSkeleton: {
      styleOverrides: { root: { backgroundColor: 'rgba(124,143,172,0.08)' } },
    },
    MuiTablePagination: {
      styleOverrides: { root: { borderTop: `1px solid ${olentiaColors.border}` } },
    },
  },
};

// Light mode colors
const olentiaLightColors = {
  ...olentiaColors,
  background: {
    default: '#F8F5F0',      // Warm cream-white
    paper: '#FFFFFF',
    sidebar: '#FFFFFF',
    hover: '#F0EBE3',
    elevated: '#FAFAFA',
  },
  text: {
    primary: '#1A1A1A',
    secondary: '#666666',
    disabled: '#BBBBBB',
  },
  border: 'rgba(0,0,0,0.08)',
};

const lightThemeOptions: ThemeOptions = {
  ...themeOptions,
  palette: {
    ...themeOptions.palette,
    mode: 'light',
    background: {
      default: olentiaLightColors.background.default,
      paper: olentiaLightColors.background.paper,
    },
    text: {
      primary: olentiaLightColors.text.primary,
      secondary: olentiaLightColors.text.secondary,
      disabled: olentiaLightColors.text.disabled,
    },
    divider: olentiaLightColors.border,
    grey: {
      50: '#FAFAFA', 100: '#F5F5F5', 200: '#EEEEEE', 300: '#E0E0E0',
      400: '#BDBDBD', 500: '#9E9E9E', 600: '#757575', 700: '#616161',
      800: '#424242', 900: '#212121',
    },
  },
  components: {
    ...themeOptions.components,
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: olentiaLightColors.background.default,
          scrollbarColor: `${olentiaLightColors.background.hover} transparent`,
          '&::-webkit-scrollbar': { width: 6 },
          '&::-webkit-scrollbar-track': { background: 'transparent' },
          '&::-webkit-scrollbar-thumb': { background: '#ccc', borderRadius: 3 },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 7, border: `1px solid ${olentiaLightColors.border}`,
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)', backgroundColor: '#FFFFFF',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: { backgroundColor: olentiaLightColors.background.sidebar, borderRight: `1px solid ${olentiaLightColors.border}` },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: { backgroundColor: '#FFFFFF', borderBottom: `1px solid ${olentiaLightColors.border}`, backgroundImage: 'none', boxShadow: 'none' },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase',
            letterSpacing: '0.5px', color: olentiaLightColors.text.secondary,
            borderBottom: `1px solid ${olentiaLightColors.border}`, backgroundColor: 'transparent',
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: { paper: { backgroundColor: '#FFFFFF' } },
    },
    MuiMenu: {
      styleOverrides: { paper: { backgroundColor: '#FFFFFF' } },
    },
    // Light theme'de sidebar item'ları için belirgin renkler — gri/soluk gözükmesin
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 7, marginBottom: 2, padding: '8px 10px',
          color: '#374151', // koyu gri — sidebar yazısı net görünür
          '&:hover': { backgroundColor: olentiaLightColors.background.hover, color: '#111827' },
          '&.Mui-selected': {
            backgroundColor: `rgba(212,121,63,0.12)`, color: olentiaColors.primary.main,
            '& .MuiListItemIcon-root': { color: olentiaColors.primary.main },
            '&:hover': { backgroundColor: `rgba(212,121,63,0.18)` },
          },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: { root: { color: '#6B7280', minWidth: 36 } }, // orta koyu gri
    },
  },
};

export const darkTheme = createTheme(themeOptions);
export const lightTheme = createTheme(lightThemeOptions);
export const theme = darkTheme; // default
export { olentiaColors, olentiaLightColors };
