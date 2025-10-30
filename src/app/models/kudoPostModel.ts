"use client";

import * as Yup from "yup";
// const API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
// const API_URL = "https://api.openai.com/v1/chat/completions";
import * as Sentry from "@sentry/nextjs";
import toast from "react-hot-toast";
import axiosInstance from "../lib/axios";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import moment from "moment";
// const phoneRegex = /^\d{10,15}$/;

export interface Recipient {
  email: string;
  mobile: string;
  countryCode: string;
}

export interface Kudo {
  id: string;
  kudo: string;
  $users?: any[];
  kudo_receiver?: any[];
  createdAt?: string;
}

export const kudoQueries = {
  given: (userID: string, cursor: any) => ({
    $: {
      where: { $users: userID },
      order: { serverCreatedAt: "desc" },
      first: 10,
      after: cursor,
    },
    $users: {
      user_profile: {
        $files: {},
      },
    },
    kudo_receiver: {
      $users: {
        user_profile: {
          $files: {},
        },
      },
    },
    kudo_likes: {
      $users: {},
    },
  }),
  received: (userID: string, cursor: any) => ({
    $: {
      where: { "kudo_receiver.$users": userID },
      order: { serverCreatedAt: "desc" },
      first: 10,
      after: cursor,
    },
    $users: {
      user_profile: {
        $files: {},
      },
    },
    kudo_receiver: {
      $users: {
        user_profile: {
          $files: {},
        },
      },
    },
    kudo_likes: {
      $users: {},
    },
  }),
  all: (userID: string, cursor: any) => ({
    $: {
      where: {
        or: [{ "kudo_receiver.$users": userID }, { $users: userID }],
      },
      order: { serverCreatedAt: "desc" },
      first: 10,
      after: cursor,
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
    kudo_likes: {
      $users: {},
    },
  }),
  // Search queries for each filter type
  searchGiven: (userID: string, searchTerm: string) => ({
    $: {
      where: {
        and: [
          { $users: userID },
          {
            or: [
              {
                "kudo_receiver.$users.user_profile.name": {
                  $ilike: `%${searchTerm}%`,
                },
              },
              { "kudo_receiver.$users.email": { $ilike: `%${searchTerm}%` } },
              { "$users.user_profile.name": { $ilike: `%${searchTerm}%` } },
              { "$users.email": { $ilike: `%${searchTerm}%` } },
            ],
          },
        ],
      },
    },
    $users: {
      user_profile: {
        $files: {},
      },
    },
    kudo_receiver: {
      $users: {
        user_profile: {
          $files: {},
        },
      },
    },
    kudo_likes: {
      $users: {},
    },
  }),
  searchReceived: (userID: string, searchTerm: string) => ({
    $: {
      where: {
        and: [
          { "kudo_receiver.$users": userID },
          {
            or: [
              {
                "kudo_receiver.$users.user_profile.name": {
                  $ilike: `%${searchTerm}%`,
                },
              },
              { "kudo_receiver.$users.email": { $ilike: `%${searchTerm}%` } },
              { "$users.user_profile.name": { $ilike: `%${searchTerm}%` } },
              { "$users.email": { $ilike: `%${searchTerm}%` } },
            ],
          },
        ],
      },
    },
    $users: {
      user_profile: {
        $files: {},
      },
    },
    kudo_receiver: {
      $users: {
        user_profile: {
          $files: {},
        },
      },
    },
    kudo_likes: {
      $users: {},
    },
  }),
  searchAll: (userID: string, searchTerm: string) => ({
    $: {
      where: {
        and: [
          {
            or: [{ "kudo_receiver.$users": userID }, { $users: userID }],
          },
          {
            or: [
              {
                "kudo_receiver.$users.user_profile.name": {
                  $ilike: `%${searchTerm}%`,
                },
              },
              { "kudo_receiver.$users.email": { $ilike: `%${searchTerm}%` } },
              { "$users.user_profile.name": { $ilike: `%${searchTerm}%` } },
              { "$users.email": { $ilike: `%${searchTerm}%` } },
            ],
          },
        ],
      },
    },
    $users: {
      user_profile: {
        $files: {},
      },
    },
    kudo_receiver: {
      $users: {
        user_profile: {
          $files: {},
        },
      },
    },
    kudo_likes: {
      $users: {},
    },
  }),
  count: (userID: string) => ({
    $users: {
      $: { where: { id: userID } },
      kudos: {},
      kudo_receiver: {},
      user_profile: {
        $files: {},
      },
    },
  }),
};

export const notificationQueries = {
  // Query for all notifications with optional date range and cursor
  all: (cursor: any, startDate: Date | null, endDate: Date | null) => ({
    $: {
      order: { serverCreatedAt: "desc" },
      first: 20,
      after: cursor,
      where: {
        and: [
          startDate
            ? {
                created_at: {
                  $gte: moment(startDate).startOf("day").toISOString(),
                },
              }
            : {},
          endDate
            ? {
                created_at: {
                  $lte: moment(endDate).endOf("day").toISOString(),
                },
              }
            : {},
        ],
      },
    },
    $users: {
      user_profile: {},
    },
    notification_channels: {},
  }),

  // Query for engagement notifications
  engagement: (cursor: any, startDate: Date | null, endDate: Date | null) => ({
    $: {
      order: { serverCreatedAt: "desc" },
      first: 20,
      after: cursor,
      where: {
        and: [
          {
            type: {
              $in: [
                "kudo_received",
                "kudo_liked",
                "connection_kudo_received",
                "connection_kudo_sent",
              ],
            },
          },
          startDate
            ? {
                created_at: {
                  $gte: moment(startDate).startOf("day").toISOString(),
                },
              }
            : {},
          endDate
            ? {
                created_at: {
                  $lte: moment(endDate).endOf("day").toISOString(),
                },
              }
            : {},
        ],
      },
    },
    $users: {
      user_profile: {},
    },
    notification_channels: {},
  }),

  // Query for reminders (non-engagement notifications)
  reminders: (cursor: any, startDate: Date | null, endDate: Date | null) => ({
    $: {
      order: { serverCreatedAt: "desc" },
      first: 20,
      after: cursor,
      where: {
        and: [
          {
            type: {
              $in: [
                "top_kudo_sender",
                "top_kudo_receiver",
                "no_kudo_sent_last_week",
                "monthly_user_report",
                "inactive_user_reminder",
                "inactive_new_user",
                "top_active_kudo_users",
                "daily_app_push_notification",
                "announcement",
              ],
            },
          },
          startDate
            ? {
                created_at: {
                  $gte: moment(startDate).startOf("day").toISOString(),
                },
              }
            : {},
          endDate
            ? {
                created_at: {
                  $lte: moment(endDate).endOf("day").toISOString(),
                },
              }
            : {},
        ],
      },
    },
    $users: {
      user_profile: {},
    },
    notification_channels: {},
  }),

  // Query for failed notifications
  failed: (cursor: any, startDate: Date | null, endDate: Date | null) => ({
    $: {
      order: { serverCreatedAt: "desc" },
      first: 20,
      after: cursor,
      where: {
        and: [
          {
            or: [
              { "notification_channels.status": "failed" },
              { notification_channels: { $isNull: true } },
            ],
          },
          startDate
            ? {
                created_at: {
                  $gte: moment(startDate).startOf("day").toISOString(),
                },
              }
            : {},
          endDate
            ? {
                created_at: {
                  $lte: moment(endDate).endOf("day").toISOString(),
                },
              }
            : {},
        ],
      },
    },
    $users: {
      user_profile: {},
    },
    notification_channels: {},
  }),

  // Search query with filter type
  search: (
    term: string,
    startDate: Date | null,
    endDate: Date | null
  ) => {
    const searchTerm = term.toLowerCase().trim();
    const baseWhere = {
      and: [
        startDate
          ? {
              created_at: {
                $gte: moment(startDate).startOf("day").toISOString(),
              },
            }
          : {},
        endDate
          ? {
              created_at: {
                $lte: moment(endDate).endOf("day").toISOString(),
              },
            }
          : {},
        {
          or: [
            { name: { $ilike: `%${searchTerm}%` } },
            { frequency: { $ilike: `%${searchTerm}%` } },
            { type: { $ilike: `%${searchTerm}%` } },
            { "$users.user_profile.name": { $ilike: `%${searchTerm}%` } },
            { "$users.email": { $ilike: `%${searchTerm}%` } },
          ],
        },
      ],
    };

    return {
      $: {
        where: baseWhere,
      },
      $users: {
        user_profile: {},
      },
      notification_channels: {},
    };
  },

  // Separate count queries for each notification type
  counts: {
    all: () => ({
      notifications: {
        $: {},
      },
    }),
    engagement: () => ({
      notifications: {
        $: {
          where: {
            type: {
              $in: [
                "kudo_received",
                "kudo_liked",
                "connection_kudo_received",
                "connection_kudo_sent",
              ],
            },
          },
        },
      },
    }),

    failed: () => ({
      notifications: {
        $: {
          where: {
            "notification_channels.status": "failed",
          },
        },
      },
    }),
    noChannels: () => ({
      notifications: {
        $: {
          where: {
            notification_channels: { $isNull: true },
          },
        },
      },
    }),
    opened: () => ({
      notifications: {
        $: {
          where: {
            is_read: true,
          },
        },
      },
    }),
  },
};

export const generateMessageFromAI = async (
  prompt: string,
  isThrowException: boolean = false
) => {
  try {
    const response = await axiosInstance.post(
      "/api/openAI/generate-message",
      { prompt }
      // {
      //   headers: {
      //     "Content-Type": "application/json",
      //     Authorization: `Bearer ${API_KEY}`,
      //   },
      // }
    );
    return response.data.message;
  } catch (error: any) {
    const status = error?.response?.status;
    if (status >= 500 || !status) {
      Sentry.captureException(error);
    }
    // toast.error(error?.response?.data.message || error.message);
    if (isThrowException) {
      throw new Error(
        error.response?.data?.message || "Error generate AI message"
      );
    }
  }
};
// export const generateMessageFromAI = async (prompt: string) => {
//   try {
//     const response = await axiosInstance.post(
//       API_URL,
//       {
//         model: "gpt-4o-mini",
//         messages: [{ role: "user", content: prompt }],
//         temperature: 0.7,
//       },
//       {
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${API_KEY}`,
//         },
//       }
//     );
//     return response?.data?.choices[0]?.message || "";
//   } catch (error: any) {
//     throw new Error(
//       error.response?.data?.message || "Error generate AI message"
//     );
//   }
// };

export const sendKudo = async (formData: FormData) => {
  try {
    const response = await axiosInstance.post("/api/kudo/send", formData);
    if (response.data?.kudoID) {
      if (
        response.data.message &&
        response.data.message.includes(
          "but some messages may not have been delivered."
        )
      ) {
        toast(response.data.message);
      }
      return { success: true };
    } else {
      throw new Error("Something went wrong!");
    }
  } catch (error: any) {
    const status = error?.response?.status;
    if (status >= 500 || !status) {
      Sentry.captureException(error);
    }
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to send Kudo.";
    throw new Error(errorMessage);
  }
};
export const deleteKudo = async (kudoId: string) => {
  try {
    const response = await axiosInstance.delete("/api/kudo/delete", {
      data: {
        kudoId,
      },
    });
    if (response.status === 200) {
      return response.data.message;
    } else {
      throw new Error("Something went wrong!");
    }
  } catch (error: any) {
    const status = error?.response?.status;
    if (status >= 500 || !status) {
      Sentry.captureException(error);
    }
    throw new Error("Failed to delete Kudo.");
  }
};

export const pushNotification = async (formData: FormData) => {
  try {
    const response = await axiosInstance.post(
      "/api/jobs/send-announcement",
      formData
    );
    return response.data;
  } catch (error: any) {
    console.error("Error in pushNotification:", error);
    return {
      success: false,
      message:
        error?.response?.data?.message ||
        error?.message ||
        "Failed to send announcement.",
      error,
    };
  }
};
export const getValidationSchema = (
  recipients: Recipient[],
  countryCode: string
) =>
  Yup.object().shape({
    email: Yup.string()
      .trim()
      .email("Invalid email address")
      .test(
        "email-or-mobile",
        "Either phone or email is required",
        function (value) {
          const { mobile } = this.parent;
          return !!value || !!mobile || recipients.length > 0;
        }
      ),

    mobile: Yup.string()
      .test("valid-if-present", "Invalid phone number", function (value) {
        if (!value) return true; // If mobile is empty, skip validation
        const phoneNumber = parsePhoneNumberFromString(
          `+${countryCode}${value}`
        );
        return phoneNumber?.isValid() ?? false;
      })
      .test(
        "email-or-mobile",
        "Either phone or email is required",
        function (value) {
          const { email } = this.parent;
          return !!value || !!email || recipients.length > 0;
        }
      ),
  });

export const likeKudo = async (kudoId: string, createdAt: string) => {
  try {
    const response = await axiosInstance.post("/api/kudo/like", {
      kudoId,
      createdAt,
    });
    if (response.status === 200) {
      return response.data.message;
    } else {
      throw new Error("Something went wrong!");
    }
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to send Kudo.";
    console.log(errorMessage, "kudo like");
    throw new Error(errorMessage);
  }
};
