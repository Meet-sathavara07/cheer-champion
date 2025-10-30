import { NextRequest } from "next/server";
import { authenticateRequest, jsonResponse } from "@/helpers/loginHelper";
import { reportIssue } from "@/app/lib/services/googleMail";
import * as Sentry from "@sentry/nextjs";

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return jsonResponse(401, "Unauthorized");
    }
    const formData = await request.formData();
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const message = formData.get("message") as string;
    const file = formData.get("attachment") as File | null;
    await reportIssue(name, email, message, file);
    return jsonResponse(200, "Thank you! Your message has been sent.");
  } catch (error: any) {
    const status = error?.response?.status || 500;
    if (status >= 500) {
      Sentry.captureException(error);
    }
    console.error("Error contact us:", error);
    return jsonResponse(
      status,
      error?.response?.data.message || "Internal server error"
    );
  }
}
