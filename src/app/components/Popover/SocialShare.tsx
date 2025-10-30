"use client";
import {
  FacebookShareButton,
  LinkedinShareButton,
  TelegramShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  FacebookIcon,
  TelegramIcon,
  TwitterIcon,
  WhatsappIcon,
  LinkedinIcon,
} from "react-share";

interface Props {
  URL: string;
  shareMessage?: string;
  open: boolean;
  onShareOnSocial: any;
}

export default function SocialSharePopover({
  URL,
  shareMessage = "",
  open,
  onShareOnSocial,
}: Props) {
  if (!open) return null;
  return (
    <div className="absolute top-full right-0 mt-2 bg-white border-1 border-gray-400 rounded-lg shadow-lg p-3 z-50 flex gap-3">
      <FacebookShareButton
        url={URL}
        title={shareMessage}
        onClick={onShareOnSocial}
      >
        <FacebookIcon size={32} round />
      </FacebookShareButton>
      <TwitterShareButton
        url={URL}
        title={shareMessage}
        onClick={onShareOnSocial}
      >
        <TwitterIcon size={32} round />
      </TwitterShareButton>
      <WhatsappShareButton
        url={URL}
        title={shareMessage}
        onClick={onShareOnSocial}
      >
        <WhatsappIcon size={32} round />
      </WhatsappShareButton>
      <LinkedinShareButton
        url={URL}
        title={shareMessage}
        onClick={onShareOnSocial}
      >
        <LinkedinIcon size={32} round />
      </LinkedinShareButton>
      <TelegramShareButton
        url={URL}
        title={shareMessage}
        onClick={onShareOnSocial}
      >
        <TelegramIcon size={32} round />
      </TelegramShareButton>
    </div>
  );
}