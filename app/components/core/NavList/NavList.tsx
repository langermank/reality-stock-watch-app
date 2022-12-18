import React, { Children, PropsWithChildren, forwardRef, type Ref } from "react";

export type NavListProps = {};

export const NavList = forwardRef<Ref, PropsWithChildren<NavListProps>>(({ children }, ref) => {
  const arrChildren = Children.toArray(children);

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
});

NavList.displayName = "NavList";
