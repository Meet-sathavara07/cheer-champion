import * as Sentry from '@sentry/nextjs';

export async function register() {
  // Only register Sentry if not disabled and not in development
  if (process.env.DISABLE_SENTRY !== "true" && process.env.NODE_ENV !== "development") {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
      await import('../sentry.server.config');
    }

    if (process.env.NEXT_RUNTIME === 'edge') {
      await import('../sentry.edge.config');
    }
  }
}

// Only export this function if Sentry is enabled
export const onRequestError = process.env.DISABLE_SENTRY !== "true" && process.env.NODE_ENV !== "development"
  ? Sentry.captureRequestError
  : () => {};