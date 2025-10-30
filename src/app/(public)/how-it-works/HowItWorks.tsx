"use client";
import React from "react";
import PublicNavbar from "@/app/components/Navbar/PublicNavbar";
import BackButton from "@/app/components/BackButton";
import { useTranslation } from "react-i18next";
import { APP_VERSION } from "@/constants/version";

interface HowItWorksItem {
  title: string;
  desc: string;
}

const HowItWorks: React.FC = () => {
  const { t } = useTranslation();
  const items = t("howWorks.whatYouCanDo.items", {
    returnObjects: true,
  }) as HowItWorksItem[];

  return (
    <div className="min-h-screen w-full flex flex-col max-w-[120rem] mx-auto">
      <PublicNavbar />
      <div className="py-4 text-sm text-gray-700 font-libre px-4 lg:px-15 flex flex-col mx-auto">
        <div className="flex mb-4">
          <BackButton />
          <h1 className="text-2xl lg:text-4xl font-bold text-gray-800 mb-0 lg:mb-4 font-comfortaa">
          {t("howWorks.title")} <span className="text-primary">| {t("general.cheerChampion")}</span>
          </h1>
        </div>
        <p className="mb-4">{t("howWorks.intro")}</p>

        <h2 className="text-xl font-comfortaa font-semibold text-black mt-6 mb-3">
          {t("howWorks.whatYouCanDo.title")}
        </h2>
        <ol className="list-decimal list-inside space-y-4 mb-6">
          {items.map((item, index) => (
            <li key={index}>
              <strong>{item.title}</strong>
              <br />
              {item.desc}
            </li>
          ))}
        </ol>
        <h2 className="text-xl font-comfortaa font-semibold text-black mt-6 mb-3">
          {t("howWorks.whyItMatters.title")}
        </h2>
        <p className="mb-6">{t("howWorks.whyItMatters.desc")}</p>

        <h2 className="text-xl font-comfortaa font-semibold text-black mt-6 mb-3">
          {t("howWorks.learnMore.title")}
        </h2>
        <p>
          {t("howWorks.learnMore.desc")}{" "}
          <a
            href="https://docs.google.com/document/d/1iOmK_CCCbMEQTGl8rImY89FNGNLN4RMweo2wlopZqHU"
            target="_blank"
            rel="noopener noreferrer"
            className="text-secondary-dark underline italic"
          >
            {t("howWorks.learnMore.link")}
          </a>
        </p>

        <footer className="pt-8 border-t border-gray-200 text-center text-gray-600 font-medium mt-10">
          {t("howWorks.footer")}
        </footer>
        <label className="flex mt-4 w-full justify-center text-xs lg:text-sm font-libre font-medium">
          Powered By CheerChampion V{APP_VERSION}
        </label>
      </div>
    </div>
  );
};

export default HowItWorks;
