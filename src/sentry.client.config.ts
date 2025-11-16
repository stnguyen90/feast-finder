import * as Sentry from '@sentry/tanstackstart-react'

// Initialize Sentry for client-side error tracking
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,

  // Set environment
  environment: import.meta.env.MODE || 'development',

  // Performance Monitoring
  integrations: [
    // Enable browser tracing for performance monitoring
    Sentry.browserTracingIntegration({
      // Set sample rate for performance monitoring
      // In production, you might want to lower this
    }),

    // Enable Session Replay
    Sentry.replayIntegration({
      // Mask all text content by default
      maskAllText: true,
      // Mask all media (images, videos, etc.)
      blockAllMedia: true,
    }),

    // Enable user feedback
    Sentry.feedbackIntegration({
      // Automatically inject user feedback button
      autoInject: true,
      colorScheme: 'system',
    }),

    // Capture console logs
    Sentry.captureConsoleIntegration({
      levels: ['error', 'warn'],
    }),
  ],

  // Performance Monitoring sample rate
  // 1.0 = 100% of transactions are sent
  // In production, consider lowering this to reduce quota usage
  tracesSampleRate: 1.0,

  // Session Replay sample rate
  // 0.1 = 10% of sessions will be recorded
  replaysSessionSampleRate: 0.1,

  // Session Replay sample rate for sessions with errors
  // 1.0 = 100% of sessions with errors will be recorded
  replaysOnErrorSampleRate: 1.0,

  // Enable Sentry debug mode in development
  debug: import.meta.env.MODE === 'development',

  // Send default PII (Personally Identifiable Information)
  sendDefaultPii: false,

  // Before sending events, filter out potential sensitive data
  beforeSend(event) {
    // Check if it's a browser event (not server-side)
    if (typeof window !== 'undefined') {
      // Filter out potential sensitive query parameters
      if (event.request?.url) {
        try {
          const url = new URL(event.request.url)
          // Remove sensitive query parameters if needed
          const sensitiveParams = ['token', 'api_key', 'apikey', 'password']
          sensitiveParams.forEach((param) => {
            if (url.searchParams.has(param)) {
              url.searchParams.set(param, '[Filtered]')
            }
          })
          event.request.url = url.toString()
        } catch (e) {
          // Invalid URL, skip filtering
        }
      }
    }
    return event
  },
})
