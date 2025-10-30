import "server-only";
import adminDB from "../lib/admin/instant";
import {
  likeKudoWhatsAppMessage,
  receiveKudoWhatsAppNotification,
  sendKudoWhatsAppMessage,
  sentKudoWhatsAppNotification,
} from "../lib/services/aisensyServices";
import {
  likeKudoEmail,
  receiveKudoEmailNotification,
  sendKudoEmail,
  sentKudoEmailNotification,
} from "../lib/services/googleMail";
import { getUserProfilesByUserIds } from "./profile";
import { getUserProfile } from "@/helpers/loginHelper";
import moment from "moment";
import { s3Client } from "../lib/s3Config";
import {
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { cleanedKudoMessage, isDummyEmail } from "@/helpers/jobs";
import {
  // updateActivityDate,
  updateLastSendAt,
  updateLastReceiveAt,
} from "@/app/actions/profile";
import { id } from "@instantdb/admin";
// import { sendKudoSMS } from "../lib/services/SMSServices";
import {
  addConnectionReceivedKudoNotifications,
  addConnectionSentKudoNotification,
  addKudoLikeNotifications,
  addKudoReceivedNotifications,
  addNotificationChannel,
} from "./notifications";
import {
  likeKudoAppPushNotification,
  receiveKudoPushNotification,
  sendKudoAppPushNotification,
  sentKudoPushNotification,
} from "../lib/services/appPushNotification";
import * as Sentry from "@sentry/nextjs";
import { sendKudoWebPushNotification } from "../lib/services/webPushNotification";

export async function sendKudoMessages(
  kudoID: string,
  kudo: any,
  receiverUserIDs: string[],
  userID: string
) {
  try {
    const receivers = await getUserProfilesByUserIds(receiverUserIDs);
    const currentUserProfile = await getUserProfile(userID);
    const senderName = currentUserProfile?.name || "";
    const isProduction = process.env.NODE_ENV === "production";
    for (const receiver of receivers) {
      try {
        const notificationID = await addKudoReceivedNotifications(
          receiver,
          kudoID,
          currentUserProfile
        );
        if (isProduction) {
          await sendKudoWhatsAppMessage(
            receiver,
            senderName,
            kudoID,
            kudo,
            notificationID
          );
        }
        await sendKudoEmail(
          receiver,
          currentUserProfile,
          kudoID,
          kudo,
          notificationID
        );
        await sendKudoAppPushNotification(
          receiver,
          currentUserProfile,
          kudoID,
          notificationID
        );
        await sendKudoWebPushNotification(
          receiver,
          kudoID,
          `🎉 You got a new Kudo!`,
          `${senderName} sent you a Kudo`,
          notificationID
        );
      } catch (err) {
        console.error(`Failed for receiver ${receiver.id}`, err);
        Sentry.captureException(err);
        continue;
      }
    }
  } catch (error) {
    console.error("Non-critical: Message delivery failed", error);
    Sentry.captureException(error);
  }
}

export async function getKudoDetails(kudoID: string) {
  try {
    const kudoDetails: any = await adminDB.query({
      kudos: {
        $: {
          where: {
            id: kudoID,
          },
        },
        kudo_receiver: {
          $users: {
            user_profile: {
              $files: {},
            },
          },
        },
        $users: {
          user_profile: {
            $files: {},
          },
        },
      },
    });
    if (kudoDetails.kudos.length) {
      return kudoDetails.kudos[0];
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to get kudo");
  }
}

export async function getImageTypeFromUrl(url: string) {
  const match = url.match(/\.(gif|png|jpe?g|webp)(\?|#|$)/i);
  return match ? match[1].toLowerCase() : "webp";
}
export async function getRecentlySentSameKudo(
  userId: string,
  message: string,
  fileURL: string
) {
  // const startTime = Date.now();
  const oneMinuteAgo = moment.utc().subtract(1, "minute").toISOString();

  try {
    // For uploaded files, we need to check if the file exists in the bucket
    let fileExists = false;
    if (fileURL && fileURL.includes(process.env.S3_BUCKET_NAME!)) {
      try {
        const url = new URL(fileURL);
        const key = decodeURIComponent(url.pathname.substring(1));
        // console.log("Checking S3 file existence:", {
        //   bucket: process.env.S3_BUCKET_NAME,
        //   key,
        // });
        await s3Client.send(
          new GetObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME!,
            Key: key,
          })
        );
        fileExists = true;
        // console.log("S3 file exists:", key);
      } catch (error) {
        // If file doesn't exist in bucket, we can proceed
        fileExists = false;
        Sentry.captureException(error);
        console.error("Non-critical: getRecentlySentSameKudo", error);
      }
    }

    // const query = {
    const result: any = await adminDB.query({
      kudos: {
        $: {
          where: {
            and: [
              { "$users.id": userId },
              { kudo: message },
              { created_at: { $gt: oneMinuteAgo } },
              fileURL ? { file_url: fileURL } : {},
            ],
          },
          order: { serverCreatedAt: "desc" },
          limit: 1,
        },
      },
      // };

      // console.log("Executing DB Query:", JSON.stringify(query, null, 2));

      // const result: any = await adminDB.query(query);

      // const executionTime = Date.now() - startTime;
      // console.log("Query Results:", {
      //   foundKudos: result.kudos.length,
      //   executionTimeMs: executionTime,
      //   firstKudo: result.kudos[0] || null,
    });
    const kudos = result.kudos;
    if (kudos.length) {
      return kudos[0];
    }
    return null;
  } catch (error) {
    console.error("Error fetching recent kudo:", error);
    // const executionTime = Date.now() - startTime;
    // console.error('Error fetching recent kudo:', {
    //   error,
    //   executionTimeMs: executionTime,
    //   userId,
    //   message,
    //   fileURL
    // });
    return null; // Return null instead of throwing to allow retry
  }
}
export async function uploadKudoImageToBucket(file: File, kudoID: string) {
  try {
    if (typeof file?.arrayBuffer !== "function") {
      throw new Error("Invalid file object passed. Cannot read buffer.");
    }
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Get original filename and extension
    const fileName = file.name;
    const extension = fileName.split(".").pop()?.toLowerCase();
    const baseName = fileName.substring(0, fileName.lastIndexOf("."));

    // Create S3 filename with original name, date, and extension
    const s3FileName = `kudos/${baseName}-${kudoID}-.${extension}`;

    // Set appropriate content type
    let contentType = file.type;
    if (extension === "webp") {
      contentType = "image/webp";
    } else if (extension === "gif") {
      contentType = "image/gif";
    }

    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: s3FileName,
        Body: buffer,
        ContentType: contentType,
      })
    );

    // Generate public S3 URL
    return `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.REGION}.amazonaws.com/${s3FileName}`;
  } catch (error) {
    console.error("Error uploading kudo image:", error);
    throw error;
  }
}
export async function uploadImageToBucket(file: File, fileName: string) {
  try {
    if (typeof file?.arrayBuffer !== "function") {
      throw new Error("Invalid file object passed. Cannot read buffer.");
    }
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Get file extension
    const extension = file.name.split(".").pop()?.toLowerCase() || "bin";
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000000);
    const s3FileName = `kudos/${timestamp}-${fileName}-${random}.${extension}`;

    const contentType = file.type;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: s3FileName,
        Body: buffer,
        ContentType: contentType,
      })
    );

    // Return public S3 URL
    return `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.REGION}.amazonaws.com/${s3FileName}`;
  } catch (error) {
    console.error("Error uploading kudo image:", error);
    throw error;
  }
}
export async function deleteKudoImageFromBucket(fileUrl: string) {
  // Query all kudos that reference this file URL
  const result: any = await adminDB.query({
    kudos: {
      $: {
        where: {
          file_url: fileUrl,
        },
      },
    },
  });

  // Check how many kudos use this file
  const kudoCount = result.kudos.length;

  if (kudoCount > 1) {
    // More than one kudo uses this file, do not delete from S3
    return null;
  }

  try {
    // Extract the key from the S3 URL
    const url = new URL(fileUrl);
    const key = decodeURIComponent(url.pathname.substring(1));

    if (!key) {
      console.error("Could not extract key from URL:", fileUrl);
      return false;
    }

    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: key,
      })
    );

    return true;
  } catch (error) {
    console.error("Error deleting file from S3:", error);
    return false;
  }
}

