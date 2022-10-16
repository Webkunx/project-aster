import { ParsedJSON } from "./parsed-json";
import { Headers } from "./headers";

export type IncomingRequestData = {
  body: ParsedJSON;
  query: Record<string, string>;
  headers: Headers;
  params?: Record<string, string>;
};
