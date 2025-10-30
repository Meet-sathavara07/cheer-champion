"use client";

import Image from "next/image";
import layoutLeft from "@/assets/layouts/layout-left.svg";
import layoutTop from "@/assets/layouts/layout-top-mobile.svg";
import gratefulImage from "@/assets/grateful.svg";
import gratefulImage2 from "@/assets/big-memories-image.svg";
import gratefulLineImage2 from "@/assets/big-memories-line.svg";
import gratefulCurveImage from "@/assets/curve-gratitude-text.svg";
import GratitudeImage from "@/assets/Gratitude-1.svg";
import AIIcon from "@/assets/icon/AI-icon.svg";
import gratefulLineImage from "@/assets/grateful-line.svg";
import PublicNavbar from "@/app/components/Navbar/PublicNavbar";
import FormikTextArea from "@/app/components/Inputs/FormikTextArea";
import Link from "next/link";
import Button from "@/app/components/Button";
import useMessageViewModel from "@/app/viewModels/messageViewModel";
// import { noKudoSentLastWeek } from "./models/jobsModel";
// import { notifyUser } from "./models/notificationModel";
// import { monthlyTopKudoSender } from "./models/notificationModel";
// import { noKudoSentReminder, noRespondedForWeekReminder } from "./models/jobsModel";
// import toast from "react-hot-toast";
// import Footer from "./components/Footer/Footer";

