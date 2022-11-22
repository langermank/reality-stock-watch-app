import React, { Children } from "react";
import PropTypes from "prop-types";

const NavList = React.forwardRef(({ children }, ref) => {
  const arrChildren = Children.toArray(children);

  return (
    <>
    {arrChildren.length &&
      <nav ref={ref}>
        <ul className="NavList-list">
          {Children.map(arrChildren, (childElement, index) => {
            return (
              <li key={`navLink-${index}`} className="NavList-item">
                {childElement}
              </li>
            );
          })}</ul>
      </nav>
    }
    </>
  );
});

// NavList.propTypes = {
//   children: PropTypes.arrayOf(PropTypes.element),
// };

NavList.propTypes = {
  children: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.node),
      PropTypes.node
  ]).isRequired
}

export default NavList;

NavList.displayName = "NavList";
