"use client";
import Image from "next/image";
import closeIcon from "@/assets/icon/modal-close.svg";

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
  open: boolean;
  setOpen: (open: boolean) => void;
  URL: string;
  title: string;
}

export default function SocialShareModal({ open, setOpen, URL, title }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-end justify-center bg-black/72 z-50">
      <div className="flex p-10 relative flex-col items-center w-full max-w-md lg:max-w-lg bg-white rounded-lg shadow-lg mb-10">
        <button className="btn p-2 absolute top-2 right-2" onClick={() => setOpen(false)}>
          <Image
            className=""
            src={closeIcon}
            alt="closeIcon"
            height={13}
            width={13}
          />
        </button>
        <div className="flex space-x-6   ">
          <FacebookShareButton url={URL} title={title}>
            <FacebookIcon size={32} round={true} />
          </FacebookShareButton>

          <TwitterShareButton url={URL} title={title}>
            <TwitterIcon size={32} round={true} />
          </TwitterShareButton>

          <WhatsappShareButton url={URL} title={title}>
            <WhatsappIcon size={32} round={true} />
          </WhatsappShareButton>

          <LinkedinShareButton url={URL} title={title}>
            <LinkedinIcon size={32} round={true} />
          </LinkedinShareButton>

          <TelegramShareButton url={URL} title={title}>
            <TelegramIcon size={32} round={true} />
          </TelegramShareButton>
        </div>
      </div>
    </div>
  );
}
