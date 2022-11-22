import React from "react";
import PropTypes from "prop-types";

const NavLink = React.forwardRef(
  ({ icon, href, dataActive, children, alwaysVisible }, ref) => {
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

NavLink.propTypes = {
  icon: PropTypes.node,
  href: PropTypes.node,
  dataActive: PropTypes.bool,
  children: PropTypes.string,
  alwaysVisible: PropTypes.bool,
};

NavLink.defaultProps = {
  icon: null,
  href: null,
  dataActive: false,
  children: "Linky link",
  alwaysVisible: null,
};

export default NavLink;

NavLink.displayName = "NavLink";
