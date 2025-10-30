"use client";
import React, { useState } from "react";
import { FaTimes, FaEye, FaCopy, FaCheckCircle } from "react-icons/fa";
import Image from "next/image";
import moment from "moment";
import BackgroundLayer from "@/assets/layouts/background-layer.svg";
import Link from "next/link";
import { useTranslation } from "react-i18next";

interface NotificationModalProps {
  notification: any;
  onClose: () => void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({
  notification,
  onClose,
}) => {
  const { t } = useTranslation();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 600);
    });
  };

  const truncateText = (text: string, maxLength: number = 25) => {
    if (!text) return "-";
    if (text.length <= maxLength) return text;
    return `${text.slice(0, maxLength)}...`;
  };

  const truncateIdentifier = (channel: any) => {
    if (!channel.identifier) return "-";
    if (["app_push", "web_push"].includes(channel.channel)) {
      const templateMatch = channel.identifier.match(/[^/]+$/); // Extract template name
      const template = templateMatch ? templateMatch[0] : channel.identifier;
      return truncateText(template, 25);
    }
    return truncateText(channel.identifier, 25);
  };

  const truncateError = (channel: any) => {
    if (!channel.error) return "-";
    return truncateText(channel.error, 25);
  };

  const getStatusColor = (status: string) => {
    return status === "failed"
      ? "bg-red-100 text-red-800"
      : "bg-green-100 text-green-800";
  };

  const getStatusIcon = (status: string) => {
    return status === "failed" ? (
      <FaTimes className="text-red-500" />
    ) : (
      <FaCheckCircle className="text-green-500" />
    );
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4 sm:px-6 py-4">
      <div className="absolute inset-0" onClick={onClose}></div>
      <Image
        className="absolute inset-0 w-full h-full object-cover object-center -z-10"
        src={BackgroundLayer}
        alt="Background Layer"
        priority
      />
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-primary p-4 sm:p-5">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Notification Details
              </h2>
              <span className="block w-16 sm:w-24 h-1 bg-white/80 mt-2 rounded-full"></span>
              <p className="text-white/80 mt-2 text-sm">
                ID: {notification.id}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 rounded-full transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div className="md:col-span-2">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Title</h3>
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
                <p className="text-gray-800 font-medium">
                  {notification.title || "-"}
                </p>
                {notification.title && (
                  <button
                    onClick={() => handleCopy(notification.title, "title")}
                    className="text-gray-500 hover:text-primary transition-colors cursor-pointer p-2"
                    aria-label="Copy title"
                  >
                    {copiedField === "title" ? (
                      <FaCheckCircle className="text-green-500" />
                    ) : (
                      <FaCopy />
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Message */}
            <div className="md:col-span-2">
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Message
              </h3>
              <div className="flex items-start justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
                <p className="text-gray-800 whitespace-pre-wrap">
                  {notification.message || "-"}
                </p>
                {notification.message && (
                  <button
                    onClick={() => handleCopy(notification.message, "message")}
                    className="text-gray-500 hover:text-primary transition-colors cursor-pointer p-2"
                    aria-label="Copy message"
                  >
                    {copiedField === "message" ? (
                      <FaCheckCircle className="text-green-500" />
                    ) : (
                      <FaCopy />
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Recipient Info */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Recipient
                </h3>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <p className="text-gray-800 font-medium">
                    {notification.$users?.user_profile?.name || "User"}
                  </p>
                  <p className="text-gray-600 text-sm mt-1">
                    {notification.$users?.email || "-"}
                  </p>
                </div>
              </div>

              {[
                "kudo_received",
                "kudo_liked",
                "connection_kudo_received",
                "connection_kudo_sent",
              ].includes(notification.type) &&
                notification.entity_id && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">
                      Related Kudo
                    </h3>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <Link
                        href={`/feeds/${notification.entity_id}`}
                        className="text-primary hover:text-primary-dark font-medium transition-colors duration-150 inline-flex items-center gap-2"
                      >
                        <FaEye />
                        View Kudo
                      </Link>
                    </div>
                  </div>
                )}
            </div>

            {/* Metadata */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Details
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm">Type:</span>
                  <span className="text-gray-800 text-sm font-medium">
                    {notification.type || "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm">Name:</span>
                  <span className="text-gray-800 text-sm font-medium">
                    {notification.name || "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm">Frequency:</span>
                  <span className="text-gray-800 text-sm font-medium">
                    {notification.frequency || "Actionable"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm">Created:</span>
                  <span className="text-gray-800 text-sm font-medium">
                    {notification.created_at
                      ? moment(notification.created_at).format(
                          "MMM D, YYYY HH:mm"
                        )
                      : "-"}
                  </span>
                </div>
                {[
                  "kudo_received",
                  "kudo_liked",
                  "connection_kudo_received",
                  "connection_kudo_sent",
                ].includes(notification.type) && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm">Status:</span>
                    <span className="text-gray-800 text-sm font-medium">
                      {notification.is_read === true ? "Read" : "Unread"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Channels Section */}
          <div>
            <h3 className="font-medium text-gray-800 mb-4 flex items-center gap-2">
              Delivery Channels
              <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-full text-xs font-medium">
                {notification.notification_channels?.length || 0}
              </span>
            </h3>

            {notification.notification_channels?.length > 0 ? (
              <div className="space-y-3">
                {notification.notification_channels.map(
                  (channel: any, idx: number) => (
                    <div
                      key={idx}
                      className="border border-gray-200 rounded-lg p-4 bg-gray-50/50 hover:bg-gray-50 transition-colors"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-600">
                              Channel:
                            </span>
                            <span className="text-sm text-gray-800 font-medium capitalize">
                              {channel.channel?.replace(/_/g, " ") || "-"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-600">
                              Status:
                            </span>
                            <div className="flex items-center gap-1.5">
                              {getStatusIcon(channel.status)}
                              <span
                                className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${getStatusColor(
                                  channel.status
                                )}`}
                              >
                                {channel.status || "-"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-600">
                                Identifier:
                              </span>
                              <span className="text-sm text-gray-800 break-all">
                                {truncateIdentifier(channel)}
                              </span>
                            </div>
                            {channel.identifier && (
                              <button
                                onClick={() =>
                                  handleCopy(
                                    channel.identifier,
                                    `identifier-${idx}`
                                  )
                                }
                                className="text-gray-500 hover:text-primary transition-colors cursor-pointer p-1 shrink-0"
                                aria-label="Copy identifier"
                              >
                                {copiedField === `identifier-${idx}` ? (
                                  <FaCheckCircle className="text-green-500 text-sm" />
                                ) : (
                                  <FaCopy className="text-sm" />
                                )}
                              </button>
                            )}
                          </div>
                          {channel.error && (
                            <div className="group relative">
                              <div className="flex items-start">
                                <span className="text-sm font-medium text-gray-600 shrink-0 mr-2">
                                  Error:
                                </span>
                                <span className="text-sm text-gray-800 break-words flex-1">
                                  {truncateError(channel)}
                                </span>
                              </div>
                              {truncateError(channel) !== channel.error && (
                                <div className="absolute hidden group-hover:block z-20 bottom-full left-0 mt-1 w-full max-w-xs p-3 bg-white border border-gray-200 rounded-lg shadow-lg">
                                  <div className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                                    {channel.error}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500 border border-gray-200">
                No delivery channels found for this notification
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
