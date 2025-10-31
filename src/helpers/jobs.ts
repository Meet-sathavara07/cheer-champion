import "server-only";
import adminDB from "@/app/lib/admin/instant";
import moment from "moment";
import {
  sendReminderByMSG91,
  KudoSenderAppreciationMonthlyByMSG91,
} from "@/app/lib/services/aisensyServices";
import {
  emailActiveKudoUser,
  emailMonthlyUserReport,
  emailNoKudoSentLastWeekReminder,
  emailRemindUser,
  emailRemindUsers,
  emailTopReceiverUser,
  emailTopSenderUser,
} from "@/app/lib/services/googleMail";
import {
  addNotification,
  addNotificationChannel,
} from "@/app/actions/notifications";
import { firebaseAdmin } from "@/app/lib/admin/firebase";
import * as Sentry from "@sentry/nextjs";
import { dailyAppPushNotification } from "@/app/lib/services/appPushNotification";
import { dailyWebPushNotification } from "@/app/lib/services/webPushNotification";

const creatorAccounts = [
  "raj.mansuri@quantuminfoway.com",
  "cploonker@gmail.com",
  "chetanthumar@gmail.com",
  "mansuriraj1995@gmail.com",
  "cp@cheerchampion.com",
  "meetsathavara10@gmail.com",
];

const S3_BASE_URL = "https://cheerchampion.s3.us-east-1.amazonaws.com/uploads/";
const baseURL = "https://cheerchampion.s3.us-east-1.amazonaws.com/kudos";
const defaultImage = `${baseURL}/cheer_champion_image_512x512.png`;
export const WHATSAPP_REMINDER_IMAGES = [
  "Reminder+1+1.png",
  "Reminder+2+1.png",
  "Reminder+3+1.png",
  "Reminder+4+1.png",
  "Reminder+5+1.png",
];

const pushNotification = [
  {
    title: "Kind words create a positive impact 🎉",
    body: "Keep the cheer going! Send a Kudo now 💫",
    image: S3_BASE_URL + WHATSAPP_REMINDER_IMAGES[0],
  },
  {
    title: "A Small Thank You Can Go a Long Way 💌",
    body: "You got a Kudo recently — pass the joy forward by sending one now!",
    image: S3_BASE_URL + WHATSAPP_REMINDER_IMAGES[1],
  },
  {
    title: "Every kind word matters",
    body: "Why not take a moment to thank someone who’s made your day better lately?",
    image: S3_BASE_URL + WHATSAPP_REMINDER_IMAGES[2],
  },
  {
    title: "You’ve experienced how it feels to be appreciated 💬",
    body: "Now it’s your turn. Think of someone who deserves a kind word — a teammate, a friend, or even a stranger.",
    image: S3_BASE_URL + WHATSAPP_REMINDER_IMAGES[3],
  },
  {
    title: "Someone took a moment to appreciate you",
    body: "Now imagine giving that feeling to someone else.A Kudo can make a difference — even more than you think.",
    image: S3_BASE_URL + WHATSAPP_REMINDER_IMAGES[4],
  },
];
export const isDevTeamEmail = async (email: string) => {
  return email === "chetanthumar@gmail.com" || email === "cploonker@gmail.com";
};
export const isDummyEmail = async (email: string = "") => {
  return (
    email?.includes("@cheerchampion.com") && email !== "cp@cheerchampion.com"
  );
};
export const cleanedKudoMessage = async (message: string) =>
  message
    .replace(/\s+/g, " ") // Collapse all whitespace (tabs, newlines, multiple spaces)
    .replace(/[“”‘’]/g, '"') // Convert curly quotes to straight quotes
    .replace(/[\u200B-\u200D\uFEFF]/g, "") // Remove zero-width characters
    .trim()
    .slice(0, 100) + (message.trim().length > 100 ? "..." : "");