export default function Home() {
  const {
    formik,
    textGenerateByAI,
    generateAIMessageHandler,
    handleUseAIText,
    isLoading,
    randomNumber,
    isClient,
    t,
  } = useMessageViewModel();

  // const handleSentReminder = async () => {
  // try {
  //   const response = await noKudoSentLastWeek();
  //   console.log(response,"response s")
  // } catch (error: any) {
  //   console.log(error,"error s")
  // }
  // }
  // const handleSentReminder = async () => {
  //   try {
  //   const res = await notifyUser();
  //   console.log(res,"res");
  //    if (res.status !== 200) {
  //     console.log("No inactive users found.");
  //     toast.success("No users to remind.");
  //   }
  //    toast.success("Reminders sent to users.");
  //   } catch (error: any) {
  //     console.error("Error sending reminders:", error);
  //     toast.error(error.message || "Failed to send reminders");
  //   }
  // }
  // const handleSentReminder = async () => {
  //   try {
  //   const res = await webNotifyUser();
  //   console.log(res,"res");
  //    if (res.status !== 200) {
  //     console.log("No inactive users found.");
  //     toast.success("No users to remind.");
  //   }
  //    toast.success("Reminders sent to users.");
  //   } catch (error: any) {
  //     console.error("Error sending reminders:", error);
  //     toast.error(error.message || "Failed to send reminders");
  //   }
  // }
  
  if (!isClient) return null; // Prevents hydration error

  return (
    <section className="min-h-screen w-full relative flex ">
      <div className="grid grid-cols-1 lg:grid-cols-12 w-full">
        <div className="relative w-full h-[250px] lg:h-auto overflow-hidden lg:hidden">
          <Image
            src={layoutTop}
            className="object-cover object-bottom w-full h-[250px] "
            alt="layout mobile"
          />
        </div>

        <div className="hidden lg:block relative lg:col-span-5 h-screen w-full">
          <Image
            src={layoutLeft} 
            alt="layout desktop"
            fill
            className="object-cover object-right"
          />
        </div>
      </div>
      <div className="flex flex-col w-full h-full absolute">
        <PublicNavbar isLight={true} />
        <div className="w-full max-w-[120rem] mx-auto px-4 flex flex-col lg:grid lg:grid-cols-12 flex-1">
          <div className="lg:col-span-5 flex lg:flex-col h-[198px] mb-8 lg:mb-0 lg:h-auto items-end lg:items-center justify-center">
            {randomNumber === 1 ? (
              <div className="flex flex-row-reverse lg:flex-col items-center justify-center">
                <Image
                  src={gratefulImage}
                  alt="image"
                  className="lg:w-[220.36px] lg:h-[255.36px] w-[132.87px] h-[153.98px]"
                />
                <Image
                  src={gratefulLineImage}
                  alt="image"
                  className="lg:w-[335px] lg:h-[124px] w-[154px] h-[58px]"
                />
              </div>
            ) : randomNumber === 2 ? (
              <div className="relative flex flex-row-reverse lg:flex-col items-center justify-center">
                  <Image
                    src={gratefulCurveImage}
                    alt="image"
                    className="sm:w-[125.11px] sm:h-[77.46] w-[110px] h-[60] lg:w-[335px] lg:h-[124px] absolute top-0 left-0"
                  />
                  <Image
                    src={gratefulImage2}
                    alt="image"
                    className="max-w-[230.41px]  h-[170px] sm:max-w-[270.41px] sm:h-[205px] lg:max-w-full lg:h-[379.06px]"
                  />
                  <Image
                    src={gratefulLineImage2}
                    alt="image"
                    className="lg:w-[335px] lg:h-[124px] w-[180px] h-[42px] sm:w-[197px] sm:h-[52px]"
                  />
              </div>
            ) : (
              <div className="flex lg:flex-col items-end lg:items-center justify-center">
                <Image
                  src={GratitudeImage}
                  alt="GratitudeImage"
                  className="lg:w-[546.99px] lg:h-[433.52px] w-[340.21px] h-[158px]"
                />
              </div>
            )}
          </div>
          <div className="flex-1 lg:col-span-7 flex justify-center lg:items-center">
            <form
              onSubmit={formik.handleSubmit}
              className="w-[518px] flex flex-col"
            >
              <h2 className="text-xl lg:text-2xl font-bold font-comfortaa mb-2 ">
              {t("home.typeMessage")}
              </h2>
              <p className="text-xs lg:text-sm font-bold font-comfortaa text-sub-title mb-4 ">
              {t("home.typeMessageDesc")}
              </p>
              <FormikTextArea name="message" formik={formik} />

              {textGenerateByAI ? (
                <>
                  <p className="mt-2 text-secondary-dark text-xs lg:text-sm font-libre font-medium ">
                    {t("home.textRecommendation")}
                  </p>
                  <div className="mt-2 p-3 border border-secondary rounded-lg">
                    <p className="text-secondary-dark text-xs lg:text-sm font-libre font-medium whitespace-pre-wrap  overflow-y-auto ">
                      {textGenerateByAI} 
                    </p>
                  </div>
                  <div className="flex justify-between">

                  <Link
                    href="/"
                    onClick={handleUseAIText}
                    className="mt-2 text-secondary-dark lg:text-sm text-xs font-libre font-medium italic underline "
                    >
                    {t("home.useThisText")}
                  </Link>

                  <Link
                    href="/"
                    onClick={(e) => generateAIMessageHandler(e)}
                    className="mt-2 text-secondary-dark lg:text-sm text-xs font-libre font-medium italic underline "
                    >
                    Regenerate message
                  </Link>
                    </div>
                </>
              ) : (
                <Link
                  href="/"
                  onClick={(e) => generateAIMessageHandler(e)}
                  className="mt-2 flex items-center text-secondary-dark text-xs lg:text-sm font-libre font-medium italic underline "
                >
                 {t("home.improveTextLink")}
                  <Image
                    src={AIIcon}
                    alt="icon"
                    className="w-[13.2px] h-[13.2px] lg:w-[16.2px] lg:h-[16.2px] ml-1"
                  />
                </Link>
              )}

              <Button
                isLoading={isLoading}
                type="submit"
                className="mx-auto mt-auto mb-6 lg:mb-0 lg:mt-10"
              >
                {t("home.nextButton")}
              </Button>
              {/* <Button
                isLoading={isLoading}
                onClick={handleSentReminder}
                className="mx-auto mt-auto mb-6 lg:mb-0 lg:mt-10"
              >
                {"check API"}
              </Button> */}
              {/* <Button
                isLoading={isLoading}
                type="submit"
                className="mx-auto mt-auto mb-6 lg:mb-0 lg:mt-10"
              >
                {t("home.nextButton")}
              </Button> */}
            </form>
          </div>
        </div>
        {/* <Footer /> */}
      </div>
    </section>
  );
}