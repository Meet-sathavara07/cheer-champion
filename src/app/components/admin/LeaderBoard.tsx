import React, { useState } from "react";
import { User } from "@/app/viewModels/AdminDashboardViewModal";
import Image from "next/image";

interface LeaderboardProps {
  topSenders: User[];
  topReceivers: User[];
}

const LeaderboardUserCard: React.FC<{
  user: User;
  type: "sender" | "receiver";
  rank: number;
}> = ({ user, type, rank }) => {
  const name = user.user_profile?.name || "Unknown";
  const email = user?.email || "-";
  const profile =
    user.user_profile?.$files?.url || "/src/assets/defaultProfile.png";
  const count =
    type === "sender"
      ? user.kudos?.length || 0
      : user.kudo_receiver?.length || 0;

  // Different medal colors for top 3
  const getMedalIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
            <span className="text-yellow-800 text-xs font-bold">1</span>
          </div>
        );
      case 2:
        return (
          <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-gray-700 text-xs font-bold">2</span>
          </div>
        );
      case 3:
        return (
          <div className="w-6 h-6 bg-amber-600 rounded-full flex items-center justify-center">
            <span className="text-amber-100 text-xs font-bold">3</span>
          </div>
        );
      default:
        return (
          <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-gray-600 text-xs font-bold">{rank}</span>
          </div>
        );
    }
  };

  return (
    <div className="flex items-center py-3 px-4 hover:bg-gray-50 transition-colors">
      {/* Rank */}
      <div className="flex-shrink-0 mr-4">{getMedalIcon(rank)}</div>

      {/* Profile Image */}
      <div className="flex-shrink-0 mr-3">
        <Image
          src={profile}
          alt={name}
          width={50}
          height={50}
          className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
        />
      </div>

      {/* User Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-gray-900 truncate">{name}</h3>
        <h3 className="font-libre text-gray-900 truncate">{email}</h3>
      </div>

      {/* Score */}
      <div className="flex-shrink-0">
        <span className="text-sm font-semibold text-gray-600">
          {count} {count === 1 ? "Kudo" : "Kudos"}
        </span>
      </div>
    </div>
  );
};

const Leaderboard: React.FC<LeaderboardProps> = ({
  topSenders,
  topReceivers,
}) => {
  const [activeTab, setActiveTab] = useState<"senders" | "receivers">(
    "senders"
  );

  const currentData = activeTab === "senders" ? topSenders : topReceivers;

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 items-center justify-center ">
        <h2 className="text-xl text-gray-900 font-comfortaa font-bold tracking-tight">
          Cheer Board
          <span className="block w-1/6 h-1 bg-primary mt-2 rounded-full"></span>
        </h2>
      </div>

      {/* Tab Navigation */}
      <div className="p-2">
        <div className="relative flex justify-evenly mb-1.5 px-1 py-1.5 rounded-4xl bg-[#F2F7F6] ">
          {/* Sliding indicator */}
          <div
            className={`absolute cursor-pointer top-1.5 bottom-1.5 rounded-3xl bg-white shadow-md transition-all duration-400 ease-in-out ${
              activeTab === "senders"
                ? "left-1.5 right-1/2"
                : "left-1/2 right-1.5"
            }`}
          ></div>

          <button
            onClick={() => setActiveTab("senders")}
            className={`relative z-10 w-full py-3 text-sm font-medium rounded-3xl transition-colors cursor-pointer ${
              activeTab === "senders"
                ? "text-primary"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Top Senders
          </button>

          <button
            onClick={() => setActiveTab("receivers")}
            className={`relative z-10 w-full py-3 text-sm font-medium rounded-3xl transition-colors cursor-pointer ${
              activeTab === "receivers"
                ? "text-primary"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Top Receivers
          </button>
        </div>
      </div>

      {/* Leaderboard Content */}
      <div className="max-h-96 overflow-y-auto">
        {currentData.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto mb-3 text-gray-300"
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
            <p className="text-sm">
              No {activeTab === "senders" ? "senders" : "receivers"} data
              available
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {currentData.map((user, idx) => (
              <LeaderboardUserCard
                key={`${activeTab}-${user.id}`}
                user={user}
                type={activeTab === "senders" ? "sender" : "receiver"}
                rank={idx + 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
