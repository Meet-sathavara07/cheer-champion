"use client";
import React, { useEffect, useState } from "react";
import DarkBackground from "@/assets/dark-background.svg";
import FullLayout from "@/assets/layouts/full-bottom-layout.svg";
import Image from "next/image";
import PublicNavbar from "@/app/components/Navbar/PublicNavbar";
import Button from "@/app/components/Button";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import * as Sentry from "@sentry/nextjs";
import Loader from "@/app/components/Loader";
import { FaEnvelope, FaBell, FaCheckCircle } from "react-icons/fa";
import { useUserContext } from "@/app/context/UserContext";

export default function Unsubscribe() {
  const params = useParams();
  const router = useRouter();
  const userId = params?.id as string;
  const [user, setUser] = useState<any | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateComplete, setUpdateComplete] = useState(false);
  const userContext = useUserContext();

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!userId) {
        toast.error("No user ID provided");
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get(`/api/users/unsubscribe?id=${userId}`);
        const result = response.data;

        if (response.status === 200 && result.user) {
          setUser(result.user);
          // Set initial selection based on current consent
          if (result.user.consent_message_taken === "yes") {
            setSelectedOption("subscribe");
          } else if (result.user.consent_message_taken === "no") {
            setSelectedOption("unsubscribe");
          }
        } else {
          toast.error(result.message || "User not found");
          setUser(null);
        }
      } catch (error: any) {
        Sentry.captureException(error);
        toast.error("Failed to fetch user details");
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDetails();
  }, [userId]);

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
  };

  const handleConfirm = async () => {
    if (!selectedOption || !user) return;

    setIsUpdating(true);
    const newConsent = selectedOption === "subscribe";

    try {
      const response = await axios.post(`/api/users/consent`, {
        userId: user.id,
        consent: newConsent ? "yes" : "no",
      });

      if (response.status === 200) {
        toast.success(
          newConsent ? "Subscribed successfully" : "Unsubscribed successfully"
        );
        setUpdateComplete(true);
      }
    } catch (error: any) {
      console.error("DEBUG: Consent update error:", error);
      Sentry.captureException(error);
      toast.error("Failed to update preferences");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="relative min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <Loader />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full">
      <Image
        alt="layout"
        src={FullLayout}
        className="w-full h-[calc(100dvh-191px)] lg:h-[calc(100dvh-210px)] object-cover object-top"
      />
      <div className="absolute inset-0 z-10">
        <div className="relative h-full w-full overflow-hidden">
          <Image
            alt="background-image"
            src={DarkBackground}
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 flex flex-col">
            <PublicNavbar className="flex" isLight />
            <div className="flex-1 flex flex-col items-center justify-center pt-4 pb-8 px-4 overflow-y-auto">
              <div className="bg-white rounded-2xl shadow-2xl px-4 sm:px-6 py-3 sm:py-4 w-full max-w-[90vw] md:max-w-[70vw] lg:max-w-[60vw] xl:max-w-[50vw] border border-gray-100">
                <div className="text-center">
                  {!updateComplete ? (
                    <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-blue-100 rounded-full mb-3 sm:mb-4">
                      <FaEnvelope className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                    </div>
                  ) : (
                    <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-green-100 rounded-full mb-3 sm:mb-4">
                      <FaCheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                    </div>
                  )}
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-800 font-comfortaa">
                      {updateComplete
                        ? "Preference Updated Successfully!"
                        : "Notification Preferences"}
                    </h1>
                    <p className="text-sm sm:text-base text-gray-600 mt-1">
                      Hello, {user?.name || "User"}
                      {user?.email && ` (${user.email})`}
                    </p>
                  </div>
                </div>

                {!updateComplete ? (
                  <>
                    <div className="mb-2 sm:mb-4">
                      <div className="my-3 sm:my-4 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                        <div className="flex items-start">
                          <div className="bg-blue-100 p-1.5 sm:p-2 rounded-full mr-2 sm:mr-3 flex-shrink-0">
                            <FaBell className="text-blue-600 text-sm sm:text-base" />
                          </div>
                          <p className="text-xs sm:text-sm text-gray-700">
                            We send helpful reminders, updates, and
                            encouragement to help you spread and receive
                            appreciation. Transactional messages (e.g., kudo
                            sent/received) will still be delivered. You can
                            change your preferences at any time.
                          </p>
                        </div>
                      </div>

                      <h3 className="text-base sm:text-lg font-medium text-gray-800 text-center mb-3 sm:mb-4">
                        Would you like to receive promotional communications?
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                        <div
                          className={`p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                            selectedOption === "unsubscribe"
                              ? "border-red-400 bg-red-50 shadow-md"
                              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                          onClick={() => handleOptionSelect("unsubscribe")}
                        >
                          <div className="flex items-center mb-1 sm:mb-2">
                            <div
                              className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center mr-2 sm:mr-3 ${
                                selectedOption === "unsubscribe"
                                  ? "border-red-500 bg-red-500"
                                  : "border-gray-400"
                              }`}
                            >
                              {selectedOption === "unsubscribe" && (
                                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"></div>
                              )}
                            </div>
                            <h4 className="font-medium text-sm sm:text-base">
                              Unsubscribe
                            </h4>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-600 ml-6 sm:ml-8">
                            Stop receiving promotional emails and notifications
                          </p>
                        </div>

                        <div
                          className={`p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                            selectedOption === "subscribe"
                              ? "border-green-400 bg-green-50 shadow-md"
                              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                          onClick={() => handleOptionSelect("subscribe")}
                        >
                          <div className="flex items-center mb-1 sm:mb-2">
                            <div
                              className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center mr-2 sm:mr-3 ${
                                selectedOption === "subscribe"
                                  ? "border-green-500 bg-green-500"
                                  : "border-gray-400"
                              }`}
                            >
                              {selectedOption === "subscribe" && (
                                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"></div>
                              )}
                            </div>
                            <h4 className="font-medium text-sm sm:text-base">
                              Subscribe
                            </h4>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-600 ml-6 sm:ml-8">
                            Continue receiving helpful updates and notifications
                          </p>
                        </div>
                      </div>

                      {selectedOption && (
                        <div className="mt-2 sm:mt-4 p-2 sm:p-3 bg-gray-50 rounded-xl border border-gray-200 animate-fadeIn">
                          <p className="text-center text-xs sm:text-sm text-gray-700 mb-3 sm:mb-4">
                            You've selected to{" "}
                            <span className="font-semibold">
                              {selectedOption === "subscribe"
                                ? "subscribe"
                                : "unsubscribe"}
                            </span>
                            . Confirm your choice below.
                          </p>
                          <div className="flex justify-center">
                            <Button
                              onClick={handleConfirm}
                              disabled={isUpdating}
                              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg transition-all py-2 sm:py-3 text-white font-medium rounded-lg"
                            >
                              {isUpdating ? (
                                <div className="flex items-center justify-center">
                                  <div className="w-4 h-4 border-t-2 border-r-2 border-white rounded-full animate-spin mr-2"></div>
                                  Updating...
                                </div>
                              ) : (
                                `Confirm ${
                                  selectedOption === "subscribe"
                                    ? "Subscription"
                                    : "Unsubscription"
                                }`
                              )}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    {!selectedOption && (
                      <p className="text-xs text-center text-gray-500 mb-3 sm:mb-4">
                        Select your preference to continue
                      </p>
                    )}
                  </>
                ) : (
                  <div className="text-center py-4 sm:py-6">
                    <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
                      You have{" "}
                      {selectedOption === "subscribe"
                        ? "subscribed"
                        : "unsubscribed"}{" "}
                      from promotional communications.
                    </p>
                    <div className="p-3 sm:p-4 bg-green-50 rounded-xl border border-green-200 mt-3 sm:mt-4">
                      <p className="text-xs sm:text-sm text-green-700">
                        Your notification preferences have been saved. You can
                        change these preferences anytime in your user account
                        settings.
                      </p>
                    </div>
                    <div className="mt-3 sm:mt-4 flex justify-center gap-4">
                      {userContext.user ? (
                        <>
                          <Button onClick={() => router.push("/feeds")}>
                            Go to Feed
                          </Button>
                          <Button
                            onClick={() => router.push("/kudos")}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2 sm:py-3 rounded-lg shadow-lg transition-all"
                          >
                            Send Kudos
                          </Button>
                        </>
                      ) : (
                        <Button
                          onClick={() => router.push("/login")}
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2 sm:py-3 rounded-lg shadow-lg transition-all"
                        >
                          Login / Signup
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
