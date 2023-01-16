/* eslint-disable @typescript-eslint/no-use-before-define */
import { Popover } from "../Popover/Popover";
import { Button } from "../button/Button";
import { MenuNavLink } from "../NavList/NavLink";
import { CaretDown } from "phosphor-react";
import type { AriaMenuProps } from "@react-types/menu";
import type { ReactNode } from "react";
import { useRef, useState } from "react";
import { useMenu, useMenuItem, useFocus, mergeProps, useButton, useMenuTrigger } from "react-aria";
import { useTreeState, useMenuTriggerState } from "react-stately";

interface MenuButtonProps<T> extends AriaMenuProps<T> {
  label: ReactNode;
  width?: "default" | "full";
}

export function MenuButton<T extends object>(props: MenuButtonProps<T>) {
  // Create state based on the incoming props
  let state = useMenuTriggerState(props);

  // Get props for the menu trigger and menu elements
  let ref = useRef<HTMLButtonElement>(null);
  let { menuTriggerProps, menuProps } = useMenuTrigger({}, state, ref);

  // Get props for the button based on the trigger props from useMenuTrigger
  let { buttonProps } = useButton(menuTriggerProps, ref);

  return (
    <div style={{ position: "relative" }}>
      <Button
        variant='muted'
        trailingActionIcon={<CaretDown className='NavMenu-trigger-icon' />}
        className='NavMenu-trigger'
        width={props.width}
        alignContent='start'
        ref={ref}
        {...buttonProps}
      >
        {props.label}
      </Button>
      {state.isOpen && (
        <Popover
          state={state}
          triggerRef={ref}
          offset={8}
          placement='bottom start'
          width={props.width}
        >
          <Menu {...props} {...menuProps} />
        </Popover>
      )}
    </div>
  );
}

interface MenuPopupProps<T> extends AriaMenuProps<T> {
  domProps?: any;
  autoFocus: any;
  onClose?: () => void;
}

function Menu<T extends object>(props: MenuPopupProps<T>) {
  // Create menu state based on the incoming props
  let state = useTreeState({ ...props, selectionMode: "none" });

  // Get props for the menu element
  let ref = useRef<HTMLUListElement>(null);
  let { menuProps } = useMenu(props, state, ref);

  // Wrap in <FocusScope> so that focus is restored back to the
  // trigger when the menu is closed. In addition, add hidden
  // <DismissButton> components at the start and end of the list
  // to allow screen reader users to dismiss the popup easily.
  return (
    <ul {...menuProps} ref={ref}>
      {[...state.collection].map((item) => (
        <MenuItem
          key={item.key}
          item={item}
          state={state}
          // href={props.href}
          onAction={props.onAction}
          onClose={props.onClose}
        />
      ))}
    </ul>
  );
}

function MenuItem({ item, state, onAction, onClose }) {
  // Get props for the menu item element
  let ref = useRef<HTMLLIElement | HTMLAnchorElement>(null);
  let { menuItemProps } = useMenuItem(
    {
      key: item.key,
      isDisabled: item.isDisabled,
      onAction,
      onClose,
    },
    state,
    ref
  );

  const isLink = !!item.props.href;

  // Handle focus events so we can apply highlighted
  // style to the focused menu item
  let [isFocused, setFocused] = useState(false);
  let { focusProps } = useFocus({ onFocusChange: setFocused });

  const props = mergeProps(menuItemProps, focusProps, {
    // style: {
    //   display: "block",
    //   background: isFocused ? "gray" : "transparent",
    //   color: isFocused ? "white" : undefined,
    //   padding: "2px 5px",
    //   outline: "none",
    //   cursor: "pointer",
    // },
  });

  if (isLink) {
    return (
      <li role='none'>
        <MenuNavLink
          ref={ref}
          to={item.props.href}
          {...props}
          onPointerUp={() => {}}
          onKeyDown={() => {}}
        >
          {item.rendered}
        </MenuNavLink>
      </li>
    );
  }

  return (
    <li ref={ref} {...props} className='linkWrap'>
      {item.rendered}
    </li>
  );
}
