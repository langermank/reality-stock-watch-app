import React from "react";
import { Plus, Minus } from "phosphor-react";
import { Text } from "../core/Text/Text";
import { Stack } from "../core/Stack/Stack";
import { Image } from "../core/Image/Image";
import { Input } from "../core/Input/Input";
import { Heading } from "../core/Heading/Heading";
import { StarRating } from "../core/StarRating/StarRating";
import { ChangeVisualizer } from "../core/ChangeVisualizer/ChangeVisualizer";
import { Button } from "../core/button/Button";

export type MarketTradeCardProps = {};

export function MarketTradeCard({}: MarketTradeCardProps) {
  return (
    <div className='MarketTradeCard'>
      <Image
        src='https://realitystockwatch.com/storage/sSGedBejXxaVjtAOFERqM38oymvjsfklf38xSgLh.png'
        height='56'
        width='56'
      />
      <Stack
        direction='inline'
        gap='normal'
        align='center'
        spread='distribute'
        className='MarketTradeCard-content'
      >
        <Stack direction='block' gap='none'>
          <Heading as='h3' size='title-small'>
            Mary (MRY)
          </Heading>
          <StarRating rating='5' />
        </Stack>
        <Stack direction='block' gap='none'>
          <ChangeVisualizer label='$10.00' />
          <ChangeVisualizer label='$10.00' />
        </Stack>
      </Stack>
      <div className='MarketTradeCard-trade'>
        <Text>Trade</Text>
        <Stack direction='inline' gap='condensed'>
          <Input
            sizeVariant='small'
            label='Trade {participant} stock'
            type='number'
            id='trade'
            visuallyHideLabel
          />
          <Button size='small' iconOnly icon={<Plus />}>
            Buy
          </Button>
          <Button size='small' iconOnly icon={<Minus />}>
            Sell
          </Button>
        </Stack>
        <Text size='small'>Holding</Text>
        <Stack direction='inline' gap='normal'>
          <Text size='small'>20</Text>
          <ChangeVisualizer label='10' size='small' />
        </Stack>
      </div>
    </div>
  );
}
