"use client";
import { browserCountryCode, validateCountryDetails } from "@/helpers/utils";
import { createContext, useContext, useEffect, useState } from "react";

type CountryDetails = {
  dialCode: string;
  iso2: string;
};

type CountryCodeContextType = {
  countryDetails: CountryDetails;
  setCountryDetails: (countryDetails: CountryDetails) => void;
};

const CountryCodeContext = createContext<CountryCodeContextType | undefined>(
  undefined
);

export const CountryCodeProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [countryDetails, setCountryDetails] = useState<CountryDetails>({
    dialCode: browserCountryCode?.dialCode || "1",
    iso2: browserCountryCode?.iso2 || "us",
  });

  useEffect(() => {
  try {
    const storedCountryCode = localStorage.getItem("countryDetails");
    if (storedCountryCode) {
      const countryCodeParse = JSON.parse(storedCountryCode);
      // Validate and sync the stored country details
      const validatedCountry = validateCountryDetails(countryCodeParse);
      setCountryDetails(validatedCountry);
    }
  } catch (error) {
    console.error("Error parsing stored country details:", error);
    // If parsing fails, use browser country or default
    const fallbackCountry = browserCountryCode || {
      dialCode: "1",
      iso2: "us",
    };
    setCountryDetails(fallbackCountry);
    }
  }, []);

  useEffect(() => {
    const countryCodeJSON = JSON.stringify(countryDetails);
    localStorage.setItem("countryDetails", countryCodeJSON);
  }, [countryDetails]);

  const handleSetCountryDetails = (newCountryDetails: CountryDetails) => {
    // Validate the new country details before setting
    const validatedCountry = validateCountryDetails(newCountryDetails);
    setCountryDetails(validatedCountry);
  };

  return (
    <CountryCodeContext.Provider value={{ countryDetails, setCountryDetails: handleSetCountryDetails }}>
      {children}
    </CountryCodeContext.Provider>
  );
};

export const useCountryDetails = () => {
  const context = useContext(CountryCodeContext);
  if (!context)
    throw new Error("useCountryDetails must be used within a CountryCodeProvider");
  return context;
};
