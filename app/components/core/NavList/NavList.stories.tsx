import React from "react";
import type { ComponentMeta, ComponentStory } from "@storybook/react";
import { MenuNavLink } from "./NavLink";
import { NavList } from "./NavList";
import { MenuButton } from "../DropdownMenu/DropdownMenu";
import { Item } from "@react-stately/collections";

export default {
  title: "Components/NavList",
  component: NavList,
} as ComponentMeta<typeof NavList>;

export const Playground: ComponentStory<typeof NavList> = (args) => {
  let [open, setOpen] = React.useState(false);
  return (
    <NavList {...args}>
      <MenuNavLink to="/">First</MenuNavLink>
      <MenuNavLink to="/">Second</MenuNavLink>
      <MenuNavLink to="/">Third</MenuNavLink>
      <MenuButton
        isOpen={open}
        onOpenChange={setOpen}
        label="Actions"
        onAction={(key) => {
          alert(key);
        }}
        width="full"
      >
        <Item key="copy">Copy</Item>
        <Item key="cut">Cut</Item>
        <Item key="paste">Paste</Item>
        <Item key="view" href="https://google.com">
          View
        </Item>
      </MenuButton>
    </NavList>
  );
};
