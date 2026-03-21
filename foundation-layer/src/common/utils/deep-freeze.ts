const isObjectLike = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

export const deepFreeze = <T>(value: T): Readonly<T> => {
  if (!isObjectLike(value)) {
    return value;
  }

  const objectValue = value as Record<string, unknown>;
  for (const key of Object.getOwnPropertyNames(objectValue)) {
    const child = objectValue[key];
    if (isObjectLike(child) && !Object.isFrozen(child)) {
      deepFreeze(child);
    }
  }

  return Object.freeze(value);
};
