"use client";
// import DarkModeSwitch from "./DarkModeSwitch";
// import { clearPreviousUser } from "../../instant/queries";
// import { useUserContext } from "../../context/UserContext";
// import { useInstantDB } from "@/app/context/InstantProvider";
// import { useRouter } from "next/navigation";
// import axios from "axios";
import Image from "next/image";
import lightBrandLogo from "@/assets/logo/brand-logo-light.svg";
import darkBrandLogo from "@/assets/logo/brand-logo-dark.svg";
// import BellIcon from "@/assets/icon/Bell.svg";
import { useUserContext } from "@/app/context/UserContext";
import { useRouter, usePathname } from "next/navigation";
// import { useSystemTheme } from "@/helpers/hooks";
import Link from "next/link";
import ProfileDropdown from "../Dropdowns/ProfileDropdown";
import { useEffect, useState } from "react";
import LanguageDropdown from "../Dropdowns/LanguageDropdown";
import { useTranslation } from "react-i18next";
import DownloadAppModal from "../Modals/DownloadAppModal";
import DownloadIcon from "@/assets/icon/Download.svg";
import CloseIcon from "@/assets/icon/close-icon.svg";
import BellIcon from "@/assets/icon/Bell.svg";
import HamburgerIcon from "@/assets/icon/menu.svg";
import Button from "../Button";
import MobileMenu from "./MobileMenu";
import { getUserProfile } from "@/helpers/clientSide/profile";
import { useInstantDB } from "@/app/context/InstantProvider";
import NotificationSidebar from "../Modals/NotificationModal";

