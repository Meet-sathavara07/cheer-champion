"use client";
import layout from "@/assets/layouts/layout-modal.svg";
import BackgroundLayer from "@/assets/layouts/background-layer.svg";
import closeIcon from "@/assets/icon/modal-close.svg";
import Image from "next/image";
import Button from "../Button";
import { useTranslation } from "react-i18next";

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  onCancel: () => void;
  onSuccess: () => void;
  accountExist: any;
  isLoading: boolean;
}

export default function MergeAccountModal({
  open,
  setOpen,
  accountExist,
  onCancel,
  onSuccess,
  isLoading,
}: Props) {
  const { t } = useTranslation();
  if (!open) return null;
  let identifierText;
  if (accountExist.identifier && accountExist.identifier.includes("@")) {
    identifierText = `${accountExist.identifier} ${t("modal.email")}`;
  } else if (accountExist.identifier) {
    identifierText = `${accountExist.code ? `+${accountExist.code}-` : ""}${
      accountExist.identifier
    } ${t("modal.whatsappNumber")}`;
  } else {
    identifierText = "";
  }
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/72 z-50">
      {/* Background Layer */}
      <Image
        className="absolute inset-0 w-full overflow-visible h-[70%] top-[20%] bottom-[10%] object-cover"
        src={BackgroundLayer}
        alt="Background Layer"
      />

      <div className="relative w-full max-w-sm lg:max-w-lg bg-white rounded-lg shadow-lg z-20">
        {/* Header with green wave */}
        <div className="w-full h-[44px] lg:h-[85px] relative">
          <Image
            className="absolute object-cover object-bottom top-0 left-0 w-full h-[44px] lg:h-[85px]"
            src={layout}
            alt="layout"
            height={85}
          />
        </div>

        {/* Content */}
        <div className="px-10 pb-8 pt-2 flex flex-col items-center">
          <h3 className="text-base lg:text-lg text-center font-bold text-primary mt-4 font-comfortaa">
            {t("modal.title")}
          </h3>
          <p className="text-sm lg:text-lg text-center text-gray-600 mt-2">
            {t("modal.description", { identifier: identifierText })}
          </p>

          <div className="flex gap-4 mt-4 lg:mt-6">
            <Button
              className="bg-white border-1 hover:bg-white border-secondary !text-secondary-dark"
              onClick={onCancel}
            >
              {t("modal.cancel")}
            </Button>
            <Button isLoading={isLoading} onClick={onSuccess}>
              {t("modal.confirm")}
            </Button>
          </div>
        </div>

        {/* Close Button */}
        <button
          className="btn absolute top-2 right-2 p-2 z-10"
          onClick={() => setOpen(false)}
        >
          <Image
            className="z-20 object-contain"
            src={closeIcon}
            alt="closeIcon"
            height={13}
            width={13}
          />
        </button>
      </div>
    </div>
  );
}
