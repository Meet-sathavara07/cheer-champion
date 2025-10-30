import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import closeIcon from "@/assets/icon/modal-close.svg";
import Image from "next/image";
import Button from "../Button";
import toast from "react-hot-toast";
import { verifyOTP } from "@/app/models/authModel";
import * as Sentry from "@sentry/nextjs";
import { useTranslation } from "react-i18next";

interface Props {
  otpSentTo: { identifier: string; countryCode: string; countryIso2: string };
  setOpen: (open: boolean) => void;
  open: boolean;
  onSuccess: (accountExist: string | null) => void;
}

const VerifyOTPModal: React.FC<Props> = ({
  otpSentTo,
  setOpen,
  open,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const [isLoading, setLoading] = useState(false);

  const handleVerifyOTP = async (OTP: string) => {
    setLoading(true);
    try {
      const response = await verifyOTP(
        OTP,
        otpSentTo.identifier,
        otpSentTo.countryCode,
        otpSentTo.countryIso2,
        "verify"
      );
      toast.success(response.message);
      setOpen(false);
      onSuccess(response.user);
      formik.resetForm();
    } catch (error: any) {
      Sentry.captureException(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      OTP: "",
    },
    onSubmit: (values) => {
      handleVerifyOTP(values.OTP);
    },
    validationSchema: Yup.object({
      OTP: Yup.string()
        .required(t("modal.verifyOTP.error.required"))
        .matches(/^[0-9]{6}$/, t("modal.verifyOTP.error.format")),
    }),
  });

  if (!open) return null;

  return (
    <div className="fixed flex items-center justify-center h-full w-full inset-0 bg-black/70 z-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-114 relative">
        <div className="flex justify-between mb-7">
          <h2 className="text-lg text-600 font-semibold font-comfortaa">
            {t("modal.verifyOTP.title")}
          </h2>

          <button
            type="button"
            className="btn p-2"
            onClick={() => {
              setOpen(false);
              formik.resetForm();
            }}
          >
            <Image src={closeIcon} alt="closeIcon" height={13} width={13} />
          </button>
        </div>

        <p className="text-sm text-300 font-comfortaa">
          {t("modal.verifyOTP.instruction")}{" "}
          {otpSentTo.countryCode
            ? t("modal.verifyOTP.WhatsAppno") + otpSentTo.countryCode + "-"
            : t("modal.verifyOTP.emailcheck")}
       {" "}   {otpSentTo.identifier}
        </p>
        <form onSubmit={formik.handleSubmit}>
          <div className="mt-2 mb-4">
            <input
              type="password"
              placeholder={t("modal.verifyOTP.placeholder")}
              className="border min-w-[293px] border-border bg-input-bg text-600 placeholder:text-400 font-libre text-sm text-normal p-2 rounded-md"
              maxLength={6}
              {...formik.getFieldProps("OTP")}
            />
            {formik.touched.OTP && formik.errors.OTP && (
              <div className="text-red-600 text-sm">{formik.errors.OTP}</div>
            )}
          </div>

          <Button
            isLoading={isLoading}
            type="submit"
            className="mt-4 px-6 py-2"
          >
            {t("modal.verifyOTP.verifyButton")}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default VerifyOTPModal;
