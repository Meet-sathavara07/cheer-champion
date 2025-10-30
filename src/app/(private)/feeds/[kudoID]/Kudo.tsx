"use client";
import React, { useEffect, useRef, useState } from "react";
import FullLayout from "@/assets/layouts/full-bottom-layout.svg";
import DarkBackground from "@/assets/dark-background.svg";
import Image from "next/image";
import VerticalKudoCard from "@/app/components/Cards/VerticalKudoCard";
import HorizontalKudoCard from "@/app/components/Cards/HorizontalKudoCard";
import Button from "@/app/components/Button";
import { useUserContext } from "@/app/context/UserContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Loader from "@/app/components/Loader";
import { useTranslation } from "react-i18next";
import * as Sentry from "@sentry/nextjs";
import axios from "axios";

export interface Kudo {
  id: string;
  kudo?: string; // Optional to prevent missing property errors
  $users: any[]; // Optional array
  kudo_receiver?: any[];
  createdAt?: string;
  kudo_likes?: any[];
}

export default function Kudo({
  params,
}: {
  params: Promise<{ kudoID: string }>;
}) {
  const [kudo, setKudo] = useState<Kudo | null>(null);
  const { user } = useUserContext();
  const router = useRouter();
  const [isLoading, setLoading] = useState(false);
  const { t } = useTranslation();
  const [isMobile, setIsMobile] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") router.push("/feeds");
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        router.push("/feeds");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [router]);

  const getKudoHandler = async () => {
    setLoading(true);
    try {
      const { kudoID } = await params;
      const response = await axios.get(
        `/api/kudo/details?id=${kudoID}`
      );
      const result = response.data;
      if (
        response.status === 200 
      ) {
        setKudo(result.kudo);
      } else {
        toast.error(result.message || "Kudo not found");
      }
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        toast.error("This kudo has been deleted or does not exist.");
      } else {
        Sentry.captureException(error);
        console.error("Error fetching kudo:", error);
        toast.error("Failed to fetch kudo. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getKudoHandler();
  }, []);

  return (
    <div className="relative">
      <div className="h-[129px]" />
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
          
          {/* Content with proper padding from header */}
          <div className="absolute inset-0 flex flex-col items-center pt-4 pb-8 px-4 overflow-y-auto">
            <div 
              ref={modalRef}
              className="flex flex-col items-center w-full"
            >
              {/* Kudo card container */}
              <div className={`w-full ${
                isMobile ? "max-w-[90vw]" : "max-w-[60vw]"
              } bg-white rounded-md shadow-xl overflow-hidden mb-6`}>
                {isLoading ? (
                  <div className="h-64 flex items-center justify-center">
                    <Loader className="h-14 w-14 !border-primary border-t-3 border-b-3" />
                  </div>
                ) : kudo ? (
                  <>
                    {isMobile ? (
                      <VerticalKudoCard kudo={kudo} />
                    ) : (
                      <HorizontalKudoCard kudo={kudo} />
                    )}
                  </>
                ) : null}
              </div>
              
              {/* Buttons positioned after the card */}
              <div className="flex justify-center gap-4">
                {user ? (
                  <>
                    <Button
                      onClick={() => router.push("/feeds")}
                      className="bg-white hover:bg-white border-1 border-secondary hover:border-[#3886CB] !text-secondary-dark"
                    >
                      {t("general.goToFeed")}
                    </Button>
                    <Button onClick={() => router.push("/")}>
                      {t("general.sendKudos")}
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => router.push("/login")}>
                    {t("kudoDetails.loginSignup")}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}