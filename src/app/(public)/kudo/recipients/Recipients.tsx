"use client";
import Image from "next/image";
import PublicNavbar from "@/app/components/Navbar/PublicNavbar";
import Button from "@/app/components/Button";
import CountryCodeDropdown from "@/app/components/Dropdowns/CountryCodeDropdown";
import KudosSuccessModal from "@/app/components/Modals/KudoSuccessModal";
import closeIcon from "@/assets/icon/close-icon.svg";
import backIcon from "@/assets/icon/gray-back.svg";
import layoutLeft from "@/assets/layouts/layout-left.svg";
import ExternalImage from "@/app/components/ExternalImage";
import { useRecipientViewModel } from "@/app/viewModels/recipientViewModel";
import NotLoggedInModal from "@/app/components/Modals/NotLoggedInModal";
import layoutTop from "@/assets/layouts/layout-top-mobile.svg";
import KudoSendConfirmModal from "@/app/components/Modals/KudoSendConfirmModal";
import EditEmailIcon from "@/assets/icon/edit-secondary-icon.svg";

export default function KudoRecipients() {
  const {
    formik,
    isLoading,
    isOpenPostSuccess,
    setOpenPostSuccess,
    isConfirmKudoSend,
    setConfirmKudoSend,
    recipients,
    handleAddEmail,
    handleAddPhone,
    handleRemoveRecipient,
    formData,
    goBackHandler,
    isOpenNotLoggedIn,
    setOpenNotLoggedIn,
    t,
    hasMounted,
    emailSuggestions,
    phoneSuggestions,
    onSelectEmail,
    onSelectPhone,
    onChangePhone,
    onChangeEmail,
    onConfirm,
    goHomeHandler,
  } = useRecipientViewModel();

  if (!hasMounted) return null;

  return (
    <section className="min-h-screen w-full relative ">
      <KudosSuccessModal
        open={isOpenPostSuccess}
        setOpen={setOpenPostSuccess}
      />
      <KudoSendConfirmModal
        isLoading={isLoading}
        isOpen={isConfirmKudoSend}
        setOpen={setConfirmKudoSend}
        onConfirm={onConfirm}
      />
      <NotLoggedInModal open={isOpenNotLoggedIn} setOpen={setOpenNotLoggedIn} />
      <div className="grid grid-cols-1 w-full lg:grid-cols-11 absolute -z-1 h-[320px] lg:h-full">
        <div className="relative w-full h-[320px] lg:h-auto overflow-hidden lg:hidden">
          <Image
            src={layoutTop}
            alt="layout mobile"
            className="absolute object-cover object-bottom w-full h-full -z-1"
          />
        </div>
        <div className="hidden lg:block relative lg:col-span-6 h-screen w-full">
          <Image
            src={layoutLeft}
            alt="layout desktop"
            className="absolute w-full h-full object-cover object-right -z-1 "
          />
        </div>
      </div>
      <div className="min-h-screen w-full flex flex-col">
        <PublicNavbar isLight />
        <div className="flex flex-col lg:grid grid-cols-11 flex-grow-1 w-full max-w-[120rem] p-4 lg:py-0 px-4 mx-auto">
          <div className="col-span-6 flex justify-center items-center">
            <div className="flex flex-col bg-white items-center rounded-md p-4 lg:p-10 w-[488px] ">
              <h2 className="font-bold text-black text-base font-comfortaa">
                {t("kudoRecipients.preview")}
              </h2>
              <div className="p-4 lg:p-5 flex-grow-1">
                {formData.fileType === "pick" && formData.file_url ? (
                  <ExternalImage
                    src={formData.file_url}
                    width={200}
                    height={289}
                    className="w-full h-[225px] lg:h-[289px]"
                  />
                ) : formData.previewUrl ? (
                  <img
                    src={formData.previewUrl}
                    alt="kudo-preview"
                    width={200}
                    height={289}
                    className="w-full h-[225px] lg:h-[289px]"
                    onError={(error) => console.log(error)}
                  />
                ) : null}
              </div>
              <div className="relative w-full">
                <textarea
                  disabled
                  value={formData.message}
                  className="w-full min-h-[200px] lg:min-h-[247px] bg-input-bg text-600 text-sm font-libre font-normal p-2 border-0 rounded-md focus:outline-none focus:ring-2 focus:ring-input-bg"
                />
                {formData.message && (
                  <button
                    type="button"
                    onClick={goHomeHandler}
                    className="btn h-[30px] w-[30px] rounded-full bg-white flex justify-center items-center absolute top-2 right-5"
                  >
                    <Image
                      src={EditEmailIcon}
                      alt="EditMobileIcon"
                      className="h-[24px] w-[24px]"
                    />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="col-span-5 flex justify-center items-center">
            <div className="flex flex-col p-4 lg:p-5 bg-white rounded-md w-[488px] lg:w-[519px] ">
              <div className="flex items-center mb-2">
                <button className="btn p-2" onClick={() => goBackHandler()}>
                  <Image
                    src={backIcon}
                    alt="back"
                    width={12}
                    height={12}
                    className="h-[12px] w-[12px]"
                  />
                </button>
                <h2 className="text-xl lg:text-2xl font-comfortaa font-bold">
                  {t("kudoRecipients.shareWith")}
                </h2>
              </div>
              <p className="text-xs lg:text-sm font-bold font-comfortaa text-sub-title mb-4">
                {t("kudoRecipients.instructions")}
              </p>

              <form
                onSubmit={formik.handleSubmit}
                className="flex flex-col"
                onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
              >
                <p className="text-sm font-medium font-libre text-sub-title mb-2">
                  <span className="text-black">
                    {t("kudoRecipients.sendTo")}
                  </span>
                </p>

                <div className="mb-5 relative">
                  <input
                    type="text"
                    placeholder={t("kudoRecipients.emailPlaceholder")}
                    className="border min-w-[293px] border-border bg-input-bg text-600 placeholder:text-400 font-libre text-sm text-normal p-2 rounded-md"
                    {...formik.getFieldProps("email")}
                    onKeyDown={handleAddEmail}
                    onChange={onChangeEmail}
                  />
                  {formik.touched.email && formik.errors.email && (
                    <p className="text-red-500 text-sm my-2">
                      {formik.errors.email}
                    </p>
                  )}

                  {emailSuggestions.length > 0 && formik.values.email && (
                    <ul className="rounded-md shadow-lg bg-white mt-1 max-h-[160px] overflow-y-auto absolute top-12 z-20 w-full style-scrollbar">
                      {emailSuggestions.map((suggest) => (
                        <li
                          key={suggest.resourceName}
                          className="px-3 lg:px-4 py-2 hover:bg-gray-100 w-full cursor-pointer flex flex-col items-start"
                          onClick={() => {
                            onSelectEmail(suggest);
                          }}
                        >
                          {suggest.name && (
                            <label className="text-xs font-comfortaa lg:text-sm text-600">
                              {suggest.name}
                            </label>
                          )}
                          <span className="text-500 font-libre text-xs lg:text-sm">
                            {suggest.emailAddress}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <label className="text-sm font-libre font-normal mb-5">
                  {t("kudoRecipients.or")}
                </label>

                <div className="mb-5 relative">
                  <div className="flex flex-col lg:flex-row">
                    <CountryCodeDropdown />
                    <input
                      type="text"
                      placeholder={t("kudoRecipients.whatsappPlaceholder")}
                      className="border max-w-[293px] lg:min-w-[293px] border-border bg-input-bg text-600 placeholder:text-400 font-libre text-sm text-normal p-2 rounded-md "
                      {...formik.getFieldProps("mobile")}
                      onKeyDown={handleAddPhone}
                      onChange={onChangePhone}
                    />
                  </div>
                  {formik.touched.mobile && formik.errors.mobile && (
                    <p className="text-red-500 text-sm my-2">
                      {formik.errors.mobile}
                    </p>
                  )}

                  {phoneSuggestions.length > 0 && formik.values.mobile && (
                    <ul className="rounded-md shadow-lg bg-white mt-1 max-h-[160px] overflow-y-auto absolute top-12 z-20 w-full style-scrollbar">
                      {phoneSuggestions.map((suggest) => (
                        <li
                          key={suggest.resourceName}
                          className="px-3 lg:px-4 py-2 hover:bg-gray-100 w-full cursor-pointer flex flex-col items-start"
                          onClick={() => {
                            onSelectPhone(suggest);
                          }}
                        >
                          {suggest.name && (
                            <label className="text-xs font-comfortaa lg:text-sm text-600">
                              {suggest.name}
                            </label>
                          )}
                          <span className="text-500 font-libre text-xs lg:text-sm">
                            {suggest.phoneNumberWithCode}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {!!recipients.length && (
                  <div className="bg-input-bg p-3 min-h-[200px] lg:min-h-[331px] overflow-y-auto style-scrollbar flex items-start content-start flex-wrap w-full">
                    {recipients.map((recipient, index) => (
                      <div
                        key={index}
                        className="bg-secondary-light border text-xs border-secondary font-libre font-medium text-600 px-3 py-1 rounded-full inline-flex items-center m-1"
                      >
                        {recipient.email
                          ? recipient.email
                          : `+${recipient.countryCode}-${recipient.mobile}`}
                        <button
                          type="button"
                          className="ml-2 p-1 text-red-500"
                          onClick={() => handleRemoveRecipient(index)}
                        >
                          <Image
                            src={closeIcon}
                            alt="remove-icon"
                            width={6}
                            height={6}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <Button
                  isLoading={isLoading}
                  type="submit"
                  className="mt-4 mr-auto"
                >
                  {t("kudoRecipients.sendButton")}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
