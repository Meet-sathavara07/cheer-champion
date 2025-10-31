"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

interface NotificationProps {
  title: string;
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
  type?: "info" | "warning" | "success" | "reminder";
  imageUrl?: string;
  actionLabel?: string; // Custom label for action button
  actionUrl?: string; // Custom URL for action button
}

const WebPushNotification: React.FC<NotificationProps> = ({
  title,
  message,
  isVisible,
  onClose,
  duration = 6000,
  type = "reminder",
  imageUrl,
  actionLabel = "Take action",
  actionUrl = "/",
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [isTabVisible, setIsTabVisible] = useState(
    document.visibilityState === "visible"
  );
  const { t } = useTranslation();
  const router = useRouter();
  const defaultImage = "https://cheer-champion.vercel.app/OpenGraph.png"; // Fallback image

  // Handle visibility state changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabVisible(document.visibilityState === "visible");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // Handle mounting and auto-close timer
  useEffect(() => {
    setIsMounted(true);

    if (isVisible && isTabVisible && duration > 0) {
      const timer = setTimeout(handleClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, isTabVisible, duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
      setIsExiting(false);
    }, 300);
  };

  const handleAction = () => {
    setIsExiting(true);
    setTimeout(() => {
      router.push(actionUrl);
      onClose();
      setIsExiting(false);
    }, 300);
  };

  const handleImageError = () => {
    setImgError(true);
  };

  if (!isMounted || !isVisible || !isTabVisible) return null;

  // Dynamic styling based on notification type
  const notificationConfig: Record<
    string,
    { accentColor: string; icon: string; textColor: string; bgColor: string }
  > = {
    reminder: {
      accentColor: "bg-primary",
      icon: "👋",
      textColor: "text-purple-800",
      bgColor: "bg-purple-50",
    },
    info: {
      accentColor: "bg-blue-500",
      icon: "ℹ️",
      textColor: "text-blue-800",
      bgColor: "bg-blue-50",
    },
    warning: {
      accentColor: "bg-yellow-500",
      icon: "⚠️",
      textColor: "text-yellow-800",
      bgColor: "bg-yellow-50",
    },
    success: {
      accentColor: "bg-green-500",
      icon: "✅",
      textColor: "text-green-800",
      bgColor: "bg-green-50",
    },
  };

  const { accentColor, icon, textColor, bgColor } =
    notificationConfig[type] || notificationConfig.reminder;

  return (
    <div
      className={`fixed top-4 right-4 z-50 w-80 transition-all duration-300 ${
        isExiting ? "translate-x-full opacity-0" : "translate-x-0 opacity-100"
      }`}
    >
      <div
        className={`relative rounded-xl shadow-xl overflow-hidden ${accentColor} ${bgColor}`}
      >
        <div className="p-4 pr-8">
          <div className="flex items-start">
            {/* User avatar */}
            <div className="relative h-12 w-12 flex-shrink-0 mr-3">
              {imgError ? (
                <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-lg font-semibold text-gray-500">
                    {title.charAt(0).toUpperCase()}
                  </span>
                </div>
              ) : (
                <img
                  src={imageUrl || defaultImage}
                  alt={title}
                  onError={handleImageError}
                  className="rounded-full object-cover w-full h-full"
                />
              )}
              <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-0.5 shadow-sm">
                <span className="text-base">{icon}</span>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className={`font-bold text-sm ${textColor}`}>{title}</h3>
                <span className="text-xs text-gray-500">{t("remind.now")}</span>
              </div>
              <p className="text-gray-700 text-sm mb-2">{message}</p>

              {/* Action buttons */}
              <div className="flex space-x-2 mt-2">
                <button
                  className={`text-xs px-3 py-1 rounded-full ${accentColor} text-white font-medium hover:opacity-90 transition-opacity`}
                  onClick={handleAction}
                >
                  {actionLabel}
                </button>
                <button
                  onClick={handleClose}
                  className="text-xs px-3 py-1 rounded-full bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition-colors"
                >
                  {t("remind.later")}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1 bg-gray-200">
          <div
            className={`h-full ${accentColor} transition-all duration-100 linear`}
            style={{
              width: "100%",
              animation: `progress ${duration}ms linear forwards`,
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default WebPushNotification;
