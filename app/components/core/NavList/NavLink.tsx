import React, { useRef } from "react";
import type { PropsWithChildren } from "react";

export type NavLinkProps = {
  icon?: React.ReactNode;
  href?: string;
  dataActive?: boolean;
  alwaysVisible?: boolean;
};

export const NavLink = ({
  icon,
  href,
  dataActive,
  alwaysVisible,
  children,
}: PropsWithChildren<NavLinkProps>) => {
  const ref = useRef<HTMLAnchorElement>(null);
  return (
    <a className="linkWrap" ref={ref} href={href} data-active={dataActive}>
      {icon}
      <span className="linkLabel" data-visible={alwaysVisible}>
        {children}
      </span>
    </a>
  );
};

NavLink.displayName = "NavLink";
