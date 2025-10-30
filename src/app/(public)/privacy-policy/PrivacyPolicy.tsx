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
      <div className="py-4 text-sm text-gray-700 font-libre px-10 lg:px-15">
        <div className="flex mb-4">
          <BackButton />
          <h1 className="text-2xl lg:text-4xl font-bold text-gray-800 mb-0 lg:mb-4 font-comfortaa">
            {t("privacy.title")}{" "}
            <span className="text-primary">| {t("general.cheerChampion")}</span>
          </h1>
        </div>
        <p>{t("privacy.intro")}</p>

        {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
          <div key={num}>
            <h2 className="text-lg font-bold mt-6 text-black font-comfortaa">
              {t(`privacy.section${num}.title`)}
            </h2>
            {Array.isArray(
              t(`privacy.section${num}.content`, { returnObjects: true })
            ) ? (
              <ul className="list-disc list-inside pl-2">
                {(
                  t(`privacy.section${num}.content`, {
                    returnObjects: true,
                  }) as string[]
                ).map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            ) : (
              <p>
                {t(`privacy.section${num}.content`)}
                {num === 8 && (
                  <a
                    href="mailto:cp@cheerchampion.com"
                    className="text-secondary-dark underline italic"
                  >
                    cp@cheerchampion.com
                  </a>
                )}
              </p>
            )}
          </div>
        ))}
        <label className="flex w-full mt-4 justify-center text-xs lg:text-sm font-libre font-medium">
          Powered By CheerChampion V{APP_VERSION}
        </label>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
