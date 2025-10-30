import { sendTestReportEmail } from "@/app/lib/services/googleMail";
import { jsonResponse } from "@/helpers/loginHelper";
import * as Sentry from "@sentry/nextjs";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { passedTests, failedTests } = await request.json();
     if (!passedTests.length && !failedTests.length) {
      return jsonResponse(400, "Invalid request.");
    }
    await sendTestReportEmail(passedTests, failedTests);
    return jsonResponse(200,"Email sent successfully");
  } catch (error:any) {
    console.error("Error sending email:", error);
    Sentry.captureException(error);
    return jsonResponse(
      500,
      error?.response?.data.message || "Failed to send email"
    );
  }
}
