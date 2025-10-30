"use client";
import BackButton from "@/app/components/BackButton";
import PublicNavbar from "@/app/components/Navbar/PublicNavbar";
import { APP_VERSION } from "@/constants/version";
import React from "react";
import { useTranslation } from "react-i18next";

const TermsConditions: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen w-full flex flex-col max-w-[120rem] mx-auto">
      <PublicNavbar />
      <div className="py-4 text-sm text-gray-700 font-libre px-10 lg:px-15 flex flex-col mx-auto">
        <div className="flex mb-4">
          <BackButton />
          <h1 className="text-2xl lg:text-4xl font-bold text-gray-800 mb-0 lg:mb-4 font-comfortaa">
            {t("terms.heading")}{" "}
            <span className="text-primary">| {t("general.cheerChampion")}</span>
          </h1>
        </div>

        <p className="mb-4">{t("terms.intro")}</p>

        <h2 className="font-comfortaa font-bold text-lg text-black mb-2 mt-4">
          {t("terms.use.title")}
        </h2>
        <p className="mb-4">{t("terms.use.desc")}</p>

        <h2 className="font-comfortaa font-bold text-lg text-black mb-2 mt-4">
          {t("terms.content.title")}
        </h2>
        <p className="mb-4">{t("terms.content.desc")}</p>

        <h2 className="font-comfortaa font-bold text-lg text-black mb-2 mt-4">
          {t("terms.prohibited.title")}
        </h2>
        <ul className="list-disc list-inside mb-4">
          <li>{t("terms.prohibited.laws")}</li>
          <li>{t("terms.prohibited.harmful")}</li>
          <li>{t("terms.prohibited.ip")}</li>
          <li>{t("terms.prohibited.access")}</li>
        </ul>

        <h2 className="font-comfortaa font-bold text-lg text-black mb-2 mt-4">
          {t("terms.termination.title")}
        </h2>
        <p className="mb-4">{t("terms.termination.desc")}</p>

        <h2 className="font-comfortaa font-bold text-lg text-black mb-2 mt-4">
          {t("terms.disclaimer.title")}
        </h2>
        <p className="mb-4">{t("terms.disclaimer.desc")}</p>

        <h2 className="font-comfortaa font-bold text-lg text-black mb-2 mt-4">
          {t("terms.liability.title")}
        </h2>
        <p className="mb-4">{t("terms.liability.desc")}</p>

        <h2 className="font-comfortaa font-bold text-lg text-black mb-2 mt-4">
          {t("terms.changes.title")}
        </h2>
        <p className="mb-4">{t("terms.changes.desc")}</p>

        <h2 className="font-comfortaa font-bold text-lg text-black mb-2 mt-4">
          {t("terms.contact.title")}
        </h2>
        <p className="mb-4">
          {t("terms.contact.desc")}{" "}
          <a
            href="mailto:cp@cheerchampion.com"
            className="text-secondary-dark underline italic"
          >
            cp@cheerchampion.com
          </a>
        </p>
        <label className="flex mt-4 w-full justify-center text-xs lg:text-sm font-libre font-medium">
          Powered By CheerChampion V{APP_VERSION}
        </label>
      </div>
    </div>
  );
};

export default TermsConditions;
