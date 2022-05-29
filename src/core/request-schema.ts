import { PayloadForRequestHandler } from "./communication-strategies/payloads/payload-for-request-handler";
import { HTTPMethods } from "./http-methods";

export enum ParamsToExtractFromResponse {
  AllParams = "AllParams",
  NoParams = "NoParams",
}
// TODO: Add extraction for concrete params
// TODO?: Request parralelism + merging???
export interface RequestHandlerSchema {
  name: string;
  shouldNotWaitForRequestCompletion?: boolean;
  paramsToExtract: ParamsToExtractFromResponse;
  payloadForRequestHandler: PayloadForRequestHandler;
}

export interface RequestSchema {
  url: string;
  method: HTTPMethods;
  validationSchema?: string;
  defaultPayloadForRequestHandler: PayloadForRequestHandler;
  requestHandlersSchemas?: RequestHandlerSchema[];
}
