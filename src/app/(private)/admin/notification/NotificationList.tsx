"use client";
import React, { useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import InfiniteScroll from "react-infinite-scroll-component";
import { DateRangePicker } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import {
  FaRegCalendarAlt,
  FaSearch,
  FaUndo,
  FaTimes,
  FaBell,
  FaChevronDown,
  FaFilter,
} from "react-icons/fa";
import { IoMdNotifications } from "react-icons/io";
import { RiUserHeartLine } from "react-icons/ri";
import { TbRefresh } from "react-icons/tb";
import Loader from "@/app/components/Loader";
import moment from "moment";
import MobileLayoutTopImage from "@/assets/layouts/layout-mobile-top.svg";
import LayoutTopImage from "@/assets/layouts/layout-top.svg";
import LineLayoutImage from "@/assets/layouts/line.png";
import NotificationsTable from "@/app/components/Table/NotificationsTable";
import { useNotificationsListViewModel } from "@/app/viewModels/NotificationListViewModel";

export default function NotificationsList() {
  const {
    notifications,
    loadMoreNotifications,
    isLoading,
    hasMore,
    t,
    startDate,
    endDate,
    mode,
    setMode,
    error,
    stats,
    isCalendarOpen,
    setIsCalendarOpen,
    searchInput,
    setSearchInput,
    isScrolled,
    calendarRef,
    handleSelect,
    handleReset,
    selectionRange,
    activeFilter,
    setActiveFilter,
  } = useNotificationsListViewModel();
  const router = useRouter();
  const pathname = usePathname();
  const [showFilters, setShowFilters] = useState(false);

  // Notification types for filtering
  const notificationTypes = [
    {
      id: "all",
      name: "All",
      icon: <IoMdNotifications />,
      count: stats.total,
    },
    {
      id: "engagement",
      name: "Transitional",
      icon: <RiUserHeartLine />,
      count: stats.engagement,
    },
    {
      id: "reminders",
      name: "Promotional",
      icon: <TbRefresh />,
      count: stats.reminders,
    },
    {
      id: "failed",
      name: "Alerts",
      icon: <FaBell />,
      count: stats.failed,
      color: "bg-red-500 text-white",
    },
  ];

  return (
    <section
      key={pathname}
      className="flex-1 h-[calc(100dvh-70px)] lg:h-[calc(100dvh-85px)] w-full relative bg-gray-50 overflow-hidden"
    >
      {/* Header Background */}
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

      {/* Main Content */}
      <div
        id="notificationsListScrollableDiv"
        className="py-4 px-4 lg:px-8 xl:px-12 lg:py-6 absolute top-0 left-0 h-full w-full overflow-y-auto"
      >
        <div className="max-w-[120rem] mx-auto">
          {/* Navigation Header - Same as Admin Dashboard and Kudo List */}
          <div className="w-full bg-white mb-3 p-2 rounded-lg shadow-sm sm:mb-4 flex flex-col md:flex-row md:justify-between md:items-start">
            <div className="flex flex-wrap items-start">
              <button
                onClick={() => router.push("/admin/dashboard")}
                className="px-3 py-1.5 sm:px-4 sm:py-2 cursor-pointer text-gray-800 hover:text-primary transition-colors"
              >
                <span className="text-sm sm:text-base font-comfortaa font-bold">
                  {t("admin.dashboard.title")}
                </span>
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
                className="px-3 py-1.5 sm:px-4 cursor-pointer sm:py-2 text-gray-800 hover:text-primary transition-colors relative"
              >
                <span className="text-sm sm:text-base font-comfortaa font-bold">
                  Notification
                </span>
                <span className="block w-1/2 h-0.5 bg-primary mt-1 rounded-full"></span>
              </button>
            </div>
            <div className="w-full px-3 py-1.5 sm:w-auto flex flex-col gap-1 items-start sm:items-end">
              <div className="flex items-center justify-between w-full sm:justify-end sm:gap-6">
                <div className="hidden md:flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-500">
                      Total :
                    </span>
                    <span className="text-lg font-semibold text-primary">
                      {stats.total}
                    </span>
                  </div>
                  <div className="w-px h-6 bg-gray-200"></div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-500">
                      Transitional :
                    </span>
                    <span className="text-lg font-semibold text-primary">
                      {stats.engagement}
                    </span>
                  </div>
                  <div className="w-px h-6 bg-gray-200"></div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-500">
                      Promotional :
                    </span>
                    <span className="text-lg font-semibold text-primary">
                      {stats.reminders}
                    </span>
                  </div>
                  <div className="w-px h-6 bg-gray-200"></div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-500">
                      Alerts :
                    </span>
                    <span className="text-lg font-semibold text-primary">
                      {stats.failed}
                    </span>
                  </div>
                </div>

                <div className="md:hidden flex items-center justify-around w-full">
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-medium text-gray-500">
                      Total :
                    </span>
                    <span className="text-base font-bold text-primary">
                      {stats.total}
                    </span>
                  </div>
                  <div className="w-px h-6 bg-gray-200"></div>
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-medium text-gray-500">
                      Transitional :
                    </span>
                    <span className="text-base font-bold text-primary">
                      {stats.engagement}
                    </span>
                  </div>
                  <div className="w-px h-6 bg-gray-200"></div>
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-medium text-gray-500">
                      Promotional :
                    </span>
                    <span className="text-base font-bold text-primary">
                      {stats.reminders}
                    </span>
                  </div>
                  <div className="w-px h-6 bg-gray-200"></div>
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-medium text-gray-500">
                      Alerts :
                    </span>
                    <span className="text-base font-bold text-primary">
                      {stats.failed}
                    </span>
                  </div>
                </div>
              </div>
              <div className="w-full sm:w-auto flex items-center gap-2 mt-1">
                <span className="text-xs font-medium text-gray-500">
                  {t("admin.notificationList.showing") || "Showing"}
                </span>
                <span className="text-sm sm:text-base font-semibold text-primary">
                  {notifications.length}
                </span>
                <span className="text-xs font-medium text-gray-500">
                  {t("admin.notificationList.of") || "of"}
                </span>
                <span className="text-sm sm:text-base font-semibold text-primary">
                  {stats.total}
                </span>
                <span className="text-xs font-medium text-gray-500">
                  {t("admin.notificationList.notificationsLabel") ||
                    "Notifications"}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-lg p-4 lg:p-6 bg-white shadow-sm">
            {/* Notification Type Filters */}
            <div className="flex flex-wrap justify-between gap-1 lg:gap-2 mb-6">
              <div className="flex flex-wrap gap-2">
                {notificationTypes.map((type) => (
                  <button
                    key={type.id}
                    className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg cursor-pointer text-xs sm:text-sm font-medium transition-colors border border-gray-200 shadow-sm min-w-[120px] justify-center ${
                      activeFilter === type.id
                        ? "bg-primary text-white"
                        : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                    } ${
                      activeFilter === "failed" && type.id === "failed"
                        ? "bg-red-500 text-white"
                        : ""
                    }`}
                    onClick={() => setActiveFilter(type.id as any)}
                  >
                    <span className="text-base">{type.icon}</span>
                    <span>{type.name}</span>
                    {activeFilter === type.id && (
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-xs bg-white text-gray-700`}
                      >
                        {notifications.length}
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <div
                className={`${
                  showFilters ? "block" : "hidden"
                } lg:block mt-2 md:mt-0 lg:w-auto`}
              >
                <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
                  {/* Search Bar */}
                  <div className="relative flex-1 block max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaSearch className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="px-3 py-2 pl-10 border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm bg-gray-50"
                      placeholder={
                        t("admin.notificationList.searchPlaceholder") ||
                        "Search notifications..."
                      }
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                    />
                    {searchInput && (
                      <button
                        onClick={() => setSearchInput("")}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        <FaTimes className="text-gray-500 hover:text-gray-700" />
                      </button>
                    )}
                  </div>

                  {/* Date Filter */}
                  <div className="flex items-center gap-2">
                    <div
                      className="relative flex items-center"
                      ref={calendarRef}
                    >
                      <button
                        className="px-3 sm:px-4 py-2 bg-gray-50 cursor-pointer text-gray-700 rounded-lg flex items-center gap-2 text-xs sm:text-sm font-medium hover:bg-gray-100 transition-colors border border-gray-200 shadow-sm whitespace-nowrap"
                        onClick={() => {
                          setIsCalendarOpen((open) => !open);
                          setMode("filter");
                        }}
                        type="button"
                      >
                        {moment(startDate).format("DD-MM-YYYY")} -{" "}
                        {moment(endDate).format("DD-MM-YYYY")}
                        <FaRegCalendarAlt className="text-primary" />
                      </button>
                      {isCalendarOpen && (
                        <div className="   absolute z-20 bg-white p-2 sm:p-4 rounded-lg shadow-lg border border-gray-200 mt-2 top-full    left-1/2 -translate-x-1/2       sm:left-0 sm:translate-x-0      lg:left-auto lg:right-0 lg:translate-x-0     customDateRangePicker ">
                          <DateRangePicker
                            ranges={[selectionRange]}
                            onChange={handleSelect}
                            moveRangeOnFirstSelection={false}
                            direction={
                              window.innerWidth < 768
                                ? "vertical"
                                : "horizontal"
                            }
                            months={window.innerWidth < 768 ? 1 : 2}
                            className="border-0 text-sm sm:text-base"
                            rangeColors={["#3b82f6"]}
                            showMonthAndYearPickers={true}
                            calendarFocus="forwards"
                            preventSnapRefocus={true}
                          />
                        </div>
                      )}
                    </div>
                    {/* Reset Button */}
                    <button
                      className="px-3 sm:px-4 py-2 cursor-pointer bg-gray-50 text-gray-700 rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-100 transition-colors flex items-center gap-2 border border-gray-200 shadow-sm w-fit"
                      onClick={handleReset}
                      type="button"
                    >
                      <FaUndo className="text-primary" />
                      {t("admin.notificationList.reset") || "Reset"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filter Toggle for Mobile */}
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg w-full justify-center"
              >
                <FaFilter />
                {showFilters ? "Hide Filters" : "Show Filters"}
                <FaChevronDown
                  className={`transition-transform ${
                    showFilters ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>

            {/* Loading State */}
            {isLoading && notifications.length === 0 && (
              <div className="flex justify-center py-12">
                <Loader className="h-12 w-12 border-primary border-t-4 border-b-4" />
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-center flex flex-col items-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3">
                  <FaTimes className="text-red-500 text-xl" />
                </div>
                <h3 className="font-medium">
                  {t("admin.notificationList.failed") ||
                    "Failed to load notifications"}
                </h3>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && notifications.length === 0 && (
              <div className="text-center py-12">
                <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 shadow-inner">
                  <FaSearch className="text-gray-500 text-2xl" />
                </div>
                <h3 className="text-lg font-medium text-gray-700">
                  {t("admin.notificationList.noNotifications") ||
                    "No notifications found"}
                </h3>
                <p className="text-gray-500 mt-2">
                  {mode === "search"
                    ? t("admin.notificationList.trySearch") ||
                      "Try changing your search query to see more results."
                    : mode === "filter"
                    ? t("admin.notificationList.tryDate") ||
                      "Try adjusting the date range to see more results."
                    : t("admin.notificationList.noDisplay") ||
                      "There are no notifications to display at the moment."}
                </p>
              </div>
            )}

            {/* Notifications Table with Infinite Scroll */}
            {notifications.length > 0 && (
              <InfiniteScroll
                dataLength={notifications.length}
                next={loadMoreNotifications}
                hasMore={hasMore}
                loader={
                  <div className="flex justify-center py-6">
                    <Loader className="h-10 w-10 !border-primary border-t-4 border-b-4" />
                  </div>
                }
                endMessage={
                  <div className="text-center py-6 text-gray-500 text-sm bg-gray-50 rounded-xl mx-4">
                    {notifications.length > 0
                      ? t("admin.notificationList.endOfList") ||
                        "You've reached the end of the list"
                      : t("admin.notificationList.noNotifications") ||
                        "No notifications found"}
                  </div>
                }
                scrollableTarget="notificationsListScrollableDiv"
                scrollThreshold="200px"
              >
                <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                  <NotificationsTable
                    notifications={notifications}
                    isLoading={isLoading}
                  />
                </div>
              </InfiniteScroll>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
