"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
export default function Footer({
}: {
  className?: string;
}) {
  const { t } = useTranslation();
  return (
    <footer className="py-4 px-4 lg:px-15 lg:py-5 bg-white/20">
      <div className="flex w-full justify-center items-center gap-2 lg:gap-4">
        <Link
          href="/privacy-policy"
          className="text-secondary-dark text-xs lg:text-sm font-libre font-medium italic hover:text-secondary underline"
        >
          {t("footer.privacyPolicy")}
        </Link>
        <Link
          href="/terms-of-service"
          className="text-secondary-dark text-xs lg:text-sm font-libre font-medium italic hover:text-secondary underline"
        >
          {t("footer.termsAndConditions")}
        </Link>
        <Link
          href="/how-it-works"
          className="text-secondary-dark text-xs lg:text-sm font-libre font-medium italic hover:text-secondary underline"
        >
          {t("footer.howItWorks")}
        </Link>
        <Link
          href="/how-it-works"
          className="text-secondary-dark text-xs lg:text-sm font-libre font-medium italic hover:text-secondary underline"
        >
          {t("footer.childSafety")}
        </Link>
      </div>
    </footer>
  );
}
