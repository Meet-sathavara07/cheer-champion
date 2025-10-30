import type { Metadata } from "next";
import { openGraphMetaData, twitterMetaData } from "@/app/shared-metadata";
import Announcement from "./Announcement";

export const metadata: Metadata = {
  title: "Admin - Announcements",
  description:
    "Create and manage push notification announcements for all users. Admin-only access.",
  keywords: [
    "Cheer Champion",
    "Admin",
    "Announcements",
    "Push Notifications",
    "Manage Announcements",
    "Admin Panel",
    "Announcement Management",
    "Admin Dashboard",
    "Notification Admin",
    "Announcement Analytics",
  ],
  openGraph: {
    ...openGraphMetaData,
    title: "Admin - Announcements",
    description:
      "Create and manage push notification announcements for all users. Admin-only access.",
  },
  twitter: {
    ...twitterMetaData,
    title: "Admin - Announcements",
    description:
      "Create and manage push notification announcements for all users. Admin-only access.",
  },
};

export default function AdminAnnouncementPage() {
  return <Announcement />;
}