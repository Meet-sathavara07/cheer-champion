import type { Metadata } from "next";
import KudoLibrary from "./Library";
import { openGraphMetaData, twitterMetaData } from "@/app/shared-metadata";

export const metadata: Metadata = {
  title: "Kudo Library",
  description: "Pick images to send kudos and find inspiration to share gratitude.",
  keywords: "kudo library, cheer champion, gratitude images, inspiration, send kudo",
  openGraph: {
    ...openGraphMetaData,
    title: "Kudo Library",
    description: "Pick images to send kudos and find inspiration to share gratitude.",
  },
  twitter: {
    ...twitterMetaData,
    title: "Kudo Library",
    description: "Pick images to send kudos and find inspiration to share gratitude.",
  },
}


export default function KudoLibraryPage() {
  return <KudoLibrary />;
}
