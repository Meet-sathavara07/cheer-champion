"use client";
import React, { useState, useRef, useEffect, useMemo } from "react";
import ProfilePlaceholderImage from "@/assets/defaultProfile.png";
import { useRouter } from "next/navigation";
import { useUserContext } from "@/app/context/UserContext";
import { useInstantDB } from "@/app/context/InstantProvider";
import toast from "react-hot-toast";
import { getUserProfile } from "@/helpers/clientSide/profile";
import Image from "next/image";
import { useAutoLogout } from "@/helpers/hooks";
import { usePostContext } from "@/app/context/KudoPostContext";
import { useTranslation } from "react-i18next";
import * as Sentry from "@sentry/nextjs";
import axiosInstance from "@/app/lib/axios";
import Link from "next/link";
import { defaultProfileImageIDs } from "@/helpers/profileImages";
import { isDummyEmail } from "@/helpers/utils";

interface ProfileDropdownProps {}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isShowTooltip] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const dropdownRef = useRef<any>(null);
  const router = useRouter();
  const { user, setUser, loading, setLoading } = useUserContext();
  const { setFormData, initialKudo }: any = usePostContext();
  const db = useInstantDB();
  const { t } = useTranslation();
  const userData = db.useAuth();

  const isProfileNeedsUpdate = useMemo(() => {
    if (!userProfile) return false;
    const { name, mobile1_country_code, mobile1, $users, $files } = userProfile;

    const isDefaultNameFromMobile =
      mobile1_country_code &&
      mobile1 &&
      name &&
      name.length === 7 &&
      `${mobile1_country_code}${mobile1}`.slice(0, 7) === name;

    const isDefaultNameFromEmail =
      $users && name && name.length === 7 && $users.email.slice(0, 7) === name;

    const isDefaultName = isDefaultNameFromMobile || isDefaultNameFromEmail;

    const isDefaultImage =
      !$files || defaultProfileImageIDs.includes($files.id);

    return (
      isDummyEmail($users.email) ||
      !mobile1 ||
      !name ||
      isDefaultName ||
      isDefaultImage
    );
  }, [userProfile]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current?.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    (async () => {
      try {
        if (user?.id) {
          // const userProfile = await getUserProfileBySlug(slug);
          const profile: any = await getUserProfile(user.id);
          setUserProfile(profile);
        }
      } catch (error: any) {
        console.log(error, "error");
        toast.error(error);
      }
    })();
  }, [user]);

  const clearUserHandler = async () => {
    try {
      localStorage.removeItem("user");
      setUser(null);
      if (userData.user && db?.auth?.signOut) {
        await db.auth.signOut();
      }
    } catch (error) {
      Sentry.captureException(error);
      console.error("InstantDB signOut error:", error);
    } finally {
      axiosInstance.defaults.headers.common["Authorization"] = "";
      setFormData(initialKudo);
      setTimeout(() => router.push("/login"), 100);
    }
  };

  const handleSignOut = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.post("/api/users/logout");
      setDropdownOpen(false);
      await clearUserHandler();
      toast.success(response.data.message);
    } catch (error: any) {
      const status = error?.response?.status || 500;
      if (status >= 500 || !status) {
        Sentry.captureException(error);
      }
      console.error("Logout failed:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  useAutoLogout(user, clearUserHandler);

  const sentKudoHandler = async () => {
    setDropdownOpen(false);
    router.push("/");
  };

  const handleProfileClick = () => {
    if (window.innerWidth < 640) {
      router.push("/update-profile");
    } else {
      setDropdownOpen(!dropdownOpen);
    }
  };

  return (
    <div className="relative z-30" ref={dropdownRef}>
      <div className="relative flex justify-center ">
        <button
          type="button"
          className="btn  border-[2px] overflow-hidden border-primary flex justify-center items-center rounded-full"
          onClick={handleProfileClick}
        >
          <Image
            src={userProfile?.$files?.url || ProfilePlaceholderImage}
            alt="profile"
            height={26}
            width={26}
            className="h-[22px] w-[22px] lg:h-[26px] lg:w-[26px] object-cover"
            onError={(error) => console.log(error, "error")}
          />
        </button>
        {isShowTooltip && isProfileNeedsUpdate && (
          <div className="absolute z-10 text-nowrap inline-block px-3 py-2 text-sm font-medium text-white bg-[#E20909] hover:bg-red-700  rounded-[5px] tooltip top-full mt-2">
            <Link href="/update-profile" className="underline">
              {t("profileDropdown.updateProfile")}
            </Link>
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-[#E20909] hover:bg-red-700 rotate-45"></div>
          </div>
        )}
      </div>
      {dropdownOpen && window.innerWidth >= 640 && (
        <div className="absolute right-0 mt-2 w-36 lg:w-48 bg-white rounded-md shadow-lg z-100">
          <ul className="py-1">
            <li>
              <button
                className="btn px-3 lg:px-4 py-2 text-xs lg:text-sm text-600 hover:bg-gray-100 w-full text-left"
                onClick={sentKudoHandler}
              >
                {t("profileDropdown.sendKudos")}
              </button>
            </li>
            <li>
              <button
                className="btn px-3 lg:px-4 py-2 text-xs lg:text-sm text-600 hover:bg-gray-100 w-full text-left"
                onClick={() => {
                  setDropdownOpen(false);
                  router.push("/feeds");
                }}
              >
                {t("profileDropdown.kudoFeed")}
              </button>
            </li>
            <li>
              <button
                className="btn px-3 lg:px-4 py-2 text-xs lg:text-sm text-600 hover:bg-gray-100 w-full text-left"
                onClick={() => {
                  setDropdownOpen(false);
                  router.push("/update-profile");
                }}
              >
                {t("profileDropdown.profile")}
              </button>
            </li>
            <li>
              <button
                disabled={loading}
                className="btn px-3 lg:px-4 py-2 text-xs lg:text-sm text-600 hover:bg-gray-100 w-full text-left"
                onClick={handleSignOut}
              >
                {t("profileDropdown.signOut")}
              </button>
            </li>
            <li>
              <button
                className="btn px-3 lg:px-4 py-2 text-xs lg:text-sm text-600 hover:bg-gray-100 w-full text-left"
                onClick={() => {
                  setDropdownOpen(false);
                  router.push("/contact-us");
                }}
              >
                {t("settings.reportProblem")}
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;