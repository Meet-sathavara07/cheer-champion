"use client";
// import DarkModeSwitch from "./DarkModeSwitch";
// import { clearPreviousUser } from "../../instant/queries";
import Image from "next/image";
import darkBrandLogo from "@/assets/logo/brand-logo-dark.svg";
// import lightBrandLogo from "@/assets/logo/brand-logo-light.svg";
// import BellIcon from "@/assets/icon/Bell.svg";
import { useUserContext } from "@/app/context/UserContext";
// import { useSystemTheme } from "@/helpers/hooks";
import ProfileDropdown from "../Dropdowns/ProfileDropdown";
import Link from "next/link";
import LanguageDropdown from "../Dropdowns/LanguageDropdown";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getUserProfile } from "@/helpers/clientSide/profile";
import DownloadAppModal from "../Modals/DownloadAppModal";
import DownloadIcon from "@/assets/icon/Download.svg";
import Button from "../Button";
import { useTranslation } from "react-i18next";
import HamburgerIcon from "@/assets/icon/menu.svg";
import MobileMenu from "./MobileMenu";
import { useInstantDB } from "@/app/context/InstantProvider";
import NotificationSidebar from "../Modals/NotificationModal";
import BellIcon from "@/assets/icon/Bell.svg";

export default function PrivateNavbar({}) {
  const { user } = useUserContext();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useTranslation();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const db = useInstantDB();

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

  return (
    <>
      <nav className="flex justify-between items-center py-[11px] px-4 lg:py-[18.5px] lg:px-15 shadow-lg max-w-[120rem] mx-auto">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Image
              src={darkBrandLogo}
              alt="brand-logo"
              className="lg:h-[44px] lg:w-[114px] h-[30px] w-[78px]"
            />
          </Link>
        </div>

        {user && (
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
              <span className="text-[#318CDC] text-xs sm:text-sm">
                {/* Smaller text */}
                <span className="hidden sm:inline">
                  {t("navbar.private.download")}{" "}
                </span>
                {t("navbar.private.App")}
              </span>
            </Button>
            {isAdmin && (
              <button
                onClick={() => router.push("/admin/dashboard")}
                className="px-3 py-1.5 sm:px-4 sm:py-2 cursor-pointer text-gray-800 hover:text-primary transition-colors relative"
              >
                <span className="text-sm sm:text-base font-comfortaa font-bold">
                  {t("admin.dashboard.title")}
                </span>
                <span className="block w-9 sm:w-14 h-0.5 bg-primary mt-1 rounded-full"></span>
              </button>
            )}
            <div className="max-[640px]:hidden">
              <LanguageDropdown />
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="min-[640px]:hidden cursor-pointer text-secondary-dark p-2 bg-gray-100 rounded-full transition-colors duration-200"
              aria-label={t("navbar.private.menuLabel")}
            >
              <Image
                src={HamburgerIcon}
                alt="menu-icon"
                width={20}
                height={20}
              />
            </button>

            <ProfileDropdown />
          </div>
        )}
      </nav>
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        showDownloadButton={true}
        onDownloadClick={() => {
          setIsMobileMenuOpen(false);
          setShowDownloadModal(true);
        }}
        isPrivateNav={true}
        isLoginPage={() => false}
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
