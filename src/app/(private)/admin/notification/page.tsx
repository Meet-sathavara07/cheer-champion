import type { Metadata } from "next";
import { openGraphMetaData, twitterMetaData } from "@/app/shared-metadata";
import AdminNotifications from "./NotificationList";

export const metadata: Metadata = {
  title: "Admin - Notifications",
  description:
    "View, search, and manage notifications, user engagement, and reminders in the admin panel.",
  keywords: [
    "Cheer Champion",
    "Admin",
    "Notifications",
    "User Engagement",
    "Reminders",
    "Admin Panel",
    "Notification Management",
    "Admin Dashboard",
    "Engagement Analytics",
    "Reminder Admin",
  ],
  openGraph: {
    ...openGraphMetaData,
    title: "Admin - Notifications",
    description:
      "View, search, and manage notifications, user engagement, and reminders in the admin panel.",
  },
  twitter: {
    ...twitterMetaData,
    title: "Admin - Notifications",
    description:
      "View, search, and manage notifications, user engagement, and reminders in the admin panel.",
  },
};

export default function AdminNotificationPage() {
  return <AdminNotifications />;
}
