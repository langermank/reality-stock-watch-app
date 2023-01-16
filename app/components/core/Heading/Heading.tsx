import React, { PropsWithChildren, forwardRef, type Ref } from "react";

type BaseProps<T> = {
  className?: string;
  id?: string;
  ref?: Ref<T>;
};

export const HeadingSizes = [
  "display",
  "title-large",
  "title-medium",
  "title-small",
  "body-large",
  "body-medium",
] as const;
export const HeadingTags = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;
export const defaultHeadingTag = HeadingTags[1];

export const classMap = {
  h1: HeadingSizes[0],
  h2: HeadingSizes[1],
  h3: HeadingSizes[2],
  h4: HeadingSizes[3],
  h5: HeadingSizes[4],
  h6: HeadingSizes[5],
};

type HeadingTags = BaseProps<HTMLHeadingElement> & {
  as?: typeof HeadingTags[number];
  size?: typeof HeadingSizes[number];
} & React.HTMLAttributes<HTMLHeadingElement>;

export type HeadingProps = {
  className?: string;
} & HeadingTags;

export const Heading = forwardRef(
  (
    { className, children, as = defaultHeadingTag, size, ...rest }: PropsWithChildren<HeadingProps>,
    ref: Ref<HTMLHeadingElement>
  ) => {
    const headingSize = size && [`${size}`];

    const HeadingComponent = React.useCallback(
      ({ ...props }: React.HTMLAttributes<HTMLHeadingElement>) => {
        if (!HeadingTags.includes(as)) {
          // eslint-disable-next-line no-console
          console.error(`Heading: 'as' prop must be one of ${HeadingTags.join(", ")}`);
          return null;
        }

        return React.createElement(as, props, children);
      },
      [as, children]
    );

    return (
      <HeadingComponent className='Heading' ref={ref} data-size={headingSize} {...rest}>
        {children}
      </HeadingComponent>
    );
  }
);

Heading.displayName = "Heading";
