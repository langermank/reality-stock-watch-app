import React from "react";
import type { PropsWithChildren } from "react";
import { Button } from "../button/Button";
import { CaretDown } from "phosphor-react";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";

// export type NavMenuRootProps = React.ComponentProps<typeof NavigationMenu["Root"]> & {
//   name?: string;
//   clearQueryParamsOnClose?: string[];
// };

// const Tooltip: React.FC<React.ComponentProps<typeof RadixTooltip.Root>> = ({ children, ...props }) => {
//     return (
//       <RadixTooltip.Root delayDuration={200} {...props}>
//         {children}
//       </RadixTooltip.Root>
//     );
//   };

// export type NavigationMenuProps = Pick<NavigationMenu.NavigationMenuProps, "orientation"> &
//   Pick<NavigationMenu.NavigationMenuProps, "onSelect">;

// export interface NavMenuRoot extends NavigationMenu.Root {}

export const NavMenuRoot = ({ children, ...navMenuRootProps }: PropsWithChildren<{}>) => {
  return (
    <NavigationMenu.Root className="NavMenu-root" {...navMenuRootProps} orientation="vertical">
      {children}
    </NavigationMenu.Root>
  );
};

export const NavMenuList = ({ children }: PropsWithChildren<{}>) => {
  return <NavigationMenu.List className="NavList-list">{children}</NavigationMenu.List>;
};

export const NavMenuItem = ({ children }: PropsWithChildren<{}>) => {
  return <NavigationMenu.Item className="NavList-item">{children}</NavigationMenu.Item>;
};

export const NavMenuLink = ({ children }: PropsWithChildren<{}>) => {
  return <NavigationMenu.Link className="linkWrap">{children}</NavigationMenu.Link>;
};

export const NavMenuTrigger = ({ children }: PropsWithChildren<{}>) => {
  return (
    <NavigationMenu.Trigger asChild>
      <Button
        variant="muted"
        trailingActionIcon={<CaretDown className="NavMenu-trigger-icon" />}
        className="NavMenu-trigger"
        width="full"
        alignContent="start"
      >
        {children}
      </Button>
    </NavigationMenu.Trigger>
  );
};

export const NavMenuContent = ({ children }: PropsWithChildren<{}>) => {
  return <NavigationMenu.Content className="NavMenu-overlay">{children}</NavigationMenu.Content>;
};

// export const NavMenuRoot = NavigationMenu.Root;
// export const NavMenuList = NavigationMenu.List;
// export const NavMenuItem = NavigationMenu.Item;
// export const NavMenuTrigger = NavigationMenu.Trigger;
// export const NavMenuContent = NavigationMenu.Content;
export const NavMenuSub = NavigationMenu.Sub;
export const NavMenuViewport = NavigationMenu.Viewport;
export const NavMenuIndicator = NavigationMenu.Indicator;
// export const NavMenuLink = NavigationMenu.Link;
