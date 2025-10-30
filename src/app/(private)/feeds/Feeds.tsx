"use client";
import React from "react";
import ProfilePlaceholderImage from "@/assets/defaultProfile.png";
import GivenIcon from "@/assets/icon/given-icon.svg";
import ReceivedIcon from "@/assets/icon/received-icon.svg";
import LayoutImage from "@/assets/layouts/kudo-background.svg";
import MobileLayoutImage from "@/assets/layouts/mobile-kudo-background.svg";
import Image from "next/image";
import KudoCard from "@/app/components/Cards/KudoCard";
import { useFeedsViewModel } from "@/app/viewModels/feedsViewModal";
import Loader from "@/app/components/Loader";
import InfiniteScroll from "react-infinite-scroll-component";
import Masonry from "react-masonry-css";
import { FaSearch, FaTimes } from "react-icons/fa";

export default function Feeds() {
  const {
    kudos,
    sentCount,
    receivedCount,
    filter,
    setFilter,
    loadMoreKudos,
    // redirectToSendKudo,
    isLoading,
    profilePhoto,
    onDeleteSuccess,
    t,
    hasMore,
    user,
    searchInput,
    setSearchInput,
    searchTerm,
    mode,
    clearSearch,
    error,
  } = useFeedsViewModel();

  if (!user) return null;

  // Define breakpoint columns for responsive Masonry layout
  const breakpointColumnsObj = {
    default: 3, // 3 columns for large screens
    1280: 3, // 3 columns for xl screens
    768: 2, // 2 columns for md screens
    640: 1, // 1 column for sm screens
  };

  return (
    <section>
      <div className="block py-4 lg:py-7 px-4 lg:px-15 max-w-4xl ">
        <div className="p-1.5 rounded-full flex items-center bg-primary-light w-full">
          <div className="h-[36px] w-[36px] lg:h-[40px] lg:w-[40px] border-2 border-primary overflow-hidden flex justify-center items-center rounded-full shrink-0 mr-2 lg:mr-3">
            <Image
              src={profilePhoto || ProfilePlaceholderImage}
              alt="profile"
              width={40}
              height={40}
              className="h-full w-full object-cover"
              sizes="(max-width: 768px) 36px, 40px"
            />
          </div>
          <div className="relative flex-grow max-w-4xl">
            <div className="absolute inset-y-0 left-0 pl-3 lg:pl-4 flex items-center pointer-events-none">
              <FaSearch className="text-gray-500 text-sm lg:text-base" />
            </div>
            <input
              placeholder={t("admin.kudoList.searchPlaceholder")}
              className="px- py-2 lg:py-1.5 pl-8 lg:pl-12 pr-8 lg:pr-10 border border-gray-200 rounded-full w-full 
                  focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent 
                  transition-all shadow-sm bg-white text-gray-700 text-sm lg:text-base"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            {searchInput && (
              <button
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 pr-3 lg:pr-4 flex items-center"
                aria-label="Clear search"
              >
                <FaTimes className="text-gray-500 h-4 w-4 lg:h-5 lg:w-5 hover:text-gray-700 transition-colors cursor-pointer" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="relative h-[calc(100dvh-154px)] lg:h-[calc(100dvh-199px)] w-full">
        <Image
          src={LayoutImage}
          alt="Layout Image"
          className="h-full w-full hidden lg:block object-top object-cover"
        />
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src={MobileLayoutImage}
            alt="Layout Image"
            className="h-full w-full lg:hidden object-cover"
            style={{
              position: "absolute",
              top: "40px",
              left: 0,
              right: 0,
              bottom: 0,
              objectPosition: "top",
            }}
          />
        </div>
        <div
          id="scrollableDiv"
          className="py-4 lg:py-7 absolute top-0 left-0 h-full w-full overflow-y-auto"
        >
          <div className="flex gap-2 relative lg:-top-7 px-4 lg:px-15 max-w-[120rem] mb-3 mx-auto">
            {(["received", "given", "all"] as const).map((type) => {
              const count =
                type === "given"
                  ? sentCount
                  : type === "received"
                  ? receivedCount
                  : sentCount + receivedCount;

              const isActive = filter === type;

              return (
                <button
                  key={type}
                  className={`rounded-full font-semibold font-libre text-xs btn px-3 sm:px-4 py-0.5 sm:py-1 flex gap-1 sm:gap-2 items-center h-7 sm:h-8 border transition-colors ${
                    isActive
                      ? "bg-[#FFC229] border-[#FFC229] hover:bg-[#FFC229]/70"
                      : "bg-[#F6F6F6] border-[#D9D9D9]"
                  }`}
                  onClick={() => setFilter(type)}
                >
                  {type === "received" && (
                    <Image
                      src={ReceivedIcon}
                      alt="Received"
                      className="h-[17px] sm:h-[14px] w-[17px] sm:w-[14px]"
                    />
                  )}
                  {type === "given" && (
                    <Image
                      src={GivenIcon}
                      alt="Given"
                      className="h-[17px] sm:h-[14px] w-[17px] sm:w-[14px]"
                    />
                  )}

                  <span className="font-semibold font-libre text-xs mi-1 sm:ml-0.5">
                    {t(`feeds.filter.${type}`)}
                  </span>

                  <span
                    className={`text-xs font-medium font-libre ml-1 ${
                      isActive ? "text-[#6A4811]" : "text-[#787878]"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Error State */}
          {error && (
            <div className="px-4 lg:px-15 max-w-[120rem] mx-auto mb-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center">
                {t("feeds.error", "Something went wrong. Please try again.")}
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && kudos && kudos.length === 0 ? (
            <div className="h-full w-full flex items-center justify-center">
              <Loader className="h-20 w-20 !border-primary border-t-5 border-b-5" />
            </div>
          ) : kudos?.length ? (
            <InfiniteScroll
              dataLength={kudos.length}
              next={loadMoreKudos}
              hasMore={hasMore}
              loader={
                <div className="col-span-full flex justify-center py-4">
                  <Loader className="h-10 w-10 !border-primary border-t-5 border-b-5" />
                </div>
              }
              endMessage={
                <div className="col-span-full text-center py-6 text-gray-500 text-sm">
                  <div className="py-8 flex flex-col items-center">
                    <div className="text-center">
                      <p className="text-secondary-dark text-sm font-libre font-medium">
                        {mode === "search"
                          ? t(
                              "feeds.endOfSearchResults",
                              "No more search results found!"
                            )
                          : t(
                              "feeds.endOfFeed",
                              "You've seen all your gratitude kudos!"
                            )}
                      </p>
                      <p className="text-secondary-dark/70 text-xs font-libre mt-1">
                        {mode === "search"
                          ? t(
                              "feeds.tryDifferentSearch",
                              "Try a different search term"
                            )
                          : t(
                              "feeds.endOfFeedSubtext",
                              "Time to spread more appreciation"
                            )}
                      </p>
                    </div>
                  </div>
                </div>
              }
              scrollableTarget="scrollableDiv"
              scrollThreshold="500px"
            >
              <Masonry
                breakpointCols={breakpointColumnsObj}
                className="my-masonry-grid flex px-4 md:px-4 lg:px-15 max-w-[120rem] mx-auto"
                columnClassName="my-masonry-grid_column"
              >
                {kudos.map((kudo: any) => (
                  <div key={kudo.id} className="mb-4">
                    <KudoCard
                      kudo={kudo}
                      onDeleteSuccess={onDeleteSuccess}
                      isShowDeleteOption={true}
                    />
                  </div>
                ))}
              </Masonry>
            </InfiniteScroll>
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <div className="text-center py-12">
                <div className="mx-auto w-16 h-16 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4 shadow-inner">
                  <FaSearch className="text-gray-500 text-xl sm:text-2xl" />
                </div>
                <h3 className="text-base sm:text-lg font-medium text-gray-700 font-libre">
                  {mode === "search"
                    ? t("admin.kudoList.noKudos")
                    : t("admin.kudoList.noKudos")}
                </h3>
                <p className="text-sm sm:text-base text-gray-500 mt-1 font-libre">
                  {mode === "search"
                    ? t(
                        "feeds.noSearchResultsDesc",
                        `No kudos found in "${t(
                          `feeds.filter.${filter}`
                        )}" matching "${searchTerm}"`
                      )
                    : t("admin.kudoList.noKudos")}
                </p>
                {mode === "search" && (
                  <button
                    onClick={clearSearch}
                    className="mt-3 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors cursor-pointer"
                  >
                    {t("feeds.clearSearch", "Clear search")}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
