import "server-only";
import moment from "moment";
// import { getImageTypeFromUrl } from "@/app/actions/kudo";
const AISENSY_API_URL = "https://backend.aisensy.com/campaign/t1/api/v2";
import * as Sentry from "@sentry/nextjs";
import axios from "axios";
import { cleanedKudoMessage } from "@/helpers/jobs";
import { addNotificationChannel } from "@/app/actions/notifications";

interface Mobile {
  number: string | undefined;
  code: string | undefined;
}
const MSG_EXTERNAL_API =
  "https://control.msg91.com/api/v5/campaign/api/campaigns";

const APP_LINK = "https://cheerchampion.com/";

// const trialUsers = [
//   { code: "91", number: "7698026959" },
//   { code: "91", number: "8511108041" },
//   { code: "1", number: "3475461567" },
// ];

export const WHATSAPP_REMINDER_CAMPAIGN = [
  "kudo-reminder-1",
  "kudo-reminder-2",
  "kudo-reminder-3",
  "kudo-reminder-4",
  "kudo-reminder-5",
];

const S3_BASE_URL = "https://cheerchampion.s3.us-east-1.amazonaws.com/uploads/";

export const WHATSAPP_REMINDER_IMAGES = [
  "Reminder+1+1.png",
  "Reminder+2+1.png",
  "Reminder+3+1.png",
  "Reminder+4+1.png",
  "Reminder+5+1.png",
];
// export const WHATSAPP_REMINDER_TEMPLATES = [
//   "send_kudo_reminder2",
//   "send_kudo_reminder3",
//   "send_kudo_reminder4",
//   "send_kudo_reminder5",
//   "weekly_reminder_thank_1",
//   "weekly_reminder_thank_5",
//   "weekly_reminder_thank_4",
//   "weekly_reminder_thank_3",
//   "send_kudo_reminder1",
// ];

// export const EMAIL_REMINDER_TEMPLATES = [
//   {title:"The timing’s never perfect. The message always is.", templateName: "emailReminder1.html"},
//   "send_kudo_reminder2",
//   "send_kudo_reminder3",
//   "send_kudo_reminder4",
//   "send_kudo_reminder5",
//   "weekly_reminder_thank_1",
//   "weekly_reminder_thank_5",
//   "weekly_reminder_thank_4",
//   "weekly_reminder_thank_3",
//   "send_kudo_reminder1",
// ];

