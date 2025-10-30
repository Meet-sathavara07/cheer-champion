// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

// Only initialize Sentry if not disabled and not in development
if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_DISABLE_SENTRY !== "true") {
Sentry.init({
  dsn: "https://7b9d9d7c488d5b93a6a45069decaa976@o4509200820011008.ingest.us.sentry.io/4509200944398336",

  // Add optional integrations for additional features
  integrations: [
    Sentry.replayIntegration(),
  ],

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,

  // Define how likely Replay events are sampled.
  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: 0.1,

  // Define how likely Replay events are sampled when an error occurs.
  replaysOnErrorSampleRate: 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});
}

// Only export these functions if Sentry is enabled
export const onRouterTransitionStart = typeof window !== 'undefined' && process.env.NEXT_PUBLIC_DISABLE_SENTRY !== "true"
  ? Sentry.captureRouterTransitionStart 
  : () => {};