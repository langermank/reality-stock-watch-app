import React from "react";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { Image } from "./Image";

export default {
  title: "Components/Image",
  component: Image,
} as ComponentMeta<typeof Image>;

const Template: ComponentStory<typeof Image> = (args) => <Image {...args} />;

export const Default = Template.bind({});
Default.args = {
  src: "/",
};
