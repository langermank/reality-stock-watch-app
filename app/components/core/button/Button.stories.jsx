import { FileX } from "phosphor-react";
import React from "react";

import Button from "./Button.jsx";

export default {
  title: "Components/Button",
  component: Button,
};

const Template = (args) => (
  <div
    style={{
      display: "flex",
      gap: "1rem",
      flexDirection: "column",
      alignItems: "center",
    }}
  >
    <Button {...args} variant="primary">
      Primary
    </Button>
    <Button {...args} variant="primaryGhost">
      Primary Ghost
    </Button>
    <Button {...args} variant="secondary">
      Secondary
    </Button>
    <Button {...args} variant="secondaryGhost">
      Secondary Ghost
    </Button>
    <Button {...args} variant="secondaryHint">
      Secondary Hint
    </Button>
    <Button {...args} variant="outline">
      Outline
    </Button>
  </div>
);

export const Default = Template.bind({});
Default.args = {
  // variant: 'primary',
};

// export const Secondary = Template.bind({});
// Secondary.args = {
//     label: 'Button',
// };

// export const Large = Template.bind({});
// Large.args = {
//     size: 'large',
//     label: 'Button',
// };

// export const Small = Template.bind({});
// Small.args = {
//     size: 'small',
//     label: 'Button',
// };
