"use client";
import React from "react";
import Image from "next/image";
import layout from "@/assets/layouts/layout-modal.svg";
import PlayStoreIcon from "@/assets/icon/playstore.svg";
import AppStoreIcon from "@/assets/icon/app-store.svg";
import QrCodeIcon from "@/assets/qr-code.svg"; // Added QR code asset
import BackgroundLayer from "@/assets/layouts/background-layer.svg";
import Button from "../Button";
import closeIcon from "@/assets/icon/modal-close.svg";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

interface DownloadAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownload?: () => void;
  isLoading?: boolean;
}

const DownloadAppModal: React.FC<DownloadAppModalProps> = ({
  isOpen,
  onClose,
  onDownload,
  isLoading = false,
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  // Detect mobile device
  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  };

  // Detect if it's Android
  const isAndroid = () => {
    return /Android/i.test(navigator.userAgent);
  };

  // Detect if it's iOS
  const isIOS = () => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  };

  // Check if user is on desktop
  const isDesktop = () => {
    return !isMobileDevice();
  };

  // Universal deep link handler for your app
  const handleOpenApp = () => {
    if (onDownload) onDownload();

    const appScheme = "https://www.cheerchampion.com/";
    const androidPackage = "com.cheerChampion";
    const playStoreUrl = `https://play.google.com/store/apps/details?id=${androidPackage}`;
    const appStoreUrl = "https://apps.apple.com/app/idYOUR_APP_ID";

    if (isAndroid()) {
      // Android Intent URL with fallback
      const intentUrl = `intent://#Intent;scheme=cheerchampion;package=${androidPackage};S.browser_fallback_url=${encodeURIComponent(
        playStoreUrl
      )};end`;
      window.location.href = intentUrl;
    } else if (isIOS()) {
      // iOS Universal Link
      window.location.href = appScheme;
      setTimeout(() => {
        window.location.href = appStoreUrl;
      }, 2000);
    } else {
      // Desktop - redirect to Play Store
      window.open(playStoreUrl, "_blank");
    }
  };

  // Handle App Store click with platform detection
  const handleAppStoreClick = () => {
    if (onDownload) onDownload();

    if (isIOS()) {
      // iOS user - open app or App Store
      handleOpenApp();
    } else if (isAndroid()) {
      // Android user trying to click App Store - show message
      toast(t("modal.download.androidAppStoreWarning"));
      return;
    } else {
      // Desktop user
      const appStoreUrl = "https://apps.apple.com/app/idYOUR_APP_ID";
      window.open(appStoreUrl, "_blank");
    }
  };

  // Handle Play Store click with platform detection
  const handlePlayStoreClick = () => {
    if (onDownload) onDownload();

    if (isAndroid()) {
      // Android user - open app or Play Store
      handleOpenApp();
    } else if (isIOS()) {
      // iOS user trying to click Play Store - show message
      toast(t("modal.download.iosPlayStoreWarning"));
      return;
    } else {
      // Desktop user - handled by QR code
      window.open(
        "https://play.google.com/store/apps/details?id=com.cheerChampion",
        "_blank"
      );
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/72 z-[100] p-4">
      <Image
        className="absolute overflow-visible inset-0 w-full h-[70%] top-[20%] bottom-[10%] object-cover"
        src={BackgroundLayer}
        alt="Background Layer"
      />
      <div className="relative w-full max-w-[95vw] sm:max-w-[85vw] md:max-w-[75vw] lg:max-w-[65vw] xl:max-w-[55vw] max-h-[90vh] bg-white rounded-lg shadow-lg flex flex-col">
        <div className="w-full h-[50px] sm:h-[60px] md:h-[70px] relative flex-shrink-0">
          <Image
            className="absolute object-cover object-bottom top-0 left-0 w-full h-[55px] sm:h-[65px] md:h-[80px]"
            src={layout}
            alt="layout"
            height={75}
          />
          <h2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-sm sm:text-base text-center font-bold text-600 font-comfortaa">
            {t("modal.download.title")}
          </h2>
          <button
            className="absolute top-2 right-2 p-1.5 sm:p-2 z-10 hover:bg-white/20 rounded-full cursor-pointer transition-colors"
            onClick={onClose}
            disabled={isLoading}
          >
            <Image
              className="object-contain h-[12px] w-[12px] sm:h-[14px] sm:w-[14px] md:h-[16px] md:w-[16px]"
              src={closeIcon}
              alt="closeIcon"
              height={16}
              width={16}
            />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <div className="pt-3 sm:pt-4 mb-4 sm:mb-6 text-center">
            <h2 className="text-sm sm:text-base lg:text-lg font-bold text-[#3A86C9] font-comfortaa mb-3 sm:mb-4">
              {t("modal.download.callToAction")}
            </h2>

            <div className="flex justify-center space-x-4 sm:space-x-6 mb-5 sm:mb-6">
              {/* App Store Button */}
              <div className="flex flex-col items-center justify-center">
                <button
                  onClick={handleAppStoreClick}
                  disabled
                  className={`flex flex-col items-center focus:outline-none transition-all duration-200 ${
                    isAndroid() && isMobileDevice()
                      ? "transform-none hover:transform-none"
                      : "hover:scale-105"
                  }`}
                >
                  <Image
                    src={AppStoreIcon}
                    alt={t("modal.download.appStoreLabel")}
                    className="h-[55px] w-[55px]"
                    height={55}
                    width={55}
                  />
                  <span className="text-xs mt-1">
                    {t("modal.download.appStoreLabel")}
                  </span>
                  <span className="text-xs text-gray-500">
                    {t("modal.download.appStoreStatus")}{" "}
                    {/* e.g., "Coming Soon" */}
                  </span>
                </button>

                {/* Platform-specific message for App Store */}
                {isAndroid() && isMobileDevice() && (
                  <div className="mt-2 text-xs text-red-600 font-medium text-center max-w-[100px]">
                    {t("modal.download.androidAppStoreMessage")}
                  </div>
                )}
                {isIOS() && isMobileDevice() && (
                  <div className="mt-2 text-xs text-red-600 font-medium">
                    {t("modal.download.appNotAvailableAppStore")}
                  </div>
                )}
                {isDesktop() && (
                  <div className="mt-2 text-xs text-red-600 font-medium">
                    {t("modal.download.appNotAvailableAppStore")}
                  </div>
                )}
              </div>

              {/* Play Store Button or QR Code */}
              <div className="flex flex-col items-center">
                {isDesktop() ? (
                  // QR Code for Desktop
                  <div className="flex flex-col items-center">
                    <a
                      href="https://play.google.com/store/apps/details?id=com.cheerChampion"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center focus:outline-none transition-all duration-200 hover:scale-105"
                    >
                      <Image
                        src={QrCodeIcon}
                        alt={t("modal.download.scanQrCode")}
                        className="h-[150px] w-auto"
                        height={55}
                      />
                    </a>
                  </div>
                ) : (
                  // Play Store Button for Mobile
                  <button
                    onClick={handlePlayStoreClick}
                    className={`flex flex-col cursor-pointer items-center focus:outline-none transition-all duration-200 ${
                      isIOS() && isMobileDevice()
                        ? "transform-none hover:transform-none"
                        : "hover:scale-105"
                    }`}
                  >
                    <Image
                      src={PlayStoreIcon}
                      alt={t("modal.download.playStoreLabel")}
                      height={55}
                      width={55}
                      className="h-[55px] w-[55px]"
                    />
                    <span className="text-xs mt-1">
                      {t("modal.download.playStoreLabel")}
                    </span>
                    <span className="text-xs text-green-600 font-semibold animate-pulse">
                      {t("modal.download.playStoreStatus")}
                    </span>
                  </button>
                )}

                {/* Platform-specific message for Play Store */}
                {isIOS() && isMobileDevice() && (
                  <div className="mt-2 text-xs text-red-600 font-medium text-center max-w-[100px]">
                    {t("modal.download.iosPlayStoreMessage")}
                  </div>
                )}
                {isAndroid() && isMobileDevice() && (
                  <div className="mt-2 text-xs text-green-600 font-medium">
                    {t("modal.download.perfectForUse")}
                  </div>
                )}
                {isDesktop() && (
                  <div className="text-xs text-green-600 font-semibold animate-pulse">
                    {t("modal.download.playStoreStatus")}
                  </div>
                )}
              </div>
            </div>

            {/* Additional platform guidance */}
            <div className="mb-4">
              {isAndroid() && isMobileDevice() && (
                <div className="text-xs text-gray-600 bg-green-50 p-2 rounded">
                  {t("modal.download.androidGuidance")}
                </div>
              )}
              {isIOS() && isMobileDevice() && (
                <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded">
                  {t("modal.download.iosGuidance")}
                </div>
              )}
              {isDesktop() && (
                <div className="text-xs text-gray-600">
                  {t("modal.download.desktopGuidanceQr")}{" "}
                  {/* Updated for QR code */}
                </div>
              )}
            </div>

            <div className="text-center max-w-[600px] mx-auto">
              <h2 className="text-sm sm:text-base lg:text-lg font-bold text-[#3A86C9] font-comfortaa mb-3 sm:mb-4">
                {t("modal.download.description")}
              </h2>
              <p className="text-xs sm:text-sm font-medium font-libre">
                {t("modal.download.subtext")}
              </p>
            </div>
          </div>
        </div>

        <div className="px-4 pb-4 flex justify-center">
          <Button
            onClick={onClose}
            isLoading={isLoading}
            className="w-full cursor-pointer max-w-xs bg-primary hover:bg-primary-dark text-white text-sm sm:text-base transition-colors"
          >
            {t("modal.download.continueButton")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DownloadAppModal;
