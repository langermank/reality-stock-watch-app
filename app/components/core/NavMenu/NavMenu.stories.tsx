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
import * as Popover from "@radix-ui/react-popover";

export default {
  title: "Components/NavMenu",
  //   component: NavMenu,
};

export const Playground: ComponentStory<typeof NavMenu> = (args) => {
  return (
    <div style={{ maxWidth: "300px" }}>
      <NavMenuRoot orientation="vertical">
        <NavMenuList>
          <NavMenuItem>
            <NavMenuTrigger>Sub group 1</NavMenuTrigger>
            <NavMenuContent>
              <NavMenuLink>Hello</NavMenuLink>
            </NavMenuContent>
            {/* <div className="NavMenu-overlayPosition"> */}
            <NavMenuViewport className="NavigationMenuViewport" />
            {/* </div> */}
          </NavMenuItem>

          <NavMenuItem>
            <NavMenuLink>Item 2</NavMenuLink>
          </NavMenuItem>
        </NavMenuList>

        {/* <div className="NavMenu-overlayPosition">
        <NavMenuViewport className="NavigationMenuViewport" />
      </div> */}
      </NavMenuRoot>
    </div>
  );
};
