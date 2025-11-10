import { useEffect, useState } from 'react'

type ColorMode = 'light' | 'dark' | 'system'

export function useColorMode() {
  const [colorMode, setColorModeState] = useState<ColorMode>(() => {
    if (typeof window === 'undefined') return 'system'
    const stored = localStorage.getItem('chakra-ui-color-mode')
    if (!stored) return 'system'
    return stored as ColorMode
  })

  useEffect(() => {
    const root = document.documentElement
    const resolvedMode =
      colorMode === 'system'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
        : colorMode

    root.classList.remove('light', 'dark')
    root.classList.add(resolvedMode)
    root.style.colorScheme = resolvedMode

    // Listen to system preference changes when in system mode
    if (colorMode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = (e: MediaQueryListEvent) => {
        const newMode = e.matches ? 'dark' : 'light'
        root.classList.remove('light', 'dark')
        root.classList.add(newMode)
        root.style.colorScheme = newMode
      }
      mediaQuery.addEventListener('change', handler)
      return () => mediaQuery.removeEventListener('change', handler)
    }
  }, [colorMode])

  const setColorMode = (mode: ColorMode) => {
    setColorModeState(mode)
    localStorage.setItem('chakra-ui-color-mode', mode)
  }

  const toggleColorMode = () => {
    const resolvedMode =
      colorMode === 'system'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
        : colorMode
    setColorMode(resolvedMode === 'light' ? 'dark' : 'light')
  }

  return {
    colorMode,
    setColorMode,
    toggleColorMode,
  }
}

export function useColorModeValue<T>(light: T, dark: T): T {
  // Initialize with server-safe default
  const [resolvedValue, setResolvedValue] = useState<T>(() => {
    if (typeof window === 'undefined') return light
    const isDark = document.documentElement.classList.contains('dark')
    return isDark ? dark : light
  })

  useEffect(() => {
    // Update value when DOM changes
    const updateValue = () => {
      const isDark = document.documentElement.classList.contains('dark')
      setResolvedValue(isDark ? dark : light)
    }

    // Initial update
    updateValue()

    // Watch for class changes on document element
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'class'
        ) {
          updateValue()
        }
      }
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    return () => observer.disconnect()
  }, [light, dark])

  return resolvedValue
}
