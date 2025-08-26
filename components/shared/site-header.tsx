import * as React from "react";

export interface IHeaderProps {}

export default function Header(props: IHeaderProps) {
  return (
    <div className="w-full  bg-black">
      <div className="h-18 mb-auto  flex justify-center items-center">
        <span className="text-xl">SOLO LEVELING</span>
        {" "}
      </div>
    </div>
  );
}
