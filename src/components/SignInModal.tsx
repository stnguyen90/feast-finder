import { useState } from 'react'
import {
  Box,
  Button,
  DialogBackdrop,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  Input,
  Spinner,
  Text,
  VStack,
} from '@chakra-ui/react'
import { useAuthActions } from '@convex-dev/auth/react'

interface SignInModalProps {
  isOpen: boolean
  onClose: () => void
}

type AuthMode = 'signin' | 'signup'

export function SignInModal({ isOpen, onClose }: SignInModalProps) {
  const [mode, setMode] = useState<AuthMode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { signIn } = useAuthActions()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      await signIn('password', {
        email,
        password,
        ...(mode === 'signup' && name ? { name } : {}),
        flow: mode === 'signup' ? 'signUp' : 'signIn',
      })
      // Reset form and close modal on success
      setEmail('')
      setPassword('')
      setName('')
      onClose()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred. Please try again.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  const toggleMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin')
    setError(null)
  }

  const handleClose = () => {
    setEmail('')
    setPassword('')
    setName('')
    setError(null)
    setMode('signin')
    onClose()
  }

  return (
    <DialogRoot open={isOpen} onOpenChange={handleClose}>
      <DialogBackdrop />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
          </DialogTitle>
          <DialogCloseTrigger />
        </DialogHeader>
        <DialogBody>
          <Box as="form" onSubmit={handleSubmit}>
            <VStack gap={4} align="stretch">
              {mode === 'signup' && (
                <Box>
                  <Text mb={2} fontSize="sm" fontWeight="medium">
                    Name
                  </Text>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    required
                    disabled={isLoading}
                  />
                </Box>
              )}
              <Box>
                <Text mb={2} fontSize="sm" fontWeight="medium">
                  Email
                </Text>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  disabled={isLoading}
                />
              </Box>
              <Box>
                <Text mb={2} fontSize="sm" fontWeight="medium">
                  Password
                </Text>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  disabled={isLoading}
                />
              </Box>
              {error && (
                <Text color="red.500" fontSize="sm">
                  {error}
                </Text>
              )}
              <Button
                type="submit"
                bg="brand.solid"
                color="brand.contrast"
                width="full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Spinner size="sm" />
                ) : mode === 'signin' ? (
                  'Sign In'
                ) : (
                  'Create Account'
                )}
              </Button>
              <Box textAlign="center">
                <Button
                  variant="plain"
                  onClick={toggleMode}
                  size="sm"
                  disabled={isLoading}
                >
                  {mode === 'signin'
                    ? "Don't have an account? Sign up"
                    : 'Already have an account? Sign in'}
                </Button>
              </Box>
            </VStack>
          </Box>
        </DialogBody>
      </DialogContent>
    </DialogRoot>
  )
}
