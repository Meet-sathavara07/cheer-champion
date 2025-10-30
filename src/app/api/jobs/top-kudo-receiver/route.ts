import { topKudoReceiversReminder } from "@/helpers/jobs";
import {
  jsonResponse,
} from "@/helpers/loginHelper";
import * as Sentry from "@sentry/nextjs";

export async function GET() {
  try {
    const logs = await topKudoReceiversReminder();
    return jsonResponse(
      200,
      "Monthly top kudo receivers notifications processed successfully.",
      logs
    );
  } catch (error: any) {
    const status = error?.response?.status || 500;
    console.error(error, "error while top kudo receivers reminder");
    if (status >= 500) {
      Sentry.captureException(error);
    }
    return jsonResponse(
      status,
      error?.response?.data.message || "Internal server error"
    );
  }
}
