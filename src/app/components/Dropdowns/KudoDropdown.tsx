"use client";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import ResendIcon from "@/assets/icon/resend.svg";
import ShareIcon from "@/assets/icon/share-icon.svg";
import DeleteIcon from "@/assets/icon/delete.png";
import DropdownMenuIcon from "@/assets/icon/dropdown-menu.png";
import SendKudoIcon from "@/assets/icon/send-kudo.svg";
import { deleteKudo, generateMessageFromAI } from "@/app/models/kudoPostModel";
import toast from "react-hot-toast";
import { useUserContext } from "@/app/context/UserContext";
import { useTranslation } from "react-i18next";
import KudoDeleteConfirmModal from "../Modals/KudoDeleteConfirmModal";
import KudoShareModal from "../Modals/KudoShareModal";
import { useRouter } from "next/navigation";
import { usePostContext } from "@/app/context/KudoPostContext";
import { generateAIShareKudoContent } from "@/app/utils/generateKudoShareText";
import { useLanguage } from "@/app/context/LanguageContext";
import { getUserProfile } from "@/helpers/clientSide/profile";

// Define interfaces for props
interface User {
  id: string;
  email?: string;
  user_profile: {
    name: string;
    mobile1?: string;
    mobile1_country_code?: string;
    countryIso2?: string;
  };
}

interface KudoReceiver {
  $users: User[];
}

interface KudoDropdownProps {
  kudoID: string;
  onDeleteSuccess?: (kudoID: string) => void;
  title: string;
  kudoReceivers?: KudoReceiver[];
  currentKudoSender?: User;
  onSendKudo?: (recipients: any[]) => void;
  kudoMessage?: string;
  kudoFileUrl?: string;
  isCurrentUserSent?: any;
  isCurrentUserReceived?: any;
}

