import React from "react";
import NavLink from "./NavLink.jsx";
import NavList from "./NavList.jsx";

export default {
  title: "Components/NavList",
  component: NavList,
};

export const Playground = (args) => (
  <NavList {...args}>
    <li>
      <NavLink>First</NavLink>
    </li>
    <li>
      <NavLink>Second</NavLink>
    </li>
    <li>
      <NavLink>Third</NavLink>
    </li>
  </NavList>
);
