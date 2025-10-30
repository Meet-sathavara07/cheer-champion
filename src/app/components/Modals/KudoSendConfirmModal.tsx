"use client";
import React from "react";
import Image from "next/image";
import layout from "@/assets/layouts/layout-modal.svg";
import BackgroundLayer from "@/assets/layouts/background-layer.svg";
import closeIcon from "@/assets/icon/modal-close.svg";
import { useTranslation } from "react-i18next";
import Button from "../Button";

interface KudoSendConfirmModalProps {
  isOpen: boolean;
  isLoading: boolean;
  setOpen: (isOpen:boolean) => void;
  onConfirm: () => void;
}

interface KudoSendConfirmModalProps {
  isOpen: boolean;
  isLoading: boolean;
  setOpen: (isOpen: boolean) => void;
  onConfirm: () => void;
}

const KudoSendConfirmModal: React.FC<KudoSendConfirmModalProps> = ({
  isOpen,
  setOpen,
  onConfirm,
  isLoading,
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/72 z-50">
      <Image
        className="absolute overflow-visible inset-0 w-full h-[70%] top-[20%] bottom-[10%] object-cover"
        src={BackgroundLayer}
        alt="Background Layer"
      />
      <div className="relative w-full max-w-sm lg:max-w-lg bg-white rounded-lg shadow-lg z-20">
        {/* Header with green wave */}
        <div className="w-full h-[55px] lg:h-[85px] relative">
          <Image
            className="absolute object-cover object-bottom top-0 left-0 w-full h-[55px] lg:h-[85px]"
            src={layout}
            alt="layout"
            height={85}
          />

          <h2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-sm lg:text-lg text-center font-bold text-600 font-comfortaa">
              {t("sendKudoModal.alreadySentTitle")}
          </h2>
        </div>

        {/* Content */}
        <div className="px-10 pb-8 pt-2 flex flex-col items-center">
          <p className="text-xs lg:text-base font-medium font-libre text-center text-gray-600 mb-0 lg:mb-5">
             {t("sendKudoModal.alreadySentMessage")}
          </p>
          <div className="flex mt-4 gap-4">
            <Button
              className="bg-white border-1 border-secondary !text-secondary-dark hover:bg-white hover:text-secondary-dark hover:border-dark"
              onClick={() => setOpen(false)}
            >
              {t("modal.cancel")}
            </Button>
            <Button isLoading={isLoading} onClick={onConfirm}>
                {t("sendKudoModal.sendAgain")}
            </Button>
          </div>
        </div>

        {/* Close Button */}
        <button
          className="btn absolute top-2 right-2 p-2 z-10"
          onClick={() => setOpen(false)}
        >
          <Image
            className="z-20 object-contain h-[10px] w-[10px] lg:h-[13px] lg:w-[13px] "
            src={closeIcon}
            alt="closeIcon"
            height={13}
            width={13}
          />
        </button>
      </div>
    </div>
  );
};

export default KudoSendConfirmModal;
