import React from "react";
import type { ComponentMeta, ComponentStory } from "@storybook/react";
import {
  NavMenuRoot,
  NavMenuList,
  NavMenuItem,
  NavMenuTrigger,
  NavMenuContent,
  NavMenuLink,
  NavMenuViewport,
  NavMenuSub,
  NavMenuIndicator,
} from "./NavMenu";

export default {
  title: "Components/NavMenu",
  //   component: NavMenu,
};

export const Playground: ComponentStory<typeof NavMenu> = (args) => (
  <NavMenuRoot orientation="vertical">
    <NavMenuList>
      <NavMenuItem>
        <NavMenuTrigger>Sub group 1</NavMenuTrigger>
        <NavMenuContent>
          <NavMenuLink>Hello</NavMenuLink>
        </NavMenuContent>
      </NavMenuItem>

      <NavMenuItem>
        <NavMenuLink>Item 2</NavMenuLink>
      </NavMenuItem>

      <NavMenuItem>
        <NavMenuTrigger>Sub group 2</NavMenuTrigger>
        <NavMenuContent>
          <NavMenuSub>
            <NavMenuLink>Hello</NavMenuLink>
            {/* <NavMenuList />
            <NavMenuViewport /> */}
          </NavMenuSub>
        </NavMenuContent>
      </NavMenuItem>

      <NavMenuIndicator />
    </NavMenuList>

    <NavMenuViewport />
  </NavMenuRoot>
);
