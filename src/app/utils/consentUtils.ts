import moment from "moment";
import adminDB from "@/app/lib/admin/instant";

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

export const getUserProfileDetails = async (userId: string) => {
  try {
    const userProfiles: any = await adminDB.query({
      $users: {
        $: {
          where: { id: userId },
        },
        user_profile: {
          $files: {},
        },
      },
    });
    if (userProfiles?.$users?.length) {
      return userProfiles.$users[0];
    }
    return null;
  } catch (error) {
    throw error;
  }
};

export const updateUserProfile = async (
  profileId: string,
  updateFields: Record<string, string>
) => {
  try {
    await adminDB.transact([
      adminDB.tx.user_profile[profileId].update(updateFields),
    ]);
  } catch (error) {
    throw error;
  }
};

export const updateConsent = async (
  userId: string,
  consentStatus: string,
  isFromProfile: boolean = false
) => {
  try {
    const now = moment().format("YYYY-MM-DD HH:mm");
    const updateFields = {
      consent_message_taken: consentStatus,
      consent_message_taken_at: moment().format("YYYY-MM-DD HH:mm:ss"),
    };

    const profile = await getUserProfileDetails(userId);
    const profileId = profile?.user_profile?.id;
    await updateUserProfile(profileId, updateFields);

    const expires =
      consentStatus === "yes"
        ? moment().add(1, "month").toDate()
        : moment().add(1, "day").toDate();

    setCookie("consent_message", consentStatus, expires);
    setCookie("consent_message_date", now, expires);

    return true;
  } catch (error) {
    throw error;
  }
};

export const shouldShowConsentModal = async (
  userId: string,
  currentDate: string = moment().format("YYYY-MM-DD HH:mm")
) => {
  const consentStatus = getCookie("consent_message");
  const consentDate = getCookie("consent_message_date");

  if (consentStatus === "yes" || consentStatus === "no") {
    return false;
  }

  if (consentStatus === "pending" && consentDate) {
    const cookieDate = moment(consentDate, "YYYY-MM-DD HH:mm");
    const expiryDate = cookieDate.add(1, "day");
    if (moment(currentDate, "YYYY-MM-DD HH:mm").isBefore(expiryDate)) {
      return false;
    }
  }

  try {
    const profile = await getUserProfileDetails(userId);
    const dbConsent = profile?.user_profile?.consent_message_taken;

    if (dbConsent === "yes" || dbConsent === "no") {
      return false;
    }

    return true;
  } catch (error) {
    return true;
  }
};
