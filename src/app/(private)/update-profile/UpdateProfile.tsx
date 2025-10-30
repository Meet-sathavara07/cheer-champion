"use client";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import EditIcon from "@/assets/icon/edit-light-icon.svg";
import LayoutTopImage from "@/assets/layouts/layout-top.svg";
import LineLayoutImage from "@/assets/layouts/full-line.png";
import EditEmailIcon from "@/assets/icon/edit-secondary-icon.svg";
// import CheckedIcon from "@/assets/icon/checked-icon.svg";
import Button from "@/app/components/Button";
import Loader from "@/app/components/Loader";
import { useUpdateProfileViewModel } from "@/app/viewModels/updateProfileViewModel";
import Link from "next/link";
import CountryCodeDropdown from "@/app/components/Dropdowns/CountryCodeDropdown";
import VerifyOTPModal from "@/app/components/Profile/VerifyOTPModal";
import ProfilePlaceholderImage from "@/assets/defaultProfile.png";
import MergeAccountModal from "@/app/components/Modals/MergeAccountModal";
import MobileLayoutTopImage from "@/assets/layouts/layout-mobile-top.svg";
// import SettingsIcon from "@/assets/icon/settings-secondary.svg";
import ShareIcon from "@/assets/icon/share-secondary-icon.svg";
import TermsConsentViewModal from "@/app/components/Modals/TermsConsentViewModal";
import ProfileShareModal from "@/app/components/Modals/ProfileShareModal";

export default function UpdateProfile() {
  const {
    fileInputRef,
    formik,
    handleImageUpload,
    isMobileVerified,
    isEmailVerified,
    isDataLoading,
    handleUploadFile,
    verifyEmailHandler,
    verifyMobileHandler,
    isOpenOTPModal,
    setOpenOTPModal,
    OTPSentTo,
    onOTPVerify,
    imagePreview,
    isLoading,
    redirectToProfile,
    isOpenMergeAccountModal,
    setOpenMergeAccountModal,
    accountExist,
    cancelAccountMergeHandler,
    accountMergeHandler,
    // isSidebarOpen,
    // setSidebarOpen,
    t,
    isOpen,
    setOpen,
    profile,
    onSelect,
    isEmailEditing,
    toggleEmailEditing,
    handleEmailChange,
    isMobileEditing,
    toggleMobileEditing,
    handleMobileChange,
    isOpenConsentModal,
    setOpenConsentModal,
    isShareModalOpen,
    onShareModalClose,
    aiGeneratedMessage,
    isGeneratingMessage,
    handleShareClick,
  } = useUpdateProfileViewModel();

  return (
    <section className="flex-1 h-[calc(100dvh-85px)] w-full relative">
      {profile && (
        <ProfileShareModal
          isOpen={isShareModalOpen}
          onClose={onShareModalClose}
          shareMessage={aiGeneratedMessage}
          shareUrl={`${process.env.NEXT_PUBLIC_BASE_URL}/profile/${profile.$users.id}`}
          isGeneratingMessage={isGeneratingMessage} // Pass new prop
        />
      )}
      <VerifyOTPModal
        setOpen={setOpenOTPModal}
        open={isOpenOTPModal}
        otpSentTo={OTPSentTo}
        onSuccess={onOTPVerify}
      />
      <MergeAccountModal
        isLoading={isLoading}
        onSuccess={accountMergeHandler}
        onCancel={cancelAccountMergeHandler}
        accountExist={accountExist}
        open={isOpenMergeAccountModal}
        setOpen={setOpenMergeAccountModal}
      />
      <TermsConsentViewModal
        isOpen={isOpenConsentModal}
        onClose={() => setOpenConsentModal(false)}
      />
      {/* <div className="h-[238px] relative">
        <Image
          src={LayoutTopImage}
          alt="layout"
          className="w-full h-full object-cover object-bottom -z-1 "
        />
        <Image
          src={LineLayoutImage}
          alt="layout"
          className="absolute inset-0 w-full h-[172px] object-cover object-bottom z-0 "
        />
      </div> */}
      <div className="h-[73px] lg:h-[238px] relative">
        <Image
          src={LayoutTopImage}
          alt="layout"
          className="w-full hidden lg:block h-full object-cover object-bottom -z-1 "
        />
        <Image
          src={LineLayoutImage}
          alt="layout"
          className="absolute hidden lg:block inset-0 h-[172px] w-full object-cover object-bottom z-0 "
        />
        <Image
          src={MobileLayoutTopImage}
          alt="layout"
          className="absolute block lg:hidden inset-0 w-full h-full object-cover object-bottom z-0 "
        />
      </div>
      <div className="absolute w-full max-h-[calc(100dvh-70px)] lg:max-h-[calc(100dvh-85px)] overflow-hidden inset-0 ">
        <div className="flex items-start h-[calc(100dvh-70px)] lg:h-[calc(100dvh-85px)] flex-col py-5 px-4 md:px-15 max-w-[120rem] mx-auto">
          <div className="flex items-center justify-end w-full mb-3 lg:mb-4">
            {/* 
            <button
              onClick={() => setSidebarOpen(true)}
              className="btn h-[30px] w-[30px] border-1 border-secondary rounded-full bg-white  flex lg:hidden justify-center items-center"
              >
              <Image
                src={SettingsIcon}
                alt="SettingsIcon"
                className="h-[16.35px] w-[16.35px]"
                />
            </button> */}
            <button
              className="btn h-[30px] w-[30px] border-1 hover:border-[#3886CB] hover:bg-white border-secondary rounded-full bg-white flex justify-center items-center"
              onClick={handleShareClick}
            >
              <Image
                src={ShareIcon}
                alt="ShareIcon"
                className="h-[16.35px] w-[16.35px]"
              />
            </button>
          </div>

          <div className="flex w-full h-[calc(100dvh-120px)] lg:h-[calc(100dvh-161px)]">
            {/* <SettingsPanel isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} /> */}
            {isDataLoading ? (
              <div className="flex-1 w-full flex items-center justify-center">
                <div>
                  <Loader className="h-20 w-20 !border-primary border-t-5 border-b-5 " />
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-between  ">
                <form
                  onSubmit={formik.handleSubmit}
                  className="flex flex-col items-center"
                >
                  <div className="relative mt-10 mb-8 h-[91px] w-[91px] lg:h-[115px] lg:w-[115px] flex justify-center items-center rounded-full bg-[#FF9543]">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="profile"
                        className="h-[87px] w-[87px] lg:h-[115px] lg:w-[115px] rounded-full object-cover"
                        onError={(error) => console.log(error)}
                      />
                    ) : formik.values.profileImage &&
                      !(formik.values.profileImage instanceof File) ? (
                      <Image
                        src={
                          formik.values.profileImage || ProfilePlaceholderImage
                        }
                        alt="profile"
                        height={111}
                        width={111}
                        className="h-[87px] w-[87px] lg:h-[115px] lg:w-[115px] rounded-full object-cover"
                        onError={(error) => console.log(error)}
                      />
                    ) : null}

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg, image/png, image/webp, image/avif"
                      onChange={handleImageUpload}
                      className="hidden"
                    />

                    <button
                      type="button"
                      onClick={handleUploadFile}
                      className="btn bottom-0 right-0 absolute h-[34px] w-[34px] bg-secondary hover:bg-[#3886CB] rounded-full flex justify-center items-center"
                    >
                      <Image
                        src={EditIcon}
                        alt="EditIcon"
                        className="h-[25px] w-[25px]"
                      />
                    </button>
                  </div>
                  {/* {formik.errors.profileImage && (
                    <p className="text-red-500 text-xs">
                      {formik.errors.profileImage}
                    </p>
                  )} */}
                  <div className="border-b-[1px] p-1 w-[259px] border-b-border-gray mb-2">
                    <input
                      className="placeholder:text-placeholder text-center w-full text-base font-normal text-600 font-libre focus-visible:outline-none"
                      placeholder={t("updateProfile.enterYourName")}
                      {...formik.getFieldProps("name")}
                    />
                  </div>
                  {formik.errors.name && formik.touched.name && (
                    <p className="text-red-500 text-xs">{formik.errors.name}</p>
                  )}
                  <div className="relative w-full my-2 max-w-200">
                    <textarea
                      className="border-b-[1px] p-3 border-b-border-gray min-h-6 placeholder:text-placeholder text-center w-full  text-xs lg:text-base text-600 font-normal font-libre focus-visible:outline-none"
                      placeholder={t("updateProfile.enterBio")}
                      {...formik.getFieldProps("bio")}
                    />
                    <p className="text-xs text-[#B9B9B9] font-libre font-medium absolute bottom-2 right-2">
                      {formik.values.bio.length}/200
                    </p>
                  </div>
                  {formik.errors.bio && formik.touched.bio && (
                    <p className="text-red-500 text-xs">{formik.errors.bio}</p>
                  )}

                  <div className="flex items-center my-2">
                    <CountryCodeDropdown
                      disabled={isMobileVerified && !isMobileEditing}
                      className="!bg-white !mb-0 !lg:mb-0 !rounded-none border-0 !border-b-[1px] !h-[34px] !p-1 mr-1 w-[69px] border-b-border-gray"
                      onSelect={onSelect}
                    />
                    <div className="border-b-[1px] p-1 mr-1 border-b-border-gray">
                      <input
                        className=" placeholder:text-placeholder text-center w-full text-base font-normal text-600 font-libre focus-visible:outline-none"
                        type="text"
                        placeholder={t("updateProfile.enterMobile")}
                        {...formik.getFieldProps("mobile")}
                        readOnly={isMobileVerified && !isMobileEditing}
                        onChange={handleMobileChange}
                      />
                    </div>
                    {isMobileVerified ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={toggleMobileEditing}
                          className="btn h-[20px] w-[20px] flex justify-center items-center"
                        >
                          <Image
                            src={EditEmailIcon}
                            alt="EditMobileIcon"
                            className="h-[20px] w-[20px]"
                          />
                        </button>
                      </div>
                    ) : (
                      <Link
                        href="/"
                        onClick={verifyMobileHandler}
                        className=" text-secondary-dark text-sm font-libre font-medium italic underline "
                      >
                        {t("updateProfile.verify")}
                      </Link>
                    )}
                  </div>
                  {/* {!isMobileVerified &&
                    formik.values.mobile !== initProfile.mobile && (
                      <p className="text-red-500 text-xs">
                        Mobile must be verified
                      </p>
                    )} */}
                  {formik.errors.mobile && (
                    <p className="text-red-500 text-xs">
                      {formik.errors.mobile}
                    </p>
                  )}

                  <div className="flex items-center my-2">
                    <div className="border-b-[1px] p-1 mr-1 w-[259px] border-b-border-gray">
                      <input
                        className="placeholder:text-placeholder text-center w-full text-base font-normal text-600 font-libre focus-visible:outline-none"
                        type="text"
                        placeholder={t("updateProfile.enterEmail")}
                        readOnly={isEmailVerified && !isEmailEditing}
                        {...formik.getFieldProps("email")}
                        onChange={handleEmailChange}
                      />
                    </div>
                    {isEmailVerified ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={toggleEmailEditing}
                          className="btn h-[20px] w-[20px] flex justify-center items-center"
                        >
                          <Image
                            src={EditEmailIcon}
                            alt="EditEmailIcon"
                            className="h-[20px] w-[20px]"
                          />
                        </button>
                      </div>
                    ) : (
                      <Link
                        href="/"
                        onClick={verifyEmailHandler}
                        className="text-secondary-dark text-sm font-libre font-medium italic underline "
                      >
                        {t("updateProfile.verify")}
                      </Link>
                    )}
                  </div>

                  {formik.errors.email && (
                    <p className="text-red-500 text-xs">
                      {formik.errors.email}
                    </p>
                  )}

                  {/* <div className="bg-input-bg p-4 mt-6 rounded-md w-3/4 ">
                    <h4 className="text-sm font-bold text-600 font-comfortaa text-center">
                      Link Your Accounts..
                    </h4>
                    <div className="flex justify-center gap-6 mt-2"></div>
                  </div> */}
                  <div className="flex items-center my-2">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formik.values.consent_message_taken === "yes"}
                        onChange={(e) =>
                          formik.setFieldValue(
                            "consent_message_taken",
                            e.target.checked ? "yes" : "no"
                          )
                        }
                        className="h-4 w-4 mr-3"
                      />
                      <span className="text-xs sm:text-sm font-medium font-libre max-w-[auto]">
                        {t("updateProfile.consent")}
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setOpenConsentModal(true)}
                      className="ml-2 text-secondary-dark text-xs sm:text-sm font-libre font-medium cursor-pointer italic underline"
                    >
                      {t("updateProfile.viewPolicy")}
                    </button>
                  </div>
                  <div className="flex gap-2 mt-6 mb-4">
                    <Button
                      onClick={() => redirectToProfile()}
                      className="bg-white border-1 border-secondary !text-secondary-dark hover:!text-white"
                    >
                      {t("updateProfile.cancel")}
                    </Button>

                    <Button type="submit" isLoading={isLoading}>
                      {t("updateProfile.save")}
                    </Button>
                  </div>
                  {/* <Link
                    href="/"
                    // onClick={handleUseAIText}
                    className="mx-auto text-secondary-dark text-sm font-libre font-medium italic underline "
                  >
                    Delete Account
                  </Link> */}
                </form>
                <div className="flex flex-col items-center ">
                  <div className="flex items-center gap-2 lg:gap-4">
                    <Link
                      href="/privacy-policy"
                      className="text-secondary-dark text-xs lg:text-sm font-libre font-medium italic hover:text-secondary underline"
                    >
                      {t("footer.privacyPolicy")}
                    </Link>
                    <Link
                      href="/terms-of-service"
                      className="text-secondary-dark text-xs lg:text-sm font-libre font-medium italic hover:text-secondary underline"
                    >
                      {t("footer.termsAndConditions")}
                    </Link>
                    <Link
                      href="/how-it-works"
                      className="text-secondary-dark text-xs lg:text-sm font-libre font-medium italic hover:text-secondary underline"
                    >
                      {t("footer.howItWorks")}
                    </Link>
                  </div>
                  <p className="mx-auto text-xs lg:text-sm font-medium font-libre text-100 mt-4">
                    {t("updateProfile.infoNote")}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
