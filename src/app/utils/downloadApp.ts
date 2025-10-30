import moment from "moment";

export const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") {
    return null;
  }
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() || null;
  }
  return null;
};

export const setCookie = (name: string, value: string, expires: Date) => {
  if (typeof document === "undefined") {
    return;
  }
  document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/`;
};

export const setDownloadModalCookie = async () => {
  try {
    const now = moment().format("YYYY-MM-DD HH:mm");
    const expires = moment().add(1, "week").toDate();

    setCookie("download_modal_dismissed", "true", expires);
    setCookie("download_modal_date", now, expires);
  } catch (error) {
    throw error;
  }
};

export const shouldShowDownloadModal = async () => {
  const dismissed = getCookie("download_modal_dismissed");
  const modalDate = getCookie("download_modal_date");

  if (dismissed === "true" && modalDate) {
    const cookieDate = moment(modalDate, "YYYY-MM-DD HH:mm");
    const expiryDate = cookieDate.add(1, "week");

    if (moment().isBefore(expiryDate)) {
      return false;
    }
  }

  return true;
};
