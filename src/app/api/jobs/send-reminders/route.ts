import { NextRequest } from "next/server";
import { jsonResponse } from "@/helpers/loginHelper";
// import adminDB from "@/app/lib/admin/instant";
import * as Sentry from "@sentry/nextjs";
// import moment from "moment";
import { sendNoActivityReminders } from "@/helpers/jobs";

export async function GET(request: NextRequest) {
  try {
    const updates = await sendNoActivityReminders();

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
