"use client";
import * as Sentry from "@sentry/nextjs";
import { fileTypeFromBuffer } from "file-type";

import { db } from "@/app/context/InstantProvider";
export async function getUserProfile(userId: string) {
  try {
    const query = {
      user_profile: {
        $: { where: { "$users.id": userId } },
        $files: {},
        $users: {},
      },
    };
    const { data } = await db.queryOnce(query);
    if(data?.user_profile?.length){
      return data.user_profile[0]
    }
    return null;
  } catch (error) {
    Sentry.captureException(error);
    console.error("Error fetching client side user profile:", error);
    throw error;
  }
}

// export async function getUserProfileBySlug(slug: string) {
//   try {
//     const userProfiles: any = await db.queryOnce({
//       user_profile: {
//         $: {
//           where: { slug: slug },
//         },
//         $users: {},
//         $files:{}
//       },
//     });
//     if (userProfiles.data?.user_profile?.length) {
//       return userProfiles.data.user_profile[0];
//     }
//     throw "Something went wrong!";
//   } catch (error: any) {
//     Sentry.captureException(error);
//     console.error("Error fetching user profiles:", error);
//     throw error.response?.data?.message || "Something went wrong!";
//   }
// }

export async function fetchGoogleImageAsFile(
  url: string,
  filename = "google-avatar"
) {
  const res = await fetch(url);
  if (!res.ok) return "";

  const blob = await res.blob();
  const arrayBuffer = await blob.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const detectedType = await fileTypeFromBuffer(buffer);
  const mime = detectedType?.mime || "image/jpeg";
  const extension = detectedType?.ext || "jpg";

  const file = new File([buffer], `${filename}.${extension}`, { type: mime });

  return file;
}
