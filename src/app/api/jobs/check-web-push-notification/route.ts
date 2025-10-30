import {
  jsonResponse,
} from "@/helpers/loginHelper";
import * as Sentry from "@sentry/nextjs";
// import { checkWebPushNotification, dailyAppPushNotification } from "@/helpers/jobs";

export async function GET() {
  try {
    // const logs = await checkWebPushNotification();
    // return jsonResponse(
    //   200,
    //   "Daily kudo app push notifications processed successfully.",
    //   logs
    // );
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
