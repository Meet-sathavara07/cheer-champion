import "server-only";
import { uploadGoogleProfileImage } from "@/app/actions/profile";
import adminDB from "@/app/lib/admin/instant";
import { id } from "@instantdb/admin";
import moment from "moment";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { defaultProfileImageIDs } from "./profileImages";
import { extractNamePrompt } from "./prompts";
import { openai } from "@/app/lib/openai";
import axios from "axios";
import { checkUserAccountExist } from "@/app/actions/users";

interface Profile {
  [key: string]: any;
  created_at: string;
  last_login_ip?: string;
  name: string;       
  // slug: string;
  // photo_url?: string;  
  updated_at: string;
  bio?: string;     
  logins?: number;
  last_login_at?: string;
  mobile1?: string; // Mobile number
  mobile1_country_code?: string; // Country code for mobile 
  mobile1_country_iso2?: string; // ISO2 code for mobile country  
}

export const createTokenHandler = async (
  identifier: string,
  userExists: string,
  countryCode: string
) => {
  let email = userExists;
  if (!email) {
    if (countryCode) {
      email = `${countryCode}${identifier}@cheerchampion.com`; // Use mobile number as a unique email
    } else {
      email = identifier.toLowerCase() as string; // If email login, use identifier directly
    }
  }

  const token = await adminDB.auth.createToken(email);
  return token;
};

export const getGenderFromName = async (name: string) => {
  try {
    const response = await axios.get(`https://api.genderize.io`, {
      params: { name },
    });
    const { gender, probability } = response.data;
    if (probability > 0.8) return gender; // "male", "female", or null
    return "unknown";
  } catch (error) {
    console.error("Gender API error:", error);
    return "";
  }
};

export const extractNameFromMessage = async (message: string) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: extractNamePrompt(message) }],
    });
    if (
      completion.choices[0]?.message?.content &&
      completion.choices[0]?.message?.content !== "No name found"
    ) {
      return completion.choices[0].message.content;
    }
    return "";
  } catch (error: any) {
    console.log(error, "error");
    return "";
  } finally {
    clearTimeout(timeout);
  }
};

export const createInitProfile = async (
  token: string,
  identifier: string,
  countryCode: string,
  countryIso2: string,
  name: string = "",
  googleImageURL: string = "",
  IP: string = "",
  gender: string = "",
  logins: number = 1
) => {
  try {
    const user: any = await adminDB.auth.getUser({ refresh_token: token });
    const profileId = id();
    let addMobile = {};
    if (countryCode) {
      addMobile = {
        mobile1: identifier,
        mobile1_country_code: countryCode,
        mobile1_country_iso2: countryIso2,
      }; // Store mobile & country code separately
    }
    const profileName = name
      ? name
      : countryCode
      ? `${countryCode}${identifier}`.slice(0, 7)
      : identifier.slice(0, 7);
      
    // const uniqueSlug = await createUniqueSlug(profileName);

    const profile: Profile = {
      created_at: moment(user.created_at).format("YYYY-MM-DD HH:mm:ss"),
      last_login_ip: IP,
      name: profileName,
      // slug: uniqueSlug,
      // photo_url: profileImage,
      updated_at: moment().format("YYYY-MM-DD HH:mm:ss"),
      bio: "",
      consent_message_taken: "pending",
      ...addMobile, // Add mobile info if available
    };
    if (logins) {
      profile.last_login_at = moment().format("YYYY-MM-DD HH:mm:ss");
      profile.logins = logins;
    }

    let randomIndex = Math.floor(Math.random() * 7);
    switch (gender) {
      case "male":
        randomIndex = Math.floor(Math.random() * 3) + 3;
        break;
      case "female":
        randomIndex = Math.floor(Math.random() * 2);
        break;
      case "unknown":
        randomIndex = 2;
        break;
    }

    const defaultFileId = defaultProfileImageIDs[randomIndex];

    // ✅ Fast transaction: create profile + link default image
    const transaction = [
      adminDB.tx.user_profile[profileId]
        .update(profile)
        .link({ $users: user.id })
        .link({ $files: defaultFileId }),
    ];
    await adminDB.transact(transaction);

    // 👇 Defer slow image upload (background)
    if (googleImageURL) {
      try {
        const fileId = await uploadGoogleProfileImage(googleImageURL, user.id);

        // Update profile photo in background
        await adminDB.transact([
          adminDB.tx.user_profile[profileId].unlink({ $files: defaultFileId }),
          adminDB.tx.user_profile[profileId].link({ $files: fileId }),
        ]);
      } catch (imageError) {
        console.error(
          "Image upload failed, continuing without it:",
          imageError
        );
      }
    }
    return user;
  } catch (error) {
    console.log(JSON.stringify(error, null, 2), "create profile");
    throw error;
  }
};
export const updateInitProfile = async (userExistID: string, IP: string) => {
  try {
    const userProfile: any = await getUserProfile(userExistID);
    const updateProfile = {
      last_login_at: moment().format("YYYY-MM-DD HH:mm:ss"),
      last_login_ip: IP,
      logins: (userProfile.logins || 0) + 1,
    };

    const transaction = [
      adminDB.tx.user_profile[userProfile.id].update(updateProfile),
    ];
    await adminDB.transact(transaction);
  } catch (error) {
    console.log(JSON.stringify(error, null, 2), "update profile");
    throw error;
  }
};

