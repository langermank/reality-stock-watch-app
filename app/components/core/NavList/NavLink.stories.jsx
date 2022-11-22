import { House } from "phosphor-react";
import React from "react";

import NavLink from "./NavLink.jsx";

export default {
  title: "Components/NavLink",
  component: NavLink,
  args: {
    dataActive: false,
    alwaysVisible: false,
  },
};

export const Playground = (args) => <NavLink {...args}>Link</NavLink>;

export const WithIcon = (args) => <NavLink {...args}>Link</NavLink>;
WithIcon.args = {
  icon: <House size={18} />,
};