const KudoDropdown: React.FC<KudoDropdownProps> = ({
  kudoID,
  onDeleteSuccess,
  title,
  kudoReceivers = [],
  currentKudoSender,
  onSendKudo,
  kudoMessage = "",
  kudoFileUrl = "",
  isCurrentUserSent = false,
  isCurrentUserReceived = false,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [isGeneratingMessage, setGeneratingMessage] = useState(false);
  const [isKudoDeleteOpen, setKudoDeleteOpen] = useState(false);
  const [isShareModalOpen, setKudoShareOpen] = useState(false);
  const [aiGeneratedMessage, setAIGeneratedMessage] = useState("");
    const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user } = useUserContext();
  const { t } = useTranslation();
  const router = useRouter();
  const { formData, setFormData, initialKudo, isDirectKudo }: any =
    usePostContext();
  const { selectedLanguage } = useLanguage();

    useEffect(() => {
      async function fetchProfile() {
        if (user?.id) {
          const profile = await getUserProfile(user.id);
          setCurrentUserProfile(profile);
        }
      }
      fetchProfile();
    }, [user?.id]);
  
    const isAdmin = currentUserProfile?.role === "admin";

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const deleteKudoHandler = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const message = await deleteKudo(kudoID);
      setKudoDeleteOpen(false);
      setDropdownOpen(false);
      if (onDeleteSuccess) {
        onDeleteSuccess(kudoID);
      }
      toast.success(message);
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const onDeleteKudoCancel = () => {
    setKudoDeleteOpen(false);
  };

  const onShareModalClose = () => {
    setKudoShareOpen(false);
    setGeneratingMessage(false); // Reset generating state on close
  };

  // Get recipients for sending kudo (exclude current user)
  const getKudoRecipients = () => {
    const allUsers = [...kudoReceivers];

    if (currentKudoSender && currentKudoSender.id !== user?.id) {
      allUsers.push({ $users: [currentKudoSender] });
    }

    return allUsers.filter((recipient) => recipient.$users?.[0]?.id !== user?.id);
  };

  // Generate display text for send kudo option
  const getSendKudoText = () => {
    const recipients = getKudoRecipients();

    if (recipients.length === 0) return "";

    if (recipients.length === 1) {
      const recipientName = recipients[0].$users?.[0]?.user_profile?.name;
      return `${t("kudoDropdown.sendKudos")} to ${recipientName}`;
    } else {
      return t("kudoDropdown.sendKudostogroup");
    }
  };

  const handleSendKudo = () => {
    const recipients = getKudoRecipients();
    if (recipients.length > 0) {
      const formattedRecipients = recipients.map((recipient) => {
        const user = recipient.$users[0];
        const hasEmail = user.email;

        return {
          email: hasEmail ? user.email : "",
          mobile: !hasEmail ? user.user_profile.mobile1 || "" : "",
          countryCode: !hasEmail ? user.user_profile.mobile1_country_code || "" : "",
          countryIso2: !hasEmail ? user.user_profile.countryIso2 || "" : "",
        };
      });

      setFormData({
        ...initialKudo,
        recipients: formattedRecipients,
        isDirectKudo,
      });
      setDropdownOpen(false);
      router.push("/");
    }
  };

  const handleResendKudo = () => {
    setFormData({
      ...initialKudo,
      message: kudoMessage,
      file_url: kudoFileUrl,
      isDirectKudo: false,
    });
    setDropdownOpen(false);
    router.push("/kudo/recipients");
  };

  const handleShareClick = async () => {
    if (isLoading) return;
    try {
      setLoading(true);
      setGeneratingMessage(true); // Set generating state
      setKudoShareOpen(true);
      const senderName = currentKudoSender?.user_profile?.name || "Anonymous";
      const receiverName = getReceiverName();
      const message = await generateMessageFromAI(generateAIShareKudoContent(senderName, receiverName, kudoMessage, selectedLanguage));
      console.log("Generated Share Message:", message);
      setAIGeneratedMessage(message);
      setDropdownOpen(false);
    } catch (error: any) {
      console.error("Error generating share content:", error);
      toast.error("Failed to generate share message");
    } finally {
      setLoading(false);
      setGeneratingMessage(false); // Reset generating state
    }
  };

  const getReceiverName = () => {
    if (kudoReceivers.length === 1) {
      return kudoReceivers[0]?.$users?.[0]?.user_profile?.name || "";
    } else if (kudoReceivers.length > 1) {
      return kudoReceivers
        .map((r) => r.$users?.[0]?.user_profile?.name)
        .filter(Boolean)
        .join(", ");
    }
    return "";
  };

  const sendKudoText = getSendKudoText();
  const showSendKudoOption = sendKudoText && getKudoRecipients().length > 0;

  return (
    <>
      <KudoDeleteConfirmModal
        isOpen={isKudoDeleteOpen}
        onClose={onDeleteKudoCancel}
        onConfirm={deleteKudoHandler}
        isLoading={isLoading}
      />

      <KudoShareModal
        isOpen={isShareModalOpen}
        onClose={onShareModalClose}
        shareMessage={aiGeneratedMessage}
        shareUrl={`${process.env.NEXT_PUBLIC_BASE_URL}/feeds/${kudoID}`}
        isGeneratingMessage={isGeneratingMessage} // Pass new prop
      />

      <div className="relative" ref={dropdownRef}>
        <button
          className="rounded-full font-semibold font-libre text-xs btn p-1"
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          <Image
            src={DropdownMenuIcon}
            alt="DropdownMenuIcon"
            className="h-[14px] w-[14px] min-w-14px lg:h-[18px] lg:w-[18px] lg:min-w-[18px]"
          />
        </button>
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-36 lg:w-48 bg-white rounded-md shadow-lg z-50">
            <ul className="py-1">
              {showSendKudoOption && (
                <li>
                  <button
                    className="flex items-center rounded-full btn p-2 w-full"
                    onClick={handleSendKudo}
                  >
                    <Image
                      src={SendKudoIcon}
                      alt="SendKudoIcon"
                      className="h-[14px] w-[14px] lg:h-[18px] lg:w-[18px] mr-2"
                    />
                    <span className="font-semibold font-libre text-xs text-left">
                      {sendKudoText}
                    </span>
                  </button>
                </li>
              )}
              <li>
                <button
                  className="flex items-center rounded-full btn p-2 w-full"
                  onClick={handleResendKudo}
                >
                  <Image
                    src={ResendIcon}
                    alt="ResendKudoIcon"
                    className="h-[14px] w-[14px] lg:h-[18px] lg:w-[18px] mr-2"
                  />
                  <span className="font-semibold font-libre text-xs text-left">
                    {t("kudoDropdown.resendKudos")}
                  </span>
                </button>
              </li>
              <li>
                <button
                  className="flex items-center rounded-full btn p-2 w-full"
                  onClick={handleShareClick}
                >
                  <Image
                    src={ShareIcon}
                    alt="ShareIcon"
                    className="h-[14px] w-[14px] lg:h-[18px] lg:w-[18px] mr-2"
                  />
                  <span className="font-semibold font-libre text-xs">
                    {t("kudoDropdown.share")}
                  </span>
                </button>
              </li>
              {(isCurrentUserSent || isCurrentUserReceived || isAdmin) && (
                <li>
                  <button
                    className="flex items-center justify-start rounded-full btn p-2 w-full"
                    onClick={() => {
                      setDropdownOpen(false);
                      setKudoDeleteOpen(true);
                    }}
                  >
                    <Image
                      src={DeleteIcon}
                      alt="DeleteIcon"
                      className="h-[14px] w-[14px] lg:h-[18px] lg:w-[18px] mr-2"
                    />
                    <span className="font-semibold font-libre text-xs">
                      {t("kudoDropdown.delete")}
                    </span>
                  </button>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </>
  );
};

export default KudoDropdown;