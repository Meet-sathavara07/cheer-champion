import { addNotificationChannel } from "@/app/actions/notifications";
import { firebaseAdmin } from "@/app/lib/admin/firebase";
import * as Sentry from "@sentry/nextjs";
const brandLogo =
  "https://cheerchampion.s3.us-east-1.amazonaws.com/kudos/cheer_champion_image_512x512.png";

export async function sendKudoWebPushNotification(
  receiver: any,
  kudoID: string,
  title: string,
  body: string,
  notificationID?: string
) {
  const { web_push_token } = receiver || {};
  if (!web_push_token || !notificationID) return;
  const defaultData = {
    channel: "web_push",
    identifier: web_push_token,
    title: title,
    message: body,
  };
  try {
    const kudoLink = `https://cheerchampion.com/feeds/${kudoID}`;
    const payload = {
      notification: {
        title,
        body,
      },
      data: {
        entity_id: kudoID,
        entity_type: "kudo",
        notification_id: notificationID,
        // link: kudoLink, // Add link in data for service worker
      },
      webpush: {
        headers: { Urgency: "high" },
        fcm_options: { link: kudoLink },
        notification: { image: brandLogo },
      },
      token: web_push_token,
    };

    await firebaseAdmin.messaging().send(payload);
    await addNotificationChannel(notificationID, {
      ...defaultData,
      status: "success",
    });
  } catch (error: any) {
    console.error(`Failed to send web push notification:`, error);
    Sentry.captureException(error);
    await addNotificationChannel(notificationID, {
      ...defaultData,
      status: "failed",
      error:
        error?.response?.data?.message ||
        error.message ||
        "Failed to send kudo web notification",
    });
  }
}

export async function sendWebPushNotification(
  web_push_token: string,
  title: string,
  body: string,
  notificationID?: string
) {
  const defaultData = {
    channel: "web_push",
    identifier: web_push_token,
    title: title,
    message: body,
  };
  try {
    const link = `https://cheerchampion.com/`;
    const payload = {
      notification: {
        title,
        body,
      },
      data: {
        notification_id: notificationID || "",
      },
      webpush: {
        headers: { Urgency: "high" },
        fcm_options: { link: link },
        notification: { image: brandLogo },
      },
      token: web_push_token,
    };

    await firebaseAdmin.messaging().send(payload);
    await addNotificationChannel(notificationID, {
      ...defaultData,
      status: "success",
    });
    return { success: true, error: "" };
  } catch (error: any) {
    console.error(`Failed to send web push notification:`, error);
    Sentry.captureException(error);
    const errorMessage =
      error?.response?.data?.message ||
      error.message ||
      "Failed to send web notification";
    await addNotificationChannel(notificationID, {
      ...defaultData,
      status: "failed",
      error: errorMessage,
    });
    return { success: false, error: errorMessage };
  }
}

export async function dailyWebPushNotification(
  pushToken: string,
  notification: any,
  notificationID: any,
  userId: any
) {
  const defaultData = {
    channel: "web_push",
    identifier: pushToken,
  };
  const baseURLlink = "https://cheer-champion.vercel.app"; // Switch to "https://cheer-champion.vercel.app" in prod

  try {
    const unsubscribeURL = `${baseURLlink}/unsubscribe/${userId}`;
    const payload = {
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: {
        notification_id: notificationID,
        base_url: baseURLlink,
        unsubscribe_url: unsubscribeURL,
      },
      webpush: {
        headers: { Urgency: "high" },
        // Clicking body opens base site; service worker can route actions
        fcm_options: { link: baseURLlink },
        notification: {
          image: brandLogo,
          actions: [{ action: "unsubscribe", title: "Unsubscribe" }],
          requireInteraction: false,
        },
      },
      token: pushToken,
    };

    console.log(`🔄 Sending web push notification to token: ${pushToken}...`);
    await firebaseAdmin.messaging().send(payload);
    await addNotificationChannel(notificationID, {
      ...defaultData,
      status: "success",
    });
    return { error: "", success: true };
  } catch (error: any) {
    console.error(
      `❌ Failed to send web push notification to ${pushToken}...:`,
      error
    );
    Sentry.captureException(error);
    const errorMessage =
      error?.response?.data?.message ||
      error.message ||
      "Failed to send web push notification";
    await addNotificationChannel(notificationID, {
      ...defaultData,
      status: "failed",
      error: errorMessage,
    });
    return { error: errorMessage, success: false };
  }
}
