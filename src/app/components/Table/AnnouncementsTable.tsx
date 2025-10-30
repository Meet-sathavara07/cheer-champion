"use client";
import React from "react";
import moment from "moment";
import { useTranslation } from "react-i18next";
import Loader from "../Loader";

interface AnnouncementsTableProps {
  announcements: any[];
  isLoading: boolean;
}

export const AnnouncementsTable: React.FC<AnnouncementsTableProps> = ({
  announcements,
  isLoading,
}) => {
  const { t } = useTranslation();

  const truncateText = (text: string) => {
    if (!text) return "N/A";
    if (text.length <= 25) return text;
    return `${text.slice(0, 25)}...`;
  };

  if (isLoading && announcements.length === 0) {
    return (
      <div className="h-64 w-full flex items-center justify-center">
        <Loader className="h-10 w-10 border-primary border-t-4 border-b-4" />
      </div>
    );
  }

  if (!announcements || announcements.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600 text-md font-medium">
        {t("admin.announcements.noAnnouncements")}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-x-auto overflow-y-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-primary">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-comfortaa text-white uppercase tracking-wider">
              #
            </th>
            <th className="px-6 py-3 text-left text-xs font-comfortaa text-white uppercase tracking-wider">
              {t("admin.announcements.title")}
            </th>
            <th className="px-6 py-3 text-left text-xs font-comfortaa text-white uppercase tracking-wider">
              {t("admin.announcements.messageLabel")}
            </th>
            <th className="px-6 py-3 text-left text-xs font-comfortaa text-white uppercase tracking-wider">
              {t("admin.announcements.recipients")}
            </th>
            <th className="px-6 py-3 text-left text-xs font-comfortaa text-white uppercase tracking-wider">
              {t("admin.usersTable.createdAt")}
            </th>
            <th className="px-6 py-3 text-left text-xs font-comfortaa text-white uppercase tracking-wider">
              {t("admin.announcements.entity_type")}
            </th>
            <th className="px-6 py-3 text-left text-xs font-comfortaa text-white uppercase tracking-wider">
              {t("admin.announcements.actions")}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {announcements.map((ann, idx) => (
            <tr
              key={ann.id || idx} // Fallback to idx if id is missing
              className="hover:bg-gray-50 transition-colors duration-150"
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {idx + 1}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                {truncateText(ann.title ?? "No Title")}
              </td>
              <td className="px-6 py-4 max-w-xs">
                <div className="relative group">
                  <div className="text-sm font-medium text-gray-800">
                    {truncateText(ann.message ?? "No Message")}
                  </div>
                  <div className="absolute hidden group-hover:block z-20 top-full left-0 mt-1 w-64 p-3 bg-white border border-gray-200 rounded-lg shadow-lg">
                    <div className="text-sm text-gray-700 whitespace-pre-wrap">
                      {ann.message ?? "No Message"}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                {ann?.$users?.user_profile?.name ?? "Unknown"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-dark">
                {ann.created_at
                  ? moment(ann.created_at).format("DD-MM-YYYY HH:mm:ss")
                  : "N/A"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                {ann.entity_type ?? "N/A"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                {ann.type ?? "N/A"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
