"use client";
import React from "react";
import { useTranslation } from "react-i18next";
import BackButton from "@/app/components/BackButton";
import PublicNavbar from "@/app/components/Navbar/PublicNavbar";
import { APP_VERSION } from "@/constants/version";

const PrivacyPolicy: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen w-full flex flex-col max-w-[120rem] mx-auto">
      <PublicNavbar />
      <div className="py-4 flex-1 flex-col flex text-sm text-gray-700 font-libre px-10 lg:px-15">
        <div className="flex mb-4">
          <BackButton />
          <h1 className="text-2xl lg:text-4xl font-bold text-gray-800 mb-0 lg:mb-4 font-comfortaa">
            {t("safety.title")}{" "}
            <span className="text-primary">| {t("general.cheerChampion")}</span>
          </h1>
        </div>
        <p>{t("safety.intro")}</p>

        {[1, 2, 3, 4].map((num) => (
          <div key={num}>
            <h2 className="text-lg font-bold mt-6 text-black font-comfortaa">
              {t(`safety.section${num}.title`)}
            </h2>
              <p>
                {t(`safety.section${num}.content`)}
                {num === 4 && (
                  <a
                    href="mailto:cp@cheerchampion.com"
                    className="text-secondary-dark underline italic"
                  >
                     cp@cheerchampion.com
                  </a>
                )}
              </p>
          </div>
        ))}
        <label className="flex w-full mt-auto justify-center text-xs lg:text-sm font-libre font-medium">
          Powered By CheerChampion V{APP_VERSION}
        </label>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
