"use client";
import Image from "next/image";

interface Props {
  src: string;
  width?: number;
  height?: number;
  className?: string;
  alt?: string;
}

// const imageLoader = ({ src }: { src: string }) => {
//   return src;
// };
// loader={imageLoader}
export default function ExternalImage({ src,alt = "Image", ...props }: Props) {
  return <Image src={src} alt={alt} unoptimized {...props} />;
}
