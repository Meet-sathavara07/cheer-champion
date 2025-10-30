"use client";

import Image from "next/image";
import Link from "next/link";
import layoutRight from "@/assets/layouts/layout-right.svg";
import GratitudeImage from "@/assets/Gratitude-1.svg";
import googleLogo from "@/assets/logo/Google-logo.svg";
// import facebookLogo from "@/assets/logo/Facebook-logo.svg";
// import linkedInLogo from "@/assets/logo/Linkedin-logo.svg";
import PublicNavbar from "@/app/components/Navbar/PublicNavbar";
import CountryCodeDropdown from "@/app/components/Dropdowns/CountryCodeDropdown";
import Button from "@/app/components/Button";
import { useLoginViewModel } from "@/app/viewModels/loginViewModel";
import layoutTop from "@/assets/layouts/layout-top-mobile.svg";
import { sanitizeMobileNumber } from "@/helpers/utils";
// import { signIn, signOut } from "next-auth/react";

export default function Login() {
  const {
    formik,
    isOTPRequested,
    // isValidInput,
    handleSendOTP,
    timeLeft,
    isLoading,
    isSentOTPLoading,
    handleSocialLogin,
    t,
    hasMounted,
    countryDetails,
    resetOTPSentHandler,
  } = useLoginViewModel();

  if (!hasMounted) return null;

  return (
    <section className="min-h-screen w-full relative">
      <div className="grid grid-cols-1 w-full lg:grid-cols-11 absolute -z-1 h-[316px] lg:h-full">
        <div className="col-span-5" />
        <div className="relative w-full h-[316px] lg:h-auto overflow-hidden lg:hidden">
          <Image
            src={layoutTop}
            className="absolute object-cover object-bottom w-full h-full -z-1"
            alt="layout mobile"
          />
        </div>

        <div className="hidden lg:block relative lg:col-span-6 h-screen w-full">
          <Image
            src={layoutRight}
            alt="layout desktop"
            fill
            className="absolute w-full h-full object-cover object-left -z-1"
          />
        </div>
      </div>
      <div className="min-h-screen w-full flex flex-col max-w-[120rem] mx-auto">
        <PublicNavbar className="hidden lg:flex" />
        <PublicNavbar className="flex lg:hidden" isLight />
        <div className="flex flex-col-reverse justify-end p-4 lg:grid grid-cols-11 lg:flex-1">
          {/* <div className="flex items-center justify-between  xl:justify-around flex-grow-1"> */}
          <div className="col-span-5 flex justify-center">
            <div className="h-full mt-5 lg:mt-0 flex flex-col justify-center">
              <div className="flex flex-col justify-center my-auto">
                <h2 className="text-2xl font-bold font-comfortaa text-500">
                  {t("login.title")}
                </h2>
                <p className="text-sm font-comfortaa font-bold text-sub-title">
                  {t("login.subtitle")}
                </p>
                <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                  <form className="pt-5" onSubmit={formik.handleSubmit}>
                    {isOTPRequested ? (
                      <p className="mb-5">
                        <span className="text-sm font-comfortaa font-bold text-sub-title ">
                          Enter the OTP sent to your{" "}
                          {formik.values.mobile
                            ? t("login.whatsappNo")
                            : t("login.email")}
                        </span>
                        <br />
                        <span className="text-sm font-comfortaa font-bold text-500">
                          {formik.values.email
                            ? formik.values.email
                            : `+${countryDetails.dialCode} - ${formik.values.mobile}`}
                        </span>
                      </p>
                    ) : (
                      <>
                        <div className="flex items-center py-4 mt-10 lg:mt-0 lg:py-5 ">
                          <button
                            className="btn mx-[6px] inline-flex items-center"
                            onClick={(e) => {
                              e.preventDefault();
                              handleSocialLogin();
                            }}
                          >
                            <label className="mr-2 font-comfortaa text-sm font-bold text-sub-title cursor-pointer ">
                              {t("login.loginUsing")}
                            </label>
                            <Image
                              src={googleLogo}
                              alt="googleLogo"
                              height={30}
                              width={30}
                            />
                          </button>
                          {/* <button
            className="btn mx-[6px]"
          >
            <Image
              src={facebookLogo}
              alt="facebookLogo"
              height={30}
              width={30}
            />
          </button>
          <button
            className="btn mx-[6px]"
          >
            <Image
              src={linkedInLogo}
              alt="linkedInLogo"
              height={30}
              width={30}
              className="mx-[6px]"
            />
          </button> */}
                        </div>
                        <label className="block text-sm font-libre font-normal mb-5">
                          {t("login.or")}
                        </label>
                        <div className="mb-5">
                          <input
                            type="text"
                            readOnly={!!formik.values.mobile}
                            placeholder={t("login.emailPlaceholder")}
                            className="border min-w-[293px] border-border bg-input-bg text-600 placeholder:text-400 font-libre text-sm text-normal p-2 rounded-md "
                            {...formik.getFieldProps("email")}
                          />
                          {formik.touched.email && formik.errors.email ? (
                            <p className="text-red-500 text-sm my-2">
                              {formik.errors.email}
                            </p>
                          ) : null}
                        </div>

                        <label className="block text-sm font-libre font-normal mb-5">
                          {t("login.or")}
                        </label>

                        <div className="mb-5">
                          <div className="flex flex-col lg:flex-row ">
                            <CountryCodeDropdown
                              disabled={!!formik.values.email}
                            />
                            <input
                              type="text"
                              readOnly={!!formik.values.email}
                              placeholder={t("login.whatsappPlaceholder")}
                              className="border max-w-[293px] lg:min-w-[293px] border-border bg-input-bg text-600 placeholder:text-400 font-libre text-sm text-normal p-2 rounded-md "
                              {...formik.getFieldProps("mobile")}
                              onChange={(e) => {
                                formik.setFieldValue(
                                  "mobile",
                                  sanitizeMobileNumber(e.target.value)
                                );
                              }}
                            />
                          </div>
                          {formik.touched.mobile && formik.errors.mobile ? (
                            <p className="text-red-500 text-sm my-2">
                              {formik.errors.mobile}
                            </p>
                          ) : null}
                        </div>
                      </>
                    )}

                    {isOTPRequested && (
                      <>
                        <div className="mb-5">
                          <input
                            id="OTP"
                            name="OTP"
                            type="password"
                            placeholder={t("login.otpPlaceholder")}
                            className="border min-w-[293px] border-border bg-input-bg text-600 placeholder:text-400 font-libre text-sm text-normal p-2 rounded-md"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.OTP}
                            maxLength={6}
                          />
                          {formik.touched.OTP && formik.errors.OTP && (
                            <div className="text-red-600 text-sm">
                              {formik.errors.OTP}
                            </div>
                          )}
                        </div>
                        <div className="flex mb-5">
                          <p className="text-sm font-comfortaa font-bold text-sub-title mr-2">
                            {t("login.didntGetCode")}
                          </p>
                          <Link
                            href="/"
                            className={`text-sm font-comfortaa font-medium underline ${
                              timeLeft > 0
                                ? "text-secondary !cursor-default"
                                : "text-secondary-dark"
                            }`}
                            onClick={handleSendOTP}
                          >
                            {timeLeft > 0
                              ? t("login.resendOtpIn", { time: `${timeLeft}s` })
                              : t("login.resendOtp")}
                          </Link>
                        </div>
                        <div className="flex mb-5">
                          <p className="text-sm font-comfortaa font-bold text-sub-title  mr-2">
                            {t("login.wantToChange")}
                          </p>
                          <Link
                            href="/"
                            className={`text-sm font-comfortaa font-medium underline text-secondary-dark`}
                            onClick={resetOTPSentHandler}
                          >
                            {formik.values.mobile
                              ? t("login.changeWhatsappNo")
                              : t("login.changeEmail")}
                          </Link>
                        </div>
                      </>
                    )}

                    <div>
                      {isOTPRequested ? (
                        <Button
                          type="submit"
                          isLoading={isLoading}
                          className="min-w-[129px] !mt-0 "
                        >
                          {t("login.loginSignup")}
                        </Button>
                      ) : (
                        <Button
                          type="submit"
                          className="min-w-[100px] !mt-0 "
                          isLoading={isSentOTPLoading}
                          // disabled={!isValidInput()}
                          // onClick={(e) => handleSendOTP(e)}
                        >
                          {t("login.requestOtp")}
                        </Button>
                      )}
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-6 flex justify-center items-center">
            <Image
              src={GratitudeImage}
              alt="GratitudeImage"
              className="lg:w-[546.99px] lg:h-[433.52px] w-[359.21px] h-[284.70px]"
            />
          </div>
          {/* </div> */}
        </div>
      </div>
    </section>
  );
}