export const generateToken = async (
  identifier: string,
  countryCode: string,
  countryIso2: string,
  name: string = "",
  googleImageURL: any = null,
  IP: string
) => {
  try {
    const userExists = await checkUserAccountExist(identifier, countryCode);
    const cookieStore = await cookies();
    if (userExists) {
      // const user = await adminDB.auth.getUser({ id: userExistID });
      const token = await createTokenHandler(
        identifier,
        userExists.email,
        countryCode
      );
      cookieStore.set("auth_token", token, {
        // httpOnly: true,
        // secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 365 * 24 * 60 * 60, // 7 days
      });

      await updateInitProfile(userExists.id, IP);
      return token;
    } else {
      const token = await createTokenHandler(identifier, "", countryCode);
      cookieStore.set("auth_token", token, {
        // httpOnly: true,
        // secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 7 * 24 * 60 * 60, // 7 days
      });
      await createInitProfile(
        token,
        identifier,
        countryCode,
        countryIso2,
        name,
        googleImageURL,
        IP,
      );
      return token;
    }
  } catch (error) {
    console.error(
      JSON.stringify(error, null, 2),
      "generate Token error",
      error
    );
    throw error;
  }
};

export const clearOTPHandler = async (
  identifier: string,
  OTPType: string,
  countryCode: string
) => {
  const otps = await fetchOTP(identifier, OTPType, countryCode);
  const deleteTransactions = otps.map((entity: any) =>
    adminDB.tx.otps[entity.id].delete()
  );
  await adminDB.transact(deleteTransactions);
};
export const saveOTPHandler = async (
  identifier: string,
  otp: string,
  OTPType: string,
  countryCode: string
) => {
  try {
    const otpTime = moment().add(5, "minutes").format("YYYY-MM-DD HH:mm:ss"); // 5 min expiry
    // const nextResendTime = moment()
    //   .add(5, "minutes")
    //   .format("YYYY-MM-DD HH:mm:ss"); // 30s cooldown
    const loginMethod = countryCode ? "mobile" : "email";
    const OTPID = id();
    const [storedOTP]:any[] = await fetchOTP(identifier, OTPType, countryCode);
    const otpUpdate: any = {
      created_at: moment().format("YYYY-MM-DD HH:mm:ss"),
      otp,
      otp_attempted: 1,
      otp_resend: otpTime,
      expired_at: otpTime,
      otp_type: OTPType,
      [loginMethod]: identifier,
      country_code: countryCode,
    };
    let userOTP;
    if (storedOTP) {
      const isBlocked =
        storedOTP.blocked_until && moment().isBefore(storedOTP.blocked_until);
      const isBlockExpired =
        storedOTP.blocked_until && moment().isAfter(storedOTP.blocked_until as string);
      if (isBlocked) {
        throw "Too many attempts. Try again later.";
      }
      if (isBlockExpired) {
        otpUpdate.otp_attempted = 1;
        otpUpdate.blocked_until = null;
      } else {
        otpUpdate.otp_attempted = storedOTP.otp_attempted + 1;
      }
      if (otpUpdate.otp_attempted >= 5) {
        otpUpdate.blocked_until = moment()
          .add(1, "hour")
          .format("YYYY-MM-DD HH:mm:ss");
      }
      userOTP = adminDB.tx.otps[storedOTP.id].update(otpUpdate);
    } else {
      userOTP = adminDB.tx.otps[OTPID].update(otpUpdate);
    }
    await adminDB.transact(userOTP);
  } catch (error) {
    console.log(error, "error");
    throw error;
  }
};

