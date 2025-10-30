"use client";
import moment from "moment";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import ProfilePlaceholderImage from "@/assets/defaultProfile.png";
import HeartFilledIcon from "@/assets/icon/heart-fill.svg";
import HeartOutlineIcon from "@/assets/icon/heart-outline.svg";
import ExternalImage from "../ExternalImage";
import { useUserContext } from "@/app/context/UserContext";
import Link from "next/link";
import { useInstantDB } from "@/app/context/InstantProvider";
import { id } from "@instantdb/react";
import KudoDropdown from "../Dropdowns/KudoDropdown";
import { useTranslation } from "react-i18next";
import Loader from "../Loader";
import toast from "react-hot-toast";
import { likeKudo } from "@/app/models/kudoPostModel";

interface KudoCardProps {
  kudo: any;
  onDeleteSuccess?: () => void;
  onSendKudo?: (recipients: any[]) => void;
}

export default function KudoCard({
  kudo,
  onDeleteSuccess,
  onSendKudo,
}: KudoCardProps) {
  const { user } = useUserContext();
  const { t } = useTranslation();
  const db = useInstantDB();
  const [isLoading, setLoading] = useState(false);
  const userProfile = kudo.$users[0] || {};



  const likeKudoHandler = async (kudoId: string, createdAt: string) => {
    if (!user) return;
    setLoading(true);
    try {
      const message = await likeKudo(kudoId, createdAt);
      toast.success(message);
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  async function createKudoLike(db: any, kudoId: string, userId: string) {
    const createdAt = moment.utc().toISOString();
    db.transact([
      db.tx.kudo_likes[id()]
        .update({ created_at: createdAt })
        .link({ $users: userId, kudos: kudoId }),
    ]);
    likeKudoHandler(kudoId, createdAt);
  }

  // Like state logic
  const fetchLike = (kudo.kudo_likes || []).find(
    (like: any) => like.$users?.id === user?.id
  );
  const { data: likeQueryData } = db.useQuery(
    user?.id && kudo?.id
      ? { kudo_likes: { $: { where: { $users: user.id, kudos: kudo.id } } } }
      : null
  );
  const liveLike = likeQueryData?.kudo_likes?.[0];
  const hasLiked = !!(liveLike || fetchLike);
  const likeId = liveLike?.id || fetchLike?.id || null;

  // Real like count
  const { data: allLikesData, isLoading: isLikesLoading } = db.useQuery(
    kudo?.id ? { kudo_likes: { $: { where: { kudos: kudo.id } } } } : null
  );
  const realLikeCount = allLikesData?.kudo_likes?.length ?? 0;

  const [isProcessing, setIsProcessing] = useState(false);

  const handleLikeToggle = async () => {
    if (!user?.id || isProcessing) return;
    setIsProcessing(true);
    try {
      if (!hasLiked) {
        await createKudoLike(db, kudo.id, user.id);
      } else if (likeId) {
        await db.transact([db.tx.kudo_likes[likeId].delete()]);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const receivers = (receivers: any[]) => {
    return receivers
      .map((receiver) => receiver.$users[0]?.user_profile?.name || "Unknown")
      .join(", ");
  };

  const isCurrentUserSent = user?.id && user.id === kudo.$users[0]?.id;
  const isCurrentUserReceived = kudo.kudo_receiver.find(
    (receiver: any) => user?.id && receiver.$users[0]?.id === user.id
  );
  const profileImage = userProfile.user_profile?.$files?.url
    ? userProfile.user_profile.$files.url
    : ProfilePlaceholderImage;

  const LinkComponent = ({ href, children, className }: any) => (
    <Link
      className={`text-sm text-600 font-bold font-comfortaa hover:text-400 ${className}`}
      href={href}
    >
      {children}
    </Link>
  );

  const handleSendKudo = (recipients: any[]) => {
    if (onSendKudo) {
      onSendKudo(recipients);
    }
  };

  return (
    <div className="bg-white rounded-md shadow-lg p-4 flex lg:flex-row flex-col gap-4 w-full">
      {/* Image Section - Now with height matching content */}
      {kudo.file_url ? (
        <div className="lg:w-1/2 w-full flex-shrink-0 flex">
          <ExternalImage
            src={kudo.file_url}
            width={200}
            height={250}
            className="w-full h-auto max-h-[400px] object-contain rounded-lg self-stretch"
            alt="Kudo Image"
          />
        </div>
      ) : (
        <div className="lg:w-1/2 w-full flex-shrink-0 flex items-center justify-center bg-gray-100 rounded-lg min-h-[250px] lg:min-h-[400px]">
          <span className="text-gray-400 text-sm font-comfortaa">
            No Image Available
          </span>
        </div>
      )}

      {/* Content Section */}
      <div className="lg:w-1/2 w-full flex flex-col">
        {/* Header with Profile and Dropdown */}
        <div className="flex items-center justify-between ">
          <div className="flex items-center gap-2">
            <Link
              href={`/profile/${userProfile.id}`}
              className={`flex items-center justify-center rounded-full p-[2px] overflow-hidden w-8 h-8 md:w-12 md:h-12 ${
                isCurrentUserSent ? "bg-[#F0C047]" : "bg-[#FF9543]"
              }`}
            >
              <Image
                src={profileImage}
                alt="profile"
                width={48} // Match largest possible size (md:w-12 = 48px)
                height={48}
                className="w-full h-full object-cover rounded-full" // Fill container completely
                onError={(error) => console.log(error)}
              />
            </Link>
            <div>
              <div className="text-sm text-gray-600 font-bold font-comfortaa">
                {isCurrentUserSent ? (
                  <LinkComponent href={`/profile/${user?.id}`}>
                    {t("kudoCard.you")}
                  </LinkComponent>
                ) : (
                  <LinkComponent href={`/profile/${userProfile.id}`}>
                    {userProfile.user_profile?.name || "Unknown"}
                  </LinkComponent>
                )}
                <span className="text-sm text-gray-400 font-bold font-comfortaa ml-1">
                  {t("kudoCard.to")}
                </span>
              </div>
              <div className="text-sm text-gray-400 font-comfortaa">
                {kudo.kudo_receiver.map((receiver: any, index: number) => (
                  <LinkComponent
                    className="!text-gray-400"
                    key={receiver.$users[0]?.id}
                    href={`/profile/${receiver.$users[0]?.id || ""}`}
                  >
                    {receiver.$users[0]?.id === user?.id
                      ? t("kudoCard.you")
                      : receiver.$users[0]?.user_profile?.name || "Unknown"}
                    {kudo.kudo_receiver.length - 1 === index ? "" : ", "}
                  </LinkComponent>
                ))}
              </div>
            </div>
          </div>
          <KudoDropdown
            kudoID={kudo.id}
            onDeleteSuccess={onDeleteSuccess}
            title={`Check out ${
              userProfile.user_profile?.name
            }'s sent kudo to ${receivers(
              kudo.kudo_receiver
            )} on Cheer Champion!`}
            kudoReceivers={kudo.kudo_receiver}
            currentKudoSender={userProfile}
            onSendKudo={handleSendKudo}
            kudoMessage={kudo.kudo}
            kudoFileUrl={kudo.file_url}
            isCurrentUserSent={isCurrentUserSent}
            isCurrentUserReceived={isCurrentUserReceived}
          />
        </div>

        {/* Kudo Message */}
        <div className="p-2 mt-2 bg-[#F3F1EE] border border-[#F4F3EF] rounded-md font-libre font-normal text-600 text-sm whitespace-pre-wrap break-words flex-grow max-h-[400px] overflow-y-auto">
          {kudo.kudo}
        </div>

        {/* Footer with Likes and Timestamp */}
        <div className="flex mt-1 justify-between items-center ">
          {isLikesLoading ? (
            <Loader className="h-4 w-4 !border-gray-400 !border-2 !border-t-gray-300 !border-b-gray-300" />
          ) : (
            <div className="flex items-center gap-2">
              <button
                className="p-1 focus:outline-none font-medium font-libre relative"
                onClick={handleLikeToggle}
                aria-label={hasLiked ? "Unlike" : "Like"}
                type="button"
                disabled={isProcessing || isLoading}
              >
                <Image
                  src={hasLiked ? HeartFilledIcon : HeartOutlineIcon}
                  alt={hasLiked ? "Liked" : "Like"}
                  className={`cursor-pointer h-4 w-4 md:h-5 md:w-5 transition-all duration-300 ${
                    hasLiked ? "opacity-100 scale-110" : "opacity-100 scale-100"
                  }`}
                />
              </button>
              <span className="text-sm">{realLikeCount}</span>
            </div>
          )}
          <span className="font-libre font-normal text-xs text-gray-400">
            {moment(kudo.created_at).fromNow()}
          </span>
        </div>
      </div>
    </div>
  );
}
