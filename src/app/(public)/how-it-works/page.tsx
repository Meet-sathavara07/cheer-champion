import type { Metadata } from "next";
import { openGraphMetaData, twitterMetaData } from "@/app/shared-metadata";
import HowItWorks from "./HowItWorks";

export const metadata: Metadata = {
  title: 'How It Works',
  description: 'Discover how Cheer Champion’s kudo platform helps you share gratitude and positivity.',
  keywords: 'cheer champion, kudo platform, gratitude app, positivity platform',
  openGraph: {
    ...openGraphMetaData,
    title: "How It Works | Cheer Champion",
    description:
      "Discover how Cheer Champion helps spread kindness through Kudos – personalized messages of appreciation. Learn how to send, explore, and track gratitude in a meaningful way.",
  },
  twitter: {
    ...twitterMetaData,
    title: "How It Works | Cheer Champion",
    description: "Discover how Cheer Champion’s kudo platform helps you share gratitude and positivity. Learn how to send, explore, and track gratitude in a meaningful way.",
  },
};

export default function HowItWorksPage() {
  return (
    <HowItWorks />
  );
}
