import "server-only";
import { Expo } from "expo-server-sdk";
import {
  addNotificationChannel,
  getPushNotification,
} from "@/app/actions/notifications";
import * as Sentry from "@sentry/nextjs";
const expo = new Expo();

export async function likeKudoAppPushNotification(
  receiver: any,
  likeUserName: string,
  kudoID: string,
  notificationID: any
) {
  try {
    const { push_token } = receiver;
    if (!push_token) return;
    const pushMessage = {
      to: push_token,
      sound: "default",
      data: {
        entity_id: kudoID,
        entity_type: "kudo",
        notification_id: notificationID,
      },
      title: `❤️ Your Kudo got a Like!`,
      body: `${likeUserName} liked your Kudo`,
    };
    const tickets = await sendAppPushMessage([pushMessage]);
    await getAppPushMessage(tickets, pushMessage, notificationID);
  } catch (error: any) {
    Sentry.captureException(error);
    console.error("Error received kudo push notification:", error);
  }
}
export async function sendKudoAppPushNotification(
  receiver: any,
  sender: any,
  kudoID: string,
  notificationID: any
) {
  try {
    const senderName = sender.name || "";
    const { push_token } = receiver;
    if (!push_token) return;
    const pushMessage = {
      to: push_token,
      sound: "default",
      data: {
        entity_id: kudoID,
        entity_type: "kudo",
        notification_id: notificationID,
      },
      title: `🎉 You got a new Kudo!`,
      body: `${senderName} sent you a Kudo`,
    };
    const tickets = await sendAppPushMessage([pushMessage]);
    await getAppPushMessage(tickets, pushMessage, notificationID);
  } catch (error: any) {
    Sentry.captureException(error);
    console.error(`Error received kudo push notification: `, error);
  }
}
export async function receiveKudoPushNotification(
  contact: any,
  kudoReceiverName: string,
  kudoID: string,
  notificationID: string = ""
) {
  try {
    const { user_profile } = contact;
    if (!user_profile?.push_token) return;
    const pushMessage = {
      to: user_profile.push_token,
      sound: "default",
      data: {
        entity_id: kudoID,
        entity_type: "kudo",
        notification_id: notificationID,
      },
      title: `✨ Your friend got a Kudo!`,
      body: `Your friend, ${kudoReceiverName}, received a Kudo`,
    };
    const tickets = await sendAppPushMessage([pushMessage]);
    await getAppPushMessage(tickets, pushMessage, notificationID);
  } catch (error: any) {
    Sentry.captureException(error);
    console.error(`Error received kudo push notification: `, error);
    // throw new Error("Error received kudo push notification:", error);
  }
}
export async function sentKudoPushNotification(
  contact: any,
  sender: any,
  kudoID: string,
  notificationID: string = ""
) {
  try {
    const { user_profile } = contact;
    if (!user_profile?.push_token) return;
    const senderName = sender.name || "";
    const pushMessage = {
      to: user_profile.push_token,
      sound: "default",
      data: {
        entity_id: kudoID,
        entity_type: "kudo",
        notification_id: notificationID,
      },
      title: `✨ Your friend sent a Kudo!`,
      body: `Your friend, ${senderName}, sent a Kudo`,
    };
    const tickets = await sendAppPushMessage([pushMessage]);
    await getAppPushMessage(tickets, pushMessage, notificationID);
  } catch (error: any) {
    Sentry.captureException(error);
    console.error(`Error received kudo push notification: `, error);
    // throw new Error("Error received kudo push notification:", error);
  }
}

// export async function getPushNotification(tickets: any[]) {
//   const fails = [];
//   const successfulRemind = [];

