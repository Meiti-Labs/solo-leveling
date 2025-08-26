import * as React from "react";
import Box from "../ui/box";
import { Icon } from "@iconify/react";
import Link from "next/link";


<Icon icon="mdi-light:home" />;

const menu = [
  {
    route: "/",
    Icon: "iconamoon:home-fill",
  },
  {
    route: "/task",
    Icon: "iconamoon:lightning-1-fill",
  },
  {
    route: "/create",
    Icon: "gridicons:add",
  },
  {
    route: "/achievments",
    Icon: "bxs:trophy",
  },
  {
    route: "/settings",
    Icon: "material-symbols-light:settings",
  },
];

export default function Footer() {
  return (
    <div className="h-18 flex justify-center items-center">
      <Box className="w-auto p-1 h-12 flex ">
        {menu.map((item, index) => (
          <Link
          key={index}
            href={item.route}
            className="p-2 h-full w-12 bg-white/10 flex justify-center items-center text-purple-500"
          >
            <Icon icon={item.Icon} fontSize={26} />
          </Link>
        ))}
      </Box>
    </div>
  );
}
