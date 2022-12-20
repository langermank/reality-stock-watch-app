/* eslint-disable react/display-name */
import React, { Children, PropsWithChildren, forwardRef, type Ref } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "phosphor-react";
import { Button } from "../button/Button";
import { Heading } from "../Heading/Heading";

export type DialogProps = {
  align?: "center";
};

export const Dialog = ({ children, align }: PropsWithChildren<DialogProps>) => {
  return (
    <DialogPrimitive.Root>
      <DialogPrimitive.Overlay className="Dialog-backdrop" data-align={align} />
      {children}
    </DialogPrimitive.Root>
  );
};

export type DialogContentProps = {
  size?: "auto" | "full";
  title: string;
  description?: string;
  visuallyHideTitle?: boolean;
};

export const DialogContent = forwardRef<Ref, PropsWithChildren<DialogContentProps>>(
  ({ children, size, title, description, visuallyHideTitle = false }, ref) => {
    <DialogPrimitive.Content ref={ref} className="Dialog" data-size={size}>
      <div className="Dialog-header">
        <div className="Dialog-titleWrap" data-hidden={visuallyHideTitle}>
          {title && (
            <DialogPrimitive.Title asChild>
              <Heading as="h2" size="title-small">
                {title}
              </Heading>
            </DialogPrimitive.Title>
          )}
          {description && (
            <DialogPrimitive.Description className="Dialog-description">
              {description}
            </DialogPrimitive.Description>
          )}
        </div>
        <DialogPrimitive.Close asChild>
          <Button variant="muted" icon={<X />} iconOnly size="small" className="Dialog-close">
            Close
          </Button>
        </DialogPrimitive.Close>
      </div>
      <div className="Dialog-content">{children}</div>
    </DialogPrimitive.Content>;
  }
);

export const DialogTrigger = DialogPrimitive.Trigger;

Dialog.displayName = "Dialog";
