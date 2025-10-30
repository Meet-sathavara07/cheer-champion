import { authenticateRequest, jsonResponse } from "@/helpers/loginHelper";
import moment from "moment";
import { id } from "@instantdb/admin";
import {
  createKudo,
  getRecentlySentSameKudo,
  notifyReceiverContactsKudoReceived,
  notifySenderContactsKudoSent,
  sendKudoMessages,
  updateUserProfileAfterKudoSent,
  uploadKudoImageToBucket,
} from "@/app/actions/kudo";
import * as Sentry from "@sentry/nextjs";
import { createOrFindReceivers } from "@/app/actions/users";

export async function POST(request: Request) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return jsonResponse(401, "Unauthorized");
    }

    const formData = await request.formData();
    const message: any = formData.get("message");
    const file_url: any = formData.get("file_url");
    const jsonRecipients: any = formData.get("recipients");
    const recipients = JSON.parse(jsonRecipients);
    const isSendAnyway: any = formData.get("isSendAnyway");
    const fileType: any = formData.get("fileType");
    const file: any = formData.get("file");

    if (typeof message !== "string" || message.trim() === "") {
      return jsonResponse(400, "Invalid kudo message.");
    }

    if (!file_url && !file) {
      return jsonResponse(400, "No kudo image provided");
    }

    if (file && fileType === "upload") {
      if (
        typeof file.name !== "string" ||
        typeof file.arrayBuffer !== "function"
      ) {
        return jsonResponse(400, "Invalid file object.");
      }
    }

    // FIX: Check recipients array length, not string length
    if (!Array.isArray(recipients) || recipients.length === 0) {
      return jsonResponse(400, "Invalid recipient list.");
    }

    try {
      // prevent duplicate kudo to send
      const recentKudo = await getRecentlySentSameKudo(
        user.id,
        message,
        file_url
      );
      if (recentKudo && isSendAnyway !== "true") {
        return jsonResponse(429, "already sent this kudo recently");
      }
    } catch (error) {
      Sentry.captureException(error);
      // return jsonResponse(500, "Error checking recent kudos");
    }

    let fileURL = file_url;

    const kudoID = id();
    if (fileType === "upload" && file) {
      fileURL = await uploadKudoImageToBucket(file, kudoID);
    }

    const kudo = {
      created_at: moment.utc().toISOString(),
      kudo: message,
      file_url: fileURL,
    };
    // 1️⃣ Create recipients
    const receiverUserIDs = await createOrFindReceivers(recipients, message);
    // 2️⃣ Create Kudo in DB
    await createKudo(user.id, kudoID, kudo, receiverUserIDs);
    // // 3️⃣ Respond to client immediately
    // setImmediate(async () => {
    await sendKudoMessages(kudoID, kudo, receiverUserIDs, user.id);
    await notifyReceiverContactsKudoReceived(
      kudoID,
      kudo,
      receiverUserIDs,
      user.id
    );
    await notifySenderContactsKudoSent(kudoID, kudo, receiverUserIDs, user.id);
    await updateUserProfileAfterKudoSent(user.id, receiverUserIDs);
    // });

    return jsonResponse(200, "Kudo sent successfully!", { kudoID });
  } catch (error: any) {
    const status = error?.response?.status || 500;
    if (status >= 500) {
      Sentry.captureException(error);
    }
    console.error(error, "error while send kudo");
    return jsonResponse(
      status,
      error?.response?.data.message || "Internal server error"
    );
  }
}
