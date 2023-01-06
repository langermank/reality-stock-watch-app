/* eslint-disable @typescript-eslint/no-use-before-define */
import { Popover } from "../Popover/Popover";
import { Button } from "../button/Button";
import { MenuNavLink } from "../NavList/NavLink";
import { Link } from "@remix-run/react";
import { CaretDown } from "phosphor-react";
import type { AriaMenuProps } from "@react-types/menu";
import type { ReactNode } from "react";
import { useRef, useState } from "react";
import {
  useMenu,
  useMenuItem,
  useLink,
  useFocus,
  mergeProps,
  useOverlay,
  DismissButton,
  useButton,
  FocusScope,
  useMenuTrigger,
} from "react-aria";
import { useTreeState, useMenuTriggerState, Item } from "react-stately";

interface MenuButtonProps<T> extends AriaMenuProps<T> {
  label: ReactNode;
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
      {state.isOpen && (
        <Popover state={state} triggerRef={ref} placement="bottom start">
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

  // Handle events that should cause the menu to close,
  // e.g. blur, clicking outside, or pressing the escape key.
  let overlayRef = useRef<HTMLDivElement>(null);
  let { overlayProps } = useOverlay(
    {
      onClose: props.onClose,
      shouldCloseOnBlur: true,
      isOpen: true,
      isDismissable: true,
    },
    overlayRef
  );

  // Wrap in <FocusScope> so that focus is restored back to the
  // trigger when the menu is closed. In addition, add hidden
  // <DismissButton> components at the start and end of the list
  // to allow screen reader users to dismiss the popup easily.
  return (
    <>
      {/* <FocusScope restoreFocus>
        <div {...overlayProps} ref={overlayRef}>
          <DismissButton onDismiss={props.onClose} />
          <div
            {...mergeProps(menuProps, props.domProps)}
            ref={ref}
            style={{
              position: "absolute",
              width: "100%",
              margin: "4px 0 0 0",
              padding: 0,
              listStyle: "none",
              border: "1px solid gray",
              background: "lightgray",
            }}
          >
            {[...state.collection].map((item) => (
              <MenuItemImpl
                key={item.key}
                item={item}
                state={state}
                onAction={props.onAction}
                onClose={props.onClose}
              />
            ))}
          </div>
          <DismissButton onDismiss={props.onClose} />
        </div>
      </FocusScope> */}
      <ul
        {...menuProps}
        ref={ref}
        style={{
          margin: 0,
          padding: 0,
          listStyle: "none",
          width: 150,
        }}
      >
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
    </>
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
    style: {
      display: "block",
      background: isFocused ? "gray" : "transparent",
      color: isFocused ? "white" : undefined,
      padding: "2px 5px",
      outline: "none",
      cursor: "pointer",
    },
  });

  if (isLink) {
    return (
      <MenuNavLink
        ref={ref}
        to={item.props.href}
        // target="_blank"
        // rel="noreferrer"
        {...props}
        onPointerUp={() => {}}
        onKeyDown={() => {}}
      >
        {item.rendered}
      </MenuNavLink>
    );
  }

  return (
    <li ref={ref} {...props}>
      {item.rendered}
    </li>
  );
}
