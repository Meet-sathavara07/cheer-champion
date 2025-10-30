// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";
// Onl initialize if not disabled and not in development
if (process.env.DISABLE_SENTRY !== "true" && process.env.NODE_ENV !== "development") {
Sentry.init({
  dsn: "https://7b9d9d7c488d5b93a6a45069decaa976@o4509200820011008.ingest.us.sentry.io/4509200944398336",

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});
}