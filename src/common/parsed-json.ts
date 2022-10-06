export type ParsedJSON =
  | string
  | number
  | boolean
  | null
  | ParsedJSON[]
  | { [key: string]: ParsedJSON };
