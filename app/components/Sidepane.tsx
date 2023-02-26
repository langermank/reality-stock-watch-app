import React, { useState } from "react";
import { Link } from "@remix-run/react";
import seasons from "~/data/season.json";
import { Button } from "./core/button/Button";
import { NavList } from "./core/NavList/NavList";
import {
  Diamond,
  Coin,
  House,
  ClipboardText,
  ChartPie,
  Medal,
  Lock,
  UserCircle,
  Gear,
} from "phosphor-react";
import { MenuNavLink } from "./core/NavList/NavLink";
import { MenuButton } from "./core/DropdownMenu/DropdownMenu";
import { Item } from "@react-stately/collections";

export const loader = ({ params: { short_name } }) => {
  const season = seasons.find((c) => c.short_name === short_name);

  return { season };
};

export default function Sidepane() {
  let [open, setOpen] = useState(false);
  let [panelState, setpanelState] = React.useState(false);
  return (
    <>
      <NavList>
        <MenuNavLink to='/' icon={<Diamond />}>
          Games
        </MenuNavLink>
        <MenuNavLink to='/' icon={<Coin />}>
          Market
        </MenuNavLink>
        <MenuNavLink to='/' icon={<House />}>
          Dashboard
        </MenuNavLink>
        <MenuNavLink to='/' icon={<ClipboardText />}>
          Survey
        </MenuNavLink>
        <MenuNavLink to='/' icon={<ChartPie />}>
          Projections
        </MenuNavLink>
        <MenuNavLink to='/' icon={<Medal />}>
          Leaderboard
        </MenuNavLink>
        <MenuNavLink to='/' icon={<Lock />}>
          Admin
        </MenuNavLink>
        <MenuButton
          isOpen={open}
          onOpenChange={setOpen}
          icon={<UserCircle />}
          iconSpacing='spacious'
          iconOnly={panelState}
          label='{username}'
          onAction={(key) => {
            alert(key);
          }}
          width='full'
        >
          <Item key='copy' href='/'>
            Profile
          </Item>
          <Item key='cut' href='/'>
            Settings
          </Item>
        </MenuButton>
      </NavList>
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
    </>
  );
}
