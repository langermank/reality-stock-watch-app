import { FileX, CaretDown } from "phosphor-react";
import type { ComponentMeta, ComponentStory } from "@storybook/react";
import React from "react";
import { Button } from "./Button";

export default {
  title: "Components/Button",
  component: Button,
  args: {
    variant: "primary",
  },
} as ComponentMeta<typeof Button>;

export const Playground: ComponentStory<typeof Button> = (args) => (
  <Button {...args}>Default</Button>
);

export const Secondary: ComponentStory<typeof Button> = (args) => (
  <Button {...args}>Default</Button>
);
Secondary.args = {
  variant: "secondary",
};

export const Primary: ComponentStory<typeof Button> = (args) => <Button {...args}>Default</Button>;
Primary.args = {
  variant: "primary",
};

export const Muted: ComponentStory<typeof Button> = (args) => <Button {...args}>Default</Button>;
Muted.args = {
  variant: "muted",
  trailingActionIcon: <CaretDown />,
};

export const SecondaryGhost: ComponentStory<typeof Button> = (args) => (
  <Button {...args}>Default</Button>
);
SecondaryGhost.args = {
  variant: "secondaryGhost",
};

export const Danger: ComponentStory<typeof Button> = (args) => <Button {...args}>Default</Button>;
Danger.args = {
  variant: "danger",
};

export const PrimaryGhost: ComponentStory<typeof Button> = (args) => (
  <Button {...args}>Default</Button>
);
PrimaryGhost.args = {
  variant: "primaryGhost",
};

export const IconLeft: ComponentStory<typeof Button> = (args) => <Button {...args}>Default</Button>;
IconLeft.args = {
  icon: <FileX />,
};

export const IconRight: ComponentStory<typeof Button> = (args) => (
  <Button {...args}>Default</Button>
);
IconRight.args = {
  icon: <FileX />,
  iconPosition: "right",
};

export const TrailingActionIcon: ComponentStory<typeof Button> = (args) => (
  <Button {...args}>Default</Button>
);
TrailingActionIcon.args = {
  icon: <FileX />,
  trailingActionIcon: <CaretDown />,
  iconPosition: "right",
};

export const IconOnly: ComponentStory<typeof Button> = (args) => <Button {...args}>Default</Button>;
IconOnly.args = {
  icon: <FileX />,
  iconOnly: true,
};
