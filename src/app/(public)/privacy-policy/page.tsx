import type { Metadata } from "next";
import { openGraphMetaData, twitterMetaData } from "@/app/shared-metadata";
import PrivacyPolicy from "./PrivacyPolicy";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how Cheer Champion collects, uses, and protects your personal information. Read our privacy practices and your rights as a user.",
  keywords: "privacy policy, data protection, user rights, cheer champion, personal information",
  openGraph: {
    ...openGraphMetaData,
    title: "Privacy Policy | Cheer Champion",
    description:
      "Learn how Cheer Champion collects, uses, and protects your personal information. Read our privacy practices and your rights as a user.",
  },
  twitter: {
    ...twitterMetaData,
    title: "Privacy Policy | Cheer Champion",
    description:
      "Learn how Cheer Champion collects, uses, and protects your personal information. Read our privacy practices and your rights as a user.",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <PrivacyPolicy />
  );
}
