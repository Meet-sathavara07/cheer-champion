import React from "react";
import { User } from "@/app/viewModels/AdminDashboardViewModal";
import Image from "next/image";
import Link from "next/link";

interface TopThreeCardsProps {
  topSenders: User[];
  topReceivers: User[];
  t: (key: string) => string;
}

const UserCard: React.FC<{
  user: User;
  type: "sender" | "receiver";
  rank: number;
}> = ({ user, type, rank }) => {
  const name = user.user_profile?.name || "Unknown";
  const email = user.email || user.user_profile?.email2 || "No email";
  const profile =
    user.user_profile?.$files?.url || "/src/assets/defaultProfile.png";
  const count =
    type === "sender"
      ? user.kudos?.length || 0
      : user.kudo_receiver?.length || 0;

  const rankColors = [
    "bg-yellow-400 text-yellow-900", // 1st place
    "bg-gray-300 text-gray-700", // 2nd place
    "bg-amber-600 text-amber-100", // 3rd place
  ];

  return (
    <Link
      href={`/profile/${user.id}`}
      className="block bg-white rounded-lg shadow-xs p-4 items-center flex gap-4 border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all duration-200 hover:bg-gray-50"
      aria-label={`View ${name}'s profile`}
    >
      {/* Rank Badge - Not clickable (will inherit from parent) */}
      <div
        className={`flex-shrink-0 w-7 h-7 ${
          rankColors[rank - 1]
        } rounded-full flex items-center justify-center font-bold text-sm shadow-inner`}
      >
        {rank}
      </div>

      {/* Profile Image - Not clickable (will inherit from parent) */}
      <div className="relative flex-shrink-0">
        <Image
          src={profile}
          alt={name}
          width={48}
          height={48}
          className="w-10 h-10 object-cover rounded-full border-2 border-white shadow-sm"
          onError={(e) => {
            e.currentTarget.src = "/src/assets/defaultProfile.png";
          }}
        />
      </div>

      {/* User Info - Not clickable (will inherit from parent) */}
      <div className="flex-1 min-w-0 space-y-1">
        <h3 className="font-medium text-gray-900 truncate text-sm group-hover:text-primary-dark">
          {name}
        </h3>
        <p className="text-xs text-gray-500 truncate">{email}</p>
      </div>

      {/* Count Badge - Not clickable (will inherit from parent) */}
      <div className="flex-shrink-0 px-2 py-1.5 bg-blue-100  text-sm font-bold rounded-full">
        {count}
      </div>
    </Link>
  );
};

const TopThreeCards: React.FC<TopThreeCardsProps> = ({
  topSenders,
  topReceivers,
  t,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Centered Header */}
      <div className="p-3 flex flex-col items-center justify-center border-b border-gray-200">
        <h2 className="text-xl text-gray-900 font-comfortaa font-bold tracking-tight text-center">
          {t("topThree.cheerBoard")}
          <span className="block  h-1 bg-primary mt-1 rounded-full mx-auto"></span>
        </h2>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-gray-200">
        {/* Left Side - Senders */}
        <div className="p-3">
          <div className="flex items-center mb-4">
            <div className="p-2 rounded-lg bg-blue-100 mr-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </div>
            <h3 className="text-md font-semibold text-gray-800">
              {t("topThree.topSenders")}
            </h3>
          </div>
          {topSenders.length === 0 ? (
            <div className="text-center py-6 text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 mx-auto mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm">{t("topThree.noSenders")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topSenders.map((user, idx) => (
                <UserCard
                  key={`sender-${user.id}`}
                  user={user}
                  type="sender"
                  rank={idx + 1}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Side - Receivers */}
        <div className="p-3">
          <div className="flex items-center mb-4">
            <div className="p-2 rounded-lg bg-green-100 mr-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 12h14M12 5l7 7-7 7"
                />
              </svg>
            </div>
            <h3 className="text-md font-semibold text-gray-800">
              {t("topThree.topReceivers")}
            </h3>
          </div>
          {topReceivers.length === 0 ? (
            <div className="text-center py-6 text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 mx-auto mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm">{t("topThree.noReceivers")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topReceivers.map((user, idx) => (
                <UserCard
                  key={`receiver-${user.id}`}
                  user={user}
                  type="receiver"
                  rank={idx + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopThreeCards;
