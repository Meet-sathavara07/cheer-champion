"use client";

import { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import moment from "moment";
import toast from "react-hot-toast";
import { sendOTP, verifyOTP, socialLogin } from "@/app/models/authModel";
import { useUserContext } from "@/app/context/UserContext";
import { useInstantDB } from "@/app/context/InstantProvider";
import { useRouter } from "next/navigation";
import { useGoogleLogin } from "@react-oauth/google";
import { useTranslation } from "react-i18next";
import { useCountryDetails } from "../context/CountryCodeContext";
// import { signIn, signOut } from "next-auth/react";
// const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
import parsePhoneNumberFromString from "libphonenumber-js";
// import axiosInstance from "../lib/axios";
const OTPRegex = /^\d{6}$/;
export const useLoginViewModel = () => {
  const [isOTPRequested, setOTPRequested] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [resendTime, setResendTime] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [isSentOTPLoading, setSentOTPLoading] = useState(false);
  const { countryDetails } = useCountryDetails();
  const { setUser } = useUserContext();
  const db = useInstantDB();
  const router = useRouter();
  const { t } = useTranslation();
  const [hasMounted, setHasMounted] = useState(false);

  const formik = useFormik({
    initialValues: {
      mobile: "",
      email: "",
      OTP: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .trim()
        .email("Invalid email address")
        .test(
          "email-or-mobile",
          "Either Whatsapp Number or email is required",
          function (value) {
            const { mobile } = this.parent;
            return !!value || !!mobile;
          }
        ),
      mobile: Yup.string()
        .trim()
        .test(
          "valid-if-present",
          "Invalid phone number with country code",
          function (value) {
            if (!value) return true; // If mobile is empty, skip validation
            const phoneNumber = parsePhoneNumberFromString(
              `+${countryDetails.dialCode}${value}`
            );
            return phoneNumber?.isValid() ?? false;
          }
        )
        .test(
          "email-or-mobile",
          "Either Whatsapp Number or email is required",
          function (value) {
            const { email } = this.parent;
            return !!value || !!email;
          }
        ),
      OTP: Yup.string().when([], {
        is: () => isOTPRequested,
        then: (schema) =>
          schema.required("OTP is required").matches(OTPRegex, "Invalid OTP"),
        otherwise: (schema) => schema.notRequired(),
      }),
    }),
    onSubmit: (values) => {
      if (isOTPRequested) {
        handleVerifyOTP(values);
      } else {
        handleSendOTP();
      }
    },
  });

  // const isValidInput = () => {
  //   return formik.values.email
  //     ? emailRegex.test(formik.values.email)
  //     : phoneRegex.test(formik.values.mobile);
  // };

  useEffect(() => {
    if (!isOTPRequested) return;
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [resendTime, isOTPRequested]);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const updateCountdown = () => {
    if (resendTime) {
      const remaining = moment(resendTime).diff(moment(), "seconds");
      setTimeLeft(remaining > 0 ? remaining : 0);
    }
  };

  const handleSendOTP = async (e?: any) => {
    if (e) e.preventDefault();
    if (timeLeft > 0 || isSentOTPLoading) return;
    setSentOTPLoading(true);
    try {
      const code = formik.values.mobile ? countryDetails.dialCode : "";
      const response = await sendOTP(
        formik.values.email.trim() || formik.values.mobile.trim(),
        code,
        "login"
      );
      setOTPRequested(true);
      toast.success(response.message);
      setResendTime(moment().add(5,"minutes").toISOString());
    } catch (error: any) {
      console.log(error, "error");
      toast.error(error);
    } finally {
      setSentOTPLoading(false);
    }
  };

  const handleSocialLogin = useGoogleLogin({
    flow: "auth-code",
    scope: "https://www.googleapis.com/auth/contacts.readonly",
    // prompt: "consent", // Forces Google to show the consent screen again
    onSuccess: async ({ code }) => {
      const {data} = await socialLogin(code);
      loginWithTokenHandler(data?.token, data?.googleAuth);
    },
    onError: (error) => console.error("Login Failed:", error),
  });
  // const handleSocialLogin = async (e, loginMethod: string) => {
  //   e.preventDefault();
  //   const res = await signIn(loginMethod, {
  //     redirect: false,
  //     callbackUrl: "/",
  //   });

  //   console.log(res, "response");
  //   if (res?.error) {
  //     console.error("Login failed:", res.error);
  //   } else {
  //     console.log("User signed in successfully!");
  //     const user = await fetchUserData(); // Fetch user details after login
  //     console.log(user, "user");
  //   }
  // };

  // const fetchUserData = async () => {
  //   const response = await fetch("/api/auth/session");
  //   const userData = await response.json();
  //   console.log("User Data:", userData);
  // };

  const loginWithTokenHandler = async (
    token: string,
    googleAuth: any,
  ) => {
    try {
      const data: any = await db.auth.signInWithToken(token);
      setUser({ ...data.user, googleAuth });
      // axiosInstance.defaults.headers.common["token"] = data.user.refresh_token;
      router.back();
      toast.success("User Logged in Successfully!");
    } catch (error: any) {
      console.error(error,"Login failed with instantDB token")
      toast.error(error?.message || "Login failed with instantDB token");
    }
  };

  const handleVerifyOTP = async (values: {
    email: string;
    mobile: string;
    OTP: string;
  }) => {
    setLoading(true);
    try {
      const countryCode = values.mobile ? countryDetails.dialCode : "";
      const countryIso2 = values.mobile ? countryDetails.iso2 : "";
      const response = await verifyOTP(
        values.OTP,
        values.email.trim() || values.mobile.trim(),
        countryCode,
        countryIso2,
        "login"
      );
      loginWithTokenHandler(response.token,null);
    } catch (error: any) {
      console.error("OTP verification failed:", error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetOTPSentHandler = (e: any) => {
    e.preventDefault();
    setResendTime("");
    setOTPRequested(false);
    setTimeLeft(0);
  };

  return {
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
  };
};
