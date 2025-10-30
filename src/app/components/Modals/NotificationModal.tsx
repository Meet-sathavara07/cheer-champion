"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import moment from "moment";
import toast from "react-hot-toast";
import { useUserContext } from "@/app/context/UserContext";
import { useInstantDB } from "@/app/context/InstantProvider";
import Image from "next/image";

interface NotificationSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface Notification {
  id: string;
  created_at: string;
  entity_id?: string;
  entity_type: string;
  is_read: boolean;
  message: string;
  read_at?: string;
  title: string;
  type: string;
  user_id: string;
  action_by?: string; // JSON string with name, id, profile_image
  $users?: any[];
  kudos?: any;
  $files?: any;
}

export const getUserNotifications = {
  getUserNotifications: (userId: string) => ({
    notifications: {
      $: {
        where: {
          user_id: userId,
          type: {
            $in: [
              "kudo_received",
              "kudo_liked",
              "connection_kudo_received",
              "connection_kudo_sent",
              "inactive_user_reminder",
            ],
          },
        },
        order: { serverCreatedAt: "desc" as const },
      },
    },
  }),
};

export default function NotificationSidebar({
  isOpen,
  onClose,
}: NotificationSidebarProps) {
  const { t } = useTranslation();
  const { user } = useUserContext();
  const router = useRouter();
  const db = useInstantDB();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);

  // Main query for user's notifications
  const { isLoading, data, error } = db.useQuery(
    user?.id ? getUserNotifications.getUserNotifications(user.id) : null
  );

  // Update notifications and unread count when data changes
  useEffect(() => {
    if (data?.notifications) {
      const notificationsData = data.notifications as Notification[];
      setNotifications(notificationsData);
      setUnreadCount(
        notificationsData.filter((n: Notification) => !n.is_read).length
      );
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [data]);

  // Handle clicks outside the modal to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node) &&
        isOpen
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Group notifications by time period
  const groupNotificationsByTime = (notificationsList: Notification[]) => {
    const now = moment();
    const todayStart = moment().startOf("day");
    const yesterdayStart = moment().subtract(1, "day").startOf("day");
    const sevenDaysAgo = moment().subtract(7, "days").startOf("day");
    const thirtyDaysAgo = moment().subtract(30, "days").startOf("day");

    const todayNotifications = notificationsList.filter((n) =>
      moment(n.created_at).isSameOrAfter(todayStart)
    );

    const yesterdayNotifications = notificationsList.filter((n) =>
      moment(n.created_at).isBetween(
        yesterdayStart,
        todayStart,
        undefined,
        "[)"
      )
    );

    const lastSevenDaysNotifications = notificationsList.filter((n) =>
      moment(n.created_at).isBetween(
        sevenDaysAgo,
        yesterdayStart,
        undefined,
        "[)"
      )
    );

    const lastThirtyDaysNotifications = notificationsList.filter((n) =>
      moment(n.created_at).isBetween(
        thirtyDaysAgo,
        sevenDaysAgo,
        undefined,
        "[)"
      )
    );

    const olderNotifications = notificationsList.filter(
      (n) =>
        moment(n.created_at).isBefore(thirtyDaysAgo) ||
        moment(n.created_at).isAfter(now) // Future notifications go to Older
    );

    return {
      today: todayNotifications,
      yesterday: yesterdayNotifications,
      lastSevenDays: lastSevenDaysNotifications,
      lastThirtyDays: lastThirtyDaysNotifications,
      older: olderNotifications,
    };
  };

  // Use all notifications
  const groupedNotifications = groupNotificationsByTime(notifications);

  const getTimeAgo = (date: Date | string) => {
    return moment(date).fromNow();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "kudo_received":
        return "🎉";
      case "kudo_liked":
        return "❤️";
      case "connection_kudo_received":
        return "🤝";
      case "connection_kudo_sent":
        return "🤝";
      default:
        return "🔔";
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "kudo_received":
        return "bg-yellow-100 text-yellow-800";
      case "kudo_liked":
        return "bg-pink-100 text-pink-800";
      case "comment_added":
        return "bg-blue-100 text-blue-800";
      case "kudo_commented":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Handle notification click - mark as read and navigate
  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      try {
        db.transact([
          db.tx.notifications[notification.id].update({
            is_read: true,
            read_at: new Date().toISOString(),
          }),
        ]);
      } catch (err) {
        console.error("Error marking notification as read:", err);
        toast.error(
          t("notifications.error_mark_read", "Failed to mark as read")
        );
      }
    }

    if (notification.entity_type === "kudo" && notification.entity_id) {
      router.push(`/feeds/${notification.entity_id}`);
    }

    onClose();
  };

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const unreadNotifications = notifications.filter((n) => !n.is_read);
      if (unreadNotifications.length === 0) return;

      const transactions = unreadNotifications.map((notification) =>
        db.tx.notifications[notification.id].update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
      );

      db.transact(transactions);
      toast.success(
        t("notifications.marked_all_read", "All notifications marked as read")
      );
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
      toast.error(
        t("notifications.error_mark_all_read", "Failed to mark all as read")
      );
    }
  }, [notifications, db, t]);

  // Delete notification
  const deleteNotification = async (id: string) => {
    try {
      await db.transact([db.tx.notifications[id].delete()]);
      toast.success(
        t("notifications.deleted", "Notification deleted successfully")
      );
    } catch (err) {
      console.error("Error deleting notification:", err);
      toast.error(
        t("notifications.error_delete", "Failed to delete notification")
      );
    }
  };

  if (!user) {
    return null;
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <div
        ref={modalRef}
        className={`
        fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50
        ${isOpen ? "translate-x-0" : "translate-x-full"}
        lg:max-w-md
        flex flex-col
      `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            aria-label={t("general.close", "Close")}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <h2 className="text-lg font-bold text-gray-900 absolute left-1/2 transform -translate-x-1/2">
            {t("notifications.title", "Notifications")}
          </h2>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs text-primary hover:text-primary-dark font-medium px-3 py-1 rounded-md hover:bg-primary/5 transition-colors"
            >
              {t("notifications.mark_all_read", "Mark all read")}
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading && notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-3"></div>
              <p className="text-sm text-gray-500">
                {t("notifications.loading", "Loading notifications...")}
              </p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400 p-4">
              <div className="p-4 bg-gray-100 rounded-full mb-4">
                <svg
                  className="w-8 h-8"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                {t("notifications.no_notifications", "No notifications")}
              </h3>
              <p className="text-xs text-center text-gray-400 px-6">
                {t(
                  "notifications.no_notifications_desc",
                  "You're all caught up!"
                )}
              </p>
            </div>
          ) : (
            <div>
              {/* Today notifications section */}
              {groupedNotifications.today.length > 0 && (
                <>
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                    {t("notifications.today")}
                  </div>
                  {groupedNotifications.today.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onClick={() => handleNotificationClick(notification)}
                      onDelete={() => deleteNotification(notification.id)}
                      getNotificationIcon={getNotificationIcon}
                      getNotificationColor={getNotificationColor}
                      getTimeAgo={getTimeAgo}
                      t={t}
                    />
                  ))}
                </>
              )}

              {/* Yesterday notifications section */}
              {groupedNotifications.yesterday.length > 0 && (
                <>
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                    {t("notifications.yesterday")}
                  </div>
                  {groupedNotifications.yesterday.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onClick={() => handleNotificationClick(notification)}
                      onDelete={() => deleteNotification(notification.id)}
                      getNotificationIcon={getNotificationIcon}
                      getNotificationColor={getNotificationColor}
                      getTimeAgo={getTimeAgo}
                      t={t}
                    />
                  ))}
                </>
              )}

              {/* Last 7 days notifications section */}
              {groupedNotifications.lastSevenDays.length > 0 && (
                <>
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                    {t("notifications.last_seven_days")}
                  </div>
                  {groupedNotifications.lastSevenDays.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onClick={() => handleNotificationClick(notification)}
                      onDelete={() => deleteNotification(notification.id)}
                      getNotificationIcon={getNotificationIcon}
                      getNotificationColor={getNotificationColor}
                      getTimeAgo={getTimeAgo}
                      t={t}
                    />
                  ))}
                </>
              )}

              {/* Last 30 days notifications section */}
              {groupedNotifications.lastThirtyDays.length > 0 && (
                <>
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                    {t("notifications.last_thirty_days")}
                  </div>
                  {groupedNotifications.lastThirtyDays.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onClick={() => handleNotificationClick(notification)}
                      onDelete={() => deleteNotification(notification.id)}
                      getNotificationIcon={getNotificationIcon}
                      getNotificationColor={getNotificationColor}
                      getTimeAgo={getTimeAgo}
                      t={t}
                    />
                  ))}
                </>
              )}

              {/* Older notifications section */}
              {groupedNotifications.older.length > 0 && (
                <>
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                    Older
                  </div>
                  {groupedNotifications.older.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onClick={() => handleNotificationClick(notification)}
                      onDelete={() => deleteNotification(notification.id)}
                      getNotificationIcon={getNotificationIcon}
                      getNotificationColor={getNotificationColor}
                      getTimeAgo={getTimeAgo}
                      t={t}
                    />
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="p-4 bg-red-50 border-t border-red-100">
            <div className="text-red-700 text-sm flex items-center mb-2">
              <svg
                className="w-4 h-4 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              {t("notifications.error", "Error loading notifications")}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded font-medium"
            >
              {t("notifications.retry", "Try again")}
            </button>
          </div>
        )}
      </div>
    </>
  );
} // Notification Item Component
function NotificationItem({
  notification,
  onClick,
  onDelete,
  getNotificationIcon,
  getNotificationColor,
  getTimeAgo,
  t,
}: any) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Parse action_by JSON string
  let actionBy: { name: string; id: string; profile_image: string } | null =
    null;
  try {
    if (notification.action_by) {
      actionBy = JSON.parse(notification.action_by);
    }
  } catch (error) {
    console.error("Error parsing action_by JSON:", error);
  }

  // Define image paths using environment variable
  const S3_BASE_URL = process.env.NEXT_PUBLIC_S3_IMAGE_URL;
  const DEFAULT_PROFILE_IMAGE = `${S3_BASE_URL}/defaultProfile.png`;
  const OPENGRAPH_IMAGE = `${S3_BASE_URL}/OpenGraph.png`;

  // Determine if the notification type is one of the specified types
  const isSpecificNotificationType = [
    "kudo_received",
    "kudo_liked",
    "connection_kudo_received",
    "connection_kudo_sent",
  ].includes(notification.type);

  // Initialize image source
  const [imageSrc, setImageSrc] = useState(
    actionBy?.profile_image ||
      (isSpecificNotificationType ? DEFAULT_PROFILE_IMAGE : OPENGRAPH_IMAGE)
  );
  const [imageLoadError, setImageLoadError] = useState(
    !actionBy?.profile_image
  );

  // Handle clicks outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle profile image click
  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the notification click
    if (actionBy?.id) {
      router.push(`/profile/${actionBy.id}`);
    }
  };

  // Handle image load error
  const handleImageError = () => {
    if (
      imageSrc !==
      (isSpecificNotificationType ? DEFAULT_PROFILE_IMAGE : OPENGRAPH_IMAGE)
    ) {
      setImageSrc(
        isSpecificNotificationType ? DEFAULT_PROFILE_IMAGE : OPENGRAPH_IMAGE
      );
      setImageLoadError(true);
    }
  };

  return (
    <div
      onClick={onClick}
      className={`p-4 cursor-pointer transition-all duration-200 group hover:bg-gray-50 relative ${
        !notification.is_read ? "bg-blue-50" : "bg-white"
      } border border-gray-200 rounded-md m-2`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 relative">
          <Image
            src={imageSrc}
            alt={actionBy?.name || "Notification image"}
            height={40}
            width={40}
            className="h-10 w-10 object-cover rounded-full cursor-pointer"
            onClick={handleProfileClick}
            onError={handleImageError}
          />
          {/* Notification icon badge */}
          <div
            className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs ${getNotificationColor(
              notification.type
            )}`}
          >
            {getNotificationIcon(notification.type)}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <h3
              className={`text-sm font-medium text-gray-900 truncate ${
                !notification.is_read ? "font-semibold" : ""
              }`}
            >
              {notification.title}
            </h3>
          </div>
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
            {notification.message}
          </p>
        </div>
      </div>

      <button
        className="absolute top-2 right-3 p-1 cursor-pointer text-gray-400 hover:text-gray-600"
        onClick={(e) => {
          e.stopPropagation();
          setShowMenu(!showMenu);
        }}
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </button>

      <div className="absolute bottom-2 right-3 p-1 text-xs text-gray-400 whitespace-nowrap ml-2 flex-shrink-0">
        {getTimeAgo(notification.created_at)}
      </div>

      {showMenu && (
        <div
          ref={menuRef}
          className="absolute bottom-4 right-4 bg-white shadow-lg rounded-md py-1 z-10 border border-gray-200"
        >
          <button
            className="flex items-center cursor-pointer px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
              setShowMenu(false);
            }}
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            {t("notifications.delete")}
          </button>
        </div>
      )}
    </div>
  );
}
