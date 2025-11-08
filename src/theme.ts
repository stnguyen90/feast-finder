import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react'

const customConfig = defineConfig({
  theme: {
    tokens: {
      colors: {
        brand: {
          50: { value: '#fee2e2' },
          100: { value: '#fecaca' },
          200: { value: '#fca5a5' },
          300: { value: '#f87171' },
          400: { value: '#ef4444' },
          500: { value: '#a20000' }, // Primary brand color
          600: { value: '#8b0000' },
          700: { value: '#7f1d1d' },
          800: { value: '#991b1b' },
          900: { value: '#7f1d1d' },
        },
      },
    },
    semanticTokens: {
      colors: {
        // Primary brand colors
        'brand.solid': {
          value: { _light: '#a20000', _dark: '#ef4444' },
        },
        'brand.contrast': {
          value: { _light: 'white', _dark: 'white' },
        },
        'brand.muted': {
          value: { _light: '#fee2e2', _dark: '#7f1d1d' },
        },
        'brand.subtle': {
          value: { _light: '#fecaca', _dark: '#991b1b' },
        },
        
        // Background colors with proper contrast
        'bg.page': {
          value: { _light: 'gray.50', _dark: 'gray.900' },
        },
        'bg.surface': {
          value: { _light: 'white', _dark: 'gray.800' },
        },
        'bg.panel': {
          value: { _light: 'gray.100', _dark: 'gray.700' },
        },
        
        // Text colors with WCAG AA contrast
        'text.primary': {
          value: { _light: 'gray.900', _dark: 'gray.50' },
        },
        'text.secondary': {
          value: { _light: 'gray.600', _dark: 'gray.400' },
        },
        'text.muted': {
          value: { _light: 'gray.500', _dark: 'gray.500' },
        },
        'text.inverted': {
          value: { _light: 'white', _dark: 'gray.900' },
        },
        
        // Badge colors with high contrast
        'badge.category.bg': {
          value: { _light: '#fecaca', _dark: '#7f1d1d' },
        },
        'badge.category.text': {
          value: { _light: '#7f1d1d', _dark: '#fecaca' },
        },
        'badge.meal.bg': {
          value: { _light: '#fee2e2', _dark: '#991b1b' },
        },
        'badge.meal.text': {
          value: { _light: '#991b1b', _dark: '#fee2e2' },
        },
      },
    },
  },
})

export const system = createSystem(defaultConfig, customConfig)
