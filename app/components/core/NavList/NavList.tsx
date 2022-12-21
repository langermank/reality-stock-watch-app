import React, { useRef, Children } from "react";
import type { PropsWithChildren } from "react";

export type NavListProps = {};

export const NavList = ({ children }: PropsWithChildren<NavListProps>) => {
  const arrChildren = Children.toArray(children);
  const ref = useRef<HTMLElement>(null);
  return (
    <>
      {arrChildren.length && (
        <nav ref={ref}>
          <ul className="NavList-list">
            {Children.map(arrChildren, (childElement, index) => {
              return (
                <li key={`navLink-${index}`} className="NavList-item">
                  {childElement}
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </>
  );
};

NavList.displayName = "NavList";
