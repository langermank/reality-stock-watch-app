import { MagnifyingGlass } from "phosphor-react";
import React from "react";

import { Dialog, DialogTrigger, DialogContent } from "./Dialog.jsx";

export default {
  title: "Components/Dialog",
  component: Dialog,
  args: {
    align: "center",
  },
};

export const Playground = (args) =>
  <Dialog {...args}>
    <DialogTrigger>Dialog trigger</DialogTrigger>
    <DialogContent size="auto">Dialog Content</DialogContent>
  </Dialog>
;
