import { NextRequest } from "next/server";
import {
  clearOTPHandler,
  generateToken,
  jsonResponse,
  validateOTP,
} from "@/helpers/loginHelper";
import { checkUserAccountExist } from "@/app/actions/users";
import * as Sentry from "@sentry/nextjs";

const testAccount = ["cp@cheerchampion.com", "raj.mansuri@quantuminfoway.com"];

export async function POST(request: NextRequest) {
  try {
    const { identifier, otp, countryCode,countryIso2, type } = await request.json();

    if (!otp) {
      return jsonResponse(400, "OTP is required.");
    }
    const { message, isValid,status }: any = await validateOTP(
      otp,
      identifier,
      type,
      countryCode
    );
    if (!isValid && !testAccount.includes(identifier.toLowerCase())) return jsonResponse(status, message);
    if (type === "login") {
      const ip =
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
      const token = await generateToken(identifier, countryCode,countryIso2, "", null, ip);
      await clearOTPHandler(identifier, type, countryCode);
      return jsonResponse(200, "OTP Verified Successfully!", {
        token,
      });
    } else {
      const userExists = await checkUserAccountExist(identifier, countryCode);
      // if (userExists) {
      //   return jsonResponse(400, `${loginMethod} already exists.`);
      // }
      await clearOTPHandler(identifier, type, countryCode);
      return jsonResponse(200, "OTP Verified Successfully!", {
        user: userExists,
      });
    }
  } catch (error: any) {
     const status = error?.response?.status || 500;
       if (status >= 500) {
         Sentry.captureException(error);
       }
       console.error(error,"error while verify otp")
       return jsonResponse(
         status,
         error?.response?.data.message || "Something went wrong"
       );
  }
}
