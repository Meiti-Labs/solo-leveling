import * as React from "react";
import { ShineBorder } from "./shine-border";

export interface IBoxProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export default function Box(props: IBoxProps) {
    
  return (
    <div {...props} className={`relative bg-[#2d1d46]/10 ${props.className} `}>
      <ShineBorder shineColor={"White"} borderWidth={1} />
      {props.children}
    </div>
  );
}
