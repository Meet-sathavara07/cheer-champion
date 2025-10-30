"use client";
import { useEffect, useState, FC } from "react";
import TermsConsentModal from "./TermsConsentModal";
import { useUserContext } from "@/app/context/UserContext";
import {
  shouldShowConsentModal,
  updateConsent,
} from "@/app/utils/consentUtils";

const ConsentModalManager: FC = () => {
  const { user, loading } = useUserContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasCheckedDB, setHasCheckedDB] = useState(false);

  const checkConsentStatus = async () => {
    if (!user?.id || loading) return;

    try {
      setIsLoading(true);
      const showModal = await shouldShowConsentModal(user.id);
      setIsModalOpen(showModal);
      setHasCheckedDB(true);
    } catch (error) {
      setIsModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkConsentStatus();

    // Set up an interval to periodically check consent status
    const intervalId = setInterval(() => {
      checkConsentStatus();
    }, 600000); // Check every 10 minutes

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, [user, loading]);

  const handleAccept = async (status: string) => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      await updateConsent(user.id, status, false);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error handling consent:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || !user?.id) {
    return null;
  }

  return (
    <TermsConsentModal
      isOpen={isModalOpen}
      onClose={() => handleAccept("pending")}
      onAccept={handleAccept}
      isLoading={isLoading}
    />
  );
};

export default ConsentModalManager;
