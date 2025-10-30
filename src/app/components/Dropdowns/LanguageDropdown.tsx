"use client";
import React, { useEffect, useRef } from "react";
import { useState } from "react";
import dropdownIcon from "@/assets/icon/dropdown-black.svg";
import Image from "next/image";
import { flags, languages } from "@/helpers/constants";
import { useLanguage } from "@/app/context/LanguageContext";
import { initI18n } from "@/i18n";
initI18n();

interface Language {
  value: string;
  label: string;
}

interface LanguageDropdownProps {
  mobileView?: boolean;
}

export default function LanguageDropdown({
  mobileView = false,
}: LanguageDropdownProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { selectedLanguage, setLanguage } = useLanguage();
  const dropdownRef = useRef<any>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current?.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const selectLanguage = (lang: Language) => {
    setLanguage(lang);
    setDropdownOpen(false);
  };

  if (mobileView) {
    return (
      <div className="w-full mb-4" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg flex items-center justify-between"
        >
          <div className="flex items-center">
            <Image
              src={flags[selectedLanguage.value]}
              alt="flag"
              width={25}
              height={15}
              className="mr-3"
            />
            <span className="text-sm text-gray-700 font-medium">
              {selectedLanguage.label}
            </span>
          </div>
          <Image
            src={dropdownIcon}
            alt="dropdown"
            width={12}
            height={12}
            className={`transition-transform ${
              dropdownOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {dropdownOpen && (
          <div className="mt-2 w-full rounded-lg border border-gray-200 bg-white shadow-sm">
            {languages
              .filter((lang) => lang.value !== selectedLanguage.value)
              .map((lang) => (
                <button
                  key={lang.value}
                  onClick={() => selectLanguage(lang)}
                  className="w-full px-4 py-3 hover:bg-gray-50 flex items-center border-t border-gray-100 first:border-t-0"
                >
                  <Image
                    src={flags[lang.value]}
                    alt="flag"
                    width={25}
                    height={15}
                    className="mr-3"
                  />
                  <span className="text-sm text-gray-600 font-medium">
                    {lang.label}
                  </span>
                </button>
              ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative mr-4" ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="px-3 py-2 btn bg-[#FFFFFF] border-[1px] border-[#E6E6E6] rounded-[5px] flex items-center justify-between w-[116px]"
      >
        <div className="flex items-center">
          <Image
            src={flags[selectedLanguage.value]}
            alt="flag"
            className="w-[25px] h-[15] mr-1"
          />
          <span className="text-xs font-libre font-normal ">
            {selectedLanguage.label}
          </span>
        </div>

        <Image
          src={dropdownIcon}
          alt="flag"
          width={10}
          height={10}
          className={`${dropdownOpen ? "rotate-180" : ""}`}
        />
      </button>

      {dropdownOpen && (
        <div className="absolute mt-2 w-full rounded-md border-[1px] border-[#E6E6E6] bg-[#FFFFFF] z-10">
          {languages
            .filter((lang) => lang.value !== selectedLanguage.value)
            .map((lang) => (
              <button
                key={lang.value}
                onClick={() => selectLanguage(lang)}
                className="flex btn w-full px-4 py-2"
              >
                <Image
                  src={flags[lang.value]}
                  alt="flag"
                  width={25}
                  height={15}
                  className="mr-2"
                />
                <span className="text-xs font-libre font-normal">
                  {lang.label}
                </span>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
