/* eslint-disable react/display-name */
import React from "react";
import PropTypes from "prop-types";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { Check, WifiNone, CaretDown } from "phosphor-react";
import Button from "../button/Button";
export const DropdownMenu = DropdownMenuPrimitive.Root;

// export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

export const DropdownMenuTrigger = React.forwardRef(
  ({ children, ...props }, forwardedRef) => {
    return (
      <DropdownMenuPrimitive.Trigger asChild>
        <Button
          variant="muted"
          {...props}
          ref={forwardedRef}
          trailingActionIcon={
            <CaretDown className="DropdownMenu-trigger-icon" />
          }
          className="DropdownMenu-trigger"
        >
          {children}
        </Button>
      </DropdownMenuPrimitive.Trigger>
    );
  }
);

export const DropdownMenuContent = React.forwardRef(
  ({ children, ...props }, forwardedRef) => {
    return (
      <DropdownMenuPrimitive.Content
        ref={forwardedRef}
        align="start"
        sideOffset="1"
        className="DropdownMenu-overlay"
      >
        {children}

        {/* <DropdownMenuPrimitive.Arrow /> */}
      </DropdownMenuPrimitive.Content>
    );
  }
);
// export const DropdownMenuLabel = DropdownMenuPrimitive.Label;
export const DropdownMenuLabel = React.forwardRef(
  ({ children, ...props }, forwardedRef) => {
    return (
      <DropdownMenuPrimitive.Label
        {...props}
        ref={forwardedRef}
        className="DropdownMenu-label"
      >
        {children}
      </DropdownMenuPrimitive.Label>
    );
  }
);

export const DropdownMenuItem = React.forwardRef(
  ({ children, ...props }, forwardedRef) => {
    return (
      <DropdownMenuPrimitive.Item
        {...props}
        ref={forwardedRef}
        className="DropdownMenu-item"
      >
        {children}
      </DropdownMenuPrimitive.Item>
    );
  }
);

// export const DropdownMenuItem = DropdownMenuPrimitive.Item;

export const DropdownMenuGroup = DropdownMenuPrimitive.Group;
export const DropdownMenuCheckboxItem = React.forwardRef(
  ({ children, ...props }, forwardedRef) => {
    return (
      <DropdownMenuPrimitive.CheckboxItem
        {...props}
        ref={forwardedRef}
        className="DropdownMenu-item hasIndicator"
      >
        <DropdownMenuPrimitive.ItemIndicator>
          {props.checked === true && <Check />}
        </DropdownMenuPrimitive.ItemIndicator>
        {children}
      </DropdownMenuPrimitive.CheckboxItem>
    );
  }
);
export const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;
export const DropdownMenuRadioItem = React.forwardRef(
  ({ children, ...props }, forwardedRef) => {
    return (
      <DropdownMenuPrimitive.RadioItem
        {...props}
        ref={forwardedRef}
        className="DropdownMenu-item hasIndicator"
      >
        <DropdownMenuPrimitive.ItemIndicator className="ItemIndicator">
          <svg
            width="15"
            height="15"
            viewBox="0 0 15 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9.875 7.5C9.875 8.81168 8.81168 9.875 7.5 9.875C6.18832 9.875 5.125 8.81168 5.125 7.5C5.125 6.18832 6.18832 5.125 7.5 5.125C8.81168 5.125 9.875 6.18832 9.875 7.5Z"
              fill="currentColor"
            ></path>
          </svg>
        </DropdownMenuPrimitive.ItemIndicator>
        <span className="dropdownMenuItemLabel">{children}</span>
        {/* {children} */}
      </DropdownMenuPrimitive.RadioItem>
    );
  }
);
// export const DropdownMenuSeparator = DropdownMenuPrimitive.Separator;

export const DropdownMenuSeparator = React.forwardRef(
  ({ children, ...props }, forwardedRef) => {
    return (
      <DropdownMenuPrimitive.Separator
        {...props}
        ref={forwardedRef}
        className="DropdownMenu-divider"
      />
    );
  }
);
