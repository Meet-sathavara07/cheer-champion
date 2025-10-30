import React from "react";
import SettingsIcon from "@/assets/icon/Settings.svg";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next";

interface SettingsPanelProps {
  isSidebarOpen:boolean,
  setSidebarOpen: ( isSidebarOpen: boolean) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({isSidebarOpen, setSidebarOpen}: SettingsPanelProps) => {
  const { t } = useTranslation(); 
  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-[80%] max-w-[320px] bg-input-bg z-40 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 lg:static lg:translate-x-0 lg:flex lg:flex-col lg:w-[320px] lg:min-w-[320px] rounded-[6px]`}
      >
        <div className="py-10 px-8 flex flex-col">
          <div className="flex items-center mb-8">
            <Image
              src={SettingsIcon}
              alt="SettingsIcon"
              className="h-[18px] w-[18px] mr-2"
            />
            <h2 className="text-md leading-4 text-black font-comfortaa font-bold">
            {t("settings.title")}
            </h2>
          </div>
          <ul>
            <li className="border-b border-b-[#BEBEBE]">
              <Link
                href="/privacy-policy"
                className="inline-flex text-black hover:text-600 font-medium text-sm font-libre items-center p-5 w-full"
              >
                {t("settings.privacyPolicy")}
              </Link>
            </li>
            <li className="border-b border-b-[#BEBEBE]">
              <Link
                href="/terms-of-service"
                className="inline-flex text-black hover:text-600 font-medium text-sm font-libre items-center p-5 w-full"
              >
                {t("settings.terms")}
              </Link>
            </li>
            <li className="border-b border-b-[#BEBEBE]">
              <Link
                href="/how-it-works"
                className="inline-flex text-black hover:text-600 font-medium text-sm font-libre items-center p-5 w-full"
              >
                {t("settings.howItWorks")}
              </Link>
            </li>
            {/* <li className="mb-20">
              <Link
                href="/contact-us"
                className="inline-flex text-black hover:text-600 font-medium text-sm font-libre items-center p-5 w-full"
              >
                {t("settings.reportProblem")}
              </Link>
            </li> */}
          </ul>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 bg-black/72 z-30 lg:hidden"
        ></div>
      )}
    </>
  );
};

export default SettingsPanel;
