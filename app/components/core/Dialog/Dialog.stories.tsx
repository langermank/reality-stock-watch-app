import React from "react";
import type { ComponentMeta, ComponentStory } from "@storybook/react";
import { Dialog, DialogTrigger, DialogContent } from "./Dialog";

export default {
  title: "Components/Dialog",
  component: Dialog,
  argTypes: {
    size: {
      options: ["auto", "full"],
      control: { type: "radio" },
    },
    title: {
      control: { type: "text" },
    },
    description: {
      control: { type: "text" },
    },
    visuallyHideTitle: {
      control: { type: "boolean" },
    },
  },
  args: {
    align: "center",
  },
} as ComponentMeta<typeof Dialog>;

export const Playground: ComponentStory<typeof Dialog> = (args) => (
  <Dialog {...args}>
    <DialogTrigger>Dialog trigger</DialogTrigger>
    <DialogContent {...args} title='hello' description='This is a description'>
      Dialog Content
    </DialogContent>
  </Dialog>
);