export default function PublicNavbar({ isLight = false, className = "" }) {
  const router = useRouter();
  const { user } = useUserContext();
  const db = useInstantDB();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const { t } = useTranslation();
  const isLoginPage = pathname.includes("login");
  const [isAdmin, setIsAdmin] = useState(false);

  // Query for unread notifications count
  const { data: unreadNotifications } = db.useQuery({
    notifications: user?.id
      ? {
          $: {
            where: {
              and: [
                { user_id: user.id },
                { is_read: false },
                {
                  type: {
                    $in: [
                      "kudo_received",
                      "kudo_liked",
                      "connection_kudo_received",
                      "connection_kudo_sent",
                      "inactive_user_reminder",
                    ],
                  },
                },
              ],
            },
          },
        }
      : undefined,
  });
  // Update notification count - ONLY show badge for unread notifications
  useEffect(() => {
    if (unreadNotifications?.notifications) {
      setUnreadNotificationCount(unreadNotifications.notifications.length);
    } else {
      setUnreadNotificationCount(0);
    }
  }, [unreadNotifications?.notifications]);

  useEffect(() => {
    async function checkAdmin() {
      if (!user) return;
      try {
        const profile = await getUserProfile(user.id);
        if (profile && profile.role === "admin") {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    }
    checkAdmin();
  }, [user]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null; // Prevents hydration error

  return (
    <>
      <nav
        className={`flex justify-between items-center py-[11px] px-4 lg:px-15 w-full max-w-[120rem] mx-auto ${
          isLoginPage ? "bg-white/20" : ""
        } ${className}`}
      >
        <Link href="/">
          <Image
            src={isLight ? lightBrandLogo : darkBrandLogo}
            alt="brand-logo"
            className="lg:h-[44px] lg:w-[114px] h-[30px] w-[78px]"
          />
        </Link>
        {user ? (
          <div className="flex items-center gap-4 max-[640px]:gap-2">
            {/* Notification Bell with Badge - ONLY shows for unread notifications */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationOpen(true)}
                aria-label={t(
                  "navbar.public.notificationLabel",
                  "Notifications"
                )}
                className="relative p-2 cursor-pointer bg-gray-100 rounded-full transition-colors duration-200"
              >
                <Image
                  src={BellIcon}
                  alt="notifications"
                  width={20}
                  height={20}
                />
                {/* Badge ONLY appears when there are unread notifications */}
                {unreadNotificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] h-[18px] flex items-center justify-center leading-none">
                    {unreadNotificationCount > 99
                      ? "99+"
                      : unreadNotificationCount}
                  </span>
                )}
              </button>
            </div>
            <Button
              className="bg-white border border-secondary flex items-center flex-row !text-secondary-dark relative
                transition-all duration-200 hover:bg-secondary-light hover:border-secondary-dark hover:shadow-md justify-center
                max-[640px]:hidden"
              onClick={() => setShowDownloadModal(true)}
            >
              <Image
                src={DownloadIcon}
                alt="download-icon"
                width={16}
                height={16}
                className="mr-2"
              />
              <span className="text-[#318CDC]">
                <span className="hidden md:inline">
                  {t("navbar.private.download")}{" "}
                </span>
                {t("navbar.private.App")}
              </span>
            </Button>
            {isAdmin && (
              <button
                onClick={() => router.push("/admin/dashboard")}
                className="px-3 py-1.5 sm:px-4 sm:py-2 cursor-pointer text-gray-800 hover:text-primary max-lg:hover:text-white transition-colors relative"
              >
                <span className="text-sm sm:text-base font-comfortaa font-bold">
                  {t("admin.dashboard.title")}
                </span>
                <span className="block w-9 sm:w-14 h-0.5 bg-primary mt-1 rounded-full lg:bg-primary max-lg:bg-white hover:bg-white"></span>
              </button>
            )}
            <div className="max-[640px]:hidden">
              <LanguageDropdown />
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="min-[640px]:hidden cursor-pointer bg-white text-secondary-dark p-2 hover:bg-gray-100 rounded-md transition-colors duration-200"
              aria-label={t("navbar.public.menuLabel")}
            >
              <Image
                src={HamburgerIcon}
                alt="menu-icon"
                width={16}
                height={16}
              />
            </button>
            <ProfileDropdown />
          </div>
        ) : (
          <>
            <div className="hidden sm:flex items-center gap-2 lg:gap-4">
              <Button
                className="bg-white border border-secondary flex items-center flex-row !text-secondary-dark relative
                  transition-all duration-200 hover:bg-secondary-light hover:border-secondary-dark hover:shadow-md justify-center"
                onClick={() => setShowDownloadModal(true)}
              >
                <Image
                  src={DownloadIcon}
                  alt="download-icon"
                  width={16}
                  height={16}
                  className="mr-2"
                />
                <span className="text-[#318CDC]">
                  <span className="hidden md:inline">
                    {t("navbar.private.download")}{" "}
                  </span>
                  {t("navbar.private.App")}
                </span>
              </Button>
              <Link
                href="/privacy-policy"
                className="text-secondary-dark text-xs lg:text-sm font-libre font-medium italic hover:text-secondary underline"
              >
                {t("footer.privacyPolicy")}
              </Link>
              <Link
                href="/terms-of-service"
                className="text-secondary-dark text-xs lg:text-sm font-libre font-medium italic hover:text-secondary underline"
              >
                {t("footer.termsAndConditions")}
              </Link>
              <Link
                href="/how-it-works"
                className="text-secondary-dark text-xs lg:text-sm font-libre font-medium italic hover:text-secondary underline"
              >
                {t("footer.howItWorks")}
              </Link>
              <Link
                href="/child-safety"
                className="text-secondary-dark text-xs lg:text-sm font-libre font-medium italic hover:text-secondary underline"
              >
                {t("footer.childSafety")}
              </Link>
              {!isLoginPage && (
                <Link
                  href="/"
                  onClick={(e) => {
                    e.preventDefault();
                    router.push("/login");
                  }}
                  className="text-secondary-dark text-xs lg:text-sm font-libre font-medium italic hover:text-secondary underline"
                >
                  {t("general.login")}
                </Link>
              )}
            </div>
            {/* Mobile Navigation */}
            <div className="sm:hidden flex items-center gap-2">
              {!isLoginPage && (
                <Link
                  href="/"
                  onClick={(e) => {
                    e.preventDefault();
                    router.push("/login");
                  }}
                  className="text-secondary-dark text-sm font-libre font-medium italic underline"
                >
                  {t("general.login")}
                </Link>
              )}
              <Button
                className="bg-white border border-secondary flex items-center flex-row !text-secondary-dark relative
                  transition-all duration-200 hover:bg-secondary-light hover:border-secondary-dark hover:shadow-md justify-center px-2 py-1"
                onClick={() => setShowDownloadModal(true)}
              >
                <Image
                  src={DownloadIcon}
                  alt="download-icon"
                  width={14}
                  height={14}
                  className="mr-1"
                />
                <span className="text-[#318CDC] text-xs">
                  {t("navbar.private.App")}
                </span>
              </Button>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="bg-white text-secondary-dark p-2 hover:bg-gray-100 rounded-md transition-colors duration-200"
                aria-label="Toggle menu"
              >
                <Image
                  src={HamburgerIcon}
                  alt={"hamburger-icon"}
                  width={16}
                  height={16}
                />
              </button>
            </div>
          </>
        )}
      </nav>

      {/* Mobile Menu Component */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        isLoginPage={isLoginPage}
        showDownloadButton={true}
        onDownloadClick={() => {
          setIsMobileMenuOpen(false);
          setShowDownloadModal(true);
        }}
        isPrivateNav={!!user} // Pass isPrivateNav based on user login status
      />

      {/* Notification Sidebar */}
      <NotificationSidebar
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />

      <DownloadAppModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
      />
    </>
  );
}
