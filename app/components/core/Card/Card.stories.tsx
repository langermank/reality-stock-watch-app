import React from "react";
import { Card } from "./Card";

export default {
  title: "Components/Card",
  component: Card,
};

export const Playground = (args) => <Card {...args}>Child</Card>;
