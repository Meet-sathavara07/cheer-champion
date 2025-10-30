import "server-only";
import adminDB from "../lib/admin/instant";
import { Expo } from "expo-server-sdk";
import { id } from "@instantdb/admin";
import moment from "moment";
import * as Sentry from "@sentry/nextjs";

const expo = new Expo();

export async function sendPushNotification(pushMessages: any[]) {
  try {
    const chunks = expo.chunkPushNotifications(pushMessages);
    const tickets: any[] = [];
    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error("Error sending push notification:", error);
        continue;
      }
    }
    return tickets;
  } catch (error: any) {
    throw new Error("Error chunk push notification:", error);
  }
}
export async function getPushNotification(
  tickets: any[],
  notificationID: any,
  pushMessage: any
) {
  try {
    const ticketIds = tickets.filter((t) => t.id).map((t) => t.id);
    const receiptChunks = await expo.getPushNotificationReceiptsAsync(
      ticketIds
    );
    Object.entries(receiptChunks).forEach(
      async ([key, value]: [string, any]) => {
        if (value.status === "ok") {
          await addNotificationChannel(notificationID, {
            channel: "app_push",
            status: "success",
            identifier: pushMessage.to,
            title: pushMessage.title,
            message: pushMessage.body,
          });
        } else if (value.status === "error") {
          await addNotificationChannel(notificationID, {
            channel: "app_push",
            status: "failed",
            identifier: pushMessage.to,
            error: value.message,
            title: pushMessage.title,
            message: pushMessage.body,
          });
        }
      }
    );
    // Always return a consistent result so callers can safely destructure
    return { success: true };
  } catch (error: any) {
    Sentry.captureException(error);
    console.error(`Failed to send web push notification:`, error);
    return {
      success: false,
      error:
        error?.response?.data?.message ||
        error?.message ||
        "Failed to send push notification",
    };
  }
}

// export async function sendAppPushNotification(
//   userId: string,
//   payload: { title: string; body: string; data?: any }
// ) {
//   // In your DB you should store user's expoPushToken
//   const pushToken = user?.expoPushToken;

//   if (!pushToken || !Expo.isExpoPushToken(pushToken)) {
//     throw new Error("Invalid push token for user " + userId);
//   }

//   const message = {
//     to: pushToken,
//     sound: "default",
//     title: payload.title,
//     body: payload.body,
//     data: payload.data,
//   };

//   const receipts = await expo.sendPushNotificationsAsync([message]);
//   return receipts;
// }
// export async function getAllUsersWithTimezone() {
//   try {
//     const endDate = moment().subtract(7, "days").startOf("day").toISOString();

//   const result = await adminDB.query({
//     $users: {
//       $: {
//         where: {
//           and: [
//             { "user_profile.last_activity_at": { $lt: endDate } },
//             {
//               or: [
//                 { "user_profile.last_reminder_send_at": { $isNull: true } },
//                 {
//                   "user_profile.last_reminder_send_at": {
//                     $lt: endDate,
//                   },
//                 },
//               ],
//             },
//           ],
//         },
//       },
//       user_profile: {},
//     },
//   });
//   const inactiveUsers = result.$users || []
//     for (const chunk of chunks) {
//       await expo.sendPushNotificationsAsync(chunk);
//     }
//   } catch (error) {
//     console.error("Error sending push notification:", error);
//   }
// }

