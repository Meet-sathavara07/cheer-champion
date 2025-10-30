import type { Metadata } from "next";
import { openGraphMetaData, twitterMetaData } from "@/app/shared-metadata";
import TermsConditions from "./TermsConditions";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Read the Terms of Service for Cheer Champion. Understand your responsibilities, rights, and our policies when using our platform.",
  keywords: "terms of service, user agreement, cheer champion, usage policy, user responsibilities",
  openGraph: {
    ...openGraphMetaData,
    title: "Terms of Service | Cheer Champion",
    description:
      "Read the Terms of Service for Cheer Champion. Understand your responsibilities, rights, and our policies when using our platform.",
  },
  twitter: {
    ...twitterMetaData,
    title: "Terms of Service | Cheer Champion",
    description:
      "Read the Terms of Service for Cheer Champion. Understand your responsibilities, rights, and our policies when using our platform.",
  },
};

export default function TermsConditionsPage() {
  return (
    <TermsConditions/>
  );
}
