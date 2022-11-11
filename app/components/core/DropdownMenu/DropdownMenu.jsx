/* eslint-disable react/display-name */
import React from 'react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { Check, CheckCircle, CaretDown } from 'phosphor-react';
import Button from '../button/Button';
// import { CheckIcon } from '@radix-ui/react-icons';
export const DropdownMenu = DropdownMenuPrimitive.Root;

// export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

export const DropdownMenuTrigger = React.forwardRef(({ children, ...props }, forwardedRef) => {
    return (
        <DropdownMenuPrimitive.Trigger asChild>
            <Button variant="muted" {...props} ref={forwardedRef} trailingActionIcon={<CaretDown className="DropdownMenu-trigger-icon" />} className="DropdownMenu-trigger">
                Temp
            </Button>
        </DropdownMenuPrimitive.Trigger>
    )
});

export const DropdownMenuContent = React.forwardRef(({ children, ...props }, forwardedRef) => {
    return (
        <DropdownMenuPrimitive.Content ref={forwardedRef} className="DropdownMenu-overlay">
            {children}

            {/* <DropdownMenuPrimitive.Arrow /> */}
        </DropdownMenuPrimitive.Content>
    );
});
// export const DropdownMenuLabel = DropdownMenuPrimitive.Label;
export const DropdownMenuLabel = React.forwardRef(({ children, ...props }, forwardedRef) => {
    return (
        <DropdownMenuPrimitive.Label
            {...props}
            ref={forwardedRef}
            className="dropdownMenuGroupLabel">
            {children}
        </DropdownMenuPrimitive.Label>
    );
});

export const DropdownMenuItem = DropdownMenuPrimitive.Item;

export const DropdownMenuGroup = DropdownMenuPrimitive.Group;
export const DropdownMenuCheckboxItem = React.forwardRef(({ children, ...props }, forwardedRef) => {
    return (
        <DropdownMenuPrimitive.CheckboxItem
            {...props}
            ref={forwardedRef}
            className="dropdownMenuItem">
            {children}

            <DropdownMenuPrimitive.ItemIndicator>
                <Check />
            </DropdownMenuPrimitive.ItemIndicator>
        </DropdownMenuPrimitive.CheckboxItem>
    );
});
export const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;
export const DropdownMenuRadioItem = React.forwardRef(({ children, ...props }, forwardedRef) => {
    return (
        <DropdownMenuPrimitive.RadioItem
            {...props}
            ref={forwardedRef}
            className="dropdownMenuItem">
            <DropdownMenuPrimitive.ItemIndicator className="ItemIndicator">
                <CheckCircle weight="fill" />
            </DropdownMenuPrimitive.ItemIndicator>
            <span className="dropdownMenuItemLabel">{children}</span>
            {/* {children} */}
        </DropdownMenuPrimitive.RadioItem>
    );
});
// export const DropdownMenuSeparator = DropdownMenuPrimitive.Separator;

export const DropdownMenuSeparator = React.forwardRef(({ children, ...props }, forwardedRef) => {
    return (
        <DropdownMenuPrimitive.Separator
            {...props}
            ref={forwardedRef}
            className="dropdownMenuSeparator">
            {children}
        </DropdownMenuPrimitive.Separator>
    );
});
