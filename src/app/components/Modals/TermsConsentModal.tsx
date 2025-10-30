"use client";
import React, { useState } from "react";
import Image from "next/image";
import layout from "@/assets/layouts/layout-modal.svg";
import BackgroundLayer from "@/assets/layouts/background-layer.svg";
import Button from "../Button";
import { useTranslation } from "react-i18next";

interface TermsConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: (status: string) => Promise<void>;
  isLoading?: boolean;
}

const TermsConsentModal: React.FC<TermsConsentModalProps> = ({
  isOpen,
  onClose,
  onAccept,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const [consentGiven, setConsentGiven] = useState(false);
  const [showFullPolicy, setShowFullPolicy] = useState(false);
  const [acceptLoading, setAcceptLoading] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);

  if (!isOpen) return null;

  const handleAccept = async () => {
    setAcceptLoading(true);
    try {
      await onAccept(consentGiven ? "yes" : "no");
    } finally {
      setAcceptLoading(false);
    }
  };

  const handleReject = async () => {
    setRejectLoading(true);
    try {
      await onAccept("pending");
    } finally {
      setRejectLoading(false);
    }
  };

  const isAnyLoading = acceptLoading || rejectLoading || isLoading;

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
            {t("modal.termsConsent.title")}
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <div className="pt-3 sm:pt-4 mb-4 sm:mb-6">
            <h2 className="text-sm sm:text-base lg:text-lg text-center font-bold text-[#3A86C9] font-comfortaa mb-2 sm:mb-3">
              {t("modal.termsConsent.heading")}
            </h2>
            <div className="flex items-start">
              <input
                type="checkbox"
                checked={consentGiven}
                onChange={(e) => setConsentGiven(e.target.checked)}
                disabled={isAnyLoading}
                className="h-4 w-4 sm:h-5 sm:w-5 mr-3 mt-1 flex-shrink-0 cursor-pointer disabled:opacity-50"
              />
              <div>
                <span className="text-xs sm:text-sm font-medium font-libre">
                  {t("modal.termsConsent.agreement")}
                </span>
                <button
                  onClick={() => setShowFullPolicy(!showFullPolicy)}
                  disabled={isAnyLoading}
                  className="text-blue-600 hover:underline cursor-pointer text-xs sm:text-sm focus:outline-none font-libre disabled:opacity-50"
                >
                  {showFullPolicy
                    ? t("modal.termsConsent.hideDetails")
                    : t("modal.termsConsent.readDetails")}
                </button>
              </div>
            </div>
          </div>
          {showFullPolicy && (
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
                  </a>{" "}
                </p>
                <p className="text-xs sm:text-sm font-bold font-libre mt-2 text-[#3A86C9]">
                  {t("modal.termsConsent.thanks")}
                </p>
              </div>
            </div>
          )}
        </div>
        <div className="px-4 pb-4 flex justify-center space-x-4">
          <Button
            onClick={handleReject}
            isLoading={rejectLoading}
            disabled={isAnyLoading}
            className="w-full max-w-xs bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm sm:text-base disabled:opacity-50 transition-colors"
          >
            {t("modal.termsConsent.remindLater")}
          </Button>
          <Button
            onClick={handleAccept}
            isLoading={acceptLoading}
            disabled={isAnyLoading || !consentGiven}
            className="w-full max-w-xs bg-primary hover:bg-primary-dark text-white text-sm sm:text-base disabled:opacity-50 transition-colors"
          >
            {t("modal.termsConsent.acceptContinue")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TermsConsentModal;
