export type ParsedJSON =
  | string
  | number
  | boolean
  | { [x: string]: ParsedJSON }
  | Array<ParsedJSON>;
