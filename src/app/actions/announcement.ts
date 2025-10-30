import "server-only";
import { getAllUserProfiles } from "./profile";
import { isDummyEmail, sendReminderWebPushNotification } from "@/helpers/jobs";
import { jsonResponse } from "@/helpers/loginHelper";
import { uploadImageToBucket } from "./kudo";
import * as Sentry from "@sentry/nextjs";
import { sendAnnouncementEmail } from "../lib/services/googleMail";
import { addNotification, addNotificationChannel } from "./notifications";

interface UserProfile {
  id: string;
  userId: string;
  web_push_token?: string;
  email?: string;
  name?: string;
}

export async function sendAnnouncement(formData: FormData) {


  
  try {
    const title = formData.get("title") as string;
    const message = formData.get("message") as string;
    const sendToAll = formData.get("sendToAll") === "true";
    const users = formData.get("users")
      ? (JSON.parse(formData.get("users") as string) as UserProfile[])
      : [];
    const image = formData.get("image") as File | null;
    const fileName = formData.get("fileName") as string | null;
    const existingImageUrl = formData.get("existingImageUrl") as string | null;

    let receivers: UserProfile[];
    if (sendToAll) {
      try {
        const profiles = await getAllUserProfiles();
        receivers = profiles.map((p: any) => ({
          id: p.id,
          userId: p.$users.id,
          name: p.name || p.email || "User",
          email: p.$users.email,
          web_push_token: p.web_push_token,
        }));
      } catch (error) {
        Sentry.captureException(error);
        throw error;
      }
    } else {
      receivers = users;
    }

    let imageUrl: string | undefined;
    if (image && fileName) {
      try {
        imageUrl = await uploadImageToBucket(image, fileName);
      } catch (error) {
        Sentry.captureException(error);
        throw error;
      }
    } else if (existingImageUrl) {
      imageUrl = existingImageUrl;
    }
    const successfulRemindUsers: any[] = [];
    const failedRemindUsers: any[] = [];
    const webPushes: any[] = [];

    for (const user of receivers) {
      const { email, id: profileId, userId, name, web_push_token } = user;

      const isEmailDummy = await isDummyEmail(user.email ?? "");
      if (isEmailDummy && !web_push_token) continue;

      const notificationData = {
        user_id: userId,
        frequency: "one-time",
        message,
        name: "Announcement",
        title,
        type: "announcement",
      };

      const notificationId = await addNotification(notificationData, userId);

      try {
        if (!isEmailDummy) {
          const emailResult = await sendAnnouncementEmail(
            title,
            message,
            imageUrl,
            user,
            userId
          );
          await addNotificationChannel(notificationId, {
            channel: "email",
            identifier: emailResult.emailTemplate,
            status: emailResult.success ? "success" : "failed",
            message: imageUrl,
            ...(emailResult.success ? {} : { error: emailResult.error }),
          });
          if (emailResult.success) {
            successfulRemindUsers.push({
              email,
              name,
              id: userId,
              profileId,
              method: "email",
            });
          } else {
            failedRemindUsers.push({
              email,
              name,
              id: userId,
              profileId,
              method: "email",
              error: emailResult.error || "email error",
            });
          }
        }
        // Handle push notifications
        if (web_push_token) {
          const pushResponse = await sendReminderWebPushNotification(
            title,
            message,
            web_push_token,
            imageUrl,
            userId
          );
          webPushes.push(pushResponse);
          await addNotificationChannel(notificationId, {
            channel: "web_push",
            identifier: web_push_token,
            message: imageUrl,
            status: pushResponse.success ? "success" : "failed",
            ...(pushResponse.success ? {} : { error: pushResponse.error }),
          });
          if (pushResponse.success) {
            successfulRemindUsers.push({
              name,
              id: userId,
              profileId,
              method: "web_push",
            });
          } else {
            failedRemindUsers.push({
              name,
              id: userId,
              profileId,
              method: "web_push",
              error: pushResponse.error,
            });
          }
        }
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.message || error?.message || "Unknown error";
        console.error(
          `[ERROR] Failed to send announcement to user ${email || userId}:`,
          errorMessage
        );
        Sentry.captureException(error);
        failedRemindUsers.push({
          email,
          name,
          id: userId,
          profileId,
          error: errorMessage,
          method: email && !(await isDummyEmail(email)) ? "email" : "push",
        });
        const channel =
          email && !(await isDummyEmail(email)) ? "email" : "push";
        const templateIdentifier =
          channel === "email"
            ? "announcement_email_template"
            : "announcement_push_template";
        await addNotificationChannel(notificationId, {
          channel,
          identifier: templateIdentifier,
          status: "failed",
          message: imageUrl,
          error: errorMessage,
        });
      }
    }

    return {
      success: true,
      webPushes,
      imageUrl,
      successfulRemindUsers,
      failedRemindUsers,
    };
  } catch (error: any) {
    const status = error?.response?.status || 500;
    if (status >= 500) {
      Sentry.captureException(error);
    }
    console.error("Error sending announcement:", error);
    return jsonResponse(status, error?.message || "Internal server error");
  }
}
