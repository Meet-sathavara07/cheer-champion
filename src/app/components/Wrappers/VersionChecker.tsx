'use client';

import { APP_VERSION } from "@/constants/version";
import { useEffect } from "react";

const VersionChecker = () => {
  useEffect(() => {
    const storedVersion = localStorage.getItem("app_version");
    if (APP_VERSION && storedVersion && storedVersion !== APP_VERSION) {
      localStorage.setItem("app_version", APP_VERSION);
      window.location.reload(); // Refresh to load new version
    } else if (!storedVersion && APP_VERSION) {
      localStorage.setItem("app_version", APP_VERSION);
    }
  }, []);

  return null;
};

export default VersionChecker;