import { cookies } from "next/headers";
import { authenticateRequest, jsonResponse } from "@/helpers/loginHelper";
import * as Sentry from "@sentry/nextjs";

export async function POST(request: Request) {
  try {
    // const user = await authenticateRequest(request);
    // if (!user) {
    //   return jsonResponse(401, "Unauthorized");
    // }

    const cookieStore = await cookies();

    cookieStore.set("auth_token", "", {
      maxAge: 0,
      path: "/",
    });

    // Clear consent_message cookie
    cookieStore.set("consent_message", "", {
      maxAge: 0,
      path: "/",
    });

    // Clear consent_message_date cookie
    cookieStore.set("consent_message_date", "", {
      maxAge: 0,
      path: "/",
    });

    // Clear download_modal_dismissed cookie
    cookieStore.set("download_modal_dismissed", "", {
      maxAge: 0,
      path: "/",
    });

    // Clear download_modal_date cookie
    cookieStore.set("download_modal_date", "", {
      maxAge: 0,
      path: "/",
    });

    return jsonResponse(200, "Logout successful");
  } catch (error: any) {
    Sentry.captureException(error);
    return jsonResponse(500, "Something went wrong.", { error: error.message });
  }
}
