"use client";
import React from "react";
import Image from "next/image";
import Loader from "@/app/components/Loader";
import type { User } from "@/app/viewModels/userListViewModal";
import ProfilePlaceholderImage from "@/assets/defaultProfile.png";
import Link from "next/link";
import ReceivedIcon from "@/assets/icon/received-icon.svg";
import GivenIcon from "@/assets/icon/given-icon.svg";
import { useTranslation } from "react-i18next";
import { FaEye } from "react-icons/fa";

interface UsersTableProps {
  users: User[];
  isLoading: boolean;
  onPreviewKudo?: (kudo: any) => void;
}

const UsersTable: React.FC<UsersTableProps> = ({
  users,
  isLoading,
  onPreviewKudo,
}) => {
  const { t } = useTranslation();

  if (isLoading && users.length === 0) {
    return (
      <div className="h-64 w-full flex items-center justify-center">
        <Loader className="h-10 w-10 border-primary border-t-4 border-b-4" />
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600 text-md font-medium">
        {t("admin.usersTable.noUsers")}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-x-auto overflow-y-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-primary">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-comfortaa text-white uppercase tracking-wider"
            >
              #
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-comfortaa text-white uppercase tracking-wider"
            >
              {t("admin.usersTable.photo")}
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-comfortaa text-white uppercase tracking-wider"
            >
              {t("admin.usersTable.name")}
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-comfortaa text-white uppercase tracking-wider"
            >
              {t("admin.usersTable.email")}
            </th>
            {/* <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-comfortaa text-white uppercase tracking-wider"
            >
              {t("admin.usersTable.role")}
            </th> */}
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-comfortaa text-white uppercase tracking-wider"
            >
              <div className="flex items-center">
                <Image
                  src={GivenIcon}
                  alt="Given"
                  className="h-4 w-4 mr-1 filter brightness-0 invert"
                />
                {t("admin.usersTable.sent")}
              </div>
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-comfortaa text-white uppercase tracking-wider"
            >
              <div className="flex items-center">
                <Image
                  src={ReceivedIcon}
                  alt="Received"
                  className="h-4 w-4 mr-1 filter brightness-0 invert"
                />
                {t("admin.usersTable.received")}
              </div>
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-comfortaa text-white uppercase tracking-wider"
            >
              {t("admin.usersTable.createdAt")}
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-comfortaa text-white uppercase tracking-wider"
            >
              {t("admin.usersTable.lastKudoSent")}
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-comfortaa text-white uppercase tracking-wider"
            >
              {t("admin.usersTable.lastKudoView")}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {users.map((user, idx) => {
            const profileImage =
              user.user_profile && (user.user_profile as any).$files?.url
                ? (user.user_profile as any).$files.url
                : ProfilePlaceholderImage;
            // Sent kudos count
            const sentKudosCount = user.kudos ? user.kudos.length : 0;
            // Latest kudo (most recent)
            const latestKudo =
              user.kudos && user.kudos.length > 0 ? user.kudos[0] : null;
            // Last kudo sent date
            let lastKudoSentDate = "—";
            if (latestKudo?.created_at) {
              lastKudoSentDate = new Date(
                latestKudo.created_at
              ).toLocaleString();
            }

            return (
              <tr
                key={user.id}
                className="hover:bg-gray-100 transition-colors duration-150"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {idx + 1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Image
                    src={profileImage}
                    alt="profile"
                    height={40}
                    width={40}
                    className="h-10 w-10 object-cover rounded-full"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-800">
                    {user?.user_profile?.name ? (
                      <Link
                        href={`/profile/${user.id}`}
                        className="text-primary hover:text-primary-dark underline"
                      >
                        {user.user_profile.name}
                      </Link>
                    ) : (
                      "-"
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-800">
                    {user.email ||
                      user.user_profile?.email2 ||
                      user.user_profile?.email3 ||
                      "-"}
                  </div>
                </td>
                {/* <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-800">
                    {user.user_profile?.role || "-"}
                  </div>
                </td> */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-800">
                    {sentKudosCount}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-800">
                    {user.kudo_receiver ? user.kudo_receiver.length : 0}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-primary-dark">
                    {user.user_profile?.created_at
                      ? new Date(user.user_profile.created_at).toLocaleString()
                      : "-"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-800">
                    {lastKudoSentDate}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {latestKudo ? (
                    <button
                      onClick={() => onPreviewKudo && onPreviewKudo(latestKudo)}
                      className="text-sm cursor-pointer font-medium flex items-center gap-1 text-primary hover:text-primary-dark"
                    >
                      <FaEye />
                      {t("admin.kudosTable.view")}
                    </button>
                  ) : (
                    <div className=" text-gray-800">—</div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default UsersTable;