export async function sendKudoWhatsAppMessage(
  receiver: any,
  senderName: string | object,
  kudoID: string,
  kudo: any,
  notificationID: string = ""
) {
  try {
    const kudoMessage = await cleanedKudoMessage(kudo.kudo);
    const sendDate = moment(kudo.created_at).format("MMMM D, YYYY");
    const sendTime = moment(kudo.created_at).format("hh:mm A");

    const {
      mobile1,
      mobile1_country_code,
      mobile2,
      mobile2_country_code,
      mobile3,
      mobile3_country_code,
      name,
    } = receiver;

    // Collect valid numbers
    const numbers = [
      { number: mobile1, code: mobile1_country_code },
      { number: mobile2, code: mobile2_country_code },
      { number: mobile3, code: mobile3_country_code },
    ].filter((mobile) => mobile.code && mobile.number);

    for (const mobile of numbers) {
      try {
        const channelState = await sendKudoMessageByMSG91(
          mobile,
          senderName,
          name,
          kudoID,
          kudoMessage,
          sendDate,
          sendTime
        );
        await addNotificationChannel(notificationID, {
          ...channelState,
          channel: "whatsapp",
        });
      } catch (err) {
        console.error(`Failed for ${mobile.number}`, err);
        continue;
      }
    }
  } catch (error) {
    console.error(
      `Failed to send message to mobile`,
      JSON.stringify(error, null, 2)
    );
    Sentry.captureException(error);
    // if (!(error instanceof Error)) {
    //   throw new Error(
    //     typeof error === "string" ? error : JSON.stringify(error)
    //   );
    // }
    // throw error;
  }
}
export async function receiveKudoWhatsAppNotification(
  contact: any,
  senderName: string | object,
  receiverName: string,
  kudoID: string,
  kudoMessage: any,
  notificationID: string = ""
) {
  try {
    const {
      mobile1,
      mobile1_country_code,
      mobile2,
      mobile2_country_code,
      mobile3,
      mobile3_country_code,
    } = contact.user_profile;
    // Collect valid numbers
    const numbers = [
      { number: mobile1, code: mobile1_country_code },
      { number: mobile2, code: mobile2_country_code },
      { number: mobile3, code: mobile3_country_code },
    ].filter((mobile) => mobile.code && mobile.number);
    for (const mobile of numbers) {
      try {
        const channelState = await receivedKudoNotifyContactsByMSG91(
          mobile,
          senderName,
          receiverName,
          kudoID,
          kudoMessage
        );
        await addNotificationChannel(notificationID, {
          ...channelState,
          channel: "whatsapp",
        });
      } catch (err) {
        console.error(`Failed for receiver ${mobile}`, err);
        continue;
      }
    }
  } catch (error) {
    console.error(
      `Failed to receiver kudo notify to mobile`,
      JSON.stringify(error, null, 2)
    );
  }
}
export async function sentKudoWhatsAppNotification(
  contact: any,
  senderName: string | object,
  receiverNames: string,
  kudoID: string,
  kudoMessage: any,
  notificationID: string = ""
) {
  try {
    const { mobile1, mobile1_country_code } = contact.user_profile;
    if (!mobile1 || !mobile1_country_code) return;
    const channelState = await sentKudoNotifyContactsByMSG91(
      { number: mobile1, code: mobile1_country_code },
      senderName,
      receiverNames,
      kudoID,
      kudoMessage
    );
    await addNotificationChannel(notificationID, {
      ...channelState,
      channel: "whatsapp",
    });
  } catch (error) {
    console.error(
      `Failed to sender kudo notify to mobile`,
      JSON.stringify(error, null, 2)
    );
  }
}

export async function likeKudoWhatsAppMessage(
  user: any,
  likeUserName: string,
  kudoID: string,
  createdAt: Date,
  notificationID: string = ""
) {
  const sendDate = moment(createdAt).format("MMMM D, YYYY");
  const sendTime = moment(createdAt).format("hh:mm A");
  const { mobile1, mobile1_country_code, name } = user;
  // Collect valid numbers
  const numbers = [{ number: mobile1, code: mobile1_country_code }].filter(
    (mobile) => mobile.code && mobile.number
  );

  for (const mobile of numbers) {
    try {
      const channelState = await likeKudoMessageByMSG91(
        mobile,
        name,
        likeUserName,
        kudoID,
        sendDate,
        sendTime
      );
      await addNotificationChannel(notificationID, {
        ...channelState,
        channel: "whatsapp",
      });
    } catch (error: any) {
      console.error("Error like notification:", error);
      continue;
    }
  }
}

export async function sendKudoMessageByAiSensy(
  mobile: Mobile,
  senderName: string,
  receiverName: string,
  kudoID: string,
  message: string,
  sendDate: string,
  sentTime: string
) {
  try {
    const campaignName = "Cheer Champion kudo received confirmation";
    const sentMessage: any = await axios.post(AISENSY_API_URL, {
      apiKey: process.env.AISENSY_API_KEY,
      campaignName: campaignName,
      destination: `+${mobile.code}${mobile.number}`,
      userName: "CheerChampion",
      templateParams: [receiverName, senderName, sendDate, sentTime, message],
      buttons: [
        {
          type: "button",
          sub_type: "URL",
          index: 0,
          parameters: [
            {
              type: "text",
              text: kudoID,
            },
          ],
        },
      ],
    });
    console.log(
      `Message sent to ${mobile.number}: ${sentMessage.data.submitted_message_id}`
    );
    return sentMessage;
  } catch (error) {
    Sentry.captureException(error);
    console.error(
      `Failed to send message to ${mobile.number}:`,
      JSON.stringify(error, null, 2)
    );
  }
}

