/* eslint-disable react/display-name */
import React, { forwardRef } from "react";
import type { PropsWithChildren } from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { Check, WifiNone, CaretDown } from "phosphor-react";
import { Button } from "../button/Button";
import { NavLink } from "../NavList/NavLink";

// export const DropdownMenuTrigger = ({ children }: PropsWithChildren<{}>) => {
//   return (
//     <DropdownMenuPrimitive.Trigger asChild>
//       <Button
//         variant="muted"
//         trailingActionIcon={<CaretDown className="NavMenu-trigger-icon" />}
//         className="NavMenu-trigger"
//         width="full"
//         alignContent="start"
//       >
//         {children}
//       </Button>
//     </DropdownMenuPrimitive.Trigger>
//   );
// };

// export type BaseProps<T> = {
//   className?: string
//   id?: string
//   ref?: Ref<T>
// }

// TODO extend props from radix

type DropdownMenuTriggerProps = PropsWithChildren<HTMLButtonElement>;

export const DropdownMenuTrigger = forwardRef<HTMLButtonElement, DropdownMenuTriggerProps>(
  ({ children }, ref) => {
    return (
      <DropdownMenuPrimitive.Trigger asChild>
        <Button
          variant="muted"
          trailingActionIcon={<CaretDown className="NavMenu-trigger-icon" />}
          className="NavMenu-trigger"
          width="full"
          alignContent="start"
          ref={ref}
        >
          {children}
        </Button>
      </DropdownMenuPrimitive.Trigger>
    );
  }
);

export const DropdownMenuContent = ({ children }: PropsWithChildren<{}>) => {
  return (
    // <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content align="start" sideOffset={5} className="DropdownMenu-overlay">
      {children}
    </DropdownMenuPrimitive.Content>
    // </DropdownMenuPrimitive.Portal>
  );
};

export const DropdownMenuLabel = ({ children }: PropsWithChildren<{}>) => {
  return (
    <DropdownMenuPrimitive.Label className="DropdownMenu-label">
      {children}
    </DropdownMenuPrimitive.Label>
  );
};

export const DropdownMenuItem = ({ children }: PropsWithChildren<{}>) => {
  return (
    <DropdownMenuPrimitive.Item className="DropdownMenu-label">
      {children}
    </DropdownMenuPrimitive.Item>
  );
};

// TODO: how to handle prop drilling for NavLink?
export const DropdownMenuLinkItem = ({ children }: PropsWithChildren<{}>) => {
  return (
    <DropdownMenuPrimitive.Item className="DropdownMenu-label" asChild>
      <NavLink>{children}</NavLink>
    </DropdownMenuPrimitive.Item>
  );
};

// extend props from radix
// export const DropdownMenuCheckboxItem = ({ children }: PropsWithChildren<{}>) => {
//   return (
//     <DropdownMenuPrimitive.CheckboxItem {...props} className="DropdownMenu-item hasIndicator">
//       <DropdownMenuPrimitive.ItemIndicator>
//         {props.checked === true && <Check />}
//       </DropdownMenuPrimitive.ItemIndicator>
//       <span className="DropdownMenu-itemLabel">{children}</span>
//     </DropdownMenuPrimitive.CheckboxItem>
//   );
// };

// export const DropdownMenuRadioItem = ({ children, value }: PropsWithChildren<{}>) => {
//   return (
//     <DropdownMenuPrimitive.RadioItem className="DropdownMenu-item hasIndicator" value={value}>
//       <DropdownMenuPrimitive.ItemIndicator className="ItemIndicator">
//         <svg
//           width="15"
//           height="15"
//           viewBox="0 0 15 15"
//           fill="none"
//           xmlns="http://www.w3.org/2000/svg"
//         >
//           <path
//             d="M9.875 7.5C9.875 8.81168 8.81168 9.875 7.5 9.875C6.18832 9.875 5.125 8.81168 5.125 7.5C5.125 6.18832 6.18832 5.125 7.5 5.125C8.81168 5.125 9.875 6.18832 9.875 7.5Z"
//             fill="currentColor"
//           ></path>
//         </svg>
//       </DropdownMenuPrimitive.ItemIndicator>
//       <span className="DropdownMenu-itemLabel">{children}</span>
//     </DropdownMenuPrimitive.RadioItem>
//   );
// };

export const DropdownMenuSeparator = () => {
  return <DropdownMenuPrimitive.Separator className="DropdownMenu-divider" />;
};

export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;
export const DropdownMenuGroup = DropdownMenuPrimitive.Group;
// export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

DropdownMenuTrigger.displayName = "DropdownMenuTrigger";
DropdownMenuContent.displayName = "DropdownMenuContent";
DropdownMenuLabel.displayName = "DropdownMenuLabel";
DropdownMenuItem.displayName = "DropdownMenuItem";
// DropdownMenuCheckboxItem.displayName = "DropdownMenuCheckboxItem";
// DropdownMenuRadioItem.displayName = "DropdownMenuRadioItem";
DropdownMenuSeparator.displayName = "DropdownMenuSeparator";
