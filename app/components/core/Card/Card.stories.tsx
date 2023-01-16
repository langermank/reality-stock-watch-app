import React from "react";
import { Card } from "./Card";
import { ChangeVisualizer } from "../ChangeVisualizer/ChangeVisualizer";

export default {
  title: "Components/Card",
  component: Card,
};

export const Playground = (args) => <Card {...args}>Child</Card>;

export const Networth = (args) => (
  <Card {...args} title='Networth'>
    <ChangeVisualizer label='$3,000' />
  </Card>
);
