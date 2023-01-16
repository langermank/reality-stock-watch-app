import { House } from "phosphor-react";
import type { ComponentMeta, ComponentStory } from "@storybook/react";
import React from "react";

import { NavLink } from "./NavLink";

export default {
  title: "Components/NavLink",
  component: NavLink,
  args: {
    dataActive: false,
    alwaysVisible: false,
  },
} as ComponentMeta<typeof NavLink>;

export const Playground: ComponentStory<typeof NavLink> = (args) => (
  <NavLink {...args}>Link</NavLink>
);

export const WithIcon: ComponentStory<typeof NavLink> = (args) => <NavLink {...args}>Link</NavLink>;
WithIcon.args = {
  icon: <House size={18} />,
};
