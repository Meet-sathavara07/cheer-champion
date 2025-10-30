"use client";
import Image from "next/image";
import { Grid } from "@giphy/react-components";
import PublicNavbar from "@/app/components/Navbar/PublicNavbar";
import backIcon from "@/assets/icon/gray-back.svg";
import LogoutIcon from "@/assets/icon/logout-icon.svg";
import SearchIcon from "@/assets/icon/search.svg";
//  import PoweredByGIPHYLogo from "@/assets/logo/PoweredBy_200px-White_HorizText.png";
import { useLibraryViewModel } from "@/app/viewModels/libraryViewModel";
import Loader from "@/app/components/Loader";
import Button from "@/app/components/Button";

export default function KudoLibrary() {
  const {
    goBackHandler,
    search,
    setSearch,
    debouncedSearch,
    handleSelectGif,
    fetchGIFs,
    fetchStickers,
    handleFileUpload,
    handleUploadClick,
    fileInputRef,
    isUploading,
    windowWidth,
    isLoadingGIFs,
    isLoadingCards,
    t,
    hasMounted,
  } = useLibraryViewModel();

  if (!hasMounted) return null;

  return (
    <section className="min-h-screen w-full ">
      <PublicNavbar />
      {/* Header */}
      <div className="max-w-[120rem] mx-auto px-4 lg:px-15">
        <div className="flex flex-col items-start lg:flex-row lg:items-center mb-2 mt-4">
          <button className="btn p-2" onClick={() => goBackHandler()}>
            <Image src={backIcon} alt="back-icon" width={12} height={12} />
          </button>
          <h2 className="text-xl lg:text-2xl font-comfortaa font-bold">
            {t("kudoLibrary.title")}
          </h2>
        </div>
        <p className=" text-xs lg:text-sm text-sub-title font-bold mb-6 font-comfortaa">
          {t("kudoLibrary.subtitle")}
        </p>

        {/* Search Input */}
        <div className="flex mb-4  items-center gap-4 sm:flex-row">
          {/* Search Input */}
          <div className="flex justify-between items-center border-[#D9D9D9] border-1 rounded-[30px] px-3 w-[60%]">
            <input
              type="text"
              placeholder={t("kudoLibrary.searchPlaceholder")}
              className="w-full p-[10px] me-2 border-0  text-xs lg:text-sm font-libre placeholder:text-[#C6C2C2]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Image src={SearchIcon} alt="search" width={18} height={18} />
          </div>
          {/* <Image className="h-[20px]" src={PoweredByGIPHYLogo} alt="PoweredByGIPHYLogo"  height={20} /> */}

          {/* Upload Button with enhanced styling */}
          <Button
            className={` bg-white border-1 flex items-center flex-row border-secondary !text-secondary-dark relative
      transition-all duration-200 hover:bg-secondary-light hover:border-secondary-dark
      ${isUploading ? "opacity-75" : "hover:shadow-md"}
      min-w-[160px] justify-center `}
            onClick={handleUploadClick}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Loader className="h-4 w-4 !border-secondary border-t-2 " />
              </>
            ) : (
              <>
                <Image
                  src={LogoutIcon}
                  alt="upload-icon"
                  width={18}
                  height={16}
                  className="mr-2"
                />
                <span>{t("uploadFile.uploadImage")}</span>
              </>
            )}
          </Button>

          {/* Hidden File Input with enhanced accept types */}
          <input
            className="hidden"
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            onChange={handleFileUpload}
            multiple={false}
          />
        </div>

        {/* Image & GIF Selection Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cards Library */}
          <div>
            <div className="bg-primary rounded-lg px-4 py-2 mb-3">
              <h3 className="text-[14px] font-bold font-comfortaa text-white">
                {t("kudoLibrary.cardsLibrary")}
              </h3>
            </div>
            <div className="grid grid-cols-3 gap-4 h-[calc(100dvh-410px)] lg:h-[calc(100dvh-320px)] overflow-y-auto style-scrollbar">
              {isLoadingCards ? (
                <div className="col-span-3 h-full flex items-center justify-center">
                  <div>
                    <Loader className="h-20 w-20 !border-primary border-t-5 border-b-5" />
                  </div>
                </div>
              ) : (
                <Grid
                  className="cursor-pointer"
                  onGifClick={handleSelectGif}
                  noLink={true}
                  hideAttribution={true}
                  width={windowWidth}
                  columns={3}
                  gutter={12}
                  fetchGifs={(offset) => fetchStickers(offset, debouncedSearch)}
                  key={debouncedSearch}
                />
              )}
            </div>
          </div>

          {/* GIFs Library */}
          <div>
            <div className="bg-primary rounded-lg px-4 py-2 mb-3">
              <h3 className="text-[14px] font-bold font-comfortaa text-white">
                {t("kudoLibrary.gifsLibrary")}
              </h3>
            </div>
            <div className="grid grid-cols-3 gap-4 h-[calc(100dvh-410px)] lg:h-[calc(100dvh-320px)] overflow-y-auto style-scrollbar">
              {isLoadingGIFs ? (
                <div className="col-span-3 h-full flex items-center justify-center">
                  <Loader className="h-20 w-20 !border-primary border-t-5 border-b-5 " />
                </div>
              ) : (
                <Grid
                  className="cursor-pointer"
                  onGifClick={handleSelectGif}
                  noLink={true}
                  hideAttribution={true}
                  width={windowWidth}
                  columns={3}
                  gutter={12}
                  fetchGifs={(offset) => fetchGIFs(offset, debouncedSearch)}
                  key={debouncedSearch}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
