import { PayloadForRequestHandler } from "./communication-strategies/payloads/payload-for-request-handler";
import { HTTPMethods } from "./http-methods";

export interface RequestSchema {
  url: string;
  method: HTTPMethods;
  validationSchema?: string;
  payloadForRequestHandler: PayloadForRequestHandler;
}
