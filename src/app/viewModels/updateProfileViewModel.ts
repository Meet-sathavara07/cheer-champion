"use client";
import { useInstantDB } from "@/app/context/InstantProvider";
import { useUserContext } from "@/app/context/UserContext";
import { kudoQueries, updateUserProfile } from "../models/profileModel";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { sendOTP } from "../models/authModel";
import { useTranslation } from "react-i18next";
import { useCountryDetails } from "../context/CountryCodeContext";
import { isDummyEmail } from "@/helpers/utils";
import { updateConsent } from "../utils/consentUtils";
import moment from "moment";
import { compressImage, validateProfileSize } from "../utils/imageProcessing";
import { useLanguage } from "../context/LanguageContext";
import { generateMessageFromAI } from "../models/kudoPostModel";
import { generateAIShareProfileContent } from "../utils/generateKudoShareText";

export interface Kudo {
  id: string;
  kudo?: string; // Optional to prevent missing property errors
  $users?: any[]; // Optional array
  kudo_receiver?: any[];
  createdAt?: string;
}

interface Values {
  name: string;
  bio: string;
  mobile: string;
  email: string;
  profileImage: any;
  countryCode: string;
  countryIso2: string;
  consent_message_taken: string;
}

const phoneRegex = /^\d{7,15}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function useUpdateProfileViewModel() {
  const db = useInstantDB();
  const router = useRouter();
  const { user, setUser } = useUserContext();
  const userProfile: any = db.useQuery(kudoQueries.userProfile(user?.id || ""));
  const profile = userProfile.data?.user_profile[0];
  const [initProfile, setInitProfile] = useState({
    name: "",
    bio: "",
    mobile: "",
    countryCode: "1",
    countryIso2: "us",
    email: "",
    profileImage: null,
    consent_message_taken: "no",
  });
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { t } = useTranslation();
  const [isMobileVerified, setMobileVerified] = useState(false);
  const [isEmailVerified, setEmailVerified] = useState(false);
  const [isOTPSending, setOTPSending] = useState(false);
  const fileInputRef = useRef<any>(null);
  const [isOpenOTPModal, setOpenOTPModal] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [OTPSentTo, setOtpSentTo] = useState({
    identifier: "",
    countryCode: "",
    countryIso2: "",
  });
  const [accountExist, setAccountExist] = useState({
    identifier: "",
    countryCode: "",
    countryIso2: "",
    userID: "",
  });
  const [imagePreview, setImagePreview] = useState<any>(null);
  const handleUploadFile = () => {
    fileInputRef.current?.click(); // Trigger file input click
  };
  const [isOpenMergeAccountModal, setOpenMergeAccountModal] = useState(false);
  const [isMergeConfirm, setMergeConfirm] = useState(false);
  const [isOpen, setOpen] = useState(false);
  const [isEmailEditing, setIsEmailEditing] = useState(false);
  const [isMobileEditing, setIsMobileEditing] = useState(false);
  const [isOpenConsentModal, setOpenConsentModal] = useState(false);
  const { countryDetails, setCountryDetails } = useCountryDetails();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isGeneratingMessage, setGeneratingMessage] = useState(false);
  const [aiGeneratedMessage, setAIGeneratedMessage] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isShareLoading, setShareLoading] = useState(false);
  const [isShareModalOpen, setKudoShareOpen] = useState(false);
  const { selectedLanguage } = useLanguage();

  const toggleEmailEditing = () => {
    setIsEmailEditing(!isEmailEditing);
    if (!isEmailEditing) {
      setEmailVerified(false);
      formik.setFieldValue("email", profile?.$users?.email || "");
    }
  };

  const toggleMobileEditing = () => {
    setIsMobileEditing(!isMobileEditing);
    if (!isMobileEditing) {
      setMobileVerified(false);
      formik.setFieldValue("mobile", profile?.user_profile?.mobile1 || "");
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    formik.setFieldValue("email", newEmail);
    if (newEmail !== profile?.$users?.email) {
      setEmailVerified(false);
    }
  };

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMobile = e.target.value;
    formik.setFieldValue("mobile", newMobile);
    if (newMobile !== profile?.user_profile?.mobile1) {
      setMobileVerified(false);
    }
  };

  const handleConsentChange = async (consentStatus: string) => {
    formik.setFieldValue("consent_message_taken", consentStatus);
    setOpenConsentModal(false);
  };

  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .min(3, "Name must be at least 3 characters")
      .max(50, "Name must be at most 50 characters")
      .required("Name is required"),
    bio: Yup.string()
      .min(8, "Bio must be at least 8 characters")
      .max(200, "Bio must be at most 200 characters"),
    mobile: Yup.string()
      .matches(phoneRegex, "Invalid phone number")
      .test("mobile-verified", "Mobile must be verified", function (value) {
        return !value || isMobileVerified;
      }),
    email: Yup.string()
      .email("Invalid email address")
      .test("email-verified", "Email must be verified", function (value) {
        return !value || isEmailVerified;
      }),
    consent_message_taken: Yup.string(),
  });

  useEffect(() => {
    if (profile) {
      const isEmailVerify = !isDummyEmail(profile.$users.email);
      const countryCode = profile.mobile1_country_code
        ? profile.mobile1_country_code
        : countryDetails.dialCode;
      const countryIso2 = profile.mobile1_country_iso2
        ? profile.mobile1_country_iso2
        : countryDetails.iso2;
      const countryCodeDetails = {
        dialCode: countryCode,
        iso2: countryIso2,
      };
      setInitProfile({
        name: profile.name,
        bio: profile.bio ? profile.bio : "",
        mobile: profile.mobile1 ? profile.mobile1 : "",
        countryCode: countryCode,
        countryIso2: countryIso2,
        email: isEmailVerify ? profile.$users.email : "",
        profileImage: profile?.$files?.url || null,
        consent_message_taken: profile.consent_message_taken || "no",
      });
      setCountryDetails(countryCodeDetails);
      setMobileVerified(!!profile.mobile1);
      setEmailVerified(isEmailVerify);
    }
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
      setOpenMergeAccountModal(false);
      setAccountExist({
        identifier: "",
        countryCode: "",
        countryIso2: "",
        userID: "",
      });
      if (fileInputRef.current?.value) {
        fileInputRef.current.value = null;
      }
    };
  }, [profile]);

  const formik = useFormik({
    initialValues: initProfile,
    enableReinitialize: true,
    validationSchema,
    onSubmit: (values: Values) => {
      handleSaveProfile(values);
    },
  });

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);

      // Validate file size
      if (!validateProfileSize(file)) {
        toast.error("File size must be less than 3MB");
        return;
      }
      // Process the file
      const { compressedFile, previewUrl } = await compressImage(file);
      setImagePreview(previewUrl);
      formik.setFieldValue("profileImage", compressedFile);
    } catch (error: any) {
      toast.error(error.message || "Failed to process image");
      console.error("Image processing error:", error);
    } finally {
      setLoading(false);
    }
  };

  const onOTPVerify = (userAccountExist: any) => {
    if (OTPSentTo.countryCode) {
      setMobileVerified(true);
      formik.setFieldError("mobile", "");
    } else {
      setEmailVerified(true);
      formik.setFieldError("email", "");
    }
    if (userAccountExist) {
      setAccountExist({ ...OTPSentTo, userID: userAccountExist.id });
    }
    setOtpSentTo({ identifier: "", countryCode: "", countryIso2: "" });
  };

  const handleSaveProfile = async (values: Values) => {
    if (!user) return;
    if (accountExist.userID && !isMergeConfirm) {
      setOpenMergeAccountModal(true);
      return;
    }
    try {
      setLoading(true);
      const formData = new FormData();
      if (values.name && values.name !== profile.name) {
        formData.append("name", values.name);
      }
      if (values.bio !== profile.bio) {
        formData.append("bio", values.bio);
      }
      if (
        values.mobile &&
        values.countryCode &&
        values.countryIso2 &&
        values.mobile !== profile.mobile1
      ) {
        formData.append("mobile1", values.mobile);
        formData.append("mobile1_country_code", values.countryCode);
        formData.append("mobile1_country_iso2", values.countryIso2);
      }
      if (values.email && values.email !== profile.$users.email) {
        formData.append("email", values.email);
      }
      if (imagePreview && values.profileImage) {
        formData.append("profileImage", values.profileImage);
      }
      formData.append("userID", user.id);

      if (accountExist?.userID) {
        formData.append("userExistID", accountExist.userID);
      }

      if (values.consent_message_taken !== profile.consent_message_taken) {
        await updateConsent(user.id, values.consent_message_taken, true);
        formData.append("consent_message_taken", values.consent_message_taken);
        formData.append(
          "consent_message_taken_at",
          moment().format("YYYY-MM-DD HH:mm:ss")
        );
      }

      const response = await updateUserProfile(formData);
      if (response.status === 200) {
        if (response.data?.success) {
          if (values.email && values.email !== user.email) {
            setUser({ ...user, email: values.email });
          }
          router.push(`/profile/${user.id}`);
        }
        toast.success(response.data.message);
      } else {
        toast.error("Failed to update profile.");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const verifyEmailHandler = (e: any) => {
    e.preventDefault();
    if (isOTPSending) return;
    if (!formik.values.email) {
      formik.setErrors({ email: "Email is required" });
      return;
    }
    if (!emailRegex.test(formik.values.email.trim())) {
      formik.setErrors({ email: "Invalid email address" });
      return;
    }
    sendOTPHandler("", "", formik.values.email.trim());
  };

  const sendOTPHandler = async (
    countryCode: string,
    countryIso2: string,
    value: string
  ) => {
    try {
      setOTPSending(true);
      await sendOTP(value, countryCode, "verify");
      setOpenOTPModal(true);
      setOtpSentTo({
        identifier: value,
        countryCode: countryCode,
        countryIso2: countryIso2,
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to send OTP");
    } finally {
      setOTPSending(false);
    }
  };

  const verifyMobileHandler = (e: any) => {
    e.preventDefault();
    if (isOTPSending) return;
    if (!formik.values.mobile) {
      formik.setErrors({ mobile: "Mobile number is required" });
      return;
    }
    if (!phoneRegex.test(formik.values.mobile.trim())) {
      formik.setErrors({ mobile: "Invalid phone number" });
      return;
    }
    sendOTPHandler(
      formik.values.countryCode,
      formik.values.countryIso2,
      formik.values.mobile.trim()
    );
  };

  const cancelAccountMergeHandler = () => {
    if (accountExist.countryCode) {
      setMobileVerified(false);
      formik.setFieldValue("mobile", "");
    } else {
      formik.setFieldValue("email", "");
      setEmailVerified(false);
    }
    setOpenMergeAccountModal(false);
    setAccountExist({
      identifier: "",
      countryCode: "",
      countryIso2: "",
      userID: "",
    });
  };

  const accountMergeHandler = () => {
    setMergeConfirm(true);
    formik.handleSubmit();
  };

  const onSelect = (country: any) => {
    formik.setFieldValue("countryCode", country.dialCode);
    formik.setFieldValue("countryIso2", country.iso2);
    setCountryDetails(country);
  };
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleShareClick = async () => {
    if (isShareLoading) return;
    try {
      setShareLoading(true);
      setGeneratingMessage(true); // Set generating state
      setKudoShareOpen(true);
      const profileName = profile?.name || "user";
      const profileBio = profile?.bio || "user";
      const message = await generateMessageFromAI(
        generateAIShareProfileContent(profileName, profileBio, selectedLanguage)
      );
      setAIGeneratedMessage(message);
      setDropdownOpen(false);
    } catch (error: any) {
      console.error("Error generating share content:", error);
      toast.error("Failed to generate share message");
    } finally {
      setGeneratingMessage(false);
      setShareLoading(false);
    }
  };
  const onShareModalClose = () => {
    setKudoShareOpen(false);
    setGeneratingMessage(false); // Reset generating state on close
  };
  return {
    redirectToProfile: () => router.push(`/profile/${user?.id}`),
    formik,
    handleImageUpload,
    isMobileVerified,
    isEmailVerified,
    isDataLoading: userProfile.isLoading,
    handleUploadFile,
    fileInputRef,
    verifyMobileHandler,
    verifyEmailHandler,
    isOpenOTPModal,
    setOpenOTPModal,
    OTPSentTo,
    onOTPVerify,
    imagePreview,
    isLoading,
    backToFeedsHandler: () => router.push("/feeds"),
    isOpenMergeAccountModal,
    setOpenMergeAccountModal,
    accountExist: accountExist,
    cancelAccountMergeHandler,
    accountMergeHandler,
    isSidebarOpen,
    setSidebarOpen,
    t,
    profile,
    isOpen,
    setOpen,
    onSelect,
    isEmailEditing,
    toggleEmailEditing,
    handleEmailChange,
    isMobileEditing,
    toggleMobileEditing,
    handleMobileChange,
    isOpenConsentModal,
    setOpenConsentModal,
    handleConsentChange,
    isShareModalOpen,
    onShareModalClose,
    aiGeneratedMessage,
    isGeneratingMessage,
    handleShareClick,
  };
}
