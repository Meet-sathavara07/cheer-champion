import { NextRequest } from "next/server";
import { jsonResponse } from "@/helpers/loginHelper";
import adminDB from "@/app/lib/admin/instant";
import * as Sentry from "@sentry/nextjs";
import moment from "moment";
import { updateUserProfile } from "@/app/actions/profile";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, consent } = body;

    if (!userId || !consent) {
      return jsonResponse(400, "User ID and consent are required.");
    }
    if (!["yes", "no"].includes(consent)) {
      return jsonResponse(400, "Consent must be 'yes' or 'no'.");
    }

    const userData = await adminDB.query({
      $users: {
        $: {
          where: { id: userId },
        },
        user_profile: {},
      },
    });

    if (!userData?.$users?.length) {
      return jsonResponse(404, "User not found");
    }

    const profileId = userData.$users[0].user_profile?.id;
    if (!profileId) {
      return jsonResponse(404, "User profile not found");
    }

    const updateFields = {
      consent_message_taken: consent,
      consent_message_taken_at: moment().format("YYYY-MM-DD HH:mm:ss"),
    };

    await updateUserProfile(profileId, updateFields);

    return jsonResponse(200, "Consent updated successfully", {
      success: true,
      consent,
    });
  } catch (error: any) {
    console.error("DEBUG: Error in /users/consent:", error);
    const status = error?.response?.status || 500;
    if (status >= 500) {
      Sentry.captureException(error);
    }
    return jsonResponse(status, error?.message || "Failed to update consent");
  }
}
