import type { Metadata } from "next";
import { openGraphMetaData, twitterMetaData } from "@/app/shared-metadata";
import Admin from "./KudoList";

export const metadata: Metadata = {
  title: "Admin - Kudo List",
  description:
    "View, search, and manage all kudos sent in the system. Admin-only access.",
  keywords: [
    "Cheer Champion",
    "Admin",
    "Kudo List",
    "Kudos",
    "Manage Kudos",
    "Admin Panel",
    "Kudo Management",
    "Admin Dashboard",
    "Kudo Admin",
    "Kudo Analytics",
  ],
  openGraph: {
    ...openGraphMetaData,
    title: "Admin - Kudo List",
    description:
      "View, search, and manage all kudos sent in the system. Admin-only access.",
  },
  twitter: {
    ...twitterMetaData,
    title: "Admin - Kudo List",
    description:
      "View, search, and manage all kudos sent in the system. Admin-only access.",
  },
};

export default function AdminKudoListPage() {
  return <Admin />;
}
