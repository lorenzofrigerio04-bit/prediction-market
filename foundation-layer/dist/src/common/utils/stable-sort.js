export const stableSort = (values, compare) => values
    .map((value, index) => ({ value, index }))
    .sort((left, right) => {
    const compared = compare(left.value, right.value);
    return compared !== 0 ? compared : left.index - right.index;
})
    .map(({ value }) => value);
//# sourceMappingURL=stable-sort.js.map