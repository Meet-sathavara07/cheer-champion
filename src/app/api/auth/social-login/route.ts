import { NextRequest } from "next/server";
import { generateToken, jsonResponse } from "@/helpers/loginHelper";
import * as Sentry from "@sentry/nextjs";
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const name: any = formData.get("name");
    const email: any = formData.get("email");
    const googleImage: any = formData.get("googleImage");
    if (!email) {
      return jsonResponse(400, "Email is required.");
    }
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
    const token = await generateToken(email, "","", name, googleImage, ip);
    return jsonResponse(200, "Login Successful!", { token });
  } catch (error: any) {
    const status = error?.response?.status || 500;
    if (status >= 500) {
      Sentry.captureException(error);
    }
    console.error("Error social login:", error);
    return jsonResponse(
      status,
      error?.response?.data.message || "Internal server error"
    );
  }
}
