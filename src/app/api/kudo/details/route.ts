import adminDB from "@/app/lib/admin/instant";
import { jsonResponse } from "@/helpers/loginHelper";
import { NextRequest } from "next/server";
import * as Sentry from "@sentry/nextjs";

export async function GET(request: NextRequest) {
  try {
    const kudoId = request.nextUrl.searchParams.get("id");

    if (!kudoId) {
      return jsonResponse(404, "Kudo ID is required.");
    }

    const data = await adminDB.query({
      kudos: {
        $: {
          where: { id: kudoId },
        },
        kudo_receiver: {
          $users: {
            user_profile: {},
          },
        },
        $users: {
          user_profile: {
            $files: {},
          },
        },
        kudo_likes: { $users: {} },
      },
    });

    if (!data?.kudos?.length) {
      return jsonResponse(404, "Kudo not found");
    }

    const kudo = data.kudos[0];

    return jsonResponse(200, "Get Kudo Details Successfully", {
      kudo: kudo,
    });
  } catch (error: any) {
   const status = error?.response?.status || 500;
    if (status >= 500) {
      Sentry.captureException(error);
    }
    console.error("Error fetching kudo:", error);
    return jsonResponse(500, "Something went wrong.", { error: error.message });
  }
}
