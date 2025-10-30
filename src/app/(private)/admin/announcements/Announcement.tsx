"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import MobileLayoutTopImage from "@/assets/layouts/layout-mobile-top.svg";
import LayoutTopImage from "@/assets/layouts/layout-top.svg";
import LineLayoutImage from "@/assets/layouts/line.png";
import {
  FaPaperPlane,
  FaImage,
  FaUsers,
  FaUser,
  FaSearch,
  FaTimes,
} from "react-icons/fa";
import { AnnouncementViewModel } from "@/app/viewModels/announcementViewModel";

export default function Announcements() {
  const {
    formik,
    handleImageChange,
    removeImage,
    fileInputRef, // Add fileInputRef from view model
    isUserSelectionModalOpen,
    toggleUserSelectionModal,
    handleUserSelection,
    filteredUsers,
    toggleSelectAll,
    searchTerm,
    setSearchTerm,
    isLoading,
    t,
  } = AnnouncementViewModel({ announcement: null, onClose: () => {} });
  const router = useRouter();

  return (
    <section className="flex-1 h-[calc(100dvh-70px)] lg:h-[calc(100dvh-85px)] w-full relative bg-gray-50 overflow-hidden">
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
      <div className="py-4  px-4 lg:px-8 xl:px-12  lg:py-6 absolute top-0 left-0 h-full w-full overflow-y-auto">
        <form onSubmit={formik.handleSubmit}>
          <div className=" max-w-[120rem] mx-auto">
            <div className="w-full bg-white mb-3 p-2 rounded-lg shadow-sm sm:mb-4 flex justify-between ">
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
                </button>
                <button
                  onClick={() => router.push("/admin/announcements")}
                  className="px-3 py-1.5 sm:px-4 cursor-pointer sm:py-2 text-gray-800 hover:text-primary transition-colors"
                >
                  <span className="text-sm sm:text-base font-comfortaa font-bold">
                    {t("admin.announcements.title")}
                  </span>
                  <span className="block w-1/2 h-0.5 bg-primary mt-1 rounded-full"></span>
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
              <div className="w-full sm:w-auto hidden lg:flex flex-col gap-1 justify-center sm:items-end mb-4 sm:mb-0">
                <div className="flex items-center justify-between w-full sm:justify-end sm:gap-4">
                  <div className="flex items-center gap-4">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-primary cursor-pointer text-white py-2 px-4 rounded-lg text-sm font-medium disabled:cursor-default hover:bg-primary-dark disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>{t("admin.announcements.processing")}</span>
                        </>
                      ) : (
                        <>
                          <FaPaperPlane className="text-xs" />
                          {t("admin.announcements.createButton")}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-span-12 rounded-lg p-4 bg-white shadow-sm">
              <div className="rounded-lg p-4 lg:p-6 bg-white">
                {/* Announcement Form */}
                <div className="lg:flex lg:space-x-6 space-y-6 lg:space-y-0">
                  {/* Left Column - Form Fields */}
                  <div className="lg:w-2/3 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t("admin.announcements.titleLabel")}
                      </label>
                      <input
                        type="text"
                        {...formik.getFieldProps("title")}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white"
                        placeholder={t("admin.announcements.titlePlaceholder")}
                      />
                      {formik.errors.title && formik.touched.title && (
                        <p className="text-red-500 text-xs mt-1">
                          {formik.errors.title}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t("admin.announcements.messageLabel")}
                      </label>
                      <textarea
                        {...formik.getFieldProps("message")}
                        rows={8}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white resize-y"
                        placeholder={t(
                          "admin.announcements.messagePlaceholder"
                        )}
                      />
                      {formik.errors.message && formik.touched.message && (
                        <p className="text-red-500 text-xs mt-1">
                          {formik.errors.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Column - Image Upload & User Selection */}
                  <div className="lg:w-1/3 space-y-4">
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mb-6">
                      <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center">
                        <FaUsers className="mr-2 text-primary text-sm" />
                        {t("admin.announcements.recipientLabel")}
                      </h3>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <label className="flex items-center p-2 rounded-lg border border-gray-200 bg-white cursor-pointer hover:bg-gray-50 transition-colors">
                          <input
                            type="radio"
                            checked={formik.values.sendToAll}
                            onChange={() => {
                              formik.setFieldValue("sendToAll", true);
                              formik.setFieldValue("selectedUsers", []);
                            }}
                            className="h-4 w-4 text-primary focus:ring-primary"
                          />
                          <span className="ml-2 text-sm text-gray-700 font-medium">
                            {t("admin.announcements.allUsers")}
                          </span>
                        </label>
                        <label className="flex items-center p-2 rounded-lg border border-gray-200 bg-white cursor-pointer hover:bg-gray-50 transition-colors">
                          <input
                            type="radio"
                            checked={!formik.values.sendToAll}
                            onChange={() =>
                              formik.setFieldValue("sendToAll", false)
                            }
                            className="h-4 w-4 text-primary focus:ring-primary"
                          />
                          <span className="ml-2 text-sm text-gray-700 font-medium">
                            {t("admin.announcements.selectedUsers")}
                          </span>
                        </label>
                        {!formik.values.sendToAll && (
                          <div className="w-full sm:w-auto">
                            <button
                              type="button"
                              onClick={toggleUserSelectionModal}
                              className="w-full sm:w-auto px-3 py-2 bg-white text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors border border-gray-300 flex items-center justify-between group"
                            >
                              <span className="flex items-center gap-2">
                                <FaUser className="text-primary text-xs" />
                                {formik.values.selectedUsers.length > 0
                                  ? `${formik.values.selectedUsers.length} ${t(
                                      "admin.announcements.usersSelected"
                                    )}`
                                  : t("admin.announcements.selectUsers")}
                              </span>
                              <svg
                                className="w-3 h-3 text-primary font-bold transform transition-transform group-hover:translate-x-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                      {formik.errors.selectedUsers &&
                        formik.touched.selectedUsers && (
                          <p className="text-red-500 text-xs mt-2">
                            {Array.isArray(formik.errors.selectedUsers)
                              ? formik.errors.selectedUsers.join(", ")
                              : typeof formik.errors.selectedUsers === "object"
                              ? JSON.stringify(formik.errors.selectedUsers)
                              : formik.errors.selectedUsers}
                          </p>
                        )}
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center">
                        <FaImage className="mr-2 text-primary text-sm" />
                        {t("admin.announcements.imageLabel")}
                      </h3>
                      <div className="space-y-3">
                        {formik.values.previewUrl && (
                          <div className="relative flex justify-center">
                            <img
                              src={formik.values.previewUrl}
                              alt="Preview"
                              className="w-full h-32 object-cover rounded-lg border border-gray-300"
                            />
                            <button
                              type="button"
                              onClick={removeImage}
                              className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-red-50 transition"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 text-red-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </div>
                        )}

                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            id="image-upload"
                            onChange={handleImageChange}
                            ref={fileInputRef} // Attach the ref here
                          />
                          <label
                            htmlFor="image-upload"
                            className="block px-3 py-2 bg-white cursor-pointer text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors border border-gray-300 text-center"
                          >
                            <FaImage className="inline mr-2 text-primary text-xs" />
                            {formik.values.selectedImage
                              ? formik.values.selectedImage.name
                              : formik.values.fileName ||
                                t("admin.announcements.imagePlaceholder")}
                          </label>
                        </div>
                        {formik.values.previewUrl && (
                          <p className="text-xs text-gray-500 text-center">
                            {t("admin.announcements.replaceImageNote")}
                          </p>
                        )}
                        {formik.errors.selectedImage &&
                          formik.touched.selectedImage && (
                            <p className="text-red-500 text-xs">
                              {formik.errors.selectedImage}
                            </p>
                          )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mobile Submit Button */}
                <div className="mt-6 lg:hidden flex justify-center">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-primary cursor-pointer text-white py-2 px-4 rounded-lg text-sm font-medium disabled:cursor-default hover:bg-primary-dark disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>{t("admin.announcements.processing")}</span>
                      </>
                    ) : (
                      <>
                        <FaPaperPlane className="text-xs" />
                        {t("admin.announcements.createButton")}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* User Selection Modal */}
      {isUserSelectionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-4">
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 font-comfortaa">
                {t("admin.announcements.selectUsersTitle")}
                <span className="block w-12 h-1 bg-primary mt-1 rounded-full"></span>
              </h3>
              <button
                onClick={toggleUserSelectionModal}
                className="text-gray-500 hover:text-gray-700 text-lg cursor-pointer p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            <div className="mb-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400 text-sm" />
                </div>
                <input
                  type="text"
                  placeholder={t("admin.announcements.searchUsers")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex justify-between items-center mb-3">
              <span className="text-xs text-gray-600 flex items-center">
                <span className="bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded-full mr-2">
                  {formik.values.selectedUsers.length}
                </span>
                {t("admin.announcements.selected")}
              </span>
              <button
                onClick={toggleSelectAll}
                className="text-xs text-primary hover:text-primary-dark font-medium flex items-center cursor-pointer"
              >
                {formik.values.selectedUsers.length === filteredUsers.length
                  ? t("admin.announcements.deselectAll")
                  : t("admin.announcements.selectAll")}
                <svg
                  className="w-3 h-3 ml-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16m-7 6h7"
                  />
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto flex-grow border border-gray-200 rounded-lg">
              <div className="divide-y divide-gray-200">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between py-2 px-3 hover:bg-gray-50 transition-colors cursor-pointer group"
                      onClick={() => handleUserSelection(user)}
                    >
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold mr-3 text-xs">
                          {user.photo_url ? (
                            <Image
                              src={user.photo_url}
                              alt={`${user.name}'s profile`}
                              height={40}
                              width={40}
                              className="h-10 w-10 object-cover rounded-full"
                            />
                          ) : (
                            <div className="h-10 w-10 flex items-center justify-center bg-gray-200 rounded-full text-gray-500 text-sm">
                              {user.name?.charAt(0).toUpperCase() || "U"}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-sm text-gray-900 font-medium group-hover:text-primary">
                            {user.name}
                          </div>
                          {user.email && (
                            <div className="text-xs text-gray-500">
                              {user.email}
                            </div>
                          )}
                        </div>
                      </div>
                      <div
                        className={`h-4 w-4 rounded-full border-2 border-gray-300 flex items-center justify-center transition-colors ${
                          formik.values.selectedUsers.some(
                            (u) => u.id === user.id
                          )
                            ? "bg-primary border-primary"
                            : "group-hover:border-primary/50"
                        }`}
                      >
                        {formik.values.selectedUsers.some(
                          (u) => u.id === user.id
                        ) && (
                          <svg
                            className="h-2 cursor-pointer w-2 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center text-gray-500 text-sm">
                    <FaSearch className="text-2xl mx-auto text-gray-300 mb-2" />
                    {t("admin.announcements.noUsersFound")}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 flex gap-2 pt-3 border-t border-gray-200">
              <button
                onClick={toggleUserSelectionModal}
                className="flex-1 bg-gray-200 cursor-pointer text-gray-800 py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
              >
                {t("admin.announcements.cancel")}
              </button>
              <button
                onClick={toggleUserSelectionModal}
                className="flex-1 bg-primary cursor-pointer text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors flex items-center justify-center"
              >
                <FaUser className="mr-1 text-xs" />
                {t("admin.announcements.confirmSelection")}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
