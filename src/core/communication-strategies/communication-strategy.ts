import { ParsedJSON } from "../json";
import { PayloadForRequestHandler } from "./payloads/payload-for-request-handler";

export type CommunicationStrategyName = string;
export interface HandlerResponse {
  code?: number;
  response: ParsedJSON;
}

export interface CommunicationStrategy<
  T extends PayloadForRequestHandler = PayloadForRequestHandler
> {
  name: CommunicationStrategyName;
  handleRequest(data: ParsedJSON, payload: T): Promise<HandlerResponse>;
}
