import {
  authenticateRequest,
  jsonResponse,
} from "@/helpers/loginHelper";
import * as Sentry from "@sentry/nextjs";
import { NextRequest } from "next/server";
import adminDB from "@/app/lib/admin/instant";

export async function GET(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);

    if (!user) {
      return jsonResponse(401, "Unauthorized");
    }
   const result = await adminDB.query({
      notifications: {
        $: { where: { user_id: user.id, is_read: false } }
      }
    });
   
    return jsonResponse(200, "Get unread notifications count successfully",{count: result.notifications.length});
  } catch (error: any) {
    const status = error?.response?.status || 500;
    if (status >= 500) {
      Sentry.captureException(error);
    }
    console.error("Error Unread notifications count:", error);
    return jsonResponse(
      status,
      error?.response?.data.message || "Internal server error"
    );
  }
}
