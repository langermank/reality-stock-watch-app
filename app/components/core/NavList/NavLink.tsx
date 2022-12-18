import React, { Children, PropsWithChildren, forwardRef, type Ref } from "react";

export type NavLinkProps = {
  icon?: React.ReactNode;
  href?: string;
  dataActive?: boolean;
  // children?: PropTypes.string;
  alwaysVisible?: boolean;
};

export const NavLink = forwardRef<Ref, PropsWithChildren<NavLinkProps>>(
  ({ icon, href, dataActive, alwaysVisible, children }, ref) => {
    return (
      <a className="linkWrap" ref={ref} href={href} data-active={dataActive}>
        {icon}
        <span className="linkLabel" data-visible={alwaysVisible}>
          {children}
        </span>
      </a>
    );
  }
);

NavLink.displayName = "NavLink";
