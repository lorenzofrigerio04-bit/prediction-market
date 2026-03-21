const isObjectLike = (value) => typeof value === "object" && value !== null;
export const deepFreeze = (value) => {
    if (!isObjectLike(value)) {
        return value;
    }
    const objectValue = value;
    for (const key of Object.getOwnPropertyNames(objectValue)) {
        const child = objectValue[key];
        if (isObjectLike(child) && !Object.isFrozen(child)) {
            deepFreeze(child);
        }
    }
    return Object.freeze(value);
};
//# sourceMappingURL=deep-freeze.js.map