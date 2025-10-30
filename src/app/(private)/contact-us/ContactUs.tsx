"use client";

import { useContactViewModel } from "@/app/viewModels/contactViewModal";
import Image from "next/image";
// import SettingsPanel from "@/app/components/Profile/SettingsPanel";
import LayoutTopImage from "@/assets/layouts/layout-top.svg";
import LineLayoutImage from "@/assets/layouts/full-line.png";
import Button from "@/app/components/Button";
// import BackIcon from "@/assets/icon/back-icon.svg";
import AttachmentIcon from "@/assets/icon/attachment.svg";
// import SettingsIcon from "@/assets/icon/settings-secondary.svg";

export default function ContactUs() {
  const {
    fileInputRef,
    formik,
    handleUploadFile,
    isLoading,
    // isSidebarOpen,
    //  setSidebarOpen,
    t,
  } = useContactViewModel();

  return (
    <section className="flex-1 h-[calc(100dvh-70px)] lg:h-[calc(100dvh-85px)] w-full relative">
      <div className="h-[103px] relative">
        <Image
          src={LayoutTopImage}
          alt="layout"
          className="w-full h-full object-cover object-bottom -z-1 "
        />
        <Image
          src={LineLayoutImage}
          alt="layout"
          className="absolute inset-0 w-full h-full object-cover object-bottom z-0 "
        />
      </div>
      <div className="absolute w-full max-h-[calc(100dvh-70px)] lg:max-h-[calc(100dvh-85px)]  overflow-hidden inset-0 ">
        <div className="flex  items-start h-[calc(100dvh-70px)] lg:h-[calc(100dvh-85px)] flex-col py-5 px-10 lg:px-15 max-w-[120rem] mx-auto">
          <div className="flex w-full h-[calc(100dvh-158px)]">
            {/* <SettingsPanel isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} /> */}
            <div className="flex-1 lg:pl-12 flex justify-center items-center">
              <form
                onSubmit={formik.handleSubmit}
                className="space-y-4 flex flex-col items-center w-full"
              >
                <h1 className="text-md lg:text-2xl font-bold mb-4 mx-auto font-comfortaa">
                  {t("contact.title")}
                </h1>
                <div className="border-b-[1px] p-1 w-[259px] border-b-border-gray my-2">
                  <input
                    className="placeholder:text-placeholder text-center w-full text-base font-normal text-600 font-libre focus-visible:outline-none"
                    placeholder={t("contact.namePlaceholder")}
                    {...formik.getFieldProps("name")}
                  />
                </div>
                {formik.errors.name && formik.touched.name && (
                  <p className="text-red-500 text-xs">{formik.errors.name}</p>
                )}
                <div className="border-b-[1px] p-1 w-[259px] border-b-border-gray my-2">
                  <input
                    className="placeholder:text-placeholder text-center w-full text-base font-normal text-600 font-libre focus-visible:outline-none"
                    type="text"
                    placeholder={t("contact.emailPlaceholder")}
                    {...formik.getFieldProps("email")}
                  />
                </div>
                {formik.errors.email && formik.touched.email && (
                  <p className="text-red-500 text-xs">{formik.errors.email}</p>
                )}
                <div className="relative w-full max-w-200 my-2">
                  <textarea
                    className="border-b-[1px] p-3 border-b-border-gray min-h-6 placeholder:text-placeholder text-center w-full text-base text-600 font-normal font-libre focus-visible:outline-none"
                    placeholder={t("contact.messagePlaceholder")}
                    {...formik.getFieldProps("message")}
                  />
                  <p className="text-xs text-[#B9B9B9] font-libre font-medium absolute bottom-2 right-2">
                    {formik.values.message.length}/500
                  </p>
                </div>
                {formik.errors.message && formik.touched.message && (
                  <p className="text-red-500 text-xs">
                    {formik.errors.message}
                  </p>
                )}
                <div className="flex items-end border-b-[1px] mb-6 p-1 w-[300px] border-b-border-gray my-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    name="attachment"
                    className={`${
                      formik.values.attachment ? "hidden" : ""
                    } placeholder:text-placeholder text-center w-full text-base font-normal text-600 font-libre focus-visible:outline-none`}
                    placeholder={t("contact.attachmentPlaceholder")}
                    onChange={handleUploadFile}
                  />
                  {formik.values.attachment &&
                    typeof formik.values.attachment === "object" && (
                      <p className="text-center w-full text-base font-normal text-600 font-libre">
                        {formik.values.attachment.name}
                      </p>
                    )}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="btn bg-secondary hover:[#3886CB] rounded h-[30px] w-[30px] flex justify-center items-center ml-1"
                  >
                    <Image
                      src={AttachmentIcon}
                      alt="AttachmentIcon"
                      className="h-[18px] w-[18px]"
                    />
                  </button>
                </div>
                <Button isLoading={isLoading} type="submit" className="!px-5">
                  {t("contact.sendButton")}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
