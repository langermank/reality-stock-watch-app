import React from "react";

import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from "./Dialog.jsx";

export default {
  title: "Components/Dialog",
  component: Dialog,
  argTypes: {
    size: {
      options: ['auto', 'full'],
      control: { type: 'radio' },
    },
    title: {
      control: { type: 'text' },
    },
    description: {
      control: { type: 'text' },
    },
    visuallyHideTitle: {
      control: { type: 'boolean' },
    }
  },
  args: {
    align: "center",
  },
};

export const Playground = (args) =>
  <Dialog {...args}>
    <DialogTrigger>Dialog trigger</DialogTrigger>
    <DialogContent {...args} title="hello" description="This is a description">
      {/* <DialogTitle>Hello</DialogTitle> */}
      {/* <DialogDescription>This is a description</DialogDescription> */}
      Dialog Content
    </DialogContent>
  </Dialog>
;
