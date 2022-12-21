// import Link from 'next/link';
// import { useRouter } from 'next/router';
import { Button } from "../button/Button";
import { Popover } from "../Popover/Popover";
// import { Dialog, DialogTrigger, DialogContent } from './Dialog.jsx';
import NavLink from "../NavList/NavLink";
import { Gear, UserCircle, CaretDown, SignOut, SignIn } from "phosphor-react";
import { useMenuTriggerState } from "@react-stately/menu";
import { useButton } from "@react-aria/button";
import { useMenu, useMenuItem, useMenuTrigger, useMenuSection } from "@react-aria/menu";
import { useTreeState } from "@react-stately/tree";
import { Item } from "@react-stately/collections";
import { mergeProps } from "@react-aria/utils";
import { FocusScope } from "@react-aria/focus";
import { useFocus } from "@react-aria/interactions";
import { useOverlay, DismissButton } from "@react-aria/overlays";
import React, { useRef, useState } from "react";

function MenuButton(props) {
  // Create state based on the incoming props
  let state = useMenuTriggerState(props);

  // Get props for the button and menu elements
  let ref = useRef();
  let { menuTriggerProps, menuProps } = useMenuTrigger({}, state, ref);

  return (
    <>
      <Button
        {...props}
        variant="muted"
        ref={ref}
        trailingActionIcon={<CaretDown className="DropdownMenu-trigger-icon" />}
        className="DropdownMenu-trigger"
      >
        {props.label}
      </Button>
      {state.isOpen && (
        <Popover state={state} triggerRef={ref} placement="bottom start">
          <Menu {...props} {...menuProps} />
        </Popover>
      )}
    </>
  );
}

function Menu(props) {
  // Create menu state based on the incoming props
  let state = useTreeState(props);

  // Get props for the menu element
  let ref = useRef();
  let { menuProps } = useMenu(props, state, ref);

  return (
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
      {[...state.collection].map((item) =>
        item.type === "section" ? (
          <MenuSection key={item.key} section={item} state={state} />
        ) : (
          <MenuItem key={item.key} item={item} state={state} />
        )
      )}
    </ul>
  );
}

function MenuItem({ item, state }) {
  // Get props for the menu item element
  let ref = React.useRef();
  let { menuItemProps, isFocused, isSelected, isDisabled } = useMenuItem(
    { key: item.key },
    state,
    ref
  );

  return (
    <li
      {...menuItemProps}
      ref={ref}
      style={{
        background: isFocused ? "gray" : "transparent",
        color: isDisabled ? "gray" : isFocused ? "white" : "black",
        padding: "2px 5px",
        outline: "none",
        cursor: "default",
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      {item.rendered}
      {isSelected && <span aria-hidden="true">✅</span>}
    </li>
  );
}

function MenuSection({ section, state, onAction }) {
  let { itemProps, headingProps, groupProps } = useMenuSection({
    heading: section.rendered,
    "aria-label": section["aria-label"],
  });

  let { separatorProps } = useSeparator({
    elementType: "li",
  });

  // If the section is not the first, add a separator element.
  // The heading is rendered inside an <li> element, which contains
  // a <ul> with the child items.
  return (
    <>
      {section.key !== state.collection.getFirstKey() && (
        <li
          {...separatorProps}
          style={{
            borderTop: "1px solid gray",
            margin: "2px 5px",
          }}
        />
      )}
      <li {...itemProps}>
        {section.rendered && (
          <span
            {...headingProps}
            style={{
              fontWeight: "bold",
              fontSize: "1.1em",
              padding: "2px 5px",
            }}
          >
            {section.rendered}
          </span>
        )}
        <ul
          {...groupProps}
          style={{
            padding: 0,
            listStyle: "none",
          }}
        >
          {[...section.childNodes].map((node) => (
            <MenuItem key={node.key} item={node} state={state} onAction={onAction} />
          ))}
        </ul>
      </li>
    </>
  );
}