export async function deleteKudoLike(kudoId: string, kudo: any) {
  // Query all kudo_likes for this kudo
  const kudoLikesResult = await adminDB.query({
    kudo_likes: {
      $: { where: { kudos: kudoId } },
    },
  });
  const kudoLikes = kudoLikesResult.kudo_likes || [];

  // Build all delete operations for a single transaction
  const transactOps = [
    ...kudoLikes.map((like: any) => adminDB.tx.kudo_likes[like.id].delete()),
    ...kudo.kudo_receiver.map((receiver: any) =>
      adminDB.tx.kudo_receiver[receiver.id].delete()
    ),
    adminDB.tx.kudos[kudoId].delete(),
  ];

  await adminDB.transact(transactOps);
}

// export async function getUsersCreatedOneMonthAgo() {
//   const startTime = Date.now();
//   const oneMonthAgo = moment.utc().subtract(1, "month").toISOString();

//   console.log("=== getUsersCreatedOneMonthAgo Query Details ===");
//   console.log("Query Parameters:", {
//     oneMonthAgo,
//   });

//   try {
//     const query = {
//       user_profile: {
//         $: {
//           where: {
//             created_at: { $gt: oneMonthAgo },
//           },
//         },
//         $users: {
//           user_profile: {
//             $files: {},
//           },
//         },
//         kudos: {
//           $: {
//             order: { created_at: "desc" },
//           },
//         },
//         kudo_receiver: {
//           $: {
//             order: { created_at: "desc" },
//           },
//         },
//       },
//     };

