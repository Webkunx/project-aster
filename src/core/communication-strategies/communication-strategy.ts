import { IncomingRequestData } from "./../../common/incoming-request-data";
import { ParsedJSON } from "../../common/parsed-json";
import { PayloadForRequestHandler } from "./payloads/payload-for-request-handler";
import { Response } from "../response";

export type CommunicationStrategyName = string;

export interface CommunicationStrategy<
  T extends PayloadForRequestHandler = PayloadForRequestHandler
> {
  name: CommunicationStrategyName;
  handleRequest(
    incomingRequestData: IncomingRequestData,
    requestUrl: string,
    handlersData: Record<string, ParsedJSON>,
    payload: T
  ): Promise<Response>;
}
