// import type { Metadata } from "next";
// import { getUserProfileBySlug } from "@/app/actions/profile";
import { openGraphMetaData, twitterMetaData } from "@/app/shared-metadata";
import UserProfile from "./UserProfile";
import * as Sentry from "@sentry/nextjs";
import { getUserProfileDetails } from "@/app/actions/profile";
type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  try {
    const baseURL = process.env.NEXT_PUBLIC_BASE_URL;
    const userDetails: any = await getUserProfileDetails(id);

    if (!userDetails || !userDetails.user_profile) {
      // User profile not found, return default metadata
      return {
        title: "Profile Not Found",
        description: "This user profile does not exist on Cheer Champion.",
        openGraph: {
          ...openGraphMetaData,
          type: "profile",
          url: `${baseURL}/profile/${id}`,
          title: "Profile Not Found | Cheer Champion",
          description: "This user profile does not exist on Cheer Champion.",
          images: [
            {
              url: `${baseURL}/defaultProfile.png`,
              width: 1200,
              height: 630,
              alt: "Default Profile",
            },
          ],
        },
        twitter: {
          ...twitterMetaData,
          title: "Profile Not Found | Cheer Champion",
          description: "This user profile does not exist on Cheer Champion.",
          images: [
            {
              url: `${baseURL}/defaultProfile.png`,
              width: 1200,
              height: 630,
              alt: "Default Profile",
            },
          ],
        },
      };
    }
    const defaultProfile = userDetails.user_profile?.$files?.url
      ? userDetails.user_profile.$files.url
      : `${baseURL}/defaultProfile.png`;
    const profileName = userDetails.user_profile?.name || "Profile";
    const sentCount = userDetails?.kudos?.length || 0;
    const receivedCount = userDetails?.kudo_receiver?.length || 0;
    let description = `${profileName} has received ${receivedCount} kudos and sent ${sentCount} kudos on Cheer Champion! 🎉`;
    if (userDetails.user_profile?.bio) {
      description += ` ${userDetails.user_profile.bio}`;
    }
    return {
      title: `${profileName}`,
      description,
      openGraph: {
        ...openGraphMetaData,
        type: "profile",
        url: `${baseURL}/profile/${id}`,
        title: `${profileName} | Cheer Champion`,
        description,
        images: [
          {
            url: defaultProfile,
            width: 1200,
            height: 630,
            alt: `${profileName}'s Profile`,
          },
        ],
      },
      twitter: {
        ...twitterMetaData,
        title: `${profileName} | Cheer Champion`,
        description,
        images: [
          {
            url: defaultProfile,
            width: 1200,
            height: 630,
            alt: `${profileName}'s Profile`,
          },
        ],
      },
    };
  } catch (error) {
    Sentry.captureException(error);
    console.log(error, "error");
  }
}

export default function Page({ params }: Props) {
  return <UserProfile params={params} />;
}
