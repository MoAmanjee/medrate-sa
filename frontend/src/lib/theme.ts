import { extendTheme } from '@chakra-ui/react'

const theme = extendTheme({
  colors: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#004080', // Main primary
      600: '#003366',
      700: '#002952',
      800: '#001f3d',
      900: '#001529',
    },
    secondary: {
      50: '#ecfdf5',
      100: '#d1fae5',
      200: '#a7f3d0',
      300: '#6ee7b7',
      400: '#34d399',
      500: '#00A86B', // Main secondary (emerald green)
      600: '#059669',
      700: '#047857',
      800: '#065f46',
      900: '#064e3b',
    },
    accent: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#FFD700', // Main accent (gold)
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },
    alert: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#FF4D4F', // Main alert (red)
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    }
  },
  fonts: {
    heading: 'Inter, sans-serif',
    body: 'Roboto, sans-serif',
    mono: 'Roboto Mono, monospace',
  },
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
    '6xl': '3.75rem',
  },
  fontWeights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  radii: {
    none: '0',
    sm: '0.125rem',
    base: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'medium',
        borderRadius: 'lg',
        transition: 'all 0.2s',
        _focus: {
          boxShadow: 'outline',
        },
      },
      variants: {
        solid: {
          bg: 'primary.500',
          color: 'white',
          _hover: {
            bg: 'primary.600',
            transform: 'translateY(-1px)',
            boxShadow: 'lg',
          },
          _active: {
            bg: 'primary.700',
            transform: 'translateY(0)',
          },
        },
        outline: {
          border: '2px solid',
          borderColor: 'secondary.500',
          color: 'secondary.500',
          bg: 'transparent',
          _hover: {
            bg: 'secondary.50',
            borderColor: 'secondary.600',
            color: 'secondary.600',
          },
        },
        ghost: {
          color: 'primary.500',
          bg: 'transparent',
          _hover: {
            bg: 'primary.50',
            color: 'primary.600',
          },
        },
      },
      sizes: {
        sm: {
          h: '8',
          minW: '8',
          fontSize: 'sm',
          px: '3',
        },
        md: {
          h: '10',
          minW: '10',
          fontSize: 'md',
          px: '4',
        },
        lg: {
          h: '12',
          minW: '12',
          fontSize: 'lg',
          px: '6',
        },
      },
    },
    Card: {
      baseStyle: {
        container: {
          bg: 'white',
          borderRadius: 'xl',
          boxShadow: 'base',
          border: '1px solid',
          borderColor: 'gray.100',
          transition: 'all 0.2s',
          _hover: {
            boxShadow: 'lg',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    Input: {
      baseStyle: {
        field: {
          borderRadius: 'lg',
          border: '2px solid',
          borderColor: 'gray.200',
          _focus: {
            borderColor: 'primary.500',
            boxShadow: '0 0 0 3px rgba(0, 64, 128, 0.1)',
          },
          _invalid: {
            borderColor: 'alert.500',
            boxShadow: '0 0 0 3px rgba(255, 77, 79, 0.1)',
          },
        },
      },
    },
  },
})

export default theme
