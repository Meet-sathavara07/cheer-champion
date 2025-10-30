import { authenticateRequest, jsonResponse } from "@/helpers/loginHelper";
import { NextRequest } from "next/server";
import * as Sentry from "@sentry/nextjs";

export async function GET(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return jsonResponse(401, "User not LoggedIn");
    }
    return jsonResponse(200, "Get LoggedIn User Successfully", {user});
  } catch (error: any) {
    const status = error?.response?.status || 500;
    if (status >= 500) {
      Sentry.captureException(error);
    }
    console.error("Error fetching user:", error);
    return jsonResponse(500, "Something went wrong.", { error: error.message });
  }
}