export const fetchOTP = async (
  identifier: string,
  OTPType: string,
  countryCode: string
) => {
  const data = await adminDB.query({
    otps: {
      $: {
        where: countryCode
          ? {
              otp_type: OTPType,
              country_code: countryCode,
              mobile: identifier,
            }
          : {
              otp_type: OTPType,
              email: identifier,
            },
        order: {
          serverCreatedAt: "desc",
        },
      },
    },
  });
  if (data?.otps?.length) {
    return data.otps;
  }
  return [];
};

export const generateOTP = async () => {
  if (process.env.NODE_ENV === "production") {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    return otp;
  }
  return "111111";
};

export const jsonResponse = async (
  status: number,
  message: string,
  data: object = {}
) => {
  return NextResponse.json({ message, ...data }, { status });
};

export const validateOTP = async (
  otp: string,
  identifier: string,
  OTPType: string,
  countryCode: string
) => {
  try {
    const [storedOTP] = await fetchOTP(identifier, OTPType, countryCode);
    if (
      !storedOTP ||
      !storedOTP.otp ||
      moment().isAfter(storedOTP.expired_at as string)
    ) {
      await clearOTPHandler(identifier, OTPType, countryCode);
      return { isValid: false, message: "OTP is expired.", status: "410" };
    }
    return {
      isValid: storedOTP.otp === otp,
      message: "OTP is invalid.",
      status: "400",
    };
  } catch (error) {
    console.error("OTP validation error:", error);
    throw error;
  }
};

// export async function authenticateRequest() {
//   const cookieStore = await cookies();
//   const token = cookieStore.get("auth_token")?.value || "";

//   if (!token) {
//     return null;
//   }

//   return await adminDB.auth.verifyToken(token);
// }

export async function authenticateRequest(request: Request) {
  const cookieStore = await cookies();
  let token = cookieStore.get("auth_token")?.value || "";
  if (!token) {
    // check token from header for mobile app
    token = request.headers.get("token") || "";
  }
  if (!token) {
    return null;
  }
  try {
    return await adminDB.auth.verifyToken(token);
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

export async function getUserProfile(userId: string) {
  try {
    const query = {
      user_profile: {
        $: { where: { "$users.id": userId } },
        $users: {},
        $files: {},
      },
    };
    const data = await adminDB.query(query);
    if (data.user_profile?.length) {
      return data.user_profile[0];
    }
    return null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
}

export const getGoogleTokens = async (requestData: any) => {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
  if (!clientId || !clientSecret) {
    throw new Error(
      "Google client ID or secret is not set in environment variables."
    );
  }

  // console.log(refresh_token, "refresh_token 222");
  try {
    const response = await axios.post(
      GOOGLE_TOKEN_URL,
      new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        ...requestData,
      }),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );
    return response.data;
  } catch (error: any) {
    console.log(error, "error");
  }
};
