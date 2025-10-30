import { dailyPushNotification } from "@/helpers/jobs";
import {
  jsonResponse,
} from "@/helpers/loginHelper";
import * as Sentry from "@sentry/nextjs";

export async function GET() {
  try {
    const logs = await dailyPushNotification();
    return jsonResponse(
      200,
      "Daily kudo app push notifications processed successfully.",
      logs
    );
  } catch (error: any) {
    const status = error?.response?.status || 500;
    if (status >= 500) {
      Sentry.captureException(error);
    }
    console.error(error, "error while app push notifications");
    return jsonResponse(
      status,
      error?.response?.data.message || "Internal server error"
    );
  }
}
