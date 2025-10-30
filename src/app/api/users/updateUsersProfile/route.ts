import { NextRequest, NextResponse } from "next/server";
import adminDB from "@/app/lib/admin/instant";
import * as Sentry from "@sentry/nextjs";

export async function POST(request:NextRequest) {
  try {
    const { userId, newEmail, newMobile, verified } = await request.json();

    if (!userId || !verified) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Fetch user profile
    const userProfileQuery:any = {
      user_profile: {
        where: { id: userId },
      },
    };

    const userProfileData = await adminDB.query(userProfileQuery);
    const userProfile:any = userProfileData.user_profile[0];

    if (!userProfile) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    // const updateFields:any = {}; 

    // if (newEmail) {
    //   const emailCheckQuery:any = {
    //     $users: { where: { email: newEmail } },
    //   };

    //   const existingEmail = await adminDB.query(emailCheckQuery);
      
    //   if (!existingEmail.$users?.length) {
    //     console.log("Email exists in $users, adding to profile");
    //   } else {
    //     updateFields.email1 = newEmail;
    //   }
    // }

    // if (newMobile) {
    //   const existingMobiles = [userProfile.mobile1, userProfile.mobile2, userProfile.mobile3];
    //   if (!existingMobiles.includes(newMobile)) {
    //     if (!userProfile.mobile1) updateFields.mobile1 = newMobile;
    //     else if (!userProfile.mobile2) updateFields.mobile2 = newMobile;
    //     else if (!userProfile.mobile3) updateFields.mobile3 = newMobile;
    //   }
    // }

    // if (Object.keys(updateFields).length > 0) {
    //   const updateProfileQuery = {
    //     user_profile: {
    //       where: { id: userId },
    //       update: updateFields,
    //     },
    //   };

    //   await adminDB.mutate(updateProfileQuery);
    //   return NextResponse.json({ success: true, message: "Profile updated successfully" }, { status: 200 });
    // }

    return NextResponse.json({ success: false, message: "No updates were made" }, { status: 400 });

  } catch (error) {
    Sentry.captureException(error);
    console.error("Error updating profile:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}