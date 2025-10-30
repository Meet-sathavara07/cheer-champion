import { authenticateRequest, jsonResponse } from "@/helpers/loginHelper";
import * as Sentry from "@sentry/nextjs";
import { NextRequest } from "next/server";
import adminDB from "@/app/lib/admin/instant";
import moment from "moment";

export async function PATCH(
  request: NextRequest,
  { params }: { params: any }
) {
  try {
    const user = await authenticateRequest(request);

    if (!user) {
      return jsonResponse(401, "Unauthorized");
    }
    const { id } = params;
    if (!id) {
      return jsonResponse(401, "Invalid notification ID");
    }

    await adminDB.transact([
      adminDB.tx.notifications[id].update({
        is_read: true,
        read_at: moment.utc().toISOString(),
      }),
    ]);

    return jsonResponse(200, "Notification read successfully");
  } catch (error: any) {
    const status = error?.response?.status || 500;
    if (status >= 500) {
      Sentry.captureException(error);
    }
    console.error("Error read notification:", error);
    return jsonResponse(
      status,
      error?.response?.data.message || "Internal server error"
    );
  }
}
