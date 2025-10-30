"use client";

import * as Sentry from "@sentry/nextjs";
import axios from "axios";

export const sendOTP = async (
  identifier: string,
  countryCode: string,
  type: string
) => {
  try {
    const response = await axios.post("/api/send-otp", {
      identifier,
      type,
      countryCode,
    });
    return response.data;
  } catch (error: any) {
    const status = error?.response?.status;
    if (status >= 500 || !status) {
      Sentry.captureException(error);
    }
    throw error.response?.data?.message || "Error on sending OTP";
  }
};

export const verifyOTP = async (
  otp: string,
  identifier: string,
  countryCode: string,
  countryIso2: string,
  type: string
) => {
  try {
    const response = await axios.post("/api/verify-otp", {
      otp,
      identifier,
      countryCode,
      countryIso2,
      type,
    });
    return response.data;
  } catch (error: any) {
    // const status = error?.response?.status;
    // if (status >= 500 || !status) {
    //   Sentry.captureException(error);
    // }
    throw new Error(error.response?.data?.message || "OTP verification failed");
  }
};

export const socialLogin = async (code: string) => {
  try {
    return await axios.post("/api/auth/google", {
      code: code,
    });
    // console.log(data,"social data");
    // if (data.user.email_verified) {
    //   const googleFile = await fetchGoogleImageAsFile(data.user.picture);
    //   const formData = new FormData();
    //   formData.append("googleImage", googleFile);
    //   formData.append("email", data.user.email);
    //   formData.append("name", data.user.name);
    //   return await axiosInstance.post("/api/auth/social-login", formData);
    // }
  } catch (error: any) {
    // const status = error?.response?.status;
    // if (status >= 500 || !status) {
    //   Sentry.captureException(error);
    // }
    console.error("Social login error:", error);
    throw new Error(error.response?.data?.message || "Social login failed");
  }
};

export const getGoogleContacts = async ({
  access_token,
  refresh_token,
  expired_at,
}: any) => {
  try {
    const { data } = await axios.post("/api/google/contacts", {
      access_token,
      refresh_token,
      expired_at,
    });
    return data;
  } catch (error: any) {
    // const status = error?.response?.status;
    // if (status >= 500 || !status) {
    //   Sentry.captureException(error);
    // }
    console.error("get google contacts error:", error);
  }
};

export const getLoggedInUser = async () => {
  try {
    const response = await axios.get("/api/auth/me");
    return response.data;
  } catch (error: any) {
    const status = error?.response?.status || 500;
    if (status >= 500) {
      Sentry.captureException(error);
      throw new Error(
        error.response?.data?.message || "Error on get loggedIn user"
      );
    }
  }
};
