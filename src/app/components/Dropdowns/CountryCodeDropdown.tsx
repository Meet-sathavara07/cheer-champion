"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import DropdownIcon from "@/assets/icon/dropdown-icon.svg";
// import { CountryCodes } from "@/helpers/utils";
import { allCountries } from "country-telephone-data";
import { useCountryDetails } from "@/app/context/CountryCodeContext";
import { getFlagUrl } from "@/helpers/utils";

const CountryCodeDropdown = ({
  onSelect,
  className = "",
  disabled = false,
}: {
  onSelect?: (code: string) => void;
  className?: string;
  disabled?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const {countryDetails, setCountryDetails} = useCountryDetails();
  const handleSelect = (country:any) => {
    if(onSelect){
      onSelect(country)
    }
    setCountryDetails(country);
    setOpen(false);
    setSearch("");
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
 
  // const selected: any = allCountries.find(
  //   (c: any) => c.dialCode === countryDetails
  // );

  return (
    <div ref={ref}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className={`bg-input-bg btn mb-5 lg:mb-0 flex justify-between items-center border border-border rounded-md p-2 h-[40px] w-[96px] relative mr-2 ${className} `}
      >
        <div className="flex items-center gap-2">
          <Image
            src={getFlagUrl(countryDetails.iso2, countryDetails.dialCode)}
            alt={countryDetails.iso2}
            width={20}
            height={16}
            className="w-5 h-4 object-contain"
          />
          <span className="text-sm font-libre font-normal">
            +{countryDetails.dialCode}
          </span>
        </div>

        <Image
          src={DropdownIcon}
          alt={"dropdown-icon"}
          width={10}
          height={10}
          className="ml-1"
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute bg-white border border-border mt-1 w-80 z-50 rounded-md shadow-md overflow-hidden">
          <div className="p-2 border-b border-gray-200">
            <input
              autoFocus
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search country..."
              className="w-full px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {allCountries.filter(({ iso2, name, dialCode }: any) => {
              const query = search.toLowerCase();
              return (
                name.toLowerCase().includes(query) ||
                iso2.toLowerCase().includes(query) ||
                dialCode.includes(query)
              );
            }).map((country: any) => (
              <div
                key={`${country.iso2}-${country.dialCode}`}
                onClick={() => handleSelect(country)}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
              >
                <Image
                  src={getFlagUrl(country.iso2, country.dialCode)}
                  alt={country.iso2}
                  width={20}
                  height={16}
                  className="w-5 h-4 object-contain"
                />
                <span className="text-sm font-libre font-normal">
                  {country.name} (+{country.dialCode})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CountryCodeDropdown;
