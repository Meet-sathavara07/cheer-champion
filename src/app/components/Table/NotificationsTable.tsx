"use client";
import React, { useState } from "react";
import {
  FaPaperPlane,
  FaTimes,
  FaEye,
  FaCheckCircle,
  FaExclamationTriangle,
} from "react-icons/fa";
import Loader from "@/app/components/Loader";
import moment from "moment";
import NotificationModal from "../Modals/NotificationPopModal";

interface NotificationsTableProps {
  notifications: any[];
  isLoading: boolean;
}

const statusColors = {
  success: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  alert: "bg-amber-100 text-amber-800",
};

const statusIcons = {
  success: <FaCheckCircle className="text-green-500" />,
  failed: <FaTimes className="text-red-500" />,
  alert: <FaExclamationTriangle className="text-amber-500" />,
};

const NotificationsTable: React.FC<NotificationsTableProps> = ({
  notifications,
  isLoading,
}) => {
  const [selectedNotification, setSelectedNotification] = useState<any | null>(
    null
  );

  const truncateText = (text: string) => {
    if (!text) return "-";
    if (text.length <= 25) return text;
    return `${text.slice(0, 25)}...`;
  };

  if (isLoading && notifications.length === 0) {
    return (
      <div className="h-64 w-full flex items-center justify-center font-libre">
        <Loader className="h-10 w-10 border-primary border-t-4 border-b-4" />
      </div>
    );
  }

  if (!notifications || notifications.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600 text-md font-medium font-libre">
        No notifications found
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl border border-gray-200 bg-white overflow-x-auto overflow-y-hidden font-libre">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-primary">
            <tr>
              <th
                scope="col"
                className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider font-comfortaa"
              >
                #
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider font-comfortaa"
              >
                Name
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider font-comfortaa"
              >
                Notification
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider font-comfortaa"
              >
                Details
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider font-comfortaa"
              >
                Recipient
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider font-comfortaa"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider font-comfortaa"
              >
                Date
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {notifications.map((notification, idx) => {
              let status: "success" | "failed" | "alert" = "success";
              if (!notification.notification_channels?.length) {
                status = "failed"; // No channels means notification failed
              } else {
                const failedCount = notification.notification_channels.filter(
                  (channel: any) => channel.status === "failed"
                ).length;
                if (failedCount === notification.notification_channels.length) {
                  status = "failed"; // All channels failed
                } else if (failedCount > 0) {
                  status = "alert"; // Some channels failed
                }
              }
              return (
                <tr
                  key={notification.id}
                  className="hover:bg-gray-50 transition-colors duration-150 even:bg-gray-50/50"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {idx + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-800">
                      {notification.name || "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4 max-w-xs">
                    <div className="relative group">
                      <div className="text-sm font-medium text-gray-800">
                        {truncateText(notification.title)}
                      </div>
                      {(notification.title || notification.message) && (
                        <div className="absolute hidden group-hover:block z-20 top-full left-0 mt-1 w-64 p-3 bg-white border border-gray-200 rounded-lg shadow-lg font-libre">
                          <div className="text-sm text-gray-700 whitespace-pre-wrap">
                            {notification.title}
                            {notification.message && (
                              <>
                                <br />
                                {notification.message}
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => setSelectedNotification(notification)}
                      className="text-primary flex items-center gap-1.5 hover:text-primary-dark text-sm font-medium transition-colors duration-150 underline cursor-pointer px-2 py-1 hover:bg-primary/10 rounded-lg"
                      type="button"
                    >
                      <FaEye className="text-sm" />
                      View
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-800">
                      {notification.$users?.user_profile?.name ||
                        notification.$users?.email ||
                        "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      {statusIcons[status] || statusIcons.success}
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          statusColors[status] || statusColors.success
                        }`}
                      >
                        {status === "failed"
                          ? "Failed"
                          : status === "alert"
                          ? "Alert"
                          : "Success"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-primary-dark font-medium">
                      {notification.created_at
                        ? moment(notification.created_at).format("MMM D, YYYY")
                        : "-"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {notification.created_at
                        ? moment(notification.created_at).format("hh:mm A")
                        : ""}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {selectedNotification && (
        <NotificationModal
          notification={selectedNotification}
          onClose={() => setSelectedNotification(null)}
        />
      )}
    </>
  );
};

export default NotificationsTable;
