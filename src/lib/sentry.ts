/**
 * Sentry Configuration for BaliBuddy PWA
 * Error tracking and performance monitoring
 */

import * as Sentry from '@sentry/react-native';

/**
 * Initialize Sentry for error tracking
 */
export function initSentry() {
  const dsn = process.env.VITE_SENTRY_DSN;
  
  if (!dsn) {
    console.warn('Sentry DSN not configured. Error tracking disabled.');
    return;
  }

  Sentry.init({
    dsn,
    debug: __DEV__,
    environment: __DEV__ ? 'development' : 'production',
    
    // Performance Monitoring
    tracesSampleRate: __DEV__ ? 1.0 : 0.2,
    
    // Session Replay (optional)
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    
    // Integrations
    integrations: [
      Sentry.reactNativeTracingIntegration(),
      Sentry.mobileReplayIntegration(),
    ],
    
    // beforeSend hook to filter sensitive data
    beforeSend(event) {
      // Filter out sensitive information
      if (event.request?.data) {
        const data = event.request.data as Record<string, unknown>;
        // Remove sensitive fields
        delete data.password;
        delete data.token;
        delete data.apiKey;
      }
      return event;
    },
  });
}

/**
 * Capture exception with context
 */
export function captureException(error: Error, context?: Record<string, unknown>) {
  if (context) {
    Sentry.setContext('additional', context);
  }
  Sentry.captureException(error);
}

/**
 * Capture message with level
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info') {
  Sentry.captureMessage(message, level);
}

/**
 * Set user context for error tracking
 */
export function setUserContext(user: {
  id?: string;
  email?: string;
  username?: string;
}) {
  Sentry.setUser(user);
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(message: string, category?: string, data?: Record<string, unknown>) {
  Sentry.addBreadcrumb({
    message,
    category: category || 'custom',
    data,
    level: 'info',
  });
}

/**
 * Start a span for performance monitoring
 */
export function startSpan(name: string, op: string) {
  return Sentry.startSpan({
    name,
    op,
  }, () => {});
}

export default {
  init: initSentry,
  captureException,
  captureMessage,
  setUserContext,
  addBreadcrumb,
  startSpan,
};
