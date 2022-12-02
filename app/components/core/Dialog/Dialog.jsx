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
//   className: PropTypes.string,
//   id: PropTypes.string,
//   children: PropTypes.oneOfType([
//     PropTypes.arrayOf(PropTypes.node),
//     PropTypes.node,
//   ]).isRequired,
//   disabled: PropTypes.bool,
//   size: PropTypes.oneOf(["default", "small"]),
//   width: PropTypes.oneOf(["default", "fullWidth"]),
  align: PropTypes.oneOf([
    "center"
  ]),
//   icon: PropTypes.node,
//   iconOnly: PropTypes.bool,
//   iconPosition: PropTypes.oneOf(["left", "right"]),
//   alignContent: PropTypes.oneOf(["center", "start"]),
//   ariaLabelledById: PropTypes.string,
//   trailingActionIcon: PropTypes.node,
  // ref: PropTypes.string,
};

export const DialogContent = React.forwardRef(({ children, size, ...props }, forwardedRef) => (
    <DialogPrimitive.Content {...props} ref={forwardedRef} className="Dialog" data-size={size}>
        <div className='Dialog-header'>
            <div className="Dialog-titleWrap">
                <DialogPrimitive.Title />
                <DialogPrimitive.Description />
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
};

export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

Dialog.displayName = 'Dialog';