//     console.log("Executing DB Query:", JSON.stringify(query, null, 2));

//     const result: any = await adminDB.query(query);

//     const executionTime = Date.now() - startTime;
//     console.log("Query Results:", {
//       totalUsers: result.user_profile?.length || 0,
//       executionTimeMs: executionTime,
//       users: result.user_profile?.map((profile: any) => ({
//         id: profile.$users?.[0]?.id,
//         email: profile.$users?.[0]?.email,
//         created_at: profile.created_at,
//         name: profile.name,
//         kudosCount: profile.kudos?.length || 0,
//         receivedKudosCount: profile.kudo_receiver?.length || 0,
//         profile: {
//           name: profile.name,
//           bio: profile.bio,
//           photo_url: profile.photo_url,
//           country_code: profile.country_code,
//         },
//       })),
//     });

//     return result.user_profile || [];
//   } catch (error) {
//     const executionTime = Date.now() - startTime;
//     console.error("Error fetching users created one month ago:", {
//       error,
//       executionTimeMs: executionTime,
//     });
//     return [];
//   }
// }

export async function likeKudoMessages(
  kudoID: string,
  userID: string,
  userIDs: any[],
  createdAt: Date
  // receiverUserIDs: string[],
) {
  try {
    const receivers = await getUserProfilesByUserIds(userIDs);
    const likeUserProfile = await getUserProfile(userID);
    const likeUserName = likeUserProfile?.name || "";
    const isProduction = process.env.NODE_ENV === "production";
    for (const receiver of receivers) {
      try {
        const notificationID = await addKudoLikeNotifications(
          receiver,
          kudoID,
          likeUserProfile
        );
        if (isProduction) {
          await likeKudoWhatsAppMessage(
            receiver,
            likeUserName,
            kudoID,
            createdAt,
            notificationID
          );
        }
        await likeKudoEmail(
          receiver,
          likeUserName,
          kudoID,
          createdAt,
          likeUserProfile,
          notificationID
        );
        await likeKudoAppPushNotification(
          receiver,
          likeUserName,
          kudoID,
          notificationID
        );
        await sendKudoWebPushNotification(
          receiver,
          kudoID,
          `❤️ Your Kudo got a Like!`,
          `${likeUserName} liked your Kudo`,
          notificationID
        );
      } catch (error) {
        Sentry.captureException(error);
        console.error(
          `Failed to like kudo main loop for receiver ${receiver.id}: `,
          JSON.stringify(error, null, 2)
        );
        continue;
      }
    }
  } catch (error) {
    throw error;
  }
}
export async function getUserConnections(userID: string) {
  try {
    const result: any = await adminDB.query({
      $users: {
        $: {
          where: {
            or: [
              { "kudo_receiver.kudos.$users": userID },
              { "kudos.kudo_receiver.$users": userID },
            ],
          },
        },
        user_profile: {},
      },
    });
    return result.$users;
  } catch (error) {
    console.error(`Error fetching user connections for user ${userID}:`, error);
    // throw error instanceof Error ? error : new Error(String(error));
  }
}

export async function notifyReceiverContactsKudoReceived(
  kudoID: string,
  kudo: any,
  receiverUserIDs: string[],
  currentUserID: string
) {
  // remove duplicate user and kudo sender
  try {
    const uniqueReceiverIDs = receiverUserIDs.filter(
      (id, idx, arr) => id && arr.indexOf(id) === idx && id !== currentUserID
    );
    const messageReceivers: string[] = [];
    const currentUserProfile = await getUserProfile(currentUserID);
    const kudoMessage = await cleanedKudoMessage(kudo.kudo);
    const senderName = currentUserProfile?.name || "";
    const isProduction = process.env.NODE_ENV === "production";
    for (const userID of uniqueReceiverIDs) {
      try {
        const receiver = await getUserProfile(userID);
        const kudoReceiverName = receiver?.name || "";
        const userConnections = await getUserConnections(userID);
        for (const contact of userConnections) {
          if (
            messageReceivers.includes(contact.id) ||
            currentUserID === contact.id
          )
            continue;
          messageReceivers.push(contact.id);
          try {
            const notificationID = await addConnectionReceivedKudoNotifications(
              kudoReceiverName,
              kudoID,
              contact,
              receiver
            );
            if (isProduction) {
              await receiveKudoWhatsAppNotification(
                contact,
                senderName,
                kudoReceiverName,
                kudoID,
                kudoMessage,
                notificationID
              );
            }
            const isEmailDummy = await isDummyEmail(contact.email);
            if (!isEmailDummy) {
              const emailChannelState = await receiveKudoEmailNotification(
                contact,
                currentUserProfile,
                kudoReceiverName,
                kudoID,
                kudoMessage,
                kudo.file_url
              );
              await addNotificationChannel(notificationID, {
                ...emailChannelState,
                channel: "email",
              });
            }
            await receiveKudoPushNotification(
              contact,
              kudoReceiverName,
              kudoID,
              notificationID
            );
            await sendKudoWebPushNotification(
              contact.user_profile,
              kudoID,
              `✨ Your friend got a Kudo!`,
              `Your friend, ${kudoReceiverName}, received a Kudo`,
              notificationID
            );
          } catch (err) {
            console.error(`Failed for receiver ${contact.id}`, err);
            continue;
          }

          // return [...messages, ...emails];
        }
      } catch (error) {
        console.error(`Error fetching connections for user ${userID}:`, error);
        continue; // Skip this user and continue with the next
      }
    }
  } catch (error) {
    console.error("Non-critical: notify contacts delivery failed", error);
    Sentry.captureException(error);
  }
}
export async function notifySenderContactsKudoSent(
  kudoID: string,
  kudo: any,
  receiverUserIDs: string[],
  currentUserID: string
) {
  try {
    const messageReceivers: string[] = [];
    const currentUserProfile = await getUserProfile(currentUserID);
    const receivers = await getUserProfilesByUserIds(receiverUserIDs);
    const kudoMessage = await cleanedKudoMessage(kudo.kudo);
    const senderName = currentUserProfile?.name || "";
    const isProduction = process.env.NODE_ENV === "production";
    const kudoReceiverNames = receivers
      .map((receiver: any) => receiver.name || "")
      .join(", ");
    const userConnections = await getUserConnections(currentUserID);
    for (const contact of userConnections) {
      if (
        messageReceivers.includes(contact.id) ||
        receiverUserIDs.includes(contact.id) ||
        currentUserID === contact.id
      )
        continue;
      messageReceivers.push(contact.id);
      try {
        const notificationID = await addConnectionSentKudoNotification(
          currentUserProfile,
          kudoID,
          contact
        );
        if (isProduction) {
          await sentKudoWhatsAppNotification(
            contact,
            senderName,
            kudoReceiverNames,
            kudoID,
            kudoMessage,
            notificationID
          );
        }
        const isEmailDummy = await isDummyEmail(contact.email);
        if (!isEmailDummy) {
          const emailChannelState = await sentKudoEmailNotification(
            contact,
            currentUserProfile,
            kudoReceiverNames,
            kudoID,
            kudoMessage,
            kudo.file_url
          );
          await addNotificationChannel(notificationID, {
            ...emailChannelState,
            channel: "email",
          });
        }
        await sentKudoPushNotification(
          contact,
          currentUserProfile,
          kudoID,
          notificationID
        );
        await sendKudoWebPushNotification(
          contact.useProfile,
          kudoID,
          `✨ Your friend sent a Kudo!`,
          `Your friend, ${senderName}, sent a Kudo`,
          notificationID
        );
      } catch (err) {
        console.error(`Failed for receiver ${contact.id}`, err);
        continue;
      }
    }
  } catch (error) {
    console.error(
      "Non-critical: notify kudo senders contacts delivery failed",
      error
    );
    Sentry.captureException(error);
  }
}
export async function createKudo(
  userID: string,
  kudoID: string,
  kudo: any,
  receiverUserIDs: string[]
) {
  try {
    const recipientTransactions = receiverUserIDs.map((receiverID) => {
      const kudoReceiveID = id();
      return adminDB.tx.kudo_receiver[kudoReceiveID]
        .update({ kudos: kudoID })
        .link({ $users: receiverID });
    });

    // Update last_send_at for sender and last_receive_at for receivers for track user
    await adminDB.transact([
      adminDB.tx.kudos[kudoID].update(kudo).link({ $users: userID }),
      ...recipientTransactions,
      //  ...profileUpdateTransactions,
    ]);
  } catch (error) {
    console.error("DB transaction failed", JSON.stringify(error, null, 2));
    if (!(error instanceof Error)) {
      throw new Error(
        typeof error === "string" ? error : JSON.stringify(error)
      );
    }
    throw error;
  }
}
export async function updateUserProfileAfterKudoSent(
  userID: string,
  receiverUserIDs: string[]
) {
  try {
    await Promise.all([
      updateLastSendAt(userID),
      updateLastReceiveAt(receiverUserIDs),
    ]);
  } catch (error) {
    console.error("update profile failed", JSON.stringify(error, null, 2));
    console.error("Non-critical: profile update failed", error);
    Sentry.captureException(error);
  }
}
