"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { AdminDashboardViewModal } from "@/app/viewModels/AdminDashboardViewModal";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import KudosPerDayChart from "@/app/components/admin/KudosPerDayChart";
import TopThreeCards from "@/app/components/admin/TopThreeCards";
import MonthsChart from "@/app/components/admin/MonthsChart";
import MobileLayoutTopImage from "@/assets/layouts/layout-mobile-top.svg";
import LayoutTopImage from "@/assets/layouts/layout-top.svg";
import LineLayoutImage from "@/assets/layouts/line.png";
import Image from "next/image";
export default function AdminDashboard() {
  const router = useRouter();
  const {
    users,
    isLoading,
    t,
    currentMonthUsers,
    totalUsersCount,
    isScrolled,
    topSenders,
    topReceivers,
    kudosByDayOfWeek,
    currentMonthKudos, // Updated
    allKudosCount,
    allKudosData,
    allUsersForChart,
    kudosGrowth,
    usersGrowth,
    activeUsersCount,
    engagementPercentage,
    newUsersThisMonth,
    kudosTarget,
    usersTarget,
  } = AdminDashboardViewModal();

  if (isLoading) {
    return (
      <div className="flex-1 h-[calc(100dvh-70px)] lg:h-[calc(100dvh-85px)] w-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t("admin.dashboard.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <section className="flex-1 h-[calc(100dvh-70px)] lg:h-[calc(100dvh-85px)] w-full relative bg-gray-50 overflow-y-auto">
      <div className="h-[73px] lg:h-[103px] relative">
        <Image
          src={LayoutTopImage}
          alt="layout"
          className="w-full hidden lg:block h-full object-cover object-bottom -z-1"
          priority
        />
        <Image
          src={LineLayoutImage}
          alt="layout"
          className="absolute hidden lg:block inset-0 w-full h-full object-cover object-bottom z-0"
          priority
        />
        <Image
          src={MobileLayoutTopImage}
          alt="layout"
          className="absolute block lg:hidden inset-0 w-full h-full object-cover object-bottom z-0"
          priority
        />
      </div>
      <div className="py-3 lg:py-3 absolute top-0 left-0 h-full w-full">
        <div className="lg:py-3 px-4 lg:px-8 xl:px-12 max-w-[120rem] mx-auto">
          {/* Summary Stats */}
          <div className="w-full mb-3 sm:mb-4 flex justify-between items-center">
            <div className="bg-white p-2 rounded-lg shadow-sm flex flex-wrap items-start">
              <button
                onClick={() => router.push("/admin/dashboard")}
                className="px-3 py-1.5 sm:px-4 sm:py-2 cursor-pointer text-gray-800 hover:text-primary transition-colors relative"
              >
                <span className="text-sm sm:text-base font-comfortaa font-bold">
                  {t("admin.dashboard.title")}
                </span>
                <span className="block w-9 sm:w-14 h-0.5 bg-primary mt-1 rounded-full"></span>
              </button>
              <button
                onClick={() => router.push("/admin/kudo-list")}
                className="px-3 py-1.5 sm:px-4 sm:py-2 cursor-pointer text-gray-800 hover:text-primary transition-colors"
              >
                <span className="text-sm sm:text-base font-comfortaa font-bold">
                  {t("admin.kudoList.title")}
                </span>
              </button>
              <button
                onClick={() => router.push("/admin/users-list")}
                className="px-3 py-1.5 sm:px-4 cursor-pointer sm:py-2 text-gray-800 hover:text-primary transition-colors"
              >
                <span className="text-sm sm:text-base font-comfortaa font-bold">
                  {t("admin.userList.title")}
                </span>
              </button>
              <button
                onClick={() => router.push("/admin/announcements")}
                className="px-3 py-1.5 sm:px-4 cursor-pointer sm:py-2 text-gray-800 hover:text-primary transition-colors"
              >
                <span className="text-sm sm:text-base font-comfortaa font-bold">
                  {t("admin.announcements.title")}
                </span>
              </button>
              <button
                onClick={() => router.push("/admin/notification")}
                className="px-3 py-1.5 sm:px-4 cursor-pointer sm:py-2 text-gray-800 hover:text-primary transition-colors"
              >
                <span className="text-sm sm:text-base font-comfortaa font-bold">
                  Notification
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 mb-3 md:grid-cols-3 gap-5">
            {/* Kudos Analytics Card - Updated for Current Month */}
            <div className="bg-white rounded-xl border  shadow-md border-gray-200 p-6 hover:shadow-md transition-all">
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100/80 p-3 rounded-lg">
                    <svg
                      className="w-5 h-5 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      {t("admin.dashboard.totalKudos")}
                    </p>
                    <p className="text-xl font-bold text-gray-800">
                      {allKudosCount}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span
                    className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full ${
                      kudosGrowth.isPositive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {kudosGrowth.isPositive ? (
                      <svg
                        className="w-3 h-3 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-3 h-3 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12 13a1 1 0 100 2h5a1 1 0 001-1v-5a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586l-4.293-4.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    {kudosGrowth.percentage}%{" "}
                    {t("admin.dashboard.fromLastMonth")}
                  </span>
                </div>
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>
                    {t("admin.dashboard.newKudosThisMonth")}:{" "}
                    {currentMonthKudos}
                  </span>
                  <span>
                    {Math.round((currentMonthKudos / kudosTarget) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      currentMonthKudos >= kudosTarget
                        ? "bg-green-500"
                        : "bg-blue-500"
                    }`}
                    style={{
                      width: `${Math.min(
                        100,
                        (currentMonthKudos / kudosTarget) * 100
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Users Analytics Card - Updated for Current Month */}
            <div className="bg-white   shadow-md rounded-xl border border-gray-200 p-6 hover:shadow-md transition-all">
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-4">
                  <div className="bg-purple-100/80 p-3 rounded-lg">
                    <svg
                      className="w-5 h-5 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      {t("admin.dashboard.totalUsers")}
                    </p>
                    <p className="text-xl font-bold text-gray-800">
                      {totalUsersCount}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span
                    className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full ${
                      usersGrowth.isPositive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {usersGrowth.isPositive ? (
                      <svg
                        className="w-3 h-3 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-3 h-3 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12 13a1 1 0 100 2h5a1 1 0 001-1v-5a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586l-4.293-4.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    {usersGrowth.percentage}%{" "}
                    {t("admin.dashboard.fromLastMonth")}
                  </span>
                </div>
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>
                    {t("admin.dashboard.newUsersThisMonth")}:{" "}
                    {currentMonthUsers}
                  </span>
                  <span>
                    {Math.round((currentMonthUsers / usersTarget) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-purple-500"
                    style={{
                      width: `${Math.min(
                        100,
                        (currentMonthUsers / usersTarget) * 100
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Engagement Card - Unchanged */}
            <div className="bg-white rounded-xl  shadow-md border border-gray-200 p-6 hover:shadow-md transition-all">
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-4">
                  <div className="bg-amber-100/80 p-3 rounded-lg">
                    <svg
                      className="w-5 h-5 text-amber-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      {t("admin.dashboard.engagement")}
                    </p>
                    <p className="text-xl font-bold text-gray-800">
                      {engagementPercentage}%
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span
                    className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full ${
                      engagementPercentage > 75
                        ? "bg-green-100 text-green-800"
                        : engagementPercentage > 50
                        ? "bg-amber-100 text-amber-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {engagementPercentage > 75
                      ? t("high")
                      : engagementPercentage > 50
                      ? t("medium")
                      : t("low")}{" "}
                    {t("activity")}
                  </span>
                  <span className="text-xs text-gray-500 mt-1"></span>
                </div>
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>
                    {t("admin.dashboard.activeUsers")}: {activeUsersCount}
                  </span>
                  <span>
                    {t("admin.dashboard.totalUsers")} {totalUsersCount}
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      engagementPercentage > 75
                        ? "bg-green-500"
                        : engagementPercentage > 50
                        ? "bg-amber-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${engagementPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
          {/* Monthly Kudos vs Users Chart - Full Width */}
          <div className="mb-8">
            <MonthsChart
              kudosData={allKudosData}
              usersData={allUsersForChart}
              height={450}
              t={t}
            />
          </div>
          {/* Main Content: Split Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Left Half: Kudos Per Day Chart and Summary Stats */}
            <div className="space-y-6">
              {/* Kudos Per Day Chart */}
              <div>
                <KudosPerDayChart
                  data={
                    kudosByDayOfWeek || {
                      Sunday: 0,
                      Monday: 0,
                      Tuesday: 0,
                      Wednesday: 0,
                      Thursday: 0,
                      Friday: 0,
                      Saturday: 0,
                    }
                  }
                  height={400}
                  showDataLabels={true}
                  stacked={true}
                  t={t}
                />
              </div>
            </div>

            {/* Top Senders & Receivers */}
            <div className="space-y-6">
              <TopThreeCards
                topSenders={topSenders}
                topReceivers={topReceivers}
                t={t}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
