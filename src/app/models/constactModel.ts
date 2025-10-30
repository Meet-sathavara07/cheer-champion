import * as Sentry from "@sentry/nextjs";
import axiosInstance from "../lib/axios";

export const contactUS = async (formData: any) => {
  try {
    return await axiosInstance.post("/api/contact", formData);
  } catch (error: any) {
    const status = error?.response?.status;
    if (status >= 500 || !status) {
      Sentry.captureException(error);
    }
    throw new Error(error.response?.data?.message || "Failed to update profile.");
  }
};
