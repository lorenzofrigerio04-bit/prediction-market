export const stableSort = <T>(
  values: readonly T[],
  compare: (a: T, b: T) => number,
): readonly T[] =>
  values
    .map((value, index) => ({ value, index }))
    .sort((left, right) => {
      const compared = compare(left.value, right.value);
      return compared !== 0 ? compared : left.index - right.index;
    })
    .map(({ value }) => value);
