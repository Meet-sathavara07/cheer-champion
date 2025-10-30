'use client';
import { useRouter } from 'next/navigation';
import BackIcon from "@/assets/icon/back-icon.svg";
import Image from "next/image";
export default function BackButton() {
  const router = useRouter();

  return (
    <button
    type="button"
    onClick={() => router.back()}
    className="btn h-[30px] w-[30px] lg:h-[40px] lg:w-[40px] flex justify-center items-center "
  >
    <Image
      src={BackIcon}
      alt="icon"
      className="h-[16px] w-[16px] lg:h-[20px] lg:w-[20px]"
      height={20}
      width={20}
    />
  </button>
  );
}