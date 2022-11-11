let globalIdCounter = 0;

export const guid = (prefix) => {
  globalIdCounter += 1;

  return `${prefix}-${globalIdCounter}`;
}
