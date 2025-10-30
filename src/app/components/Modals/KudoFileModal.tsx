"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import BackgroundLayer from "@/assets/layouts/background-layer.svg";
import KudoCard from "@/app/components/Cards/KudoCard";
import HorizontalKudoCard from "../Cards/HorizontalKudoCard";

interface KudoFileModalProps {
  kudo: any;
  onClose: () => void;
}


const KudoFileModal: React.FC<KudoFileModalProps> = ({ kudo, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check screen size on mount and resize
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint (1024px)
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50 animate-fadeIn">
      <div
        className={`${
          isMobile ? "w-full max-w-[70vw]" : "w-full max-w-[60vw]"
        }`}
      >
        <Image
          className={`absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none ${
            isMobile ? "opacity-30" : "opacity-20"
          }`}
          src={BackgroundLayer}
          alt="Background Layer"
        />

        <div
          ref={modalRef}
          className={`relative bg-white rounded-2xl shadow-xl z-20 `}
        >
          {/* Conditional Rendering based on screen size */}
          {isMobile ? (
            <KudoCard
              kudo={kudo}
              onDeleteSuccess={() => onClose()}
              className="border-none"
            />
          ) : (
            <HorizontalKudoCard kudo={kudo} onDeleteSuccess={() => onClose()} />
          )}
        </div>
      </div>
    </div>
  );
};

export default KudoFileModal;
