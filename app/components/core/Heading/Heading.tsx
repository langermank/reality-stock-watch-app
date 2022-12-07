import React, { forwardRef, useCallback } from "react";
import type { Ref, PropsWithChildren } from "react";

type BaseProps<T> = {
  className?: string;
  id?: string;
  ref?: Ref<T>;
};

type HeadingSizesType =
  | "display"
  | "title-large"
  | "title-medium"
  | "title-small"
  | "body-large"
  | "body-medium";

type HeadingTagsType = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

// export const HeadingSizes = [
//   "display",
//   "title-large",
//   "title-medium",
//   "title-small",
//   "body-large",
//   "body-medium",
// ] as const;
// export const HeadingTags = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;
export const defaultHeadingTag = HeadingTags[1];

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

    const HeadingComponent = useCallback(
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
      <HeadingComponent className="Heading" ref={ref} data-size={headingSize} {...rest}>
        {children}
      </HeadingComponent>
    );
  }
);

Heading.displayName = "Heading";
