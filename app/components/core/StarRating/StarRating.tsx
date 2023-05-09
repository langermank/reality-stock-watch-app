import React from "react";
import { Star } from "phosphor-react";

export type StarRatingProps = {
  rating?: string;
};

export function StarRating({ rating = "1" }: StarRatingProps) {
  return (
    <div className='StarRating'>
      <Star weight='fill' />
      {rating && <p className='StarRating-label'>{rating}/10</p>}
    </div>
  );
}
