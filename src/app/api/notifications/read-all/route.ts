import {
  authenticateRequest,
  jsonResponse,
} from "@/helpers/loginHelper";
import * as Sentry from "@sentry/nextjs";
import { NextRequest } from "next/server";
import adminDB from "@/app/lib/admin/instant";
import moment from "moment";

export async function PATCH(request: NextRequest) {
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

    const updates = result.notifications.map((n) => {
      return adminDB.tx.notifications[n.id]
        .update({ is_read: true, read_at: moment.utc().toISOString() });
    });

    if (updates.length > 0) {
      await adminDB.transact(updates);
    }
    return jsonResponse(200, "read all notifications successfully",{count: updates.length});
  } catch (error: any) {
    const status = error?.response?.status || 500;
    if (status >= 500) {
      Sentry.captureException(error);
    }
    console.error("Error read all notifications:", error);
    return jsonResponse(
      status,
      error?.response?.data.message || "Internal server error"
    );
  }
}
