import * as Sentry from "@sentry/nextjs";
// import axiosInstance from "../lib/axios";

export const noKudoSentReminder = async () => {
  try {
    // return await axiosInstance.get("/api/jobs/no-kudo-sent");
   return await fetch("/api/jobs/no-kudo-sent");
  } catch (error: any) {
    const status = error?.response?.status;
    if (status >= 500 || !status) {
      Sentry.captureException(error);
    }
    throw new Error(error.response?.data?.message || "send reminder failed");
  }
};
export const noRespondedForWeekReminder = async () => {
  try {
   return await fetch("/api/jobs/remind-inactive-users");
  } catch (error: any) {
    const status = error?.response?.status;
    if (status >= 500 || !status) {
      Sentry.captureException(error);
    }
    throw new Error(error.response?.data?.message || "send reminder failed");
  }
};

export const noKudoSentLastWeek = async () => {
  try {
    return await fetch("/api/jobs/no-kudo-sent-last-week");
  } catch (error: any) {
    console.log(error,"error")
    // throw new Error(error.response?.data?.message || "send reminder failed");
  }
};
export const topActiveKudoUsers = async () => {
  try {
    return await fetch("/api/jobs/top-active-kudo-users");
  } catch (error: any) {
    console.log(error,"error")
    // throw new Error(error.response?.data?.message || "send reminder failed");
  }
};