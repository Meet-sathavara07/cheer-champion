import type { Metadata } from "next";
import Unsubscribe from "./Unsubscribe";
import { openGraphMetaData, twitterMetaData } from "@/app/shared-metadata";

export const metadata: Metadata = {
  title: "Unsubscribe - Cheer Champion",
  description: "Manage your communication preferences for Cheer Champion.",
  keywords: "unsubscribe, cheer champion, communication preferences",
  openGraph: {
    ...openGraphMetaData,
    title: "Unsubscribe - Cheer Champion",
    description: "Manage your communication preferences for Cheer Champion.",
  },
  twitter: {
    ...twitterMetaData,
    title: "Unsubscribe - Cheer Champion",
    description: "Manage your communication preferences for Cheer Champion.",
  },
};

export default function UnsubscribePage() {
  return <Unsubscribe />;
}