//   try {
//     const ticketIds = tickets.filter((t) => t.id).map((t) => t.id);
//     const receiptChunks = await expo.getPushNotificationReceiptsAsync(
//       ticketIds
//     );
//     for (const [id, receipt] of Object.entries(receiptChunks)) {
//       const result = await adminDB.query({
//         notification_channels: {
//           $: {
//             where: { identifier: id },
//           },
//         },
//       });
//       const notificationChannel = result.notification_channels?.[0];
//       if (receipt.status === "ok") {
//         successfulRemind.push(receipt);
//         if (!notificationChannel) continue;
//         await updateNotificationChannel(notificationChannel.id, {
//           status: "success",
//         });
//       } else if (receipt.status === "error") {
//         console.error(`Error sending notification ${id}`, receipt.message);
//         fails.push(receipt.details);

//         if (!notificationChannel) continue;
//         await updateNotificationChannel(notificationChannel.id, {
//           status: "failed",
//           error: receipt.message,
//         });
//       }
//     }
//   } catch (error: any) {
//     throw new Error("Error chunk push notification:", error);
//   }
//   return { successfulRemind, fails };
// }

// export async function sendPushNotification(pushMessages: any[]) {
//   try {
//     const chunks = expo.chunkPushNotifications(pushMessages);
//     const tickets: any[] = [];
//     for (const chunk of chunks) {
//       try {
//         const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
//         tickets.push(...ticketChunk);
//         for (let i = 0; i < ticketChunk.length; i++) {
//           const receipt:any = ticketChunk[i];
//           const notificationID = chunk[i].data?.notification_id;
//           if (notificationID) {
//              await addNotificationChannel(notificationID, {
//               channel: "app_push",
//               status: "pending",
//               identifier: receipt.id,
//             });
//           }
//         }
//       } catch (error) {
//         console.error("Error sending push notification:", error);
//         continue;
//       }
//     }
//     return tickets
//   } catch (error: any) {
//     throw new Error("Error chunk push notification:", error);
//   }
// }

export async function sendAppPushMessage(pushMessages: any[]) {
  try {
    const receipts = [];
    const chunks = expo.chunkPushNotifications(pushMessages);
    for (const chunk of chunks) {
      try {
        const receipt: any = await expo.sendPushNotificationsAsync(chunk);
        receipts.push(...receipt);
      } catch (error) {
        console.error("Error sending push notification:", error);
        if (!(error instanceof Error)) {
          throw new Error(
            typeof error === "string" ? error : JSON.stringify(error)
          );
        }
        throw error;
      }
    }
    return receipts;
  } catch (error: any) {
    console.error("Error chunk push notification:", error);
    if (!(error instanceof Error)) {
      throw new Error(
        typeof error === "string" ? error : JSON.stringify(error)
      );
    }
    throw error;
  }
}
export async function getAppPushMessage(
  tickets: any[] = [],
  pushMessage: any,
  notificationID: string = ""
) {
  try {
    const ticketIds = tickets.filter((t) => t?.id).map((t) => t.id);
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
  } catch (error: any) {
    console.error("Error chunk push notification:", error);
    if (!(error instanceof Error)) {
      throw new Error(
        typeof error === "string" ? error : JSON.stringify(error)
      );
    }
    throw error;
  }
}

export async function dailyAppPushNotification(
  pushToken: string,
  notification: any,
  notificationID: any
) {
  try {
    if (!Expo.isExpoPushToken(pushToken)) {
      const error = `Push token ${pushToken} is not a valid Expo push token`;
      await addNotificationChannel(notificationID, {
        status: "failed",
        error: error,
        channel: "app_push",
        identifier: pushToken,
      });
      return { error, success: false };
    }
    const pushMessage = {
      to: pushToken,
      sound: "default",
      title: notification.title,
      body: notification.body,
      richContent: {
        image: notification.image,
      },
      data: { notification_id: notificationID },
    };
    const tickets = await sendAppPushMessage([pushMessage]);
    const { error, success }: any = await getPushNotification(
      tickets,
      notificationID,
      pushMessage
    );

    return { error, success };
  } catch (error: any) {
    console.error(`Failed to send app push notifications:`, error);
    return {
      error:
        error?.response?.data?.message || error?.message || "Unknown error",
      success: false,
    };
  }
}
