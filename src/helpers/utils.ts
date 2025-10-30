"use client";
// const isProduction = process.env.NODE_ENV === "production";

// export const log = (...args) => {
//   if (!isProduction) {
//     console.log(...args);
//   }
// };

import { allCountries } from "country-telephone-data";

// const preferredCountryByDialCode: Record<string, string> = {
//   "1": "us",
//   "44": "gb",
//   "61": "au",
//   "358": "fi",
//   "7": "ru",
//   "599": "cw",
// };

const getBrowserLocaleCountry = () => {
  const locale = Intl.DateTimeFormat().resolvedOptions().locale;
  const parts = locale.split("-");
  return parts[1]?.toLowerCase() || "us";
};

// export const CountryCodes = allCountries.filter((country) => {
//   const preferredIso2 = preferredCountryByDialCode[country.dialCode];
//   return preferredIso2 ? country.iso2 === preferredIso2 : true;
// });

export const browserCountryCode:any = allCountries.find(
  (c: any) => c.iso2.toLowerCase() === getBrowserLocaleCountry()
) || allCountries.find((c: any) => c.iso2.toLowerCase() === "us"); // Fallback to US

// Helper function to find country by dial code
export const findCountryByDialCode = (dialCode: string) => {
  return allCountries.find((country: any) => country.dialCode === dialCode);
};

// Helper function to get flag URL with proper fallback
export const getFlagUrl = (iso2: string, dialCode?: string) => {
  // If iso2 is provided and valid, use it
  if (iso2 && iso2.trim()) {
    return `https://flagcdn.com/w40/${iso2.toLowerCase()}.png`;
  }
  
  // If iso2 is missing but dialCode is provided, find the country by dial code
  if (dialCode) {
    const country = findCountryByDialCode(dialCode);
    if (country) {
      return `https://flagcdn.com/w40/${country.iso2.toLowerCase()}.png`;
    }
  }
  
  // Final fallback to a generic flag or default
  return `https://flagcdn.com/w40/us.png`;
};

// Helper function to validate and sync country details
export const validateCountryDetails = (countryDetails: any) => {
  // If both iso2 and dialCode are present, verify they match
  if (countryDetails.iso2 && countryDetails.dialCode) {
    const countryByIso2 = allCountries.find(
      (c: any) => c.iso2.toLowerCase() === countryDetails.iso2.toLowerCase()
    );
    
    if (countryByIso2 && countryByIso2.dialCode === countryDetails.dialCode) {
      return countryDetails; // Valid combination
    }
  }
  
  // If dialCode exists but iso2 is missing/invalid, find by dialCode
  if (countryDetails.dialCode) {
    const countryByDialCode = findCountryByDialCode(countryDetails.dialCode);
    if (countryByDialCode) {
      return {
        dialCode: countryByDialCode.dialCode,
        iso2: countryByDialCode.iso2,
      };
    }
  }
  
  // If iso2 exists but dialCode is missing/invalid, find by iso2
  if (countryDetails.iso2) {
    const countryByIso2 = allCountries.find(
      (c: any) => c.iso2.toLowerCase() === countryDetails.iso2.toLowerCase()
    );
    if (countryByIso2) {
      return {
        dialCode: countryByIso2.dialCode,
        iso2: countryByIso2.iso2,
      };
    }
  }
  
  // Final fallback to browser country or US
  return browserCountryCode || { dialCode: "1", iso2: "us" };
};

export const sanitizeMobileNumber = (value:string) => {
  return value.replace(/\D/g, ""); // Remove all non-digit characters
};
export const isDummyEmail = (email:string) => {
  return email.includes("@cheerchampion.com") && email !== "cp@cheerchampion.com";
};