"use client";
import React from "react";
// import SettingsPanel from "@/app/components/Profile/SettingsPanel";
import Image from "next/image";
// import SettingsIcon from "@/assets/icon/settings-secondary.svg";
import EditIcon from "@/assets/icon/edit-secondary-icon.svg";
import LayoutTopImage from "@/assets/layouts/layout-top.svg";
import LineLayoutImage from "@/assets/layouts/line.png";
import ProfilePlaceholderImage from "@/assets/defaultProfile.png";
import Button from "@/app/components/Button";
import KudoCard from "@/app/components/Cards/KudoCard";
import Loader from "@/app/components/Loader";
import { useUserProfileViewModel } from "@/app/viewModels/userProfileViewModel";
import MobileLayoutTopImage from "@/assets/layouts/layout-mobile-top.svg";

type Props = {
  params: Promise<{ id: string }>;
};
export default function UserProfile({ params }: Props) {
  const {
    receivedKudos,
    sentKudos,
    sentCount,
    receivedCount,
    sendKudoHandler,
    userProfile,
    // isOpen,
    // setOpen,
    redirectToUpdateProfile,
    isLoading,
    isCurrentUserProfile,
    // isSidebarOpen,
    // setSidebarOpen,
    t,
  } = useUserProfileViewModel(params);

  return (
    <section className="flex-1 h-[calc(100dvh-70px)] lg:h-[calc(100dvh-85px)] w-full relative">
      <div className="h-[73px] lg:h-[103px] relative">
        <Image
          src={LayoutTopImage}
          alt="layout"
          className="w-full hidden lg:block h-full object-cover object-bottom -z-1 "
        />
        <Image
          src={LineLayoutImage}
          alt="layout"
          className="absolute hidden lg:block inset-0 w-full h-full object-cover object-bottom z-0 "
        />
        <Image
          src={MobileLayoutTopImage}
          alt="layout"
          className="absolute block lg:hidden inset-0 w-full h-full object-cover object-bottom z-0 "
        />
      </div>
      <div className="overflow-y-auto absolute w-full max-h-[calc(100dvh-70px)] lg:max-h-[calc(100dvh-85px)] overflow-hidden inset-0 ">
        <div className="flex items-start h-[calc(100dvh-70px)] lg:h-[calc(100dvh-85px)] flex-col py-4  pt-[54px] lg:py-5 lg:pt-[60px] px-4 lg:px-15 max-w-[120rem] mx-auto">
          <div className="flex w-full h-[calc(100dvh-120px)] lg:h-[calc(100dvh-158px)]">
            {/* <SettingsPanel isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} /> */}
            {isLoading ? (
              <div className="flex-1 w-full flex items-center justify-center">
                <div>
                  <Loader className="h-20 w-20 !border-primary border-t-5 border-b-5 " />
                </div>
              </div>
            ) : (
              <div className="flex-1 w-[calc(100%-440px)]">
                <div className="justify-end flex gap-2">
                  {isCurrentUserProfile && (
                    <button
                      onClick={redirectToUpdateProfile}
                      className="btn h-[30px] w-[30px] border-1 border-secondary hover:border-[#3886CB] rounded-full bg-white hover:bg-white flex justify-center items-center"
                    >
                      <Image
                        src={EditIcon}
                        alt="EditIcon"
                        className="h-[19px] w-[19px]"
                      />
                    </button>
                  )}
                  {/* <button
                    onClick={() => setSidebarOpen(true)}
                    className="btn h-[30px] w-[30px] border-1 border-secondary rounded-full bg-white  flex lg:hidden justify-center items-center"
                  >
                    <Image
                      src={SettingsIcon}
                      alt="SettingsIcon"
                      className="h-[16.35px] w-[16.35px]"
                    />
                  </button> */}
                </div>
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center py-3">
                  <div className="flex items-center gap-4 mb-4 lg:mb-0">
                    <div className="flex rounded-full p-[2px] overflow-hidden bg-[#F0C047]">
                      <Image
                        src={
                          userProfile?.$files?.url || ProfilePlaceholderImage
                        }
                        alt="profile"
                        height={91}
                        width={91}
                        className="h-[91px] w-[91px] object-cover rounded-full"
                        // onError={(error) => console.log(error)}
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="font-comfortaa font-bold text-lg">
                        {userProfile.name}
                      </label>
                      <p className="leading-5 font-libre font-normal text-xs lg:text-sm text-600 mt-2">
                        {userProfile.bio}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-around md:justify-center gap-3 w-full md:w-auto">
                    {/* Kudos Sent */}
                    <div className="w-[164px] h-[63px] flex flex-col items-center justify-center bg-[#F0C047] text-white rounded-lg">
                      <span className="text-xl font-bold font-libre w-full text-center">
                        {sentCount}
                      </span>
                      <label className="text-xs font-bold font-libre sm:text-sm">
                        {t("general.kudosSent")}
                      </label>
                    </div>

                    {/* Kudos Received */}
                    <div className="w-[164px] h-[63px] flex flex-col items-center justify-center bg-primary text-white rounded-lg">
                      <span className="text-xl font-bold font-libre w-full text-center">
                        {receivedCount}
                      </span>
                      <label className="text-xs font-bold font-libre sm:text-sm">
                        {t("general.kudosReceived")}
                      </label>
                    </div>

                    {/* Total Kudos */}
                    <div className="w-[164px] h-[63px] flex flex-col items-center justify-center bg-[#B7D368] text-white rounded-lg">
                      <span className="text-xl font-bold font-libre w-full text-center">
                        {sentCount + receivedCount}
                      </span>
                      <label className="text-xs font-bold font-libre sm:text-sm">
                        {t("profile.totalKudos")}
                      </label>
                    </div>
                  </div>
                </div>
                <Button className="mb-2.5" onClick={sendKudoHandler}>
                  {t("general.sendKudos")}
                </Button>
                <div className=" h-[calc(100dvh-345px)] md:h-[calc(100dvh-325px)] lg:h-[calc(100dvh-307px)]">
                  {!!sentKudos?.data?.kudos?.length && (
                    <>
                      <div className="flex items-center">
                        <h2 className="text-xs lg:text-sm font-comfortaa font-bold text-black">
                          {t("profile.recentlySentKudos")}
                        </h2>
                        <hr className="ml-2 flex-1 text-[#DBDBDB]" />
                      </div>
                      <div className="flex flex-1 overflow-x-auto mt-4 mb-8">
                        {sentKudos.data.kudos.map((kudo: any) => (
                          <div
                            key={kudo.id}
                            className="w-[381px] min-w-[381px] md:w-[441px] md:min-w-[441px] p-2 lg:p-3"
                          >
                            <KudoCard
                              kudo={kudo}
                              isShowDeleteOption={isCurrentUserProfile}
                            />
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                  {!!receivedKudos?.data?.kudos?.length && (
                    <>
                      <div className="flex items-center">
                        <h2 className="text-xs lg:text-sm font-comfortaa font-bold text-black">
                          {t("profile.recentlyReceivedKudos")}
                        </h2>
                        <hr className="ml-2 flex-1 text-[#DBDBDB]" />
                      </div>
                      <div className="flex flex-1 overflow-x-auto mt-4">
                        {receivedKudos.data.kudos.map((kudo: any) => (
                          <div
                            key={kudo.id}
                            className="w-[381px] min-w-[381px] md:w-[441px] md:min-w-[441px] p-2 lg:p-3"
                          >
                            <KudoCard
                              kudo={kudo}
                              isShowDeleteOption={isCurrentUserProfile}
                            />
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
