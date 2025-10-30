"use client";

import { useUserContext } from "@/app/context/UserContext";
import { messaging } from "@/app/lib/services/firebase";
import { updateUserProfile } from "@/app/models/profileModel";
import { getFCMPushToken } from "@/app/utils/pushNotification";
import { onMessage } from "firebase/messaging";
import { useEffect, useState } from "react";
import WebPushNotification from "../Modals/WebPushNotification";
import moment from "moment";
import { db } from "@/app/context/InstantProvider";

const StoreWebPushToken = () => {
  const { user } = useUserContext();
  const [notification, setNotification] = useState<
    Array<{ title: string; body: string }>
  >([]);
  const [currentNotification, setCurrentNotification] = useState<{
    title: string;
    body: string;
  } | null>(null);

  // Save FCM token when user is logged in
  const handleSaveFCMToken = async (token: string) => {
    try {
      if (token) {
        const formData = new FormData();
        formData.append("web_push_token", token);
        await updateUserProfile(formData);
      }
    } catch (error: any) {
      console.error("Error storing web push token:", error);
    }
  };

  useEffect(() => {
    if (user) {
      getFCMPushToken()
        .then((FCMToken) => {
          if (FCMToken) {
            handleSaveFCMToken(FCMToken);
          }
        })
        .catch((err) => {
          console.error("Error fetching FCM token:", err);
        });
    }
  }, [user]);

  // Query unread notifications from InstantDB when user logs in
  const { data, error } = db.useQuery(
    user
      ? {
          notifications: {
            $: {
              where: {
                user_id: user.id,
                is_read: false,
                type: "inactive_user_reminder",
              },
            },
            notification_channels: {},
          },
        }
      : null
  );

  // Listen for incoming push notifications
  useEffect(() => {
    if (!messaging || !user) return;

    const unsubscribe = onMessage(messaging, (payload) => {
      // Only show notification if tab is in foreground and user is logged in
      if (document.visibilityState === "visible" && payload?.notification) {
        const { title, body } = payload.notification;
        setNotification([
          {
            title: title || "Notification",
            body: body || "You have a new message!",
          },
        ]);
      }
    });

    return () => unsubscribe();
  }, [messaging, user]);

  // Store IDs of unread notifications
  const unreadNotificationIds =
    data?.notifications?.map((notif: any) => notif.id) || [];

  // Show only one notification if there are any unread
  useEffect(() => {
    if (data?.notifications?.length) {
      const timer = setTimeout(() => {
        const notif = data.notifications[0];
        setCurrentNotification({
          title: notif.title || "Activity Reminder",
          body: notif.message || "You have a new reminder!",
        });
      }, 7000); // 7 seconds delay

      return () => clearTimeout(timer); // cleanup on re-render/unmount
    }

    if (error) {
      console.error("[DEV] Error fetching notifications:", error);
    }
  }, [data, error]);

  // Handle closing: mark all as read
  const handleNotificationClose = async () => {
    setCurrentNotification(null);
    if (unreadNotificationIds.length) {
      try {
        await db.transact(
          unreadNotificationIds.map((id: string) =>
            db.tx.notifications[id].update({
              is_read: true,
              read_at: moment.utc().toISOString(),
            })
          )
        );
        console.log(
          "[DEV] Marked all notifications as read:",
          unreadNotificationIds
        );
      } catch (error) {
        console.error("[DEV] Error marking notifications as read:", error);
      }
    }
  };

  return (
    <>
      {currentNotification && (
        <WebPushNotification
          title={currentNotification.title}
          message={currentNotification.body}
          isVisible={!!currentNotification}
          onClose={handleNotificationClose}
          duration={6000}
          type="reminder"
        />
      )}
    </>
  );
};

export default StoreWebPushToken;
