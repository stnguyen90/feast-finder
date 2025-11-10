import { createFileRoute } from '@tanstack/react-router'
import { Box, Button, Container, Heading, Stack, Text } from '@chakra-ui/react'
import * as Sentry from '@sentry/tanstackstart-react'
import { useState } from 'react'

export const Route = createFileRoute('/sentry-test')({
  component: SentryTestComponent,
})

function SentryTestComponent() {
  const [count, setCount] = useState(0)

  const throwError = () => {
    throw new Error('Test error from Sentry test page!')
  }

  const captureException = () => {
    try {
      throw new Error('Manually captured test exception')
    } catch (error) {
      Sentry.captureException(error)
      alert('Exception captured and sent to Sentry!')
    }
  }

  const captureMessage = () => {
    Sentry.captureMessage('Test message from Feast Finder', 'info')
    alert('Message sent to Sentry!')
  }

  const logError = () => {
    console.error('Test console.error - should be captured by Sentry')
    alert('Error logged to console (check Sentry for capture)')
  }

  const logWarning = () => {
    console.warn('Test console.warn - should be captured by Sentry')
    alert('Warning logged to console (check Sentry for capture)')
  }

  const triggerPerformance = () => {
    // Use startSpan instead of startTransaction for newer Sentry SDK
    Sentry.startSpan(
      {
        name: 'test-transaction',
        op: 'test-operation',
      },
      () => {
        // Simulate some work
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(true)
          }, 1000)
        })
      },
    )
    alert('Performance transaction sent to Sentry!')
  }

  return (
    <Container maxW="container.lg" py={8}>
      <Stack gap={6}>
        <Box>
          <Heading size="xl" mb={2}>
            🧪 Sentry Integration Test Page
          </Heading>
          <Text color="gray.600">
            Use the buttons below to test different Sentry features. Make sure
            you have configured VITE_SENTRY_DSN in your .env.local file.
          </Text>
        </Box>

        <Box p={6} borderWidth="1px" borderRadius="lg">
          <Heading size="md" mb={4}>
            Error Tracking
          </Heading>
          <Stack gap={3}>
            <Button colorScheme="red" onClick={throwError}>
              Throw Uncaught Error
            </Button>
            <Text fontSize="sm" color="gray.600">
              This will trigger an uncaught error that should be caught by the
              ErrorBoundary and sent to Sentry.
            </Text>

            <Button colorScheme="orange" onClick={captureException}>
              Capture Exception Manually
            </Button>
            <Text fontSize="sm" color="gray.600">
              This captures and sends an exception to Sentry using
              Sentry.captureException().
            </Text>

            <Button colorScheme="blue" onClick={captureMessage}>
              Send Message to Sentry
            </Button>
            <Text fontSize="sm" color="gray.600">
              This sends an informational message to Sentry using
              Sentry.captureMessage().
            </Text>
          </Stack>
        </Box>

        <Box p={6} borderWidth="1px" borderRadius="lg">
          <Heading size="md" mb={4}>
            Console Log Capture
          </Heading>
          <Stack gap={3}>
            <Button colorScheme="red" onClick={logError}>
              Log Error to Console
            </Button>
            <Text fontSize="sm" color="gray.600">
              Logs an error to the console. Should be captured by Sentry's
              captureConsoleIntegration.
            </Text>

            <Button colorScheme="yellow" onClick={logWarning}>
              Log Warning to Console
            </Button>
            <Text fontSize="sm" color="gray.600">
              Logs a warning to the console. Should be captured by Sentry's
              captureConsoleIntegration.
            </Text>
          </Stack>
        </Box>

        <Box p={6} borderWidth="1px" borderRadius="lg">
          <Heading size="md" mb={4}>
            Performance Monitoring
          </Heading>
          <Stack gap={3}>
            <Button colorScheme="green" onClick={triggerPerformance}>
              Trigger Performance Transaction
            </Button>
            <Text fontSize="sm" color="gray.600">
              Creates a test performance transaction and sends it to Sentry.
            </Text>
          </Stack>
        </Box>

        <Box p={6} borderWidth="1px" borderRadius="lg">
          <Heading size="md" mb={4}>
            Session Replay
          </Heading>
          <Stack gap={3}>
            <Text>
              Session replay is automatically enabled. Click around this page
              and trigger some errors to see it in action.
            </Text>
            <Text fontSize="sm" color="gray.600">
              Configuration: 10% of sessions are recorded, 100% of sessions
              with errors are recorded.
            </Text>
            <Box>
              <Text fontWeight="bold" mb={2}>
                Interactive element for replay:
              </Text>
              <Button
                colorScheme="purple"
                onClick={() => setCount(count + 1)}
              >
                Click Count: {count}
              </Button>
            </Box>
          </Stack>
        </Box>

        <Box p={6} borderWidth="1px" borderRadius="lg">
          <Heading size="md" mb={4}>
            User Feedback
          </Heading>
          <Stack gap={3}>
            <Text>
              The user feedback widget should be automatically injected on this
              page. Look for a feedback button (usually in the bottom right
              corner).
            </Text>
            <Text fontSize="sm" color="gray.600">
              If you don't see it, make sure Sentry is properly configured with
              your DSN.
            </Text>
          </Stack>
        </Box>

        <Box p={4} bg="blue.50" borderRadius="md">
          <Text fontWeight="bold" mb={2}>
            📝 Note:
          </Text>
          <Text fontSize="sm">
            After testing, check your Sentry dashboard at{' '}
            <a
              href="https://sentry.io"
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'underline' }}
            >
              sentry.io
            </a>{' '}
            to see the captured errors, messages, and performance data.
          </Text>
        </Box>
      </Stack>
    </Container>
  )
}
