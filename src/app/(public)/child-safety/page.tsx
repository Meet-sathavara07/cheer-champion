import type { Metadata } from "next";
import { openGraphMetaData, twitterMetaData } from "@/app/shared-metadata";
import PrivacyPolicy from "./ChildSafety";

export const metadata: Metadata = {
  title: "Child Safety Standards",
  description:
    "Read how Cheer Champion protects children on its platform. Learn about our zero-tolerance CSAM policies, abuse reporting process, and legal compliance.",
  keywords:
    "child safety, CSAM policy, abuse reporting, child protection, cheer champion, online safety, safety standards",
  openGraph: {
    ...openGraphMetaData,
    title: "Child Safety Standards | Cheer Champion",
    description:
      "Read how Cheer Champion protects children on its platform. Learn about our zero-tolerance CSAM policies, abuse reporting process, and legal compliance.",
  },
  twitter: {
    ...twitterMetaData,
    title: "Child Safety Standards | Cheer Champion",
    description:
      "Read how Cheer Champion protects children on its platform. Learn about our zero-tolerance CSAM policies, abuse reporting process, and legal compliance.",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <PrivacyPolicy />
  );
}
