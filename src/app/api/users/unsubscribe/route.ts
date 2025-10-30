import adminDB from "@/app/lib/admin/instant";
import { jsonResponse } from "@/helpers/loginHelper";
import { NextRequest } from "next/server";
import * as Sentry from "@sentry/nextjs";

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("id");

    if (!userId) {
      console.log("DEBUG: No userId provided");
      return jsonResponse(404, "User ID is required.");
    }

    const data = await adminDB.query({
      $users: {
        $: { where: { id: userId } },
        user_profile: {},
      },
    });


    if (!data?.$users?.length) {
      return jsonResponse(404, "User not found");
    }

    const user = data.$users[0];

    const responseUser = {
      id: user.id,
      name: user.user_profile?.name,
      email: user.email,
      consent_message_taken: user.user_profile?.consent_message_taken,
      mobile1_country_code: user.user_profile?.mobile1_country_code,
      mobile1: user.user_profile?.mobile1,
    };

    return jsonResponse(200, "Get User Details Successfully", {
      user: responseUser,
    });
  } catch (error: any) {
    const status = error?.response?.status || 500;
    if (status >= 500) {
      Sentry.captureException(error);
    }
    return jsonResponse(500, "Something went wrong.", { error: error.message });
  }
}
