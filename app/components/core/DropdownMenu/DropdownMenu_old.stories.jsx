import { FileX, CaretDown } from "phosphor-react";
import React, { useState } from "react";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
} from "./DropdownMenu";

export default {
  title: "Components/DropdownMenu",
  component: DropdownMenu,
  args: {
    variant: "primary",
  },
};

export const Playground = (args) => {
  const [color, setColor] = useState("blue");
  const [checked, setChecked] = useState(true);

  return (
    <DropdownMenu open>
      <DropdownMenuTrigger>DropdownMenu trigger</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Item</DropdownMenuItem>
        <DropdownMenuItem>Item</DropdownMenuItem>
        <DropdownMenuLabel>Label</DropdownMenuLabel>
        <DropdownMenuGroup>Group</DropdownMenuGroup>
        <DropdownMenuCheckboxItem
          checked={checked}
          onCheckedChange={setChecked}
        >
          CheckboxItem
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator></DropdownMenuSeparator>
        <DropdownMenuRadioGroup value={color} onValueChange={setColor}>
          <DropdownMenuRadioItem value="red">RadioItem</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="blue">RadioItem</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
