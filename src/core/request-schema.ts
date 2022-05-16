import { PayloadForRequestHandler } from "./communication-strategies/payloads/payload-for-request-handler";
import { HTTPMethods } from "./http-methods";

export enum ParamsToExtractFromResponse {
  AllParams,
  NoParams,
}
// TODO: Add extraction for concrete params
export interface RequestHandlerSchema {
  name: string;
  shouldWait: boolean;
  paramsToExtract: ParamsToExtractFromResponse;
  payloadForRequestHandler: PayloadForRequestHandler;
}

export interface RequestSchema {
  url: string;
  method: HTTPMethods;
  validationSchema?: string;
  defaultPayloadForRequestHandler: PayloadForRequestHandler;
  requestHandlers?: RequestHandlerSchema[];
}
