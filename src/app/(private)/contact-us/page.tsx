import type { Metadata } from "next";
import { openGraphMetaData, twitterMetaData } from "@/app/shared-metadata";
import ContactUs from "./ContactUs";

export const metadata: Metadata = {
  title: "Report a Problem",
  description:
    "Encountered an issue or have feedback? Use this page to report bugs, suggest improvements, or share your thoughts with the Cheer Champion team.",
    keywords: [
      "Cheer Champion",
      "Report a problem",
      "Send feedback",
      "Contact support",
      "Bug report",
      "Feedback form",
      "Issue reporting",
      "App issue",
      "Cheer Champion feedback",
    ],
    openGraph: {
    ...openGraphMetaData,
    title: "Report a Problem | Cheer Champion",
    description:
      "Encountered an issue or have feedback? Use this page to report bugs, suggest improvements, or share your thoughts with the Cheer Champion team.",
  },
  twitter: {
    ...twitterMetaData,
    title: "Report a Problem | Cheer Champion",
    description:
      "Encountered an issue or have feedback? Use this page to report bugs, suggest improvements, or share your thoughts with the Cheer Champion team.",
  },
};

export default function HowItWorksPage() {
  return (
   <ContactUs />
  );
}
