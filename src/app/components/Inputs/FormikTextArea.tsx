import React from "react";
import { useTranslation } from "react-i18next";

interface Props {
  name:string;
  formik:any;
}
export default function FormikTextArea({name,formik}:Props) {
  const { t } = useTranslation();
  return (
    <div>
     <textarea
        // as="textarea"
        name={name}
        placeholder={t("home.inputPlaceholder")}
        className="w-full h-[152px] lg:h-[220px] bg-input-bg text-600 placeholder:text-400 text-xs lg:text-sm font-libre font-normal p-2 border-0 rounded-md focus:outline-none focus:ring-2 focus:ring-input-bg"
        {...formik.getFieldProps(name)}
      />
       {formik.touched[name] && formik.errors[name] && (
        <div className="text-red-500 text-sm">{formik.errors[name]}</div>
      )}

    </div>
  );
}
