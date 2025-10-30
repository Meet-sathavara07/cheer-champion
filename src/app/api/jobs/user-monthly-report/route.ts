import { sendMonthlyUserReport } from "@/helpers/jobs";
import {
  jsonResponse,
} from "@/helpers/loginHelper";
import * as Sentry from "@sentry/nextjs";

export async function GET() {
  try {
    const logs = await sendMonthlyUserReport();
    return jsonResponse(
      200,
      "User monthly report processed successfully.",
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
