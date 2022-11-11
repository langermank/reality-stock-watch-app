import React from "react";
import NavLink from "./NavLink.jsx";
import NavList from "./NavList.jsx";

export default {
  title: "Components/NavList",
  component: NavList,
};

export const Playground = (args) => (
  <NavList {...args}>
      <NavLink>First</NavLink>
      <NavLink>Second</NavLink>
      <NavLink>Third</NavLink>
  </NavList>
);
