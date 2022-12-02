/* eslint-disable react/display-name */
import React from 'react';
import PropTypes from "prop-types";
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'phosphor-react';
import Button from '../button/Button.jsx';


export function Dialog({ children, align, ...props }) {
    return (
        <DialogPrimitive.Root {...props} open>
            <DialogPrimitive.Overlay className="Dialog-backdrop" data-align={align} />
            {children}
        </DialogPrimitive.Root>
    );
}

Dialog.propTypes = {
  align: PropTypes.oneOf([
    "center"
  ]),
};

export const DialogContent = React.forwardRef(({ children, size, title, description, visuallyHideTitle, ...props }, forwardedRef) => (
    <DialogPrimitive.Content {...props} ref={forwardedRef} className="Dialog" data-size={size}>
        <div className='Dialog-header'>
            <div className="Dialog-titleWrap">
                {title && <DialogPrimitive.Title>{title}</DialogPrimitive.Title>}
                {description && <DialogPrimitive.Description>{description}</DialogPrimitive.Description>}
            </div>
            <DialogPrimitive.Close asChild>
                <Button variant="muted" icon={<X />} iconOnly size="small" className="Dialog-close">
                    Close
                </Button>
            </DialogPrimitive.Close>
        </div>
        <div className="Dialog-content">
            {children}
        </div>
    </DialogPrimitive.Content>
));

DialogContent.propTypes = {
    size: PropTypes.oneOf(["auto", "full"]),
    title: PropTypes.string,
    description: PropTypes.string,
    visuallyHideTitle: PropTypes.bool,
};

export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;
export const DialogTitle = DialogPrimitive.Title;
export const DialogDescription = DialogPrimitive.Description;

Dialog.displayName = 'Dialog';
