import type { Metadata } from "next";
import { openGraphMetaData, twitterMetaData } from "@/app/shared-metadata";
import Admin from "./AdminDashboard";

export const metadata: Metadata = {
  title: "Admin Dashboard ",
  description:
    "Powerful admin dashboard to monitor, analyze, and manage kudos and users across the Cheer Champion platform.",
  keywords: [
    "Cheer Champion Admin",
    "Admin Dashboard",
    "Kudo Analytics",
    "User Activity",
    "Kudo Management",
    "Admin Tools",
    "Dashboard Insights",
    "Admin Kudo Overview",
    "Top Senders",
    "Top Receivers",
    "Cheer Champion Panel",
  ],
  openGraph: {
    ...openGraphMetaData,
    title: "Admin Dashboard",
    description:
      "Powerful admin dashboard to monitor, analyze, and manage kudos and users across the Cheer Champion platform.",
  },
  twitter: {
    ...twitterMetaData,
    title: "Admin Dashboard",
    description:
      "Powerful admin dashboard to monitor, analyze, and manage kudos and users across the Cheer Champion platform.",
  },
};

export default function Page() {
  return <Admin />;
}
