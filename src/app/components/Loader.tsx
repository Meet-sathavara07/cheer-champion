import React from "react";
interface Props {
    className?:string;
}
const Loader = ({ className = "" }: Props) => {
  return (
    <div
      className={`animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mx-auto ${className}`}
    />
  );
};

export default Loader;
