"use client";
import { useInstantDB } from "@/app/context/InstantProvider";
// import { useUserContext } from "@/app/context/UserContext";
import { kudoQueries } from "../models/profileModel";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
// import { getUserProfileBySlug } from "@/helpers/clientSide/profile";
import { useUserContext } from "../context/UserContext";
import { usePostContext } from "../context/KudoPostContext";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { getUserProfile } from "@/helpers/clientSide/profile";
import { isDummyEmail } from "@/helpers/utils";

// Define the type for a Kudo
export interface Kudo {
  id: string;
  kudo?: string; // Optional to prevent missing property errors
  $users?: any[]; // Optional array
  kudo_receiver?: any[];
  createdAt?: string;
}

// Define the type for PageInfo
// interface PageInfo {
//   kudos?: {
//     endCursor?: string | null;
//   };
// }

// Define the type for QueryResult
// interface QueryResult {
//   kudos: Kudo[];
//   pageInfo?: PageInfo;
// }

export function useUserProfileViewModel(params: Promise<{ id: string }>) {
  const { user } = useUserContext();
  const db = useInstantDB();
  const router = useRouter();
  // const [isOpen, setOpen] = useState(false);
  const [profileDetails, setProfileDetails] = useState({
    $users: { id: "", email: "" },
    $files: { url: "" },
    bio: "",
    name: "",
    // photo_url: "",
    // slug: "",
    mobile1_country_code: "",
    mobile1_country_iso2: "",
    mobile1: "",
  });
  const [isLoading, setLoading] = useState(true);
  const { t } = useTranslation();
  const { initialKudo, setFormData }: any = usePostContext();
  // const [isSidebarOpen, setSidebarOpen] = useState(false);
  const userId = profileDetails.$users.id;
  const kudosCounts = db.useQuery(userId ? kudoQueries.count(userId) : null);
  const receivedKudos: any = db.useQuery(
    userId ? (kudoQueries.received(userId) as any) : null
  );

  const sentKudos: any = db.useQuery(
    userId ? (kudoQueries.given(userId) as any) : null
  );

  useEffect(() => {
    (async () => {
      if (params) {
        try {
          const { id } = await params;
          // if (!user) router.push("/login");
          // const userProfile = await getUserProfileBySlug(slug);
          const userProfile:any = await getUserProfile(id);
          setLoading(false);
          if(userProfile){
            setProfileDetails(userProfile);
          } else {
            toast.error("User profile not found");
          }
        } catch (error: any) {
          console.log(error, "error",error.message);
           setLoading(false);
          toast.error(error?.response?.data.message || error.message);
        }
      }
    })();
  }, [params]);

  const sendKudoHandler = () => {
    if (user?.id !== userId) {
      const recipients = [];
      if (!isDummyEmail(profileDetails.$users.email)) {
        recipients.push({
          email: profileDetails.$users.email,
          mobile: "",
          countryCode: "",
          countryIso2: "",
        });
      } else {
        // if (profileDetails.mobile1 && profileDetails.mobile1_country_code) {
        //   recipients.push({
        //     email: "",
        //     mobile: profileDetails.mobile1,
        //     countryCode: profileDetails.mobile1_country_code,
        //   });
        // }
        if (profileDetails.mobile1 && profileDetails.mobile1_country_code) {
          recipients.push({
            email: "",
            mobile: profileDetails.mobile1,
            countryCode: profileDetails.mobile1_country_code,
            countryIso2: profileDetails.mobile1_country_iso2,
          });
        }
        setFormData({
          ...initialKudo,
          recipients: recipients,
        });
      }
     
    }
    router.push("/");
  };
  return {
    receivedKudos: receivedKudos,
    sentKudos: sentKudos,
    sentCount: kudosCounts?.data?.$users[0]?.kudos?.length || 0,
    receivedCount: kudosCounts?.data?.$users[0]?.kudo_receiver?.length || 0,
    userProfile: profileDetails,
    isLoading,
    sendKudoHandler: sendKudoHandler,
    redirectToUpdateProfile: () => router.push("/update-profile"),
    // isOpen,
    // setOpen,
    currentUser: user,
    // isSidebarOpen,
    // setSidebarOpen,
    isCurrentUserProfile: user?.id && profileDetails.$users.id === user.id,
    t,
  };
}
