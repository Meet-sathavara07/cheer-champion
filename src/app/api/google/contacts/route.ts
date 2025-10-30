import { getGoogleTokens, jsonResponse } from "@/helpers/loginHelper";
import { NextRequest } from "next/server";
import * as Sentry from "@sentry/nextjs";
import axiosInstance from "@/app/lib/axios";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import moment from "moment";
const EXTERNAL_API_URL =
  "https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses,phoneNumbers";
export async function POST(request: NextRequest) {
  try {
    const { access_token, refresh_token, expired_at } = await request.json();
    if (!access_token) {
      return jsonResponse(400, "Unauthorized");
    }
    let latestAccessToken = access_token;
    let expiredAt = expired_at;
    const isAccessTokenExpired = moment().isAfter(expiredAt);
    if (isAccessTokenExpired) {
      const googleAuthData = await getGoogleTokens({
        refresh_token: refresh_token,
        grant_type: "refresh_token",
      });
      latestAccessToken = googleAuthData.access_token;
      expiredAt = moment().add(googleAuthData.expires_in, "s");
    }

    if (!latestAccessToken) return jsonResponse(400, "Missing auth token");

    const { data } = await axiosInstance.get(EXTERNAL_API_URL, {
      headers: {
        Authorization: `Bearer ${latestAccessToken}`,
      },
    });
    const contacts = data?.connections?.length
      ? data.connections
          .filter(
            (contact: any) =>
              (contact?.emailAddresses?.length &&
                contact.emailAddresses[0]?.value) ||
              (contact?.phoneNumbers?.length && contact.phoneNumbers[0]?.value)
          )
          .map((contact: any) => {
            const canonical = contact?.phoneNumbers?.[0]?.canonicalForm || "";
            let countryCode = "";
            let phoneNumber = "";

            if (canonical) {
              const phoneObj = parsePhoneNumberFromString(canonical);
              if (phoneObj) {
                countryCode = phoneObj.countryCallingCode;
                phoneNumber = phoneObj.nationalNumber;
              }
            }

            return {
              resourceName: contact.resourceName,
              name: contact.names?.[0]?.displayName || "",
              emailAddress: contact.emailAddresses?.[0]?.value || "",
              
              // Phone values
              phoneNumberWithCode: canonical,
              countryCode,
              phoneNumber,
            };
          })
      : [];
    return jsonResponse(200, "", {
      contacts,
      access_token: latestAccessToken,
      expired_at: expiredAt,
    });
  } catch (error: any) {
    const status = error?.response?.status || 500;
    if (status >= 500) {
      Sentry.captureException(error);
    }
    console.error("Error get google contact:", error);
    return jsonResponse(
      status,
      error?.response?.data.message || "Internal server error"
    );
  }
}
