import React from "react";
// import Button from "../button/Button.jsx";
import { MenuButton } from "./DropdownMenu";
import { Item } from "@react-stately/collections";

export default {
  title: "Components/DropdownMenu",
  // component: Button,
};

export const Playground = () => {
  let [open, setOpen] = React.useState(false);

  return (
    // <MenuButton label="hello" isOpen={open} onOpenChange={setOpen}>
    //   <Item hasChildItems>
    //     <a href="/" target="_blank">
    //       Item 1
    //     </a>
    //   </Item>
    //   <Item href="/">Item 2</Item>
    // </MenuButton>
    <MenuButton
      isOpen={"true"}
      onOpenChange={setOpen}
      label="Actions"
      onAction={(key) => {
        alert(key);
      }}
    >
      <Item key="copy">Copy</Item>
      <Item key="cut">Cut</Item>
      <Item key="paste">Paste</Item>
      <Item key="view" href="https://google.com">
        View
      </Item>
    </MenuButton>
  );
};

// figure out how to pass href to item