// export async function sendReminderByAiSensy(
//   mobile: Mobile,
//   receiverName: string = "CheerChampion User"
// ) {
//   try {
//     const campaignIdx = Math.floor(
//       Math.random() * WHATSAPP_REMINDER_TEMPLATES.length
//     );
//     const campaignName = WHATSAPP_REMINDER_TEMPLATES[campaignIdx];
//     const sentMessage: any = await axios.post(AISENSY_API_URL, {
//       apiKey: process.env.AISENSY_API_KEY,
//       campaignName: campaignName,
//       destination: `+${mobile.code}${mobile.number}`,
//       userName: "CheerChampion",
//       templateParams: [receiverName],
//     });
//     console.log(
//       `Message sent to ${mobile.number}: ${sentMessage.data.submitted_message_id}`
//     );
//     return sentMessage;
//   } catch (error) {
//     Sentry.captureException(error);
//     console.error(
//       `Failed to send message to d ${mobile.number}:`,
//       JSON.stringify(error, null, 2)
//     );
//   }
// }

let lastIdx = -1;

const getRandomReminderCampaign = () => {
  let idx;
  do {
    idx = Math.floor(Math.random() * WHATSAPP_REMINDER_CAMPAIGN.length);
  } while (idx === lastIdx && WHATSAPP_REMINDER_CAMPAIGN.length > 1);

  lastIdx = idx;
  return WHATSAPP_REMINDER_CAMPAIGN[idx];
};

const getRandomReminderImage = () => {
  const imageIdx = Math.floor(Math.random() * WHATSAPP_REMINDER_IMAGES.length);
  return S3_BASE_URL + WHATSAPP_REMINDER_IMAGES[imageIdx];
};

export async function sendReminderByMSG91(
  mobile: Mobile,
  receiverName: any,
  userId: any
) {
  const campaignSlug = getRandomReminderCampaign();
  const imageURL = getRandomReminderImage();
  try {
    const MSG_API_URL = `${MSG_EXTERNAL_API}/${campaignSlug}/run`;

    const payload: any = {
      data: {
        sendTo: [
          {
            to: [
              {
                mobiles: `${mobile.code}${mobile.number}`,
                variables: {
                  header_1: {
                    type: "image",
                    value: imageURL,
                  },
                  body_1: {
                    type: "text",
                    value: receiverName,
                  },
                  button_2: {
                    type: "text",
                    value: userId,
                  },
                },
              },
            ],
            variables: {
              header_1: {
                type: "image",
                value: imageURL,
              },
              body_1: {
                type: "text",
                value: receiverName,
              },
              button_2: {
                type: "text",
                value: userId,
              },
            },
          },
        ],
      },
    };

    if (
      campaignSlug === "kudo-reminder-4" ||
      campaignSlug === "kudo-reminder-5"
    ) {
      payload.data.sendTo[0].to[0].variables.send_kudo_link = {
        type: "text",
        value: APP_LINK,
      };
      payload.data.sendTo[0].variables.send_kudo_link = {
        type: "text",
        value: APP_LINK,
      };
    }
    const sentMessage: any = await axios.post(MSG_API_URL, payload, {
      headers: {
        "Content-Type": "application/json",
        authkey: process.env.MSG91_AUTH_KEY!,
      },
    });
    return { success: true, campaignSlug, sentMessage: sentMessage.data };
  } catch (error: any) {
    Sentry.captureException(error);
    console.error(
      `Failed to send WhatsApp message to ${mobile.number}:`,
      error
    );
    return {
      success: false,
      campaignSlug,
      error:
        error instanceof Error
          ? (error as any)?.response?.data?.message || error.message
          : "Unknown error",
    };
  }
}

