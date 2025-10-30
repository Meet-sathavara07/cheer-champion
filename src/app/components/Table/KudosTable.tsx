"use client";
import React from "react";
import Image from "next/image";
import ReceivedIcon from "@/assets/icon/received-icon.svg";
import GivenIcon from "@/assets/icon/given-icon.svg";
import Loader from "@/app/components/Loader";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { FaEye } from "react-icons/fa";

interface KudosTableProps {
  kudos: any[];
  isLoading: boolean;
  onPreviewKudo?: (kudo: any) => void;
}

const KudosTable: React.FC<KudosTableProps> = ({
  kudos,
  isLoading,
  onPreviewKudo,
}) => {
  const { t } = useTranslation();
  const truncateText = (text: string) => {
    if (!text) return "-";
    if (text.length <= 25) return text;
    return `${text.slice(0, 25)}...`;
  };

  if (isLoading && kudos.length === 0) {
    return (
      <div className="h-64 w-full flex items-center justify-center">
        <Loader className="h-10 w-10 border-primary border-t-4 border-b-4" />
      </div>
    );
  }

  if (!kudos || kudos.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600 text-md font-medium">
        {t("admin.kudosTable.noKudos")}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-x-auto overflow-y-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className=" bg-primary ">
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
              {t("admin.kudosTable.message")}
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-comfortaa text-white uppercase tracking-wider"
            >
              {t("admin.kudosTable.preview")}
            </th>
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
                {t("admin.kudosTable.sender")}
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
                {t("admin.kudosTable.receiver")}
              </div>
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-comfortaa text-white uppercase tracking-wider"
            >
              {t("admin.kudosTable.date")}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {kudos.map((kudo, idx) => (
            <tr
              key={kudo.id}
              className="hover:bg-gray-100 transition-colors duration-150"
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {idx + 1}
              </td>
              <td className="px-6 py-4 max-w-xs">
                <div className="relative group">
                  <div className="text-sm font-medium text-gray-800">
                    {truncateText(kudo.kudo)}
                  </div>
                  <div className="absolute hidden group-hover:block z-20 top-full left-0 mt-1 w-64 p-3 bg-white border border-gray-200 rounded-lg shadow-lg">
                    <div className="text-sm text-gray-700 whitespace-pre-wrap">
                      {kudo.kudo || "-"}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {kudo.file_url ? (
                  <button
                    onClick={() => onPreviewKudo && onPreviewKudo(kudo)}
                    className="text-primary flex items-center gap-1 hover:text-primary-dark text-sm font-medium transition-colors duration-150 underline cursor-pointer"
                    type="button"
                  >
                    <FaEye />
                    {t("admin.kudosTable.view")}
                  </button>
                ) : (
                  <span className="text-gray-400 text-sm">-</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-800">
                  {kudo.$users && kudo.$users.length > 0
                    ? kudo.$users
                        .map((user: any, idx: number) =>
                          user.user_profile?.name ? (
                            <Link
                              key={user.id}
                              href={`/profile/${user.id}`}
                              className=" hover:text-primary-dark underline"
                            >
                              {user.user_profile.name}
                            </Link>
                          ) : (
                            user.user_profile?.email || "-"
                          )
                        )
                        .reduce((prev: any, curr: any) => [prev, ", ", curr])
                    : "-"}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-800">
                  {kudo.kudo_receiver && kudo.kudo_receiver.length > 0
                    ? kudo.kudo_receiver
                        .map((receiver: any, ridx: number) =>
                          receiver.$users && receiver.$users.length > 0
                            ? receiver.$users
                                .map((u: any, uidx: number) =>
                                  u.user_profile?.name ? (
                                    <Link
                                      key={u.id}
                                      href={`/profile/${u.id}`}
                                      className=" hover:text-primary-dark underline"
                                      
                                    >
                                      {u.user_profile.name}
                                    </Link>
                                  ) : (
                                    u.user_profile?.email || "-"
                                  )
                                )
                                .reduce((prev: any, curr: any) => [prev, ", ", curr])
                            : "-"
                        )
                        .reduce((prev: any, curr: any) => [prev, ", ", curr])
                    : "-"}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-primary-dark">
                  {kudo.created_at
                    ? new Date(kudo.created_at).toLocaleString()
                    : "-"}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default KudosTable;
