"use client";
import layout from "@/assets/layouts/layout-modal.svg";
import closeIcon from "@/assets/icon/modal-close.svg";
import BackgroundLayer from "@/assets/layouts/background-layer.svg";
import Image from "next/image";
import Button from "../Button";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { usePostContext } from "@/app/context/KudoPostContext";

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function NotLoggedInModal({ open, setOpen }: Props) {
  const router = useRouter();
  const { t } = useTranslation();
   const { formData, setFormData }: any = usePostContext();
   
  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/72 z-50">
      <Image
        className="absolute overflow-visible inset-0 w-full h-[70%] top-[20%] bottom-[10%] object-cover"
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
          {/* <Image
            className=""
            src={SuccessImage}
            alt="SuccessImage"
            height={91}
            width={91}
          /> */}
          <h3 className="text-base lg:text-lg text-center font-bold mb-6 text-primary mt-4 font-comfortaa">
          {t("loginRequiredModal.message")}
          </h3>

          <Button className="rounded-md" onClick={() => {
            setFormData({...formData, isDirectKudo:true});
            router.push("/login")}
            }>
          {t("loginRequiredModal.loginButton")}
          </Button>
        </div>

        {/* Close Button */}
        <button
          className="btn absolute top-2 right-2 p-2 z-10"
          onClick={() => setOpen(false)}
        >
          <Image
            className="z-20 object-contain "
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
