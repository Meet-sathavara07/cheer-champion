import { jsonResponse } from "@/helpers/loginHelper";
import * as Sentry from "@sentry/nextjs";
import { noKudoSentReminders } from "@/helpers/jobs";

export async function GET() {
  try {
    const updates = await noKudoSentReminders();
    return jsonResponse(200, "Reminders processed", { updates });
  } catch (error: any) {
    const status = error?.response?.status || 500;
    if (status >= 500) {
      Sentry.captureException(error);
    }
    return jsonResponse(
      status,
      error?.response?.data.message || "Something went wrong"
    );
  }
}
