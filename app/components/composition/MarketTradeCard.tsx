import React from "react";
import { Plus, Minus } from "phosphor-react";
import { Card } from "../core/Card/Card";
import { Image } from "../core/Image/Image";
import { Input } from "../core/Input/Input";
import { Heading } from "../core/Heading/Heading";
import { StarRating } from "../core/StarRating/StarRating";
import { ChangeVisualizer } from "../core/ChangeVisualizer/ChangeVisualizer";
import { Button } from "../core/button/Button";

export type MarketTradeCardProps = {
  variant?:
    | "positive"
    | "negative"
    | "warning"
    | "neutral"
    | "gold"
    | "silver"
    | "bronze"
    | undefined;
  padding?: "normal" | "condensed" | "spacious";
  children?: React.ReactNode;
  title?: string;
  fullWidth?: boolean;
};

export function MarketTradeCard({
  variant,
  padding = "normal",
  children,
  title,
  fullWidth = false,
}: MarketTradeCardProps) {
  return (
    <div className='MarketTradeCard'>
      <Image
        src='https://realitystockwatch.com/storage/sSGedBejXxaVjtAOFERqM38oymvjsfklf38xSgLh.png'
        height='56'
        width='56'
      />
      <div className='MarketTradeCard-content'>
        <Heading as='h3' size='title-small'>
          Mary
        </Heading>
        <StarRating rating='5' />
        <div className='MarketTradeCard-change'>
          <ChangeVisualizer label='$10.00' />
          <ChangeVisualizer label='$10.00' />
        </div>
      </div>
      <div className='MarketTradeCard-input'>
        <p>Trade</p>
        <Input label='Trade {participant} stock' type='number' visuallyHideLabel />
        <Button iconOnly icon={<Plus />}>
          Buy
        </Button>
        <Button iconOnly icon={<Minus />}>
          Sell
        </Button>
      </div>

      <p>Holding</p>
    </div>
  );
}
