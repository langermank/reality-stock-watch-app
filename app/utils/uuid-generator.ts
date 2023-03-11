const largestId = 281_474_976_710_655;
let globalIdCounter = 0;

export const guid = (prefix: string) => {
  globalIdCounter = (globalIdCounter + 1) % largestId;

  return `${prefix}-${globalIdCounter}`;
};
