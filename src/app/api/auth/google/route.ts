import { generateToken, getGoogleTokens, jsonResponse } from "@/helpers/loginHelper";
import { NextRequest } from "next/server";
import * as Sentry from "@sentry/nextjs";
import axios from "axios";
import moment from "moment";

const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";
export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();
    if (!code) return jsonResponse(400, "Missing auth code");
    const googleAuthData = await getGoogleTokens({
        code,
        redirect_uri: "postmessage",
        grant_type: "authorization_code",
      })

    if (!googleAuthData) return jsonResponse(400, "Missing auth token");

    const { access_token, refresh_token, expires_in } = googleAuthData;

    const userRes = await axios.get(GOOGLE_USERINFO_URL, {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    if (!userRes?.data) return jsonResponse(400, "No google user found!");

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";

    const { name, picture, email, email_verified } = userRes.data;
    if (!email_verified) {
      return jsonResponse(400, "Email not verified!");
    }
    const token = await generateToken(email, "","", name, picture, ip);
    return jsonResponse(200, "Login Successful!", {
      token,
      googleAuth: {
        code,
        access_token,
        refresh_token,
        expired_at: moment().add(expires_in, "s"),
      },
    });
  } catch (error: any) {
   const status = error?.response?.status || 500;
       if (status >= 500) {
         Sentry.captureException(error);
       }
       console.error("Error social login:", error);
       return jsonResponse(
         status,
         error?.response?.data.message || "Google login failed"
       );
  }
}
