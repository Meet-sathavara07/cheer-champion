import React from "react";
import Loader from "./Loader";

export default function Button({
  type = "button",
  children,
  className = "",
  onClick = () => null,
  disabled = false,
  isLoading = false,
}: {
  children: React.ReactNode;
  type?: any;
  className?: string;
  onClick?: (e: any) => void;
  disabled?: boolean;
  isLoading?: boolean;
}) {
  return (
    <button
      disabled={disabled || isLoading}
      onClick={onClick}
      type={type}
      className={`btn min-w-[62px] text-sm font-inter font-normal  bg-secondary hover:bg-[#3886CB] text-white px-[15px] py-[6.5px] rounded-lg ${
        disabled ? "bg-[#A1A1A1] cursor-default" : ""
      } ${className}`}
    >
      {isLoading ? <Loader /> : children}
    </button>
  );
}
