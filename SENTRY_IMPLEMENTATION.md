# Sentry Integration Implementation Guide

## Overview

This document describes the Sentry integration implementation for Feast Finder, providing comprehensive error tracking, performance monitoring, session replay, user feedback, and log capture.

## Package Used

- **@sentry/tanstackstart-react** (v8.48.0): Official Sentry SDK for TanStack Start + React applications
- **@sentry/vite-plugin** (v2.22.9): Vite plugin for automatic source map uploads

## Files Created/Modified

### New Files

1. **src/sentry.client.config.ts**: Client-side Sentry initialization
   - Error tracking with browser tracing
   - Session replay (10% sample rate, 100% on errors)
   - User feedback widget (auto-inject)
   - Console log capture (errors & warnings)
   - Sensitive data filtering

2. **src/sentry.server.config.ts**: Server-side Sentry initialization
   - Server-side error tracking
   - Console log capture
   - Request sanitization
   - Header filtering

3. **src/routes/sentry-test.tsx**: Test page for verifying Sentry integration
   - Error throwing demos
   - Manual exception capture
   - Message capture
   - Console log testing
   - Performance transaction testing
   - Session replay demo

4. **.env.local.example**: Environment variable template
   - VITE_SENTRY_DSN
   - SENTRY_ORG
   - SENTRY_PROJECT
   - SENTRY_AUTH_TOKEN

### Modified Files

1. **src/router.tsx**: Added Sentry initialization checks
   - Client-side: `import('./sentry.client.config')`
   - Server-side: `import('./sentry.server.config')`

2. **src/routes/__root.tsx**: Added Sentry ErrorBoundary
   - Wraps entire application
   - Custom fallback UI
   - Error dialog support

3. **vite.config.ts**: Added Sentry Vite plugin
   - Source map generation
   - Automatic source map uploads (production only)
   - Auth token configuration

4. **package.json**: Added Sentry dependencies
   - @sentry/tanstackstart-react
   - @sentry/vite-plugin

5. **README.md**: Added Sentry documentation
   - Setup instructions
   - Feature list
   - Configuration guide

## Features Implemented

### ✅ Error Tracking (Client & Server)

**Client-side:**
- Automatic uncaught exception capture
- Unhandled promise rejection capture
- Error boundary integration
- Manual error capture with `Sentry.captureException()`

**Server-side:**
- Server-side error capture
- Request context tracking
- Sensitive header filtering

### ✅ Performance Monitoring

- **Browser Tracing Integration**: Tracks page loads, navigation, and interactions
- **Custom Transactions**: Support for manual performance tracking with `Sentry.startSpan()`
- **Sample Rate**: Configurable (default: 100% in development)
- **Source Maps**: Automatic upload for better stack traces in production

### ✅ Session Replay

- **Recording Rate**: 10% of normal sessions
- **Error Recording**: 100% of sessions with errors
- **Privacy Controls**:
  - All text masked by default
  - All media (images, videos) blocked
  - Configurable masking rules

### ✅ User Feedback

- **Auto-inject Widget**: Automatically added to all pages
- **System Theme Support**: Adapts to light/dark mode
- **Easy Reporting**: Users can report bugs directly from the app

### ✅ Logs Integration

- **Console Error Capture**: All `console.error()` calls sent to Sentry
- **Console Warning Capture**: All `console.warn()` calls sent to Sentry
- **Context Preservation**: Maintains error context and stack traces

### ✅ Security & Privacy

**Sensitive Data Filtering:**
- Query parameters: token, api_key, apikey, password
- Request headers: authorization, cookie, x-api-key
- Custom `beforeSend` hook for additional filtering

**Best Practices:**
- No PII (Personally Identifiable Information) sent by default
- Configurable data scrubbing
- HTTPS-only communication with Sentry

## Configuration

### Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Required - Get from https://sentry.io/settings/[org]/projects/[project]/keys/
VITE_SENTRY_DSN=your_sentry_dsn_here

# Optional - Only needed for source map uploads in production
SENTRY_ORG=your_sentry_org
SENTRY_PROJECT=your_sentry_project
SENTRY_AUTH_TOKEN=your_sentry_auth_token
```

### Sentry.io Setup

1. Create account at [sentry.io](https://sentry.io)
2. Create a new project:
   - Platform: React
   - Framework: TanStack Start
3. Copy the DSN from project settings
4. Add DSN to `.env.local`
5. (Optional) Generate auth token for source map uploads

### Configuration Options

**Client-side (src/sentry.client.config.ts):**
- `tracesSampleRate`: Percentage of transactions to track (0.0 - 1.0)
- `replaysSessionSampleRate`: Percentage of sessions to record (0.0 - 1.0)
- `replaysOnErrorSampleRate`: Percentage of error sessions to record (0.0 - 1.0)
- `debug`: Enable debug logging (default: true in development)

**Server-side (src/sentry.server.config.ts):**
- `tracesSampleRate`: Percentage of transactions to track (0.0 - 1.0)
- `debug`: Enable debug logging (default: true in development)

## Testing

### Test Page: /sentry-test

Navigate to `/sentry-test` to access the comprehensive test page with:

1. **Error Tracking Tests**
   - Throw Uncaught Error
   - Capture Exception Manually
   - Send Message to Sentry

2. **Console Log Tests**
   - Log Error to Console
   - Log Warning to Console

3. **Performance Tests**
   - Trigger Performance Transaction

4. **Session Replay Demo**
   - Interactive element for replay testing

5. **User Feedback**
   - Look for feedback widget (usually bottom-right corner)

### Manual Testing

1. Start development server: `npm run dev`
2. Navigate to `/sentry-test`
3. Test each feature
4. Check Sentry dashboard for captured events

### Production Testing

1. Build: `npm run build`
2. Start: `npm run start`
3. Navigate to application
4. Trigger errors
5. Verify in Sentry dashboard

## Build & Deploy

### Development

```bash
npm run dev
```

Sentry will initialize with debug mode enabled. No source maps are uploaded.

### Production

```bash
npm run build
```

- Source maps are generated
- Sentry plugin attempts to upload source maps (requires auth token)
- Warnings shown if auth token not configured (non-blocking)

### Deployment

The integration works automatically on Netlify or any other deployment platform. Just ensure environment variables are set:

1. **Netlify Dashboard** → Site Settings → Environment Variables
2. Add `VITE_SENTRY_DSN`
3. (Optional) Add `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN` for source maps

## Monitoring

### Sentry Dashboard

Access your Sentry dashboard at [sentry.io](https://sentry.io) to view:

- **Issues**: All captured errors and exceptions
- **Performance**: Transaction traces and metrics
- **Replays**: Session replay recordings
- **Releases**: Track deployments and error rates by release
- **Alerts**: Set up notifications for new errors

### Key Metrics

- Error count and frequency
- Affected users
- Performance bottlenecks
- User feedback submissions
- Session replay recordings

## Best Practices

1. **Environment-specific Configuration**
   - Lower sample rates in production to control quota
   - Use different DSNs for staging/production

2. **Release Tracking**
   - Tag releases in Sentry to track error trends
   - Use `release` option in Sentry.init()

3. **User Context**
   - Add user context when authentication is implemented:
     ```typescript
     Sentry.setUser({ id: userId, email: userEmail })
     ```

4. **Custom Tags**
   - Add custom tags for better filtering:
     ```typescript
     Sentry.setTag('feature', 'restaurant-search')
     ```

5. **Breadcrumbs**
   - Add custom breadcrumbs for debugging:
     ```typescript
     Sentry.addBreadcrumb({
       message: 'User searched for restaurants',
       level: 'info',
     })
     ```

## Troubleshooting

### Sentry not capturing errors

1. Check `VITE_SENTRY_DSN` is set in `.env.local`
2. Verify DSN is correct (starts with `https://`)
3. Check browser console for Sentry initialization messages
4. Ensure error occurs after Sentry initialization

### Source maps not uploading

1. Verify `SENTRY_AUTH_TOKEN` is set
2. Check `SENTRY_ORG` and `SENTRY_PROJECT` match Sentry project
3. Ensure auth token has `project:releases` scope
4. Check build output for Sentry plugin warnings

### Session replay not working

1. Verify browser supports Session Replay (modern browsers only)
2. Check sample rates in configuration
3. Trigger an error to ensure 100% capture
4. Wait a few minutes for replay to process

### User feedback widget not appearing

1. Check Sentry initialization
2. Verify `feedbackIntegration` is enabled in config
3. Look for widget in bottom-right corner (may be small)
4. Check browser console for errors

## Security Considerations

- ✅ Sensitive data automatically filtered
- ✅ No PII sent by default
- ✅ HTTPS-only communication
- ✅ Configurable data scrubbing
- ✅ Auth tokens stored as environment variables
- ✅ Source maps only uploaded in production

## Performance Impact

- **Bundle Size**: ~220KB for client Sentry SDK (gzipped: ~74KB)
- **Initialization**: < 100ms
- **Runtime Overhead**: Minimal (< 1% performance impact)
- **Session Replay**: Only when recording (10% of sessions)

## Cost Considerations

Sentry offers a free tier with:
- 5,000 errors/month
- 10,000 performance units/month
- 50 replay recordings/month

For production applications, consider upgrading to a paid plan based on usage.

## Future Enhancements

1. **User Authentication Integration**
   - Add user context to errors
   - Track user journeys

2. **Custom Contexts**
   - Add restaurant context to errors
   - Track search queries

3. **Release Tracking**
   - Implement release tagging
   - Track error trends by release

4. **Alert Configuration**
   - Set up Slack/email notifications
   - Configure alert rules

5. **Performance Budgets**
   - Set performance thresholds
   - Alert on regressions

## References

- [Sentry TanStack Start Docs](https://docs.sentry.io/platforms/javascript/guides/tanstackstart-react/)
- [Sentry React Docs](https://docs.sentry.io/platforms/javascript/guides/react/)
- [Sentry JavaScript SDK](https://docs.sentry.io/platforms/javascript/)
- [Session Replay Docs](https://docs.sentry.io/product/session-replay/)
- [Performance Monitoring Docs](https://docs.sentry.io/product/performance/)

## Support

For issues or questions:
1. Check this document
2. Visit `/sentry-test` page for testing
3. Review Sentry documentation
4. Check Sentry dashboard for captured events
