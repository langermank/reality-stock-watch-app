import React from "react";
import type { ComponentMeta, ComponentStory } from "@storybook/react";
import { NavLink } from "./NavLink";
import { NavList } from "./NavList";

export default {
  title: "Components/NavList",
  component: NavList,
} as ComponentMeta<typeof NavList>;

export const Playground: ComponentStory<typeof NavList> = (args) => (
  <NavList {...args}>
    <NavLink>First</NavLink>
    <NavLink>Second</NavLink>
    <NavLink>Third</NavLink>
  </NavList>
);
