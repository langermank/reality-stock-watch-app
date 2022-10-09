import { FileX, CaretDown } from "phosphor-react";
import React from "react";

import Button from "./Button.jsx";

export default {
  title: "Components/Button",
  component: Button,
  args: {
    variant: "primary",
  },
};

export const Playground = (args) => <Button {...args}>Default</Button>;

export const Secondary = (args) => <Button {...args}>Default</Button>;
Secondary.args = {
  variant: "secondary",
};

export const Primary = (args) => <Button {...args}>Default</Button>;
Primary.args = {
  variant: "primary",
};

export const Muted = (args) => <Button {...args}>Default</Button>;
Muted.args = {
  variant: "muted",
  trailingActionIcon: <CaretDown />,
};

export const SecondaryGhost = (args) => <Button {...args}>Default</Button>;
SecondaryGhost.args = {
  variant: "secondaryGhost",
};

export const PrimaryGhost = (args) => <Button {...args}>Default</Button>;
PrimaryGhost.args = {
  variant: "primaryGhost",
};

export const IconLeft = (args) => <Button {...args}>Default</Button>;
IconLeft.args = {
  icon: <FileX />,
};

export const IconRight = (args) => <Button {...args}>Default</Button>;
IconRight.args = {
  icon: <FileX />,
  iconPosition: "right",
};

export const TrailingActionIcon = (args) => <Button {...args}>Default</Button>;
TrailingActionIcon.args = {
  icon: <FileX />,
  trailingActionIcon: <CaretDown />,
  iconPosition: "right",
};
