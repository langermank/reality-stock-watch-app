import type { OverlayTriggerState } from "react-stately";
import type { AriaPopoverProps } from "@react-aria/overlays";
import * as React from "react";
import { usePopover, DismissButton, Overlay } from "@react-aria/overlays";

interface PopoverProps extends Omit<AriaPopoverProps, "popoverRef"> {
  children: React.ReactNode;
  state: OverlayTriggerState;
  width?: "default" | "full";
}

export function Popover(props: PopoverProps) {
  let ref = React.useRef<HTMLDivElement>(null);
  let { state, children, width } = props;

  let { popoverProps, underlayProps } = usePopover(
    {
      ...props,
      popoverRef: ref,
    },
    state
  );

  return (
    <Overlay>
      <div {...underlayProps} style={{ position: "fixed", inset: 0 }} />
      <div {...popoverProps} ref={ref} className="DropdownMenu-overlay" data-width={width}>
        <DismissButton onDismiss={state.close} />
        {children}
        <DismissButton onDismiss={state.close} />
      </div>
    </Overlay>
  );
}
