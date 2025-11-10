import { IconButton } from '@chakra-ui/react'
import { useColorMode } from '~/components/ui/color-mode'

export function ColorModeToggle() {
  const { colorMode, toggleColorMode } = useColorMode()

  // Resolve the actual display mode (system -> light or dark)
  const getResolvedMode = () => {
    if (colorMode === 'system') {
      return typeof window !== 'undefined' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
    }
    return colorMode
  }

  const resolvedMode = getResolvedMode()

  return (
    <IconButton
      aria-label="Toggle color mode"
      onClick={toggleColorMode}
      variant="ghost"
      color="white"
      _hover={{ bg: 'whiteAlpha.200' }}
      size="md"
    >
      {resolvedMode === 'light' ? '🌙' : '☀️'}
    </IconButton>
  )
}
