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
          value: { _light: '#ffffff', _dark: '#ffffff' },
        },
        'brand.muted': {
          value: { _light: '#fca5a5', _dark: '#fca5a5' },
        },
        'brand.subtle': {
          value: { _light: '#fecaca', _dark: '#991b1b' },
        },
        
        // Background colors with proper contrast
        'bg.page': {
          value: { _light: '#f7fafc', _dark: '#1a202c' },
        },
        'bg.surface': {
          value: { _light: '#ffffff', _dark: '#2d3748' },
        },
        'bg.panel': {
          value: { _light: '#edf2f7', _dark: '#4a5568' },
        },
        
        // Text colors with WCAG AA contrast
        'text.primary': {
          value: { _light: '#1a202c', _dark: '#f7fafc' },
        },
        'text.secondary': {
          value: { _light: '#4a5568', _dark: '#cbd5e0' },
        },
        'text.muted': {
          value: { _light: '#718096', _dark: '#a0aec0' },
        },
        'text.inverted': {
          value: { _light: '#ffffff', _dark: '#1a202c' },
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
