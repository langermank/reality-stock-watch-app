import PropTypes from "prop-types";
import { Button } from "../button/Button";
import { NavLink } from "../NavList/NavLink";
import { CaretDown } from "phosphor-react";
import { useMenuTriggerState } from "@react-stately/menu";
import { useButton } from "@react-aria/button";
import { useMenu, useMenuItem, useMenuTrigger } from "@react-aria/menu";
import { useTreeState } from "@react-stately/tree";
import { Item } from "@react-stately/collections";
import { mergeProps } from "@react-aria/utils";
import { FocusScope } from "@react-aria/focus";
import { useFocus } from "@react-aria/interactions";
import { useOverlay, DismissButton } from "@react-aria/overlays";
import React, { useRef, useState } from "react";
import { Popover } from "../Popover/Popover";
import { Link } from "@remix-run/react";

export function MenuButton(props) {
  // Create state based on the incoming props
  let state = useMenuTriggerState(props);

  // Get props for the menu trigger and menu elements
  let ref = useRef();
  let { menuTriggerProps, menuProps } = useMenuTrigger({}, state, ref);

  // Get props for the button based on the trigger props from useMenuTrigger
  let { buttonProps } = useButton(menuTriggerProps, ref);

  return (
    <div style={{ position: "relative"}}>
      <Button
          variant="muted"
          trailingActionIcon={<CaretDown className="NavMenu-trigger-icon" />}
          className="NavMenu-trigger"
          width="full"
          alignContent="start"
          ref={ref}
          {...buttonProps}
        >
          {props.label}
      </Button>
      {state.isOpen &&
        (
          <Popover state={state} triggerRef={ref} placement="bottom start">
            <Menu
              {...props}
              {...menuProps}
            />
          </Popover>
        )}
        {/* {state.isOpen && (
          <MenuPopup
            {...props}
            domProps={menuProps}
            autoFocus={state.focusStrategy}
            onClose={() => state.close()}
          />
      )} */}
    </div>
  );
}

function Menu(props) {
  // Create menu state based on the incoming props
  let state = useTreeState(props);

  // Get props for the menu element
  let ref = React.useRef();
  let { menuProps } = useMenu(props, state, ref);

  return (
    <ul
      {...menuProps}
      ref={ref}
      style={{
        margin: 0,
        padding: 0,
        listStyle: 'none',
        width: 150
      }}
    >
      {[...state.collection].map((item) => (
        <MenuItem key={item.key} item={item} state={state} href={props.href} />
      ))}
    </ul>
  );
}

function MenuItem({ item, state, href }) {
  // Get props for the menu item element
  let ref = React.useRef();
  let { menuItemProps, isFocused, isSelected, isDisabled, label } = useMenuItem(
    { key: item.key },
    state,
    ref
  );

  return (
    <li
      {...menuItemProps}
      ref={ref}
      style={{
        background: isFocused ? 'gray' : 'transparent',
        color: label ? 'purple' : isFocused ? 'white' : 'pink',
        padding: '2px 5px',
        outline: 'solid 1px pink',
        cursor: 'default',
        display: 'flex',
        justifyContent: 'space-between'
      }}
      >
      {/* {item.label} */}
      {item.rendered}
      {isSelected && <span aria-hidden="true">✅</span>}
    </li>
    // href ? (
    //   <li role="none">
    //     <NavLink
    //       icon={item.props.icon}
    //       href={item.props.href}
    //       ref={ref}
    //       {...mergeProps(menuItemProps, focusProps, {
    //         onClick,
    //       })}>
    //       {item.props.children}
    //     </NavLink>
    //   </li>
    // ) : (<li
    //   {...menuItemProps}
    //   ref={ref}
    //   style={{
    //     background: isFocused ? 'gray' : 'transparent',
    //     color: label ? 'purple' : isFocused ? 'white' : 'pink',
    //     padding: '2px 5px',
    //     outline: 'solid 1px pink',
    //     cursor: 'default',
    //     display: 'flex',
    //     justifyContent: 'space-between'
    //   }}
    //   >
    //   {/* {item.label} */}
    //   {item.rendered}
    //   {isSelected && <span aria-hidden="true">✅</span>}
    // </li>)
  );
}

MenuItem.propTypes = {
  // icon: PropTypes.node,
  // children: PropTypes.node,
  href: PropTypes.string,
};
