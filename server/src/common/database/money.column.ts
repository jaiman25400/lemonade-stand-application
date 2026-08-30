import { ColumnOptions, ValueTransformer } from 'typeorm';

// The pg driver returns `numeric` as a string to avoid float rounding, so every
// money column converts at the boundary and entities work in plain numbers.
const decimalTransformer: ValueTransformer = {
  to: (value: number) => value.toFixed(2),
  from: (value: string) => Number(value),
};

export const moneyColumn: ColumnOptions = {
  type: 'numeric',
  precision: 10,
  scale: 2,
  transformer: decimalTransformer,
};
