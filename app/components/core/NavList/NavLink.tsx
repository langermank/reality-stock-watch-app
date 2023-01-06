import React, { forwardRef } from "react";
import type { PropsWithChildren } from "react";
import { NavLink } from "@remix-run/react";

export type MenuNavLinkProps = {
  icon?: React.ReactNode;
  to?: string;
  isActive?: boolean;
  alwaysVisible?: boolean;
  newTab?: boolean;
} & React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>;

type MenuNavLinkPropsWithChildren = PropsWithChildren<MenuNavLinkProps>;

export const MenuNavLink = forwardRef<HTMLAnchorElement, MenuNavLinkPropsWithChildren>(
  ({ icon, to, isActive, alwaysVisible, children, newTab, ...rest }, ref) => {
    // const ref = useRef<HTMLAnchorElement>(null);

    return (
      // remove remix until storybook supports routes
      // <NavLink
      //   className="linkWrap"
      //   ref={ref}
      //   to={to}
      //   data-active={isActive}
      //   target={newTab ? "_blank" : undefined}
      //   rel={newTab ? "noopener noreferrer" : undefined}
      // >
      //   {icon}
      //   <span className="linkLabel" data-visible={alwaysVisible}>
      //     {children}
      //   </span>
      // </NavLink>
      <a
        className="linkWrap"
        ref={ref}
        href={to}
        data-active={isActive}
        target={newTab ? "_blank" : undefined}
        rel={newTab ? "noopener noreferrer" : undefined}
        {...rest}
      >
        {icon}
        <span className="linkLabel" data-visible={alwaysVisible}>
          {children}
        </span>
      </a>
    );
  }
);

MenuNavLink.displayName = "MenuNavLink";
