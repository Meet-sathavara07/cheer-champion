import type { Metadata } from "next";
import { openGraphMetaData, twitterMetaData } from "@/app/shared-metadata";
import Admin from "./UserList";

export const metadata: Metadata = {
  title: "Admin - Users List",
  description:
    "View, search, and manage all users registered in the system. Admin-only access.",
  keywords: [
    "Cheer Champion",
    "Admin",
    "Users List",
    "User Management",
    "Manage Users",
    "Admin Panel",
    "User Analytics",
    "Admin Dashboard",
    "User Admin",
  ],
  openGraph: {
    ...openGraphMetaData,
    title: "Admin - Users List",
    description:
      "View, search, and manage all users registered in the system. Admin-only access.",
  },
  twitter: {
    ...twitterMetaData,
    title: "Admin - Users List",
    description:
      "View, search, and manage all users registered in the system. Admin-only access.",
  },
};

export default function AdminUsersListPage() {
  return <Admin />;
}