export const topKudoSendersReminders = async () => {
  // Calculate last month's date range
  const lastMonthStart = moment()
    .subtract(1, "month")
    .startOf("month")
    .toISOString();
  const lastMonthEnd = moment()
    .subtract(1, "month")
    .endOf("month")
    .toISOString();
  const lastMonthName = moment().subtract(1, "month").format("MMMM YYYY");

  // Query users who sent kudos last month
  const result = await adminDB.query({
    $users: {
      user_profile: { $files: {} },
      $: {
        where: {
          "user_profile.consent_message_taken": { $not: "no" },
        },
      },
      kudos: {
        $: {
          where: {
            and: [
              { created_at: { $gte: lastMonthStart } },
              { created_at: { $lte: lastMonthEnd } },
            ],
          },
        },
      },
    },
  });

  // Filter out dev team and dummy emails, then get top 5 senders
  const activeUsers = (
    await Promise.all(
      (result.$users || []).map(async (user: any) => {
        const isDev = await isDevTeamEmail(user.email);
        return !isDev && user.kudos && user.kudos.length > 0 ? user : null;
      })
    )
  ).filter((user): user is any => user !== null);

  // Sort by kudo count and take top 5
  const topSenders = activeUsers
    .sort((a: any, b: any) => b.kudos.length - a.kudos.length)
    .slice(0, 5);

  const successfulRemindUsers: any[] = [];
  const failedRemindUsers: any[] = [];

  // Define position labels
  const positionLabels = ["1st", "2nd", "3rd", "4th", "5th"];

  for (const [index, user] of topSenders.entries()) {
    const { name, id: profileId, web_push_token } = user.user_profile || {};
    const userId = user.id;
    const kudosCount = user.kudos?.length || 0;
    const position = positionLabels[index];

    const isEmailDummy = await isDummyEmail(user.email ?? "");
    if (isEmailDummy && !web_push_token) continue;
    const notificationData = {
      user_id: userId,
      frequency: "monthly",
      message: `You sent ${kudosCount} kudos in ${lastMonthName}! 🎉`,
      name: "Top Kudo Sender Reminder",
      title: `🔥 Top Sender #${position}`,
      type: "top_kudo_sender",
    };

    try {
      const notificationId = await addNotification(notificationData, userId);
      // Handle email notifications
      if (!isEmailDummy) {
        const emailResult = await emailTopSenderUser(
          user,
          lastMonthName,
          kudosCount,
          position
        );
        await addNotificationChannel(notificationId, {
          channel: "email",
          identifier: emailResult.emailTemplate,
          status: emailResult.success ? "success" : "failed",
          ...(emailResult.success ? {} : { error: emailResult.error }),
        });
        if (emailResult.success) {
          successfulRemindUsers.push({
            email: user.email,
            name,
            id: userId,
            profileId,
            position,
            method: "email",
          });
        } else {
          failedRemindUsers.push({
            email: user.email,
            name,
            id: userId,
            method: "email",
            error: emailResult.error,
          });
        }
      }

      // Handle push notifications
      if (web_push_token) {
        const pushResponse = await sendReminderWebPushNotification(
          notificationData.title,
          notificationData.message,
          web_push_token,
          defaultImage,
          userId
        );
        await addNotificationChannel(notificationId, {
          channel: "web_push",
          identifier: web_push_token,
          status: pushResponse.success ? "success" : "failed",
          ...(pushResponse.success ? {} : { error: pushResponse.error }),
        });
        if (pushResponse.success) {
          successfulRemindUsers.push({
            name,
            id: userId,
            profileId,
            position,
            method: "web_push",
          });
        } else {
          failedRemindUsers.push({
            name,
            id: userId,
            profileId,
            position,
            method: "web_push",
            error: pushResponse.error,
          });
        }
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || error?.message || "Unknown error";
      console.error(
        `[ERROR] Failed to send reminder to top kudo sender ${
          (user?.email, userId)
        }:`,
        errorMessage
      );
      Sentry.captureException(error);
    }
  }

  return {
    topSenders,
    successfulRemindUsers,
    failedRemindUsers,
  };
};

export const topKudoReceiversReminder = async () => {
  // Calculate last month's date range
  const lastMonthStart = moment()
    .subtract(1, "month")
    .startOf("month")
    .toISOString();
  const lastMonthEnd = moment()
    .subtract(1, "month")
    .endOf("month")
    .toISOString();
  const lastMonthName = moment().subtract(1, "month").format("MMMM YYYY");

  // Query users who received kudos last month
  const result = await adminDB.query({
    $users: {
      user_profile: { $files: {} },
      $: {
        where: {
          "user_profile.consent_message_taken": { $not: "no" },
        },
      },
      kudo_receiver: {
        $: {
          where: {
            and: [
              { "kudos.created_at": { $gte: lastMonthStart } },
              { "kudos.created_at": { $lte: lastMonthEnd } },
            ],
          },
        },
      },
    },
  });

  // Filter out dev team emails, then get top 5 receivers
  const activeUsers = (
    await Promise.all(
      (result.$users || []).map(async (user: any) => {
        const isDev = await isDevTeamEmail(user.email);
        return !isDev && user.kudo_receiver && user.kudo_receiver.length > 0
          ? user
          : null;
      })
    )
  ).filter((user): user is any => user !== null);

  // Sort by kudo_receiver count and take top 5
  const topReceivers = activeUsers
    .sort((a: any, b: any) => b.kudo_receiver.length - a.kudo_receiver.length)
    .slice(0, 5);

  const successfulRemindUsers: any[] = [];
  const failedRemindUsers: any[] = [];

  // Define position labels
  const positionLabels = ["1st", "2nd", "3rd", "4th", "5th"];

  for (const [index, user] of topReceivers.entries()) {
    const { name, id: profileId, web_push_token } = user.user_profile || {};
    const userId = user.id;
    const kudosCount = user.kudo_receiver?.length || 0;
    const position = positionLabels[index];

    const isEmailDummy = await isDummyEmail(user.email);
    if (isEmailDummy && !web_push_token) continue;

    // Create a notification entry for the reminder
    const notificationData = {
      user_id: userId,
      frequency: "monthly",
      message: `You got ${kudosCount} kudos in ${lastMonthName}! 🌟`,
      name: "Top Kudo Receiver Reminder",
      title: `🏆 Top Receiver #${position}`,
      type: "top_kudo_receiver",
    };

    const notificationId = await addNotification(notificationData, userId);

    try {
      // Handle email notifications
      if (!isEmailDummy) {
        const emailResult = await emailTopReceiverUser(
          user,
          lastMonthName,
          kudosCount,
          position
        );
        await addNotificationChannel(notificationId, {
          channel: "email",
          identifier: emailResult.emailTemplate,
          status: emailResult.success ? "success" : "failed",
          ...(emailResult.success
            ? {}
            : { error: emailResult.error || "email error" }),
        });
        if (emailResult.success) {
          successfulRemindUsers.push({
            email: user.email,
            name,
            id: userId,
            profileId,
            method: "email",
          });
        } else {
          failedRemindUsers.push({
            email: user.email,
            name,
            id: userId,
            method: "email",
            error: emailResult.error || "email error",
          });
        }
      }

      // Handle push notifications
      if (web_push_token) {
        const pushResponse = await sendReminderWebPushNotification(
          notificationData.title,
          notificationData.message,
          web_push_token,
          defaultImage,
          userId
        );
        await addNotificationChannel(notificationId, {
          channel: "web_push",
          identifier: web_push_token,
          status: pushResponse.success ? "success" : "failed",
          ...(pushResponse.success ? {} : { error: pushResponse.error }),
        });
        if (pushResponse.success) {
          successfulRemindUsers.push({
            name,
            id: userId,
            profileId,
            position,
            method: "push",
          });
        } else {
          failedRemindUsers.push({
            name,
            id: userId,
            profileId,
            position,
            method: "push",
            error: pushResponse.error,
          });
        }
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || error?.message || "Unknown error";
      console.error(
        `[ERROR] Failed to send reminder to top kudo receiver ${
          (user?.email, userId)
        }:`,
        errorMessage
      );
      Sentry.captureException(error);
    }
  }

  return {
    topReceivers,
    successfulRemindUsers,
    failedRemindUsers,
  };
};

export const noKudoSentLastWeekReminder = async () => {
  const oneWeekAgo = moment().subtract(7, "days").startOf("day").toISOString();

  // Query users who haven't sent kudos in the last week
  const result = await adminDB.query({
    $users: {
      $: {
        where: {
          and: [
            {
              "user_profile.consent_message_taken": { $not: "no" },
            },
            {
              or: [
                { "user_profile.last_send_at": { $lt: oneWeekAgo } },
                { "user_profile.last_send_at": { $isNull: true } },
              ],
            },
          ],
        },
      },
      user_profile: {},
    },
  });

  const inactiveKudoSenders = result.$users || [];
  const successfulRemindUsers = [];
  const failedRemindUsers = [];
  const title = "It's been a while — send a Kudo today! 🌟";
  const message =
    "Your recognition superpower has been idle for 7 days — and we’ve truly missed your spark.";

  for (const user of inactiveKudoSenders) {
    const { email, user_profile, id } = user || {};
    const { name, web_push_token } = user_profile || {};
    try {
      const isEmailDummy = await isDummyEmail(user.email ?? "");
      if (isEmailDummy && !web_push_token) continue;

      const notificationID = await addNotification(
        {
          frequency: "weekly",
          user_id: id,
          type: "no_kudo_sent_last_week",
          name: "No Kudo Sent Last Week Reminder",
          title: title,
          message: message,
        },
        id
      );
      if (!isEmailDummy) {
        const channelState = await emailNoKudoSentLastWeekReminder(user, title);
        await addNotificationChannel(notificationID, {
          ...channelState,
          channel: "email",
        });

        if (channelState.status === "success") {
          successfulRemindUsers.push(user);
        } else {
          failedRemindUsers.push({
            email: email,
            name,
            id: id,
            error: channelState.error,
          });
        }
      }

      if (web_push_token) {
        const pushResponse = await sendReminderWebPushNotification(
          title,
          message,
          web_push_token,
          defaultImage,
          id
        );
        await addNotificationChannel(notificationID, {
          channel: "web_push",
          identifier: web_push_token,
          status: pushResponse.success ? "success" : "failed",
          ...(pushResponse.success ? {} : { error: pushResponse.error }),
        });
        if (pushResponse.success) {
          successfulRemindUsers.push({
            web_push_token,
            name,
            id,
          });
        } else {
          failedRemindUsers.push({
            web_push_token,
            name,
            id,
            error: pushResponse.error,
          });
        }
      }
    } catch (error) {
      console.error(`Failed to send reminder to user ${email}:`, error);
      continue;
    }
  }

  return {
    inactiveKudoSenders,
    successfulRemindUsers,
    failedRemindUsers,
  };
};

export const sendMonthlyUserReport = async () => {
  try {
    // Calculate last month's date range
    const lastMonthStart = moment()
      .subtract(1, "month")
      .startOf("month")
      .toISOString();
    const lastMonthEnd = moment()
      .subtract(1, "month")
      .endOf("month")
      .toISOString();
    const lastMonthName = moment().subtract(1, "month").format("MMMM YYYY");

    // Query users with their kudos sent and received last month
    const result = await adminDB.query({
      $users: {
        user_profile: { $files: {} },
        $: {
          where: {
            "user_profile.consent_message_taken": { $not: "no" },
          },
        },
        kudo_likes: {
          $: {
            where: {
              and: [
                { created_at: { $gte: lastMonthStart } },
                { created_at: { $lte: lastMonthEnd } },
              ],
            },
          },
        },
        kudos: {
          $: {
            where: {
              and: [
                { created_at: { $gte: lastMonthStart } },
                { created_at: { $lte: lastMonthEnd } },
              ],
            },
          },
        },
        kudo_receiver: {
          $: {
            where: {
              and: [
                { "kudos.created_at": { $gte: lastMonthStart } },
                { "kudos.created_at": { $lte: lastMonthEnd } },
              ],
            },
          },
        },
      },
    });

    const users = result.$users || [];

    const Users = users.filter(
      (user) => user.kudos?.length > 0 || user.kudo_receiver?.length > 0
    );

    const successfulRemindUsers: any[] = [];
    const failedRemindUsers: any[] = [];

    for (const user of Users) {
      const {
        name,
        id: profileId,
        web_push_token,
        last_send_at,
      } = user.user_profile || {};
      const userId = user.id;
      const email = user.email || "";
      const sentKudosCount = user.kudos ? user.kudos.length : 0;
      const userLikesCount = user.kudo_likes ? user.kudo_likes.length : 0;
      const receivedKudosCount = user.kudo_receiver
        ? user.kudo_receiver.length
        : 0;
      const totalKudosCount = sentKudosCount + receivedKudosCount;

      const kudosGoal = 5;
      const goalPercentage = Math.min(
        (sentKudosCount / kudosGoal) * 100,
        100
      ).toFixed(0);

      // Create a notification entry for the reminder

      const isEmailDummy = await isDummyEmail(email);
      if (isEmailDummy && !web_push_token) continue;
      const notificationData = {
        user_id: userId,
        frequency: "monthly",
        message: `${sentKudosCount} sent, ${receivedKudosCount} received, ${goalPercentage}% goal!`,
        name: "Monthly User Report",
        title: `🔥 ${lastMonthName} Monthly Highlights`,
        type: "monthly_user_report",
      };

      const notificationId = await addNotification(notificationData, userId);

      try {
        // Handle email notifications
        if (!isEmailDummy) {
          const emailResult = await emailMonthlyUserReport(
            user,
            userLikesCount,
            lastMonthName,
            sentKudosCount,
            receivedKudosCount,
            totalKudosCount,
            last_send_at,
            kudosGoal,
            goalPercentage
          );
          await addNotificationChannel(notificationId, {
            channel: "email",
            identifier: emailResult.emailTemplate,
            status: emailResult.success ? "success" : "failed",
            ...(emailResult.success
              ? {}
              : { error: emailResult.error || "email error" }),
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
            notificationData.title,
            notificationData.message,
            web_push_token,
            defaultImage,
            userId
          );
          await addNotificationChannel(notificationId, {
            channel: "web_push",
            identifier: web_push_token,
            status: pushResponse.success ? "success" : "failed",
            ...(pushResponse.success ? {} : { error: pushResponse.error }),
          });
          if (pushResponse.success) {
            successfulRemindUsers.push({
              name,
              id: userId,
              profileId,
              method: "push",
            });
          } else {
            failedRemindUsers.push({
              name,
              id: userId,
              profileId,
              method: "push",
              error: pushResponse.error || "push notification error",
            });
          }
        }
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.message || error?.message || "Unknown error";
        console.error(
          `[ERROR] Failed to send monthly report to user ${
            (user.email, userId)
          }:`,
          errorMessage
        );
        Sentry.captureException(error);
      }
    }

    return {
      users: Users,
      successfulRemindUsers,
      failedRemindUsers,
    };
  } catch (error) {
    console.error("Error in sendMonthlyUserReport:", error);
    Sentry.captureException(error);
    throw error;
  }
};

export const sendNoActivityReminders = async () => {
  const endDate = moment().subtract(7, "days").startOf("day").toISOString();
  const maxNotifyUsers = Number(process.env.NEXT_PUBLIC_MAX_NOTIFY_USER);

  const result = await adminDB.query({
    $users: {
      $: {
        where: {
          and: [
            { "user_profile.last_activity_at": { $lt: endDate } },
            { "user_profile.consent_message_taken": { $not: "no" } },
            {
              or: [
                { "user_profile.last_reminder_send_at": { $isNull: true } },
                {
                  "user_profile.last_reminder_send_at": {
                    $lt: endDate,
                  },
                },
              ],
            },
          ],
        },
      },
      user_profile: {},
    },
  });
  const inactiveUsers = result.$users || [];
  const remindUsers = inactiveUsers.slice(0, maxNotifyUsers);
  const successfulRemindUsers: any[] = [];
  const failedRemindUsers: any[] = [];

  for (const user of remindUsers) {
    const {
      mobile1,
      mobile1_country_code,
      name,
      id: profileId,
      web_push_token,
    } = user.user_profile || {};
    const userId = user.id;

    const isEmailDummy = await isDummyEmail(user.email ?? "");
    if (isEmailDummy && !web_push_token) continue;
    const notificationData = {
      user_id: userId,
      frequency: "weekly",
      message: `Hi ${name} 💫, things aren’t the same without you. Time to bring the magic back!`,
      name: "Inactivity User Reminder",
      title: "Activity Reminder",
      type: "inactive_user_reminder",
    };

    const notificationId = await addNotification(notificationData, userId);

    try {
      // Handle email notifications
      if (!isEmailDummy) {
        const emailResult = await emailRemindUser(user);
        const templateIdentifier = emailResult.emailTemplate;
        await addNotificationChannel(notificationId, {
          channel: "email",
          identifier: templateIdentifier,
          status: emailResult.success ? "success" : "failed",
          ...(emailResult.success ? {} : { error: emailResult.error }),
        });
        if (emailResult.success) {
          successfulRemindUsers.push({
            email: user.email,
            name,
            id: userId,
            profileId,
            method: "email",
          });
        } else {
          failedRemindUsers.push({
            email: user.email,
            name,
            id: userId,
            profileId,
            method: "email",
            error: emailResult.error || "email error",
          });
        }
      } else {
        if (mobile1 && mobile1_country_code) {
          const whatsappResult = await sendReminderByMSG91(
            { code: mobile1_country_code, number: mobile1 },
            name || "User",
            userId
          );
          const templateIdentifier = whatsappResult.campaignSlug;
          await addNotificationChannel(notificationId, {
            channel: "whatsapp",
            identifier: templateIdentifier,
            status: whatsappResult.success ? "success" : "failed",
            ...(whatsappResult.success ? {} : { error: whatsappResult.error }),
          });
          if (whatsappResult.success) {
            successfulRemindUsers.push({
              mobile1,
              mobile1_country_code,
              name,
              id: userId,
              profileId,
              method: "whatsapp",
            });
          } else {
            failedRemindUsers.push({
              mobile1,
              mobile1_country_code,
              name,
              id: userId,
              profileId,
              method: "whatsapp",
              error: whatsappResult.error || "WhatsApp error",
            });
          }
        }
      }

      // Handle push notifications
      if (web_push_token) {
        const pushResponse = await sendReminderWebPushNotification(
          notificationData.title,
          notificationData.message,
          web_push_token,
          defaultImage,
          userId
        );
        await addNotificationChannel(notificationId, {
          channel: "web_push",
          identifier: web_push_token,
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

      // Update last_reminder_send_at for the user if a reminder was sent
      if (profileId) {
        await adminDB.transact([
          adminDB.tx.user_profile[profileId].update({
            last_reminder_send_at: moment.utc().toISOString(),
          }),
        ]);
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || error?.message || "Unknown error";
      console.error(
        `[ERROR] Failed to send reminder to user ${
          user?.email || mobile1 || userId
        }:`,
        errorMessage
      );
      Sentry.captureException(error);
    }
  }

  return {
    remindUsers,
    successfulRemindUsers,
    failedRemindUsers,
    maxRemindUsers: maxNotifyUsers,
  };
};

export const noKudoSentReminders = async () => {
  const now = moment();
  const startDate = now.clone().subtract(1, "day");
  const result = await adminDB.query({
    $users: {
      $: {
        where: {
          and: [
            { "user_profile.created_at": { $gte: startDate.toISOString() } },
            { "user_profile.created_at": { $lte: now.toISOString() } },
            { kudos: { $isNull: true } },
            { kudo_receiver: { $isNull: true } },
            { "user_profile.logins": { $isNull: false } },
            { "user_profile.consent_message_taken": { $not: "no" } },
          ],
        },
      },
      user_profile: {},
    },
  });
  const inactiveUsers = result.$users || [];
  const successfulRemindUsers: any[] = [];
  const failedRemindUsers: any[] = [];

  for (const user of inactiveUsers) {
    const {
      name,
      id: profileId,
      web_push_token,
    } = "user_profile" in user && user.user_profile ? user.user_profile : {};
    const userId = user.id;

    const isEmailDummy = await isDummyEmail(user.email ?? "");
    if (isEmailDummy && !web_push_token) continue;

    const notificationData = {
      user_id: userId,
      frequency: "daily",
      message: `Hi ${name}, spread some cheer today — send your first kudo! 🌟!`,
      name: "Inactive New User Reminder",
      title: "💌 Your First Kudo Awaits!",
      type: "inactive_new_user",
      is_read: false,
    };

    const notificationId = await addNotification(notificationData, userId);

    try {
      // Handle email notifications
      if (!isEmailDummy) {
        const emailResult = await emailRemindUsers(user);
        const templateIdentifier = emailResult.emailTemplate;
        await addNotificationChannel(notificationId, {
          channel: "email",
          identifier: templateIdentifier,
          status: emailResult.success ? "success" : "failed",
          ...(emailResult.success ? {} : { error: emailResult.error }),
        });
        if (emailResult.success) {
          successfulRemindUsers.push({
            email: user.email,
            name,
            id: userId,
            profileId,
            method: "email",
          });
        } else {
          failedRemindUsers.push({
            email: user.email,
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
          notificationData.title,
          notificationData.message,
          web_push_token,
          defaultImage,
          userId
        );
        await addNotificationChannel(notificationId, {
          channel: "web_push",
          identifier: web_push_token,
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
        `[ERROR] Failed to send reminder to user ${user?.email || userId}:`,
        errorMessage
      );
      Sentry.captureException(error);
    }
  }

  return {
    inactiveUsers,
    successfulRemindUsers,
    failedRemindUsers,
  };
};

export const sendTopActiveKudoUsersReminder = async () => {
  // Calculate last month's date range
  const lastMonthStart = moment()
    .subtract(1, "month")
    .startOf("month")
    .toISOString();
  const lastMonthEnd = moment()
    .subtract(1, "month")
    .endOf("month")
    .toISOString();

  // Get month name and year for the message (e.g., "July 2025")
  const lastMonthName = moment().subtract(1, "month").format("MMMM YYYY");

  // Query users with kudos from last month
  const result = await adminDB.query({
    $users: {
      user_profile: {},
      $: {
        where: {
          "user_profile.consent_message_taken": { $not: "no" },
        },
      },

      kudos: {
        $: {
          where: {
            and: [
              { created_at: { $gte: lastMonthStart } },
              { created_at: { $lte: lastMonthEnd } },
            ],
          },
        },
      },
    },
  });

  // Filter users who have 5 or more kudos from last month
  const activeKudoUsers = (result.$users || []).filter(
    (user: any) =>
      !creatorAccounts.includes(user.email) &&
      user.kudos &&
      user.kudos.length >= +process.env.NEXT_PUBLIC_TOP_KUDO_SEND_COUNT!
  );
  const successfulRemindUsers = [];
  const failedRemindUsers = [];

  for (const user of activeKudoUsers) {
    const { email, user_profile, kudos, id } = user || {};
    const { mobile1, mobile1_country_code, name, web_push_token } =
      user_profile || {};
    const kudosCount = kudos.length;
    const title = `Your ${kudosCount} kudos in ${lastMonthName} made a difference! 🌟`;
    const message = `In ${lastMonthName}, you sent ${kudosCount} Kudos using Cheer Champion and that means you helped spread positivity, encouragement, and gratitude across your community.`;
    try {
      const notificationID = await addNotification(
        {
          frequency: "monthly",
          user_id: id,
          type: "top_active_kudo_users",
          name: "Top Active Kudo Users Reminder",
          title: title,
          message: message,
        },
        id
      );
      const isEmailDummy = await isDummyEmail(email);
      if (!isEmailDummy) {
        const channelState = await emailActiveKudoUser(
          user,
          lastMonthName,
          kudosCount,
          title
        );
        await addNotificationChannel(notificationID, {
          ...channelState,
          channel: "email",
        });

        if (channelState.status === "success") {
          successfulRemindUsers.push({
            email,
            name,
            id,
          });
        } else {
          failedRemindUsers.push({
            email,
            name,
            id,
            error: channelState.error,
          });
        }
      } else {
        const channelState = await KudoSenderAppreciationMonthlyByMSG91(
          { number: mobile1, code: mobile1_country_code },
          name || "User",
          lastMonthName,
          kudosCount,
          id
        );
        await addNotificationChannel(notificationID, {
          ...channelState,
          channel: "whatsapp",
        });

        if (channelState.status === "success") {
          successfulRemindUsers.push({
            mobile1,
            mobile1_country_code,
            name,
            id,
          });
        } else {
          failedRemindUsers.push({
            mobile1,
            mobile1_country_code,
            name,
            id,
            error: channelState.error,
          });
        }
      }
      if (web_push_token) {
        const pushResponse = await sendReminderWebPushNotification(
          title,
          message,
          web_push_token,
          defaultImage,
          id
        );
        await addNotificationChannel(notificationID, {
          channel: "web_push",
          identifier: web_push_token,
          status: pushResponse.success ? "success" : "failed",
          ...(pushResponse.success ? {} : { error: pushResponse.error }),
        });
        if (pushResponse.success) {
          successfulRemindUsers.push({
            web_push_token,
            name,
            id,
          });
        } else {
          failedRemindUsers.push({
            web_push_token,
            name,
            id,
            error: pushResponse.error,
          });
        }
      }
    } catch (error) {
      console.error(
        `Failed to send reminder to top active kudo user ${
          (user.email, mobile1, web_push_token)
        }:`,
        error
      );
      continue;
    }
  }
  return {
    usersToRemind: activeKudoUsers,
    successfulRemindUsers,
    failedRemindUsers,
    topKudoSendCount: +process.env.NEXT_PUBLIC_TOP_KUDO_SEND_COUNT!,
  };
};

const getRandomNotification = () => {
  const Idx = Math.floor(Math.random() * pushNotification.length);
  return pushNotification[Idx];
};
export const dailyPushNotification = async () => {
  const result = await adminDB.query({
    $users: {
      $: {
        where: {
          and: [
            { "user_profile.consent_message_taken": { $not: "no" } },
            {
              or: [
                { "user_profile.push_token": { $isNull: false } },
                { "user_profile.web_push_token": { $isNull: false } },
              ],
            },
          ],
        },
      },
      user_profile: {},
    },
  });

  const gotUsers: any[] = result.$users || [];
  const remindUserLogs = [];
  let somethingFail: any = "";
  for (const user of gotUsers) {
    const { push_token, web_push_token, name } = user.user_profile || {};
    const user_id = user.id;
    if (!push_token && !web_push_token) continue;

    try {
      const randomNotification = getRandomNotification();

      const notificationID = await addNotification(
        {
          frequency: "daily",
          user_id: user.id,
          type: "daily_push_notification",
          name: "Daily Push Notification",
          message: randomNotification.body,
          title: randomNotification.title,
        },
        user.id
      );
      if (push_token) {
        const { error, success }: any = await dailyAppPushNotification(
          push_token,
          randomNotification,
          notificationID
        );
        remindUserLogs.push({
          error,
          success,
          push_token,
          name,
          id: user.id,
          channel: "app_push",
        });
      }
      if (web_push_token) {
        const { error, success }: any = await dailyWebPushNotification(
          web_push_token,
          randomNotification,
          notificationID,
          user_id
        );
        remindUserLogs.push({
          error,
          success,
          web_push_token,
          name,
          id: user.id,
          channel: "web_push",
        });
      }
    } catch (error: any) {
      console.error(`Failed to send push notification:`, error);
      Sentry.captureException(error);
      somethingFail = error;
      continue;
    }
  }

  return {
    gotUsers,
    remindUserLogs,
    somethingFail,
  };
};

export async function sendReminderWebPushNotification(
  title: string,
  message: string,
  webPushToken: string,
  imageUrl?: string,
  userId?: string
) {
  const baseURLlink = "https://cheer-champion.vercel.app"; // Switch to "https://cheer-champion.vercel.app" in prod
  try {
    // For testing, use userId; for production, generate/use a secure token
    const unsubscribeUrl = `${baseURLlink}/unsubscribe/${userId}`;

    const payload = {
      notification: {
        title,
        body: message,
      },
      data: {
        type: "reminder",
        // Base URL to open when the body is clicked (handled by fcm_options.link)
        base_url: baseURLlink,
        // Unsubscribe URL to open when the action button is clicked (handled in SW)
        unsubscribe_url: unsubscribeUrl,
      },
      webpush: {
        headers: { Urgency: "high" },
        // Clicking the notification body opens the base site
        fcm_options: { link: baseURLlink },
        notification: {
          image: imageUrl || defaultImage,
          actions: [{ action: "unsubscribe", title: "Unsubscribe" }],
          requireInteraction: false,
        },
      },
      token: webPushToken,
    };

    await firebaseAdmin.messaging().send(payload);
    return {
      success: true,
    };
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
