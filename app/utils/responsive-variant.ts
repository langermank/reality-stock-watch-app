export const responsiveRanges = ["narrow", "regular", "wide"] as const;
export type ResponsiveRangesType = typeof responsiveRanges[number];
export type ResponsivePropType<T> = {
  narrow?: T;
  regular: T;
  wide?: T;
};
export type ResponsivePropsType<T> = {
  [Property in keyof T]: T[Property] | ResponsivePropType<T[Property]>;
};

const isResponsivePropType = <T>(candidate: any): candidate is ResponsivePropType<T> => {
  return responsiveRanges.some((responsiveVariant) => candidate.hasOwnProperty(responsiveVariant));
};

const isResponsiveRangeType = (candidate: string): candidate is ResponsiveRangesType => {
  return responsiveRanges.some((responsiveRange) => responsiveRange === candidate);
};

export const convertToResponsiveAttributes = <T>({
  responsiveProps = {},
  props = {},
}: {
  responsiveProps?: any;
  props?: any;
}) => {
  const dataAttributes: Record<string, any> = {};

  for (const key of Object.keys(props)) {
    dataAttributes[`data-${key}`] = props[key];
  }

  for (const key of Object.keys(responsiveProps)) {
    const value = responsiveProps[key];
    if (value === undefined) continue;

    if (!isResponsivePropType<T>(value)) {
      responsiveRanges.forEach((responsiveVariant) => {
        dataAttributes[`data-${key}-${responsiveVariant}`] = value;
      });
      continue;
    }

    for (const viewportRange of Object.keys(value)) {
      if (!isResponsiveRangeType(viewportRange)) continue;

      dataAttributes[`data-${key}-${viewportRange}`] = value[viewportRange];
    }
  }

  return dataAttributes;
};
