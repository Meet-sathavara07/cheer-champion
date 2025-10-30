"use client";
import React, { useState } from "react";
import Image from "next/image";
import layout from "@/assets/layouts/layout-modal.svg";
import BackgroundLayer from "@/assets/layouts/background-layer.svg";
import Button from "../Button";
import closeIcon from "@/assets/icon/modal-close.svg";
import { useTranslation } from "react-i18next";

interface TermsConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading?: boolean;
}

const TermsConsentViewModal: React.FC<TermsConsentModalProps> = ({
  isOpen,
  onClose,
  isLoading = false,
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/72 z-[100] p-4">
      <Image
        className="absolute overflow-visible inset-0 w-full h-[70%] top-[20%] bottom-[10%] object-cover"
        src={BackgroundLayer}
        alt="Background Layer"
      />
      <div className="relative w-full max-w-[95vw] sm:max-w-[85vw] md:max-w-[75vw] lg:max-w-[65vw] xl:max-w-[55vw] max-h-[90vh] bg-white rounded-lg shadow-lg flex flex-col">
        {/* Header */}
        <div className="w-full h-[50px] sm:h-[60px] md:h-[70px] relative flex-shrink-0">
          <Image
            className="absolute object-cover object-bottom top-0 left-0 w-full h-[55px] sm:h-[65px] md:h-[80px]"
            src={layout}
            alt="layout"
            height={75}
          />
          <h2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-sm sm:text-base text-center font-bold text-600 font-comfortaa">
            {t("modal.termsConsent.title")}
          </h2>
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {/* Heading & Checkbox */}
          <div className="pt-3 sm:pt-4 mb-4 sm:mb-6 "></div>

          <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 sm:p-4 mb-4 animate-fade-in">
            <h3 className="font-libre font-bold text-sm sm:text-base mb-3 text-center text-[#3A86C9]">
              {t("modal.termsConsent.policyTitle")}
            </h3>
            <h4 className="font-libre font-bold text-xs sm:text-sm mb-2">
              {t("modal.termsConsent.lastUpdated")}
            </h4>

            <p className="text-xs sm:text-sm font-medium font-libre mb-3">
              {t("modal.termsConsent.intro")}
            </p>

            <h3 className="font-libre font-bold text-xs sm:text-sm mb-2 mt-4">
              {t("modal.termsConsent.typesTitle")}
            </h3>

            <h4 className="font-libre font-bold text-xs sm:text-sm mb-1">
              {t("modal.termsConsent.emailTitle")}
            </h4>
            <ul className="list-disc pl-5 text-xs sm:text-sm font-libre mb-2 space-y-1">
              <li>{t("modal.termsConsent.emailNewKudos")}</li>
              <li>{t("modal.termsConsent.emailReminders")}</li>
              <li>{t("modal.termsConsent.emailNews")}</li>
            </ul>

            <h4 className="font-libre font-bold text-xs sm:text-sm mb-1">
              {t("modal.termsConsent.smsTitle")}
            </h4>
            <ul className="list-disc pl-5 text-xs sm:text-sm font-libre mb-2 space-y-1">
              <li>{t("modal.termsConsent.smsReminders")}</li>
              <li>{t("modal.termsConsent.smsActivity")}</li>
              <li>{t("modal.termsConsent.smsUpdates")}</li>
            </ul>

            <h4 className="font-libre font-bold text-xs sm:text-sm mb-1">
              {t("modal.termsConsent.whatsappTitle")}
            </h4>
            <ul className="list-disc pl-5 text-xs sm:text-sm font-libre mb-2 space-y-1">
              <li>{t("modal.termsConsent.whatsappReminders")}</li>
              <li>{t("modal.termsConsent.whatsappInspo")}</li>
            </ul>

            <h4 className="font-libre font-bold text-xs sm:text-sm mb-1">
              {t("modal.termsConsent.pushMobileTitle")}
            </h4>
            <ul className="list-disc pl-5 text-xs sm:text-sm font-libre mb-2 space-y-1">
              <li>{t("modal.termsConsent.pushMobileAlerts")}</li>
              <li>{t("modal.termsConsent.pushMobileNudges")}</li>
            </ul>

            <h4 className="font-libre font-bold text-xs sm:text-sm mb-1">
              {t("modal.termsConsent.pushWebTitle")}
            </h4>
            <ul className="list-disc pl-5 text-xs sm:text-sm font-libre mb-3 space-y-1">
              <li>{t("modal.termsConsent.pushWebUpdates")}</li>
              <li>{t("modal.termsConsent.pushWebReminders")}</li>
            </ul>

            <h3 className="font-libre font-bold text-xs sm:text-sm mb-2 mt-4">
              {t("modal.termsConsent.frequencyTitle")}
            </h3>
            <p className="text-xs sm:text-sm font-medium font-libre mb-2">
              {t("modal.termsConsent.frequencyNote")}
            </p>
            <ul className="list-disc pl-5 text-xs sm:text-sm font-libre mb-3 space-y-1">
              <li>{t("modal.termsConsent.frequencyWeekly")}</li>
              <li>{t("modal.termsConsent.frequencyOptOut")}</li>
            </ul>

            <h3 className="font-libre font-bold text-xs sm:text-sm mb-2 mt-4">
              {t("modal.termsConsent.privacyTitle")}
            </h3>
            <p className="text-xs sm:text-sm font-medium font-libre mb-2">
              {t("modal.termsConsent.privacyNote")}
            </p>
            <ul className="list-disc pl-5 text-xs sm:text-sm font-libre mb-3 space-y-1">
              <li>{t("modal.termsConsent.privacyOptOut")}</li>
              <li>{t("modal.termsConsent.privacyDisable")}</li>
              <li>{t("modal.termsConsent.privacyDeletion")}</li>
            </ul>

            <div className="text-center mt-4">
              <p className="text-xs sm:text-sm font-medium font-libre">
                {t("modal.termsConsent.contact")}{" "}
                <a
                  href="mailto:support@cheerchampion.com"
                  className="text-blue-600 underline"
                >
                  support@cheerchampion.com
                </a>
              </p>
              <p className="text-xs sm:text-sm font-bold font-libre mt-2 text-[#3A86C9]">
                {t("modal.termsConsent.thanks")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsConsentViewModal;
