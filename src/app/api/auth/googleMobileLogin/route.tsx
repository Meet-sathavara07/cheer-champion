import {
  generateToken,
  jsonResponse,
} from "@/helpers/loginHelper";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { code, userData } = await request.json();
    if (!code) return jsonResponse(400, "Missing auth code");

    if (!userData) return jsonResponse(400, "No google user found!");

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";

    const { name, photo, email } = userData;
    const token = await generateToken(email, "", "", name, photo, ip);
    return jsonResponse(200, "Login Successful!", {
      token,
    });
  } catch (error: any) {
    const status = error?.response?.status || 500;
    console.error("Error social login:", error);
    return jsonResponse(
      status,
      error?.response?.data.message || "Google login failed"
    );
  }
}
