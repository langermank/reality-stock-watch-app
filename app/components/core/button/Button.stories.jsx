import { FileX } from "phosphor-react";
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
