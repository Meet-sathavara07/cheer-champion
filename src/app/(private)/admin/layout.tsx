"use client";

import { useUserContext } from "@/app/context/UserContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getUserProfile } from "@/helpers/clientSide/profile";
import Loader from "@/app/components/Loader";

// Dynamically import the real admin component

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading: userLoading } = useUserContext();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkAdmin() {
      // Don't do anything until the user context has finished loading.
      if (userLoading) {
        return;
      }

      if (!user) {
        router.replace("/");
        setLoading(false);
        return;
      }

      try {
        const profile = await getUserProfile(user.id);
        if (profile && profile.role === "admin") {
          setIsAdmin(true);
        } else {
          router.replace("/");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        router.replace("/");
      } finally {
        setLoading(false);
      }
    }
    checkAdmin();
  }, [user, userLoading, router]);

  if (loading || userLoading) {
    return (
      <div className="fixed inset-0 flex  items-center justify-center">
        <Loader className="h-20 w-20 !border-primary border-t-5 border-b-5" />
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Or a message, but redirect has already been triggered.
  }

  return (
      <main>{children}</main>
  );
}