export async function KudoSenderAppreciationMonthlyByMSG91(
  mobile: Mobile,
  userName: string,
  monthYear: string,
  kudosCount: number,
  userId: string
) {
  const campaignSlug = "kudomonthlysenderappreciation1";
  const returnValue = {
    identifier: campaignSlug,
    status: "pending",
    error: "",
  };
  try {
    const MSG_API_URL = `${MSG_EXTERNAL_API}/${campaignSlug}/run`;

    const payload = {
      data: {
        sendTo: [
          {
            to: [
              {
                mobiles: `${mobile.code}${mobile.number}`, // must be in E.164 format (e.g., 9176980xxxx)
                variables: {
                  "kudo_sender_appreciation_monthly:header_1": {
                    type: "text",
                    value: userName,
                  },
                  "kudo_sender_appreciation_monthly:body_1": {
                    type: "text",
                    value: userName,
                  },
                  "kudo_sender_appreciation_monthly:body_2": {
                    type: "text",
                    value: monthYear,
                  },
                  "kudo_sender_appreciation_monthly:body_3": {
                    type: "text",
                    value: kudosCount.toString(),
                  },
                  "kudo_sender_appreciation_monthly:button_2": {
                    type: "text",
                    value: userId,
                  },
                  "6887204cd6fc0563eb716c52:name": {
                    type: "text",
                    value: userName,
                  },
                  "6887204cd6fc0563eb716c52:month": {
                    type: "text",
                    value: monthYear,
                  },
                  "6887204cd6fc0563eb716c52:no_of_kudo": {
                    type: "text",
                    value: kudosCount.toString(),
                  },
                },
              },
            ],
            variables: {
              "kudo_sender_appreciation_monthly:header_1": {
                type: "text",
                value: userName,
              },
              "kudo_sender_appreciation_monthly:body_1": {
                type: "text",
                value: userName,
              },
              "kudo_sender_appreciation_monthly:body_2": {
                type: "text",
                value: monthYear,
              },
              "kudo_sender_appreciation_monthly:body_3": {
                type: "text",
                value: kudosCount.toString(),
              },
              "kudo_sender_appreciation_monthly:button_2": {
                type: "text",
                value: userId,
              },
              "6887204cd6fc0563eb716c52:name": {
                type: "text",
                value: userName,
              },
              "6887204cd6fc0563eb716c52:month": {
                type: "text",
                value: monthYear,
              },
              "6887204cd6fc0563eb716c52:no_of_kudo": {
                type: "text",
                value: kudosCount.toString(),
              },
            },
          },
        ],
      },
    };

    const sentMessage: any = await axios.post(MSG_API_URL, payload, {
      headers: {
        "Content-Type": "application/json",
        authkey: process.env.MSG91_AUTH_KEY!,
      },
    });
    returnValue.status = sentMessage.data.status;
  } catch (error: any) {
    console.error(
      `❌ Failed to send MSG91 message to ${mobile.number}:`,
      JSON.stringify(error, null, 2)
    );
    Sentry.captureException(error);
    returnValue.status = "failed";
    returnValue.error =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to send active kudo MSG91 reminder";
  } finally {
    return returnValue;
  }
}
export async function sendKudoMessageByMSG91(
  mobile: Mobile,
  senderName: string | object,
  receiverName: string,
  kudoID: string,
  message: string,
  sendDate: string,
  sendTime: string
) {
  const campaignSlug = "kudoreceived";
  const returnValue = {
    identifier: campaignSlug,
    status: "pending",
    error: "",
  };
  try {
    const MSG_API_URL = `${MSG_EXTERNAL_API}/${campaignSlug}/run`;

    const payload = {
      data: {
        sendTo: [
          {
            to: [
              {
                //  name: "CheerChampion",
                mobiles: `${mobile.code}${mobile.number}`, // must be in E.164 format (e.g., 9176980xxxx)
                variables: {
                  "kudo_received:header_1": {
                    type: "text",
                    value: senderName,
                  },
                  "kudo_received:body_1": { type: "text", value: receiverName },
                  "kudo_received:body_2": { type: "text", value: senderName },
                  "kudo_received:body_3": { type: "text", value: sendDate },
                  "kudo_received:body_4": { type: "text", value: sendTime },
                  "kudo_received:body_5": { type: "text", value: message },
                  "kudo_received:button_1": {
                    type: "text",
                    value: `https://cheerchampion.com/feeds/${kudoID}`,
                  },
                  "685cd308d6fc0573aa62c392:var1": {
                    type: "text",
                    value: receiverName,
                  },
                  "685cd308d6fc0573aa62c392:var2": {
                    type: "text",
                    value: senderName,
                  },
                  "685cd308d6fc0573aa62c392:var3": {
                    type: "text",
                    value: sendDate,
                  },
                  "685cd308d6fc0573aa62c392:var4": {
                    type: "text",
                    value: sendTime,
                  },
                  "685cd308d6fc0573aa62c392:var5": {
                    type: "text",
                    value: message,
                  },
                  "685cd308d6fc0573aa62c392:var6": {
                    type: "text",
                    value: `https://cheerchampion.com/feeds/${kudoID}`,
                  },
                },
              },
            ],
            variables: {
              "kudo_received:header_1": {
                type: "text",
                value: senderName,
              },
              "kudo_received:body_1": { type: "text", value: receiverName },
              "kudo_received:body_2": { type: "text", value: senderName },
              "kudo_received:body_3": { type: "text", value: sendDate },
              "kudo_received:body_4": { type: "text", value: sendTime },
              "kudo_received:body_5": { type: "text", value: message },
              "kudo_received:button_1": {
                type: "text",
                value: `https://cheerchampion.com/feeds/${kudoID}`,
              },
              "685cd308d6fc0573aa62c392:var1": {
                type: "text",
                value: receiverName,
              },
              "685cd308d6fc0573aa62c392:var2": {
                type: "text",
                value: senderName,
              },
              "685cd308d6fc0573aa62c392:var3": {
                type: "text",
                value: sendDate,
              },
              "685cd308d6fc0573aa62c392:var4": {
                type: "text",
                value: sendTime,
              },
              "685cd308d6fc0573aa62c392:var5": { type: "text", value: message },
              "685cd308d6fc0573aa62c392:var6": {
                type: "text",
                value: `https://cheerchampion.com/feeds/${kudoID}`,
              },
            },
          },
        ],
      },
    };
    const sentMessage: any = await axios.post(MSG_API_URL, payload, {
      headers: {
        "Content-Type": "application/json",
        authkey: process.env.MSG91_AUTH_KEY!,
      },
    });

    returnValue.status = sentMessage.data.status;
    console.log(`Message sent to ${mobile.number}:`, sentMessage);
  } catch (error: any) {
    console.error(
      `Failed to send message to MSG91 ${mobile.number}:`,
      JSON.stringify(error, null, 2)
    );
    Sentry.captureException(error);
    returnValue.status = "failed";
    returnValue.error =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to send message to MSG91";
  } finally {
    return returnValue;
  }
}
export async function receivedKudoNotifyContactsByMSG91(
  mobile: Mobile,
  senderName: string | object,
  receiverName: string,
  kudoID: string,
  kudoMessage: string
) {
  const campaignSlug = "kudoreceivedconnecteduser";
  const returnValue = {
    identifier: campaignSlug,
    status: "pending",
    error: "",
  };
  try {
    const MSG_API_URL = `${MSG_EXTERNAL_API}/${campaignSlug}/run`;
    const payload = {
      data: {
        sendTo: [
          {
            to: [
              {
                mobiles: `${mobile.code}${mobile.number}`,
                variables: {
                  "connected_user_receive_kudo:header_1": {
                    type: "text",
                    value: receiverName,
                  },
                  "connected_user_receive_kudo:body_1": {
                    type: "text",
                    value: senderName,
                  },
                  "connected_user_receive_kudo:body_2": {
                    type: "text",
                    value: kudoMessage,
                  },
                  "connected_user_receive_kudo:body_3": {
                    type: "text",
                    value: receiverName,
                  },
                  "connected_user_receive_kudo:button_1": {
                    type: "text",
                    value: kudoID,
                  },
                },
              },
            ],
            variables: {
              "connected_user_receive_kudo:header_1": {
                type: "text",
                value: receiverName,
              },
              "connected_user_receive_kudo:body_1": {
                type: "text",
                value: senderName,
              },
              "connected_user_receive_kudo:body_2": {
                type: "text",
                value: kudoMessage,
              },
              "connected_user_receive_kudo:body_3": {
                type: "text",
                value: receiverName,
              },
              "connected_user_receive_kudo:button_1": {
                type: "text",
                value: kudoID,
              },
            },
          },
        ],
      },
    };
    const sentMessage: any = await axios.post(MSG_API_URL, payload, {
      headers: {
        "Content-Type": "application/json",
        authkey: process.env.MSG91_AUTH_KEY!,
      },
    });
    console.log(`Message sent to ${mobile.number}:`, sentMessage);
    returnValue.status = sentMessage.data.status;
  } catch (error: any) {
    console.error(
      `Failed to send message to MSG91 ${mobile.number}:`,
      JSON.stringify(error, null, 2)
    );
    Sentry.captureException(error);

    returnValue.status = "failed";
    returnValue.error =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to send message to MSG91 kudo sender connection";
  } finally {
    return returnValue;
  }
}
export async function sentKudoNotifyContactsByMSG91(
  mobile: Mobile,
  senderName: string | object,
  receiverNames: string,
  kudoID: string,
  kudoMessage: string
) {
  const campaignSlug = "kudosentconnecteduser";
  const returnValue = {
    identifier: campaignSlug,
    status: "pending",
    error: "",
  };
  try {
    const MSG_API_URL = `${MSG_EXTERNAL_API}/${campaignSlug}/run`;
    const payload = {
      data: {
        sendTo: [
          {
            to: [
              {
                mobiles: `${mobile.code}${mobile.number}`,
                variables: {
                  "connected_user_sent_kudo:header_1": {
                    type: "text",
                    value: senderName,
                  },
                  "connected_user_sent_kudo:body_1": {
                    type: "text",
                    value: receiverNames,
                  },
                  "connected_user_sent_kudo:body_2": {
                    type: "text",
                    value: kudoMessage,
                  },
                  "connected_user_sent_kudo:body_3": {
                    type: "text",
                    value: senderName,
                  },
                  "connected_user_sent_kudo:button_1": {
                    type: "text",
                    value: kudoID,
                  },
                },
              },
            ],
            variables: {
              "connected_user_sent_kudo:header_1": {
                type: "text",
                value: senderName,
              },
              "connected_user_sent_kudo:body_1": {
                type: "text",
                value: receiverNames,
              },
              "connected_user_sent_kudo:body_2": {
                type: "text",
                value: kudoMessage,
              },
              "connected_user_sent_kudo:body_3": {
                type: "text",
                value: senderName,
              },
              "connected_user_sent_kudo:button_1": {
                type: "text",
                value: kudoID,
              },
            },
          },
        ],
      },
    };
    const sentMessage: any = await axios.post(MSG_API_URL, payload, {
      headers: {
        "Content-Type": "application/json",
        authkey: process.env.MSG91_AUTH_KEY!,
      },
    });
    console.log(`Message sent to ${mobile.number}:`, sentMessage);
    returnValue.status = sentMessage.data.status;
  } catch (error: any) {
    console.error(
      `Failed to send message to MSG91 kudo sender connection ${mobile.number}:`,
      JSON.stringify(error, null, 2)
    );
    Sentry.captureException(error);

    returnValue.status = "failed";
    returnValue.error =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to send message to MSG91 kudo sender connection";
  } finally {
    return returnValue;
  }
}
export async function likeKudoMessageByMSG91(
  mobile: Mobile,
  receiverName: string,
  likeUserName: string,
  kudoID: string,
  sendDate: string,
  sendTime: string
) {
  const campaignSlug = "kudolikenotification";
  const returnValue = {
    identifier: campaignSlug,
    status: "pending",
    error: "",
  };
  try {
    const MSG_API_URL = `${MSG_EXTERNAL_API}/${campaignSlug}/run`;

    const payload = {
      data: {
        sendTo: [
          {
            to: [
              {
                name: "CheerChampion",
                mobiles: `${mobile.code}${mobile.number}`, // must be in E.164 format (e.g., 9176980xxxx)
                variables: {
                  "kudo_like_notification:body_1": {
                    type: "text",
                    value: receiverName,
                  },
                  "kudo_like_notification:body_2": {
                    type: "text",
                    value: likeUserName,
                  },
                  "kudo_like_notification:body_3": {
                    type: "text",
                    value: sendDate,
                  }, // e.g., June 26, 2025
                  "kudo_like_notification:body_4": {
                    type: "text",
                    value: sendTime,
                  }, // e.g., 07:16 PM
                  "kudo_like_notification:button_1": {
                    type: "text",
                    value: kudoID,
                  },
                  "68827604d6fc05427308de12:receiver_name": {
                    type: "text",
                    value: receiverName,
                  },
                  "68827604d6fc05427308de12:user_like_name": {
                    type: "text",
                    value: likeUserName,
                  },
                  "68827604d6fc05427308de12:user_like_date": {
                    type: "text",
                    value: sendDate,
                  },
                  "68827604d6fc05427308de12:user_like_time": {
                    type: "text",
                    value: sendTime,
                  },
                },
              },
            ],
            variables: {
              "kudo_like_notification:body_1": {
                type: "text",
                value: receiverName,
              },
              "kudo_like_notification:body_2": {
                type: "text",
                value: likeUserName,
              },
              "kudo_like_notification:body_3": {
                type: "text",
                value: sendDate,
              },
              "kudo_like_notification:body_4": {
                type: "text",
                value: sendTime,
              },
              "kudo_like_notification:button_1": {
                type: "text",
                value: kudoID,
              },
              "68827604d6fc05427308de12:receiver_name": {
                type: "text",
                value: receiverName,
              },
              "68827604d6fc05427308de12:user_like_name": {
                type: "text",
                value: likeUserName,
              },
              "68827604d6fc05427308de12:user_like_date": {
                type: "text",
                value: sendDate,
              },
              "68827604d6fc05427308de12:user_like_time": {
                type: "text",
                value: sendTime,
              },
            },
          },
        ],
      },
    };
    const sentMessage: any = await axios.post(MSG_API_URL, payload, {
      headers: {
        "Content-Type": "application/json",
        authkey: process.env.MSG91_AUTH_KEY!,
      },
    });
    console.log(`Message sent to ${mobile.number}:`, sentMessage);
    returnValue.status = sentMessage.data.status;
  } catch (error: any) {
    console.error(
      `Failed to send message to MSG91 ${mobile.number}:`,
      JSON.stringify(error, null, 2)
    );
    Sentry.captureException(error);
    returnValue.status = "failed";
    returnValue.error =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to send message to MSG91 kudo like";
  } finally {
    return returnValue;
  }
}
export async function sendOtpByMSG91(
  phoneNumber: string,
  code: string,
  countryCode: string
) {
  try {
    const campaignSlug = "mobilenumberverification";
    const MSG_API_URL = `${MSG_EXTERNAL_API}/${campaignSlug}/run`;

    const payload = {
      data: {
        sendTo: [
          {
            to: [
              {
                name: "CheerChampion",
                mobiles: `${countryCode}${phoneNumber}`,
                variables: {
                  "login_otp:body_1": { type: "text", value: code },
                  "login_otp:button_1": {
                    type: "text",
                    value: code,
                  },
                },
              },
            ],
            variables: {
              "login_otp:body_1": { type: "text", value: code },
              "login_otp:button_1": {
                type: "text",
                value: code,
              },
            },
          },
        ],
      },
    };
    const sentMessage: any = await axios.post(MSG_API_URL, payload, {
      headers: {
        "Content-Type": "application/json",
        authkey: process.env.MSG91_AUTH_KEY!,
      },
    });
    return sentMessage;
  } catch (error) {
    Sentry.captureException(error);
    console.error(
      `Failed to send message to MSG91 ${phoneNumber}:`,
      JSON.stringify(error, null, 2)
    );
  }
}

// export async function sendOtpWhatsAppMessage(
//   phoneNumber: string,
//   code: string,
//   countryCode: string
// ) {
//   try {
//     await axiosInstance.post(AISENSY_API_URL, {
//       apiKey: process.env.AISENSY_API_KEY,
//       campaignName: "otp varification",
//       destination: `+${countryCode}${phoneNumber}`,
//       userName: "CheerChampion",
//       templateParams: [code],
//       buttons: [
//         {
//           type: "button",
//           sub_type: "url",
//           index: 0,
//           parameters: [
//             {
//               type: "text",
//               text: code,
//             },
//           ],
//         },
//       ],
//     });
//   } catch (error: any) {
//     console.error(JSON.stringify(error, null, 2), "");
//     throw error;
//   }
// }
