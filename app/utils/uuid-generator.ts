import crypto from "crypto";

const largestId = 281_474_976_710_655;
let globalIdCounter = 0;

// use this to generate gloablly unique ids items in a component's list
export const guid = (prefix: string) => {
  globalIdCounter = (globalIdCounter + 1) % largestId;

  return `${prefix}-${globalIdCounter}`;
};

// use this to generate uuids for objects
export const uuid = (prefix: string = "") => {
  return `${prefix}${crypto.randomUUID()}`;
};
