"use client";
import { useEffect, useState } from "react";
import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import {
  sendKudo,
  Recipient,
  getValidationSchema,
} from "@/app/models/kudoPostModel";
import { usePostContext } from "@/app/context/KudoPostContext";
import { useUserContext } from "@/app/context/UserContext";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useCountryDetails } from "../context/CountryCodeContext";
import { getGoogleContacts } from "../models/authModel";
import { sanitizeMobileNumber } from "@/helpers/utils";
import parsePhoneNumberFromString from "libphonenumber-js";
import { base64ToFile } from "../utils/imageProcessing";
import { useInstantDB } from "@/app/context/InstantProvider";

// const phoneRegex = /^\d{10,15}$/; // Allows a numeric phone number (without country code)
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email validation
const MAX_SUGGESTIONS = 10;

interface Suggestion {
  resourceName: string;
  name: string;
  emailAddress?: string;
  phoneNumberWithCode?: string;
  phoneNumber?: string;
  countryIso2?: string;
  dialCode?: string;
  iso2?: string;
  _score?: number;
}

export function useRecipientViewModel() {
  const { formData, setFormData, initialKudo }: any = usePostContext();
  const { user, setUser } = useUserContext();
  const router = useRouter();
  const db = useInstantDB();
  const [isLoading, setLoading] = useState(false);
  const [isOpenPostSuccess, setOpenPostSuccess] = useState(false);
  const [isOpenNotLoggedIn, setOpenNotLoggedIn] = useState(false);
  const [isConfirmKudoSend, setConfirmKudoSend] = useState(false);
  const [recipients, setRecipients] = useState<Recipient[]>(
    formData.recipients || []
  );
  const { t } = useTranslation();
  const [hasMounted, setHasMounted] = useState(false);
  const [googleContacts, setGoogleContacts] = useState<any[]>([]);
  const [emailSuggestions, setEmailSuggestions] = useState<Suggestion[]>([]);
  const [phoneSuggestions, setPhoneSuggestions] = useState<Suggestion[]>([]);
  const [pastContacts, setPastContacts] = useState<Suggestion[]>([]);
  const { countryDetails, setCountryDetails } = useCountryDetails();

  // Fetch past recipients and senders for auto-complete
  const fetchPastContacts = async () => {
    if (!user?.id) return [];

    try {
      // Query for sent kudos
      const sentKudosQuery = {
        kudos: {
          $: {
            where: { $users: user.id },
          },
          kudo_receiver: {
            $users: {
              user_profile: {},
            },
          },
        },
      };

      // Query for received kudos
      const receivedKudosQuery = {
        kudos: {
          $: {
            where: { "kudo_receiver.$users": user.id },
          },
          $users: {
            user_profile: {},
          },
        },
      };

      const [sentKudos, receivedKudos] = await Promise.all([
        db.queryOnce(sentKudosQuery),
        db.queryOnce(receivedKudosQuery),
      ]);

      // Process and deduplicate contacts
      const contacts = new Map<string, Suggestion>();

      // Process sent kudos recipients
      sentKudos.data?.kudos?.forEach((kudo: any) => {
        kudo.kudo_receiver?.forEach((receiver: any) => {
          const user = receiver.$users?.[0];
          if (!user) return;

          const key =
            user.email ||
            `${user.user_profile.mobile1_country_code}${user.user_profile.mobile1}`;
          if (!key || contacts.has(key)) return;

          contacts.set(key, {
            resourceName: user.id,
            name: user.user_profile?.name || "Unknown",
            emailAddress: user.email,
            phoneNumberWithCode: user.user_profile.mobile1
              ? `+${user.user_profile.mobile1_country_code}-${user.user_profile.mobile1}`
              : undefined,
            countryIso2: user.user_profile.mobile1_country_iso2,
          });
        });
      }); 

      // Process received kudos senders
      receivedKudos.data?.kudos?.forEach((kudo: any) => {
        const sender = kudo.$users?.[0];
        if (!sender) return;

        const key =
          sender.email ||
          `${sender.user_profile.mobile1_country_code}${sender.user_profile.mobile1}`;
        if (!key || contacts.has(key)) return;

        contacts.set(key, {
          resourceName: sender.id,
          name: sender.user_profile?.name || "Unknown",
          emailAddress: sender.email,
          phoneNumberWithCode: sender.user_profile.mobile1
            ? `+${sender.user_profile.mobile1_country_code}-${sender.user_profile.mobile1}`
            : undefined,
          countryIso2: sender.user_profile.mobile1_country_iso2,
        });
      });

      return Array.from(contacts.values());
    } catch (error) {
      console.error("Error fetching past contacts:", error);
      return [];
    }
  };

  // Load past contacts on component mount
  useEffect(() => {
    const loadPastContacts = async () => {
      const contacts = await fetchPastContacts();
      setPastContacts(contacts || []);
    };

    if (user?.id) {
      loadPastContacts();
    }
  }, [user?.id]);

  // Google contacts search handler for emails
  const searchGoogleEmailHandler = (value: string) => {
    return googleContacts
      .filter((contact) => {
        const email = contact.emailAddress?.toLowerCase() || "";
        const name = contact.name?.toLowerCase() || "";
        const search = value.toLowerCase();
        // Only suggest contacts with an email address
        return (
          (email.includes(search) || name.includes(search)) &&
          contact.emailAddress
        );
      })
      .map((contact) => {
        const email = contact.emailAddress?.toLowerCase() || "";
        const name = contact.name?.toLowerCase() || "";
        const search = value.toLowerCase();
        // Calculate match score: lower is better
        let score = 2;
        if (email === search) score = 0;
        else if (email.startsWith(search)) score = 1;
        else if (name.startsWith(search)) score = 1.5;
        else if (email.includes(search)) score = 2;
        else if (name.includes(search)) score = 2.5;
        return { ...contact, _score: score };
      })
      .sort((a, b) => a._score - b._score)
      .slice(0, MAX_SUGGESTIONS);
  };

  // Past contacts search handler for emails
  const searchPastEmailHandler = (value: string) => {
    return pastContacts
      .filter((contact) => {
        const email = contact.emailAddress?.toLowerCase() || "";
        const name = contact.name?.toLowerCase() || "";
        const search = value.toLowerCase();
        return (
          (email.includes(search) || name.includes(search)) &&
          contact.emailAddress
        );
      })
      .map((contact) => {
        const email = contact.emailAddress?.toLowerCase() || "";
        const name = contact.name?.toLowerCase() || "";
        const search = value.toLowerCase();
        // Calculate match score: lower is better
        let score = 2;
        if (email === search) score = 0;
        else if (email.startsWith(search)) score = 1;
        else if (name.startsWith(search)) score = 1.5;
        else if (email.includes(search)) score = 2;
        else if (name.includes(search)) score = 2.5;
        return { ...contact, _score: score };
      })
      .sort((a, b) => a._score - b._score)
      .slice(0, MAX_SUGGESTIONS);
  };

  // Google contacts search handler for phone numbers
  const searchGooglePhoneHandler = (search: string) => {
    return googleContacts
      .filter((contact) => {
        const phone = (contact.phoneNumberWithCode || "").replace(/\D/g, "");
        const name = contact.name?.toLowerCase() || "";
        const searchTerm = search.toLowerCase();
        // Only suggest contacts with a phone number and some match
        return phone && (phone.includes(search) || name.includes(searchTerm));
      })
      .map((contact) => {
        const phone = (contact.phoneNumberWithCode || "").replace(/\D/g, "");
        const name = contact.name?.toLowerCase() || "";
        const searchTerm = search.toLowerCase();
        let score = 2;
        if (phone === search) score = 0;
        else if (phone.startsWith(search)) score = 1;
        else if (name.startsWith(searchTerm)) score = 1.5;
        return { ...contact, _score: score };
      })
      .sort((a, b) => a._score - b._score)
      .slice(0, MAX_SUGGESTIONS);
  };

  // Past contacts search handler for phone numbers
  const searchPastPhoneHandler = (search: string) => {
    return pastContacts
      .filter((contact) => {
        const phone = (contact.phoneNumberWithCode || "").replace(/\D/g, "");
        const name = contact.name?.toLowerCase() || "";
        const searchTerm = search.toLowerCase();
        return phone && (phone.includes(search) || name.includes(searchTerm));
      })
      .map((contact) => {
        const phone = (contact.phoneNumberWithCode || "").replace(/\D/g, "");
        const name = contact.name?.toLowerCase() || "";
        const searchTerm = search.toLowerCase();
        let score = 2;
        if (phone === search) score = 0;
        else if (phone.startsWith(search)) score = 1;
        else if (name.startsWith(searchTerm)) score = 1.5;
        return { ...contact, _score: score };
      })
      .sort((a, b) => a._score - b._score)
      .slice(0, MAX_SUGGESTIONS);
  };

  const onChangeEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    formik.setFieldValue("email", value);

    if (!user?.id || !value.trim()) {
      setEmailSuggestions([]);
      return;
    }

    let suggestions: Suggestion[] = [];
    const isEmailExists = googleContacts.find(
      (contact) => contact?.emailAddress
    );
    if (googleContacts.length > 0 && isEmailExists) {
      suggestions = searchGoogleEmailHandler(value);
    } else if (pastContacts.length > 0) {
      suggestions = searchPastEmailHandler(value);
    }
    setEmailSuggestions(suggestions);
  };

  const onChangePhone = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = sanitizeMobileNumber(e.target.value);
    formik.setFieldValue("mobile", value);

    if (!user?.id || !value.trim()) {
      setPhoneSuggestions([]);
      return;
    }

    let suggestions: Suggestion[] = [];
    const isPhoneExists = googleContacts.find(
      (contact) => contact?.phoneNumberWithCode
    );

    if (googleContacts.length > 0 && isPhoneExists) {
      suggestions = searchGooglePhoneHandler(value);
    } else if (pastContacts.length > 0) {
      suggestions = searchPastPhoneHandler(value);
    }
    setPhoneSuggestions(suggestions);
  };

  const onSelectEmail = (suggestion: Suggestion) => {
    if (suggestion.emailAddress) {
      formik.setFieldValue("email", suggestion.emailAddress);
      setEmailSuggestions([]);
    }
  };

  const onSelectPhone = (suggestion: Suggestion) => {
    if (suggestion.phoneNumberWithCode) {
      if (suggestion.phoneNumber) {
        formik.setFieldValue("mobile", suggestion.phoneNumber);
      } else {
        const [dialCode, mobile] = suggestion.phoneNumberWithCode
          .replace("+", "")
          .split("-");

        if (dialCode) {
          setCountryDetails({ dialCode, iso2: suggestion?.countryIso2 || "" });
        }
        formik.setFieldValue("mobile", mobile || "");
      }
      setPhoneSuggestions([]);
    }
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: { email: "", mobile: "" },
    validationSchema: getValidationSchema(recipients, countryDetails.dialCode),
    onSubmit: async (values) => {
      if (values.email) {
        const isEmailExist = recipients.find(
          (recipient) => recipient.email === values.email.trim()
        );

        if (isEmailExist) {
          formik.setErrors({ email: "Email address already added" });
          return;
        }
      }
      if (values.mobile) {
        const isMobileExist = recipients.find(
          (recipient) => recipient.mobile === values.mobile.trim()
        );

        if (isMobileExist) {
          formik.setErrors({ mobile: "Phone number already added" });
          return;
        }
      }
      const addRecipients = [];
      if (values.email) {
        const newRecipient = {
          email: values.email.trim(),
          mobile: "",
          countryCode: "",
          iso2: "",
        };
        addRecipients.push(newRecipient);
      }
      if (values.mobile) {
        const newRecipient = {
          email: "",
          mobile: values.mobile.trim(),
          countryCode: countryDetails.dialCode,
          countryIso2: countryDetails.iso2.toLowerCase(),
        };
        addRecipients.push(newRecipient);
      }
      const postData = {
        ...formData,
        recipients: [...recipients, ...addRecipients],
      };
      if (user) {
        handleSendKudo(postData);
      } else {
        setFormData(postData);
        setOpenNotLoggedIn(true);
      }
    },
  });

  const handleSendKudo = async (
    postData: any,
    isSendAnyway: boolean = false
  ) => {
    setLoading(true);
    try {
      const kudoFormData = new FormData();
      kudoFormData.append("message", postData.message);
      // Handle file URL based on file type
      if (postData.fileType === "pick") {
        if (!postData.file_url) {
          throw new Error("Missing file URL for picked kudo");
        }
        kudoFormData.append("file_url", postData.file_url);
      } else if (postData.fileType === "upload") {
        if (postData.file instanceof File) {
          kudoFormData.append("file", postData.file);
        } else if (postData.previewUrl && postData.fileName) {
          const reconstructedFile = await base64ToFile(
            postData.previewUrl,
            postData.fileName
          );
          kudoFormData.append("file", reconstructedFile);
        } else {
          throw new Error("Missing file data for upload");
        }
      } else {
        throw new Error("Invalid file type");
      }

      kudoFormData.append("fileType", postData.fileType);
      kudoFormData.append("fileName", postData.fileName || "");
      kudoFormData.append(
        "recipients",
        JSON.stringify(postData.recipients || [])
      );
      kudoFormData.append("isSendAnyway", isSendAnyway.toString());

      await sendKudo(kudoFormData);

      setFormData({ ...formData, isKudoSent: true });
      formik.resetForm();
      setRecipients([]);
      setOpenPostSuccess(true);
      setConfirmKudoSend(false);
    } catch (error: any) {
      if (
        error.message &&
        error.message.includes("already sent this kudo recently")
      ) {
        setFormData(postData);
        setConfirmKudoSend(true);
        return;
      }
      toast.error(error?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const getGoogleContactsHandler = async () => {
    if (!user) return;
    try {
      const { contacts, access_token, expired_at } = await getGoogleContacts(
        user.googleAuth
      );
      if (
        user.googleAuth?.access_token &&
        user.googleAuth.access_token !== access_token
      ) {
        setUser({
          ...user,
          googleAuth: { ...user.googleAuth, access_token, expired_at },
        });
      }
      setGoogleContacts(contacts?.length ? contacts : []);
    } catch (error) {
      console.log(error, "error");
    }
  };

  useEffect(() => {
    const {
      message,
      recipients,
      file,
      file_url,
      previewUrl,
      fileName,
      isDirectKudo,
    } = formData || {};

    // Check for valid kudo data - either file object, file_url, or previewUrl for processed images
    const hasValidFile = file || file_url || (previewUrl && fileName);

    if (user && recipients?.length && message && hasValidFile && isDirectKudo) {
      handleSendKudo(formData);
    }

    if (user && user?.googleAuth) {
      getGoogleContactsHandler();
    }

    return () => {
      setOpenPostSuccess(false);
      setOpenNotLoggedIn(false);
      if (formData.isKudoSent) {
        setFormData(initialKudo);
      }
    };
  }, [user?.id]);

  const handleAddEmail = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const { email } = formik.values;
    if (event.key === "Enter" && email.trim()) {
      event.preventDefault();
      if (!emailRegex.test(email.trim())) {
        formik.setErrors({ email: "Invalid email address" });
        return;
      }

      const isEmailExist = recipients.find(
        (recipient) => recipient.email === email.trim()
      );

      if (isEmailExist) {
        formik.setErrors({ email: "Email address already added!" });
        return;
      }
      const newRecipient = {
        email: email.trim(),
        mobile: "",
        countryCode: "",
        iso2: "",
      };
      setRecipients([...recipients, newRecipient]);
      formik.setFieldValue("email", "");
      setEmailSuggestions([]);
    }
  };

  const handleAddPhone = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const { mobile } = formik.values;
    if (event.key === "Enter" && mobile.trim()) {
      event.preventDefault();
      const phoneNumber = parsePhoneNumberFromString(
        `+${countryDetails.dialCode}${mobile.trim()}`
      );
      if (!phoneNumber?.isValid()) {
        formik.setErrors({ mobile: "Invalid phone number with country code" });
        return;
      }
      const isMobileExist = recipients.find(
        (recipient) =>
          recipient.mobile === mobile.trim() &&
          recipient.countryCode === countryDetails.dialCode
      );

      if (isMobileExist) {
        formik.setErrors({ mobile: "Phone number already added" });
        return;
      }
      const newRecipient = {
        email: "",
        mobile: mobile.trim(),
        countryCode: countryDetails.dialCode,
        countryIso2: countryDetails.iso2.toLowerCase(),
      };
      setRecipients([...recipients, newRecipient]);
      formik.setFieldValue("mobile", "");
      setPhoneSuggestions([]);
    }
  };

  const handleRemoveRecipient = (index: number) => {
    const newRecipients = recipients.filter((_, i) => i !== index);
    setRecipients(newRecipients);
    formik.setFieldValue("recipients", newRecipients);
  };

  useEffect(() => {
    setHasMounted(true);
  }, []);

  return {
    formik,
    isLoading,
    isOpenPostSuccess,
    setOpenPostSuccess,
    recipients,
    handleAddEmail,
    handleAddPhone,
    handleRemoveRecipient,
    formData,
    goBackHandler: () => router.push("/kudo/library"),
    goHomeHandler: () => router.push("/"),
    isOpenNotLoggedIn,
    setOpenNotLoggedIn,
    t,
    hasMounted,
    googleContacts,
    emailSuggestions,
    phoneSuggestions,
    onSelectEmail,
    onSelectPhone,
    onChangePhone,
    onChangeEmail,
    isConfirmKudoSend,
    setConfirmKudoSend,
    onConfirm: () => handleSendKudo(formData, true),
  };
}
