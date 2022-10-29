import React from "react";
import PropTypes from "prop-types";

const NavList = React.forwardRef(({ children }, ref) => {
  return (
    <nav ref={ref}>
      <ul class="NavList-list">{children}</ul>
    </nav>
  );
});

NavList.propTypes = {
  children: PropTypes.string,
};

NavList.defaultProps = {
  children: "Linky link",
};

export default NavList;

NavList.displayName = "NavList";
