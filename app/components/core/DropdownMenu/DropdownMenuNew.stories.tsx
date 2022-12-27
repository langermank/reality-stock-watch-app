import React from "react";
// import Button from "../button/Button.jsx";
import { MenuButton } from "./DropdownMenuNew.jsx";
import { Item } from "@react-stately/collections";

export default {
  title: "Components/DropdownMenuNew",
  // component: Button,
};

export const Playground = () => {
  let [open, setOpen] = React.useState(false);

  return (
    <MenuButton label="hello" isOpen={open} onOpenChange={setOpen}>
      <Item href="/">Item 1</Item>
      <Item href="/">Item 2</Item>
    </MenuButton>
  );
};
