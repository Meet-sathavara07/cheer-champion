"use client";
import React, { useState } from "react";
import Image from "next/image";
import InfiniteScroll from "react-infinite-scroll-component";
import UsersTable from "@/app/components/Table/UsersTable";
import Loader from "@/app/components/Loader";
import { useUserListViewModel } from "@/app/viewModels/userListViewModal";
import MobileLayoutTopImage from "@/assets/layouts/layout-mobile-top.svg";
import LayoutTopImage from "@/assets/layouts/layout-top.svg";
import LineLayoutImage from "@/assets/layouts/line.png";
import { DateRangePicker } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { FaRegCalendarAlt, FaSearch, FaTimes, FaUndo } from "react-icons/fa";
import { usePathname, useRouter } from "next/navigation";
import moment from "moment";
import UserKudoFileModal from "@/app/components/Modals/KudoFileModal";

export default function UserList() {
  const {
    users,
    isLoading,
    hasMore,
    loadMoreUsers,
    t,
    mode,
    startDate,
    endDate,
    setMode,
    error,
    totalUsersCount,
    isCalendarOpen,
    setIsCalendarOpen,
    searchInput,
    setSearchInput,
    isScrolled,
    calendarRef,
    handleSelect,
    handleReset,
    selectionRange,
    setPreviewKudo,
    previewKudo,
  } = useUserListViewModel();

  const router = useRouter();
  const pathname = usePathname();
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
        id="userListScrollableDiv"
        className="py-4  px-4 lg:px-8 xl:px-12  lg:py-6 absolute top-0 left-0 h-full w-full overflow-y-auto"
      >
        <div className="max-w-[120rem] mx-auto">
          {/* Navigation Header - Same as Admin Dashboard */}
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
                className="px-3 py-1.5 sm:px-4 sm:py-2 cursor-pointer text-gray-800 hover:text-primary transition-colors relative"
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
                <span className="block w-1/2 h-0.5 bg-primary mt-1 rounded-full"></span>
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
            <div className="w-full px-3 py-1.5  sm:w-auto flex flex-col gap-1 items-start sm:items-end">
              <div className="flex items-center justify-between w-full sm:justify-end sm:gap-4">
                {/* Desktop view */}
                <div className="hidden md:flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-500">
                      {t("admin.userList.totalUsers")}
                    </span>
                    <span className="text-lg font-semibold text-primary">
                      {totalUsersCount}
                    </span>
                  </div>
                </div>

                {/* Mobile view */}
                <div className="md:hidden flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-medium text-gray-500">
                      {t("admin.userList.totalUsers")}
                    </span>
                    <span className="text-sm sm:text-base font-semibold text-primary">
                      {totalUsersCount}
                    </span>
                  </div>
                </div>
              </div>
              {/* Users Count Display */}
              <div className="w-full sm:w-auto flex items-center gap-2 mt-1">
                <span className="text-xs font-medium text-gray-500">
                  {t("admin.userList.showing")}
                </span>
                <span className="text-sm sm:text-base font-semibold text-primary">
                  {users.length}
                </span>
                <span className="text-xs font-medium text-gray-500">
                  {t("admin.userList.of")}
                </span>
                <span className="text-sm sm:text-base font-semibold text-primary">
                  {totalUsersCount}
                </span>
                <span className="text-xs font-medium text-gray-500">
                  {t("admin.userList.usersLabel")}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-lg p-4 lg:p-6 bg-white shadow-sm">
            {/* Search and Date Filter Section */}
            <div className="mb-6 flex flex-col md:flex-row gap-3 items-stretch md:items-center">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  className="px-3 py-2 pl-10 border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm bg-gray-50"
                  placeholder={t("admin.userList.searchPlaceholder")}
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

              <div className="relative flex items-center" ref={calendarRef}>
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
                  <div className="absolute z-20 bg-white p-2 sm:p-4 rounded-lg shadow-lg border border-gray-200 mt-2 md:left-0 right-0 sm:left-1/2 sm:transform sm:-translate-x-1/2 top-full customDateRangePicker">
                    <DateRangePicker
                      ranges={[selectionRange]}
                      onChange={handleSelect}
                      moveRangeOnFirstSelection={false}
                      direction={
                        window.innerWidth < 768 ? "vertical" : "horizontal"
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
                className="px-4 py-2 cursor-pointer bg-gray-50 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors flex items-center gap-2 border border-gray-200 shadow-sm w-fit"
                onClick={handleReset}
                type="button"
              >
                <FaUndo className="text-primary" />
                {t("admin.userList.reset")}
              </button>
            </div>

            {/* Loading State */}
            {isLoading && users.length === 0 && (
              <div className="flex justify-center py-12">
                <Loader className="h-10 w-10 border-primary border-t-4 border-b-4" />
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center">
                {t("admin.userList.failed")}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && users.length === 0 && (
              <div className="text-center py-12">
                <div className="mx-auto w-16 h-16 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4 shadow-inner">
                  <FaSearch className="text-gray-500 text-xl sm:text-2xl" />
                </div>
                <h3 className="text-base sm:text-lg font-medium text-gray-700">
                  {t("admin.userList.noUsers")}
                </h3>
                <p className="text-sm sm:text-base text-gray-500 mt-1">
                  {mode === "search"
                    ? t("admin.userList.trySearch")
                    : mode === "filter"
                    ? t("admin.userList.tryDate")
                    : t("admin.userList.noDisplay")}
                </p>
              </div>
            )}

            {/* Users Table with Infinite Scroll */}
            {users.length > 0 && (
              <InfiniteScroll
                dataLength={users.length}
                next={loadMoreUsers}
                hasMore={hasMore}
                loader={
                  <div className="flex justify-center py-6">
                    <Loader className="h-8 w-8 !border-primary border-t-4 border-b-4" />
                  </div>
                }
                endMessage={
                  <div className="text-center py-6 text-gray-500 text-sm">
                    {users.length > 0
                      ? t("admin.userList.endOfList")
                      : t("admin.userList.noUsers")}
                  </div>
                }
                scrollableTarget="userListScrollableDiv"
                scrollThreshold="200px"
              >
                <div className="overflow-x-auto">
                  <div className="min-w-[600px] sm:min-w-0 overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                    <UsersTable
                      users={users}
                      isLoading={isLoading}
                      onPreviewKudo={setPreviewKudo}
                    />
                  </div>
                </div>
              </InfiniteScroll>
            )}

            {/* KudoCard Preview Modal */}
            {previewKudo && (
              <UserKudoFileModal
                kudo={previewKudo}
                onClose={() => setPreviewKudo(null)}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
