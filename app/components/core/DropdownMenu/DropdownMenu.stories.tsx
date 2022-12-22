import { FileX, CaretDown } from "phosphor-react";
import React, { useState } from "react";
import type { ComponentMeta, ComponentStory } from "@storybook/react";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuLinkItem,
} from "./DropdownMenu";

export default {
  title: "Components/DropdownMenu",
  component: DropdownMenu,
  args: {
    variant: "primary",
  },
};

export const Playground: ComponentStory<typeof DropdownMenu> = (args) => {
  const [color, setColor] = useState("blue");
  const [checked, setChecked] = useState(true);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>DropdownMenu trigger</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLinkItem>Item</DropdownMenuLinkItem>
        <DropdownMenuItem>Item</DropdownMenuItem>
        <DropdownMenuLabel>Label</DropdownMenuLabel>
        <DropdownMenuGroup>Group</DropdownMenuGroup>
        <DropdownMenuSeparator></DropdownMenuSeparator>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
