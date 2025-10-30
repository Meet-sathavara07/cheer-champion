import type { Metadata } from "next";
import KudoRecipients from "./Recipients";
import { openGraphMetaData, twitterMetaData } from "@/app/shared-metadata";

export const metadata: Metadata = {
  title: "Kudo Recipients",
  description: "Celebrate the most recognized individuals on the Cheer Champion platform.",
  keywords: "kudo recipients, cheer champion, top users, most recognized, appreciation",
  openGraph: {
    ...openGraphMetaData,
    title: "Kudo Recipients",
    description: "Celebrate the most recognized individuals on the Cheer Champion platform.",
    },
  twitter: {
    ...twitterMetaData,
    title: "Kudo Recipients",
    description: "Celebrate the most recognized individuals on the Cheer Champion platform.",
  },
}

export default function KudoRecipientsPage() {
  return (
    <KudoRecipients/>
  );
}
