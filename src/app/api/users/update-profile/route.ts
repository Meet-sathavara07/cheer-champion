import { NextRequest } from "next/server";
import {
  authenticateRequest,
  getUserProfile,
  jsonResponse,
} from "@/helpers/loginHelper";
import adminDB from "@/app/lib/admin/instant";
import {
  // createUniqueSlug,
  mergeAccount,
  // getUserProfileImage,
  updateUserProfile,
  uploadImage,
} from "@/app/actions/profile";
import { defaultProfileImageIDs } from "@/helpers/profileImages";
import * as Sentry from "@sentry/nextjs";
import moment from "moment";

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);

    if (!user) {
      return jsonResponse(401, "Unauthorized");
    }

    const formData = await request.formData();
    const name: any = formData.get("name");
    const bio: any = formData.get("bio");
    const mobile1: any = formData.get("mobile1");
    const mobile1_country_code: any = formData.get("mobile1_country_code");
    const mobile1_country_iso2: any = formData.get("mobile1_country_iso2");
    const email: any = formData.get("email");
    const profileImage: any = formData.get("profileImage");
    const pushToken: any = formData.get("push_token");
    const timeZone: any = formData.get("timezone");
    const consent_message_taken: any = formData.get("consent_message_taken");
    const consent_message_taken_at: any = formData.get("consent_message_taken_at");
    const mergeUserID: any = formData.get("userExistID");
    const webPushToken: any = formData.get("web_push_token");

    if (profileImage && profileImage.size > 3 * 1024 * 1024) {
      return jsonResponse(400, "Profile image must be smaller than 3MB.");
    }
    if (profileImage && (typeof profileImage.name !== "string" || typeof profileImage.arrayBuffer !== "function")
    ) {
      return jsonResponse(400, "Invalid Profile image.");
    }

    // Validate OTP
    const userProfile: any = await getUserProfile(user.id);

    if (!userProfile) return jsonResponse(404, "User profile not found.");
    if (mergeUserID) {
      await mergeAccount(userProfile, mergeUserID);
    }
    if (profileImage) {
      try {
        const fileId = await uploadImage(profileImage, user.id);
        if (
          defaultProfileImageIDs.includes(userProfile?.$files?.id) ||
          !userProfile?.$files?.id
        ) {
          if (!userProfile?.$files?.id) {
            // this condition is temporary for old user
            adminDB.transact(
              adminDB.tx.user_profile[userProfile.id].link({ $files: fileId })
            );
          } else {
            // this is permanently
            adminDB.transact(
              adminDB.tx.user_profile[userProfile.id]
                .unlink({ $files: userProfile.$files.id })
                .link({ $files: fileId })
            );
          }
        }
      } catch (err) {
        console.error("Image upload failed", err);
        Sentry.captureException(err);
        return jsonResponse(500, "Failed to upload profile image.");
      }
    }

    const updateFields: Record<string, string> = {};

    if (name) updateFields.name = name;
    if (bio) updateFields.bio = bio;
    if (mobile1) updateFields.mobile1 = mobile1;
    if (mobile1_country_code)
      updateFields.mobile1_country_code = mobile1_country_code;
    if (mobile1_country_iso2)
      updateFields.mobile1_country_iso2 = mobile1_country_iso2;
    if (pushToken)
      updateFields.push_token = pushToken;
    if (timeZone)
      updateFields.timezone = timeZone;
    if (consent_message_taken)
      updateFields.consent_message_taken = consent_message_taken;
    if (consent_message_taken_at)
      updateFields.consent_message_taken_at = consent_message_taken_at;
    if (webPushToken)
      updateFields.web_push_token = webPushToken;

    if (Object.keys(updateFields).length > 0) {
      updateFields.updated_at = moment().format("YYYY-MM-DD HH:mm:ss");
      await updateUserProfile(userProfile.id, updateFields);
    }
    
    if (email) {
      await adminDB.transact([
        adminDB.tx.$users[user.id].update({ email: email.toLowerCase() }),
      ]);
    }
    // Remove timezone and push_token from updateFields before returning
    const { timezone, push_token,web_push_token, ...filteredFields } = updateFields;

    if (mergeUserID) {
      return jsonResponse(
        200,
        "Accounts Merged and Profile updated successfully.",
        {
          success: true,
          profile: filteredFields,
        }
      );
    }

    if (Object.keys(updateFields).length > 0 || email || profileImage) {
      return jsonResponse(200, "Profile updated successfully.", {
        success: true,
        profile: filteredFields,
      });
    }

    return jsonResponse(200, "No changes to update.");
  } catch (error: any) {
    const status = error?.response?.status || 500;
    if (status >= 500) {
      Sentry.captureException(error);
    }
    console.error("Error update profile:", error);
    return jsonResponse(
      status,
      error?.response?.data.message || "Internal server error"
    );
  }
}