export async function addNotification(
  notification: any,
  userID: string,
  kudoID?: string
) {
  try {
    const notificationID = id();
    const data = {
      created_at: moment.utc().toISOString(),
      is_read: false,
      ...notification,
    };
    if (kudoID) {
      await adminDB.transact([
        adminDB.tx.notifications[notificationID]
          .update(data)
          .link({ $users: userID, kudos: kudoID }),
      ]);
    } else {
      await adminDB.transact([
        adminDB.tx.notifications[notificationID]
          .update(data)
          .link({ $users: userID }),
      ]);
    }

    return notificationID;
  } catch (error: any) {
    console.error("Error adding notification:", error);
    Sentry.captureException(error);
    // throw new Error(`Error adding notification: ${error.message}`);
  }
}
export async function addNotificationChannel(
  notificationID: string | undefined,
  channelData: any
) {
  if (!notificationID) return;
  try {
    const channelID = id();
    await adminDB.transact([
      adminDB.tx.notification_channels[channelID]
        .update(channelData)
        .link({ notifications: notificationID }),
    ]);
    return channelID;
  } catch (error: any) {
    console.error("Error adding notification channel:", error);
    Sentry.captureException(error);
    // throw new Error(`Error adding notification channel: ${error.message}`);
  }
}
export async function updateNotificationChannel(
  channelID: string,
  channelData: any
) {
  try {
    await adminDB.transact([
      adminDB.tx.notification_channels[channelID].update(channelData),
    ]);
  } catch (error: any) {
    console.error("Error updating notification channel:", error);
    Sentry.captureException(error);
    throw new Error(`Error updating notification channel: ${error.message}`);
  }
}
export async function addKudoReceivedNotifications(
  receiver: any,
  kudoID: string,
  kudoSender: any
) {
  try {
    const { $users } = receiver;
    const senderName = kudoSender?.name || "";
    const senderId = kudoSender?.$users?.id || "";
    const senderFile = kudoSender?.$files?.url || ""; // Use photo_url from user_profile
    const actionBy = JSON.stringify({
      name: senderName,
      id: senderId,
      profile_image: senderFile,
    });
    return await addNotification(
      {
        entity_id: kudoID,
        entity_type: "kudo",
        message: `${senderName} sent you a Kudo`,
        title: `🎉 You got a new Kudo!`,
        type: "kudo_received",
        user_id: $users.id,
        action_by: actionBy, // Add action_by as JSON string
        name: "Kudo Received",
      },
      $users.id,
      kudoID
    );
  } catch (error: any) {
    console.error(`Error addKudoReceivedNotification`, error);
    Sentry.captureException(error);
  }
}
export async function addKudoLikeNotifications(
  receiver: any,
  kudoID: string,
  likedKudoUser: any
) {
  try {
    const { $users } = receiver;
    const likedUserName = likedKudoUser?.name || "";
    const likedUserId = likedKudoUser?.$users?.id || "";
    const likedUserFile = likedKudoUser?.$files?.url || ""; // Use photo_url from user_profile
    const actionBy = JSON.stringify({
      name: likedUserName,
      id: likedUserId,
      profile_image: likedUserFile,
    });

    return await addNotification(
      {
        entity_id: kudoID,
        entity_type: "kudo",
        message: `${likedUserName} liked your Kudo`,
        title: `❤️ Your Kudo got a Like!`,
        type: "kudo_liked",
        name: "Kudo Liked",
        user_id: $users.id,
        action_by: actionBy, // Add action_by as JSON string
      },
      $users.id,
      kudoID
    );
  } catch (error: any) {
    // throw new Error("Error notification:", error);
    console.error("Error notification:", JSON.stringify(error, null, 2));
    Sentry.captureException(error);
  }
}

export async function addConnectionReceivedKudoNotifications(
  kudoReceiverName: string,
  kudoID: string,
  contact: any,
  receiver: any
) {
  try {
    const { id } = contact;
    const ReceiverFile = receiver?.$files?.url || ""; // Use photo_url from user_profile
    const ReceiverId = receiver?.$users?.id || ""; // Use photo_url from user_profile
    const actionBy = JSON.stringify({
      name: kudoReceiverName, // Use kudoReceiverName as the action initiator
      id: ReceiverId,
      profile_image: ReceiverFile,
    });
    return await addNotification(
      {
        entity_id: kudoID,
        entity_type: "kudo",
        message: `Your friend, ${kudoReceiverName}, received a Kudo`,
        title: `✨ Your friend got a Kudo!`,
        type: "connection_kudo_received",
        name: "Connection Kudo Received",
        user_id: id,
        action_by: actionBy, // Add action_by as JSON string
      },
      id,
      kudoID
    );
  } catch (error: any) {
    console.error(error, "error add notification");
    Sentry.captureException(error);
  }
}
export async function addConnectionSentKudoNotification(
  kudoSender: any,
  kudoID: string,
  contact: any
) {
  try {
    const { id } = contact;
    const actionBy = JSON.stringify({
      name: kudoSender.name, // Use kudoSenderName as the action initiator
      id: kudoSender?.$users.id,
      profile_image: kudoSender?.$files?.url,
    });
    return await addNotification(
      {
        entity_id: kudoID,
        entity_type: "kudo",
        message: `Your friend, ${kudoSender.name}, sent a Kudo`,
        title: `✨ Your friend sent a Kudo!`,
        type: "connection_kudo_sent",
        name: "Connection Kudo Sent",
        user_id: id,
        action_by: actionBy, // Add action_by as JSON string
      },
      id,
      kudoID
    );
  } catch (error: any) {
    console.error(error, "error add notification");
    Sentry.captureException(error);
  }
}
