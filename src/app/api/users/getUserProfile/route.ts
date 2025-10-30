// import { createMessage } from "@/app/lib/services";
import { NextRequest } from "next/server";
import adminDB from "@/app/lib/admin/instant";
import { jsonResponse } from "@/helpers/loginHelper";
import * as Sentry from "@sentry/nextjs";

export async function GET(
  request: NextRequest
) {
  try {
    const userId = request.nextUrl.searchParams.get("id");

    if (!userId) {
      return jsonResponse(400, "User ID is required.");
    }

    // Database query to fetch user profile
    const query = {
      user_profile: {
        $: {
          where: {
            "$users.id": userId,
          },
        },
      },
    };

    const data = await adminDB.query(query);

    if (!data?.user_profile?.length) {
      return jsonResponse(404, "User not found.");
    }

     return jsonResponse(200, "User profile retrieved successfully.", {
      user: data.user_profile[0],
    });

  } catch (error:any) {
    Sentry.captureException(error);
    return jsonResponse(500, "Something went wrong.", { error: error.message });
  }
}
