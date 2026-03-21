export type Branded<TValue, TBrand extends string> = TValue & {
  readonly __brand: TBrand;
};
