import React from "react";

export type ImageProps = {
  height?: string;
  width?: string;
  alt?: string;
  src?: string;
};

export function Image({ height, width, alt, src }: ImageProps) {
  return <img alt={alt} src={src} height={height} width={width} />;
}
