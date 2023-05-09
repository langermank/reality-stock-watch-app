import React from "react";
import { MarketTradeCard } from "./MarketTradeCard";
import { ChangeVisualizer } from "../ChangeVisualizer/ChangeVisualizer";

export default {
  title: "Compositions/MarketTradeCard",
  component: MarketTradeCard,
};

// export const Playground = (args) => <Card {...args}>Child</Card>;

export const Default = (args) => <MarketTradeCard {...args} />;
