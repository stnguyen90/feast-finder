import * as Sentry from '@sentry/tanstackstart-react'

// Initialize Sentry for server-side error tracking
Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,

  // Set environment
  environment: process.env.NODE_ENV || 'development',

  // Performance Monitoring
  integrations: [
    // Capture console logs on server
    Sentry.captureConsoleIntegration({
      levels: ['error', 'warn'],
    }),
  ],

  // Performance Monitoring sample rate
  // 1.0 = 100% of transactions are sent
  tracesSampleRate: 1.0,

  // Enable Sentry debug mode in development
  debug: process.env.NODE_ENV === 'development',

  // Send default PII (Personally Identifiable Information)
  sendDefaultPii: false,

  // Before sending events, filter out potential sensitive data
  beforeSend(event) {
    // Filter out potential sensitive data from server requests
    if (event.request?.url) {
      try {
        const url = new URL(event.request.url)
        // Remove sensitive query parameters
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

    // Filter sensitive headers
    if (event.request?.headers) {
      const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key']
      sensitiveHeaders.forEach((header) => {
        if (event.request?.headers?.[header]) {
          event.request.headers[header] = '[Filtered]'
        }
      })
    }

    return event
  },
})
