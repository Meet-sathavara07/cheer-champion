import { NextRequest } from "next/server";
import {
  generateOTP,
  jsonResponse,
  saveOTPHandler,
} from "@/helpers/loginHelper";
import { sendOtpEmail } from "@/app/lib/services/googleMail";
import { sendOtpByMSG91 } from "@/app/lib/services/aisensyServices";
import * as Sentry from "@sentry/nextjs";

export async function POST(request: NextRequest) {
  try {
    const { identifier, type, countryCode } = await request.json();
    if (!identifier || !type) {
      return jsonResponse(400, "Identifier and OTP type are required.");
    }

    // if (type === "verify") {
    //   const userExists = await checkUserAccountExist(identifier, countryCode);
    //   if (userExists) {
    //     return jsonResponse(400, `${loginMethod} already exists.`);
    //   }
    // }

    // will generate OTP here
    const otp = await generateOTP();
    await saveOTPHandler(identifier, otp, type, countryCode);
    if (countryCode) {
      const isProduction = process.env.NODE_ENV === "production";
      if (isProduction) {
        await sendOtpByMSG91(identifier, otp, countryCode);
      }
    } else {
      await sendOtpEmail(identifier, otp);
    }

    return jsonResponse(
      200,
      `OTP sent successfully to your ${countryCode ? "WhatsApp No." : "email"}!`
    );
  } catch (error: any) {
    if (error === "Too many attempts. Try again later.") {
      return jsonResponse(429, error);
    }
    const status = error?.response?.status || 500;
    if (status >= 500) {
      Sentry.captureException(error);
    }
    return jsonResponse(
      status,
      error?.response?.data?.message || "Something went wrong"
    );
  }
}
