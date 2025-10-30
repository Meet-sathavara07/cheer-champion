"use client";
import React, { useState } from "react";
import Image from "next/image";
import layout from "@/assets/layouts/layout-modal.svg";
import BackgroundLayer from "@/assets/layouts/background-layer.svg";
import closeIcon from "@/assets/icon/modal-close.svg";
import CopyIcon from "@/assets/logo/Copy.svg";
import {
  FacebookShareButton,
  LinkedinShareButton,
  TelegramShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  FacebookIcon,
  TelegramIcon,
  TwitterIcon,
  WhatsappIcon,
  LinkedinIcon,
} from "react-share";
import Loader from "../Loader";
import { useTranslation } from "react-i18next";

interface ProfileShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareMessage: string;
  shareUrl: string;
  isGeneratingMessage?: boolean;
}

const ProfileShareModal: React.FC<ProfileShareModalProps> = ({
  isOpen,
  shareMessage,
  shareUrl,
  onClose,
  isGeneratingMessage = false,
}) => {
  const { t } = useTranslation();
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(shareMessage);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 600);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/72 z-100 p-4">
      <Image
        className="absolute overflow-visible inset-0 w-full h-[70%] top-[20%] bottom-[10%] object-cover"
        src={BackgroundLayer}
        alt="Background Layer"
      />
      <div className="relative w-full max-w-[95vw] sm:max-w-[85vw] md:max-w-[75vw] lg:max-w-[65vw] xl:max-w-[55vw] max-h-[90vh] bg-white rounded-lg shadow-lg flex flex-col">
        {/* Header with green wave - Fixed height */}
        <div className="w-full h-[50px] sm:h-[60px] md:h-[70px] relative flex-shrink-0">
          <Image
            className="absolute object-cover object-bottom top-0 left-0 w-full h-[55px] sm:h-[65px] md:h-[75px]"
            src={layout}
            alt="layout"
            height={75}
          />
          <h2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-sm sm:text-base text-center font-bold text-600 font-comfortaa">
            {t("modal.profileShare.title")}
          </h2>
          {/* Close Button - Positioned within header */}
          <button
            className="absolute top-2 right-2 p-1.5 sm:p-2 z-10 hover:bg-white/20 rounded-full cursor-pointer transition-colors"
            onClick={onClose}
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

        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <div className="pt-3 sm:pt-4 mb-4 sm:mb-6">
            <h2 className="text-sm sm:text-base lg:text-lg text-center font-bold text-[#3A86C9] font-comfortaa mb-2 sm:mb-3">
              {t("modal.profileShare.intro")}
            </h2>
            <p className="text-xs sm:text-sm font-medium font-libre text-center">
              {t("modal.profileShare.privacyNote")}
            </p>
          </div>
          <div className="">
            <p className="font-libre font-medium text-sm mb-2">
              {t("modal.profileShare.shareWithMessage")}
            </p>
            <p className="text-xs font-medium font-libre mb-3 text-gray-600">
              {t("modal.profileShare.instruction")}{" "}
              <span className="font-bold text-gray-800">
                {t("modal.profileShare.justcopied")}
              </span>{" "}
              {t("modal.profileShare.whenshare")}
            </p>
            {/* Message Box with Copy Button */}
            <div className="relative bg-gray-50 rounded-lg border border-gray-200">
              <div className="p-3 sm:p-4 pr-12 sm:pr-14">
                {isGeneratingMessage && !shareMessage ? (
                  <div className="flex justify-center items-center h-full">
                    <Loader className="h-10 w-10 !border-primary" />
                  </div>
                ) : (
                  <p className="text-xs sm:text-sm whitespace-pre-wrap text-gray-700 leading-relaxed">
                    {shareMessage || t("modal.profileShare.defaultMessage")}
                  </p>
                )}
              </div>
              {/* Copy Button - Hide when loading */}
              {!isGeneratingMessage && (
                <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
                  <button
                    onClick={handleCopy}
                    className="flex items-center justify-center p-1.5 hover:bg-gray-200 rounded-md transition-colors group"
                    aria-label="Copy to clipboard"
                  >
                    <Image
                      className="object-contain h-[16px] w-[16px] sm:h-[18px] sm:w-[18px] group-hover:scale-110 transition-transform"
                      src={CopyIcon}
                      alt="Copy"
                      height={18}
                      width={18}
                    />
                  </button>
                  {/* Copied Tooltip */}
                  {isCopied && (
                    <div className="absolute -top-10 -right-2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap shadow-lg animate-fade-in">
                      {t("modal.profileShare.copied")}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div>
            <p className="font-libre font-medium text-sm sm:text-base mb-2">
              {t("modal.profileShare.shareTo")}
            </p>
            <div className="grid grid-cols-5 gap-3 sm:gap-4 justify-items-center mb-2">
              <FacebookShareButton
                url={shareUrl}
                title={shareMessage}
                className="hover:scale-110 transition-transform"
              >
                <FacebookIcon size={40} round className="sm:!w-12 sm:!h-12" />
              </FacebookShareButton>
              <TwitterShareButton
                url={shareUrl}
                title={shareMessage}
                className="hover:scale-110 transition-transform"
              >
                <TwitterIcon size={40} round className="sm:!w-12 sm:!h-12" />
              </TwitterShareButton>
              <WhatsappShareButton
                url={shareUrl}
                title={shareMessage}
                className="hover:scale-110 transition-transform"
              >
                <WhatsappIcon size={40} round className="sm:!w-12 sm:!h-12" />
              </WhatsappShareButton>
              <LinkedinShareButton
                url={shareUrl}
                title={shareMessage}
                className="hover:scale-110 transition-transform"
              >
                <LinkedinIcon size={40} round className="sm:!w-12 sm:!h-12" />
              </LinkedinShareButton>
              <TelegramShareButton
                url={shareUrl}
                title={shareMessage}
                className="hover:scale-110 transition-transform"
              >
                <TelegramIcon size={40} round className="sm:!w-12 sm:!h-12" />
              </TelegramShareButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileShareModal;
