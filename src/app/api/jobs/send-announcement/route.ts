import "server-only";
import { jsonResponse } from "@/helpers/loginHelper";
import { sendAnnouncement } from "@/app/actions/announcement";
import * as Sentry from "@sentry/nextjs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const title = formData.get("title") as string;
    const message = formData.get("message") as string;
    const sendToAll = formData.get("sendToAll") === "true";
    const jsonUsers = formData.get("users") as string;
    const users = jsonUsers ? JSON.parse(jsonUsers) as { id: string; userId: string; name: string; email?: string; web_push_token?: string }[] : [];
    const image = formData.get("image") as File | null;
    const fileName = formData.get("fileName") as string | null;
    // Validate inputs
    if (!title || !message) {
      return jsonResponse(400, "Title and message are required.");
    }

    if (!sendToAll && (!Array.isArray(users) || users.length === 0)) {
      return jsonResponse(400, "Invalid users for selected users.");
    }

    if (image && (typeof fileName !== "string" || typeof image.arrayBuffer !== "function")) {
      return jsonResponse(400, "Invalid image file.");
    }
    const result = await sendAnnouncement(formData);

    return jsonResponse(200, "Announcement sent successfully!", result);
  } catch (error: any) {
    const status = error?.response?.status || 500;
    if (status >= 500) {
      Sentry.captureException(error);
    }
    console.error("Error in announcement POST route:", error);
    return jsonResponse(status, error?.message || "Internal server error");
  }
}