import * as React from "react";
import Box from "../ui/box";
import { Icon } from "@iconify/react";
import Link from "next/link";
import {
  BxBxsTrophy,
  GridiconsAdd,
  IconamoonHomeFill,
  IconamoonLightning1Fill,
  IonSettings,
} from "../icons/icons";

<Icon icon="mdi-light:home" />;

const menu = [
  {
    route: "/",
    Icon: <IconamoonHomeFill fontSize={24}/>,
  },
  {
    route: "/task",
    Icon: <IconamoonLightning1Fill fontSize={24}/>,
  },
  {
    route: "/create",
    Icon: <GridiconsAdd fontSize={24}/>,
  },
  {
    route: "/achievments",
    Icon: <BxBxsTrophy fontSize={24}/>,
  },
  {
    route: "/settings",
    Icon: <IonSettings fontSize={24}/>,
  },
];

export default function Footer() {
  return (
    <div className="h-24 card-fade-top-black flex justify-center items-center fixed bottom-0 w-full">
      <Box className="w-auto p-1 h-12 flex ">
        {menu.map((item, index) => (
          <Link
            key={index}
            href={item.route}
            className="p-2 h-full w-12 bg-white/10 flex justify-center items-center text-purple-500"
          >
            {
              item.Icon
            }
          </Link>
        ))}
      </Box>
    </div>
  );
}
