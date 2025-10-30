"use client";
import * as Sentry from "@sentry/nextjs";
import axiosInstance from "../lib/axios";

export interface Recipient {
  email: string;
  mobile: string;
  countryCode: string;
  countryIso2: string;
}

export interface Kudo {
  id: string;
  kudo: string;
  $users?: any[];
  kudo_receiver?: any[];
  createdAt?: string;
}

export const kudoQueries = {
  given: (userID: string) => ({
    kudos: {
      $: {
        where: { $users: userID },
        order: { serverCreatedAt: "desc" },
        first: 4,
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
    },
  }),
  received: (userID: string) => ({
    kudos: {
      $: {
        where: { "kudo_receiver.$users": userID },
        order: { serverCreatedAt: "desc" },
        first: 4,
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
    },
  }),
  userProfile: (userID: string) => ({
    user_profile: {
      $: { where: { "$users.id": userID } },
      $users: {},
      $files: {},
    },
  }),
  count: (userID: string) => ({
    $users: {
      $: {
        where: { id: userID },
      },
      kudos: {},
      kudo_receiver: {},
    },
  }),
};

export const updateUserProfile = async (formData: any) => {
  try {
    return await axiosInstance.post("/api/users/update-profile", formData);
  } catch (error: any) {
    const status = error?.response?.status;
    if (status >= 500 || !status) {
      Sentry.captureException(error);
    }
    if (!(error instanceof Error)) {
      throw new Error(
        typeof error === "string" ? error : JSON.stringify(error)
      );
    }
    throw error;
  }
};
