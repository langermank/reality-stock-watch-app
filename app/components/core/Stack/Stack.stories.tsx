import type { ComponentMeta, ComponentStory } from "@storybook/react";
import React from "react";
import { Stack } from "./Stack";
import { Card } from "../Card/Card";

export default {
  title: "Components/Stack",
  component: Stack,
} as ComponentMeta<typeof Stack>;

export const Playground: ComponentStory<typeof Stack> = (args) => (
  <Stack {...args}>
    <Card>Item 1</Card>
    <Card>Item 2</Card>
    <Card>Item 3</Card>
  </Stack>
);
