// src/styles/theme.ts

export const theme = {
  colors: {
    // Primary colors
    primary: '#4f46e5', // indigo-600 (Vibrant modern tech color)
    primaryLight: '#e0e7ff', // indigo-100
    primaryDark: '#3730a3', // indigo-800
    
    // Backgrounds
    background: '#f8fafc', // slate-50 (Clean cool light gray background)
    card: '#ffffff', // Pure white card
    
    // Text colors
    text: '#0f172a', // slate-900 (Deep slate for main titles/texts)
    textSecondary: '#475569', // slate-600 (Medium gray for descriptions/subtitles)
    textMuted: '#94a3b8', // slate-400 (Light gray for placeholder/secondary labels)
    
    // Interfaces & Borders
    border: '#e2e8f0', // slate-200 (Subtle elegant borders)
    white: '#ffffff',
    black: '#000000',
    
    // Accent states
    success: '#10b981', // emerald-500 (Vibrant green for stock / active state)
    successLight: '#ecfdf5', // emerald-50
    successDark: '#065f46', // emerald-800
    
    danger: '#f43f5e', // rose-500 (Rose red for discount label / delete)
    dangerLight: '#fff1f2', // rose-50
    dangerDark: '#9f1239', // rose-800
    
    warning: '#f59e0b', // amber-500 (Pending states / warnings)
    warningLight: '#fef3c7', // amber-50
    warningDark: '#92400e', // amber-800
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
  },
  borderRadius: {
    xs: 4,
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 24,
    round: 9999,
  },
  shadows: {
    sm: {
      shadowColor: '#0f172a',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#0f172a',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.08,
      shadowRadius: 5,
      elevation: 4,
    },
    lg: {
      shadowColor: '#0f172a',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.12,
      shadowRadius: 10,
      elevation: 8,
    }
  }
};
