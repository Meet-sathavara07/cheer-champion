"use client";
import { useEffect, useState, FC } from "react";
import DownloadAppModal from "./DownloadAppModal";
import { useUserContext } from "@/app/context/UserContext";
import {
  setDownloadModalCookie,
  shouldShowDownloadModal,
} from "@/app/utils/downloadApp";

const DownloadAppModalManager: FC = () => {
  const { user, loading } = useUserContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const checkDownloadModalStatus = async () => {
    if (!user?.id || loading) return;

    try {
      setIsLoading(true);
      const showModal = await shouldShowDownloadModal();
      setIsModalOpen(showModal);
    } catch (error) {
      console.error("Error checking download modal status:", error);
      setIsModalOpen(true); // Show modal on error as a fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkDownloadModalStatus();

    // Set up an interval to periodically check modal status
    const intervalId = setInterval(() => {
      checkDownloadModalStatus();
    }, 600000); // Check every 10 minutes

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, [user, loading]);
  const handleClose = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      await setDownloadModalCookie();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error setting download modal cookie:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || !user?.id) {
    return null;
  }

  return (
    <DownloadAppModal
      isOpen={isModalOpen}
      onClose={handleClose}
      isLoading={isLoading}
    />
  );
};

export default DownloadAppModalManager;
