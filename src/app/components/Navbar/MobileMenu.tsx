"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import CloseIcon from "@/assets/icon/close-icon.svg";
import Image from "next/image";
import DownloadIcon from "@/assets/icon/Download-white.svg";
import LanguageDropdown from "../Dropdowns/LanguageDropdown";
import { useUserContext } from "@/app/context/UserContext";
import { useInstantDB } from "@/app/context/InstantProvider";
import toast from "react-hot-toast";
import * as Sentry from "@sentry/nextjs";
import axiosInstance from "@/app/lib/axios";
import { usePostContext } from "@/app/context/KudoPostContext";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  isLoginPage: any;
  showDownloadButton?: boolean;
  onDownloadClick?: () => void;
  isPrivateNav?: boolean;
}

export default function MobileMenu({
  isOpen,
  onClose,
  isLoginPage,
  showDownloadButton = false,
  onDownloadClick,
  isPrivateNav = false,
}: MobileMenuProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, setUser } = useUserContext();
  const { setFormData, initialKudo }: any = usePostContext();
  const db = useInstantDB();
  const [isLoading, setLoading] = useState(false);
  const userData = db.useAuth();

  const clearUserHandler = async () => {
    try {
      if (userData.user && db?.auth?.signOut) {
        await db.auth.signOut();
      }
    } catch (error) {
      Sentry.captureException(error);
      console.error("InstantDB signOut error:", error);
    } finally {
      setUser(null);
      setFormData(initialKudo);
      setTimeout(() => router.push("/login"), 100);
    }
  };

  const handleSignOut = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.post("/api/users/logout");
      onClose();
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

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      // Prevent body scroll when menu is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose]);

  // Close menu on escape key
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen, onClose]);

  return (
    <>
      {/* Backdrop - same as notification sidebar */}
      {isOpen && (
        <div
          className="fixed inset-0  bg-opacity-50 z-40 sm:hidden"
          onClick={onClose}
        />
      )}

      {/* Slide Menu - using same animation as notification sidebar */}
      <div
        className={`
          fixed top-0 right-0 h-full w-3/4 max-w-sm bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50
          ${isOpen ? "translate-x-0" : "translate-x-full"}
          flex flex-col
        `}
        ref={menuRef}
      >
        <div className="relative p-4 border-b border-gray-100">
          <button
            className="absolute cursor-pointer top-4 left-4 p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            onClick={onClose}
            aria-label="Close menu"
          >
            <Image src={CloseIcon} alt="close-icon" width={16} height={16} />
          </button>
          <h2 className="text-center text-sm font-semibold text-gray-800 pt-2">
            {isPrivateNav ? t("mobile.menu.accountMenu") : t("mobile.menu.menu")}
          </h2>
        </div>

        <div className="flex-1 px-6 py-4 overflow-y-auto space-y-4">
          {isPrivateNav && user ? (
            <div className="space-y-1">
              {[
                {
                  href: "/",
                  key: "profileDropdown.sendKudos",
                  onClick: () => {
                    onClose();
                    router.push("/");
                  },
                },
                {
                  href: "/feeds",
                  key: "profileDropdown.kudoFeed",
                  onClick: () => {
                    onClose();
                    router.push("/feeds");
                  },
                },
                {
                  href: "/update-profile",
                  key: "profileDropdown.profile",
                  onClick: () => {
                    onClose();
                    router.push("/update-profile");
                  },
                },
                {
                  href: "#",
                  key: "profileDropdown.signOut",
                  onClick: handleSignOut,
                  disabled: isLoading,
                },
                {
                  href: "/contact-us",
                  key: "settings.reportProblem",
                  onClick: () => {
                    onClose();
                    router.push("/contact-us");
                  },
                },
              ].map((item, index) => (
                <button
                  key={item.href}
                  onClick={item.onClick}
                  disabled={item.disabled || false}
                  className="block w-full cursor-pointer text-gray-700 text-base font-libre font-medium hover:text-primary hover:bg-gray-50 py-3 px-4 rounded-lg border-b border-gray-50 last:border-b-0"
                >
                  <span className="flex items-center justify-between w-full">
                    <span className="text-sm">{t(item.key)}</span>
                    <svg
                      className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {[
                { href: "/", key: "profileDropdown.sendKudos" },
                { href: "/privacy-policy", key: "footer.privacyPolicy" },
                { href: "/terms-of-service", key: "footer.termsAndConditions" },
                { href: "/how-it-works", key: "footer.howItWorks" },
                { href: "/child-safety", key: "footer.childSafety" },
              ].map((item, index) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block w-full text-gray-700 text-base font-libre font-medium hover:text-primary hover:bg-gray-50 py-3 px-4 rounded-lg border-b border-gray-50 last:border-b-0"
                  onClick={onClose}
                >
                  <span className="flex items-center justify-between w-full">
                    <span className="text-sm">{t(item.key)}</span>
                    <svg
                      className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </span>
                </Link>
              ))}
            </div>
          )}
          <div className="mt-4">
            <LanguageDropdown mobileView />
          </div>
        </div>

        {/* Download App Button */}
        {showDownloadButton && (
          <div className="p-4 border-t border-gray-100">
            <button
              onClick={() => {
                onClose();
                onDownloadClick?.();
              }}
              className="w-full cursor-pointer flex items-center justify-center gap-2 bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors text-xs"
            >
              <Image
                src={DownloadIcon}
                alt="download-icon"
                width={14}
                height={14}
              />
              <span>{t("mobile.menu.downloadApp")}</span>
            </button>
          </div>
        )}
        <div className="text-center text-gray-400 text-xs pb-4 opacity-60">
          {t("mobile.menu.tapToClose")}
        </div>
      </div>
    </>
  );
}