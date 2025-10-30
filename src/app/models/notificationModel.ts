// import axiosInstance from "../lib/axios";


export const notifyUser = async () => {
  try {
    return await fetch("/api/jobs/daily-push-notification");
  } catch (error: any) {
   console.log(error,"send reminder failed");
  }
};
export const webNotifyUser = async () => {
  try {
    return await fetch("/api/jobs/check-web-push-notification");
  } catch (error: any) {
    // const status = error?.response?.status;
    // if (status >= 500 || !status) {
    //   Sentry.captureException(error);
    // }
    throw new Error(error.response?.data?.message || "send reminder failed");
  }
};
export const monthlyTopKudoSender = async () => {
  try {
    return await fetch("/api/jobs/top-kudo-sender");
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "send reminder failed");
  }
};