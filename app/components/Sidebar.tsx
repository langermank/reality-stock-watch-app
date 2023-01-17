import React, { useState } from "react";
import { Link } from "@remix-run/react";
import seasons from "~/data/season.json";
import { Button } from "./core/button/Button";
import { NavList } from "./core/NavList/NavList";
import { MenuNavLink } from "./core/NavList/NavLink";
import { MenuButton } from "./core/DropdownMenu/DropdownMenu";
import { Item } from "@react-stately/collections";

export const loader = ({ params: { short_name } }) => {
  const season = seasons.find((c) => c.short_name === short_name);

  return { season };
};

export default function Sidebar() {
  let [open, setOpen] = useState(false);
  return (
    <div>
      <nav>
        <MenuNavLink to='/'>Games</MenuNavLink>
        <MenuNavLink to='/'>Market</MenuNavLink>
        <MenuNavLink to='/'>Leaderboard</MenuNavLink>
        <MenuNavLink to='/'>Full leaderboard</MenuNavLink>
        <MenuButton
          isOpen={open}
          onOpenChange={setOpen}
          label='{username}'
          onAction={(key) => {
            alert(key);
          }}
          width='full'
        >
          <Item key='copy'>Profile</Item>
          <Item key='cut'>Settings</Item>
        </MenuButton>
        {/* {seasons.map((season) => (
          <li key={season.id}>
            <Link to={`${season.show_short_name}/${season.short_name}`}>{season.name}</Link>
          </li>
        ))}
        {seasons.map((season) => (
          <li key={season.id}>
            <Link to={`${season.show_short_name}/${season.short_name}/leaderboard`}>
              {season.name} leaderboard
            </Link>
          </li>
        ))} */}
      </nav>
    </div>
  );
}
