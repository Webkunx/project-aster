import { ParsedJSON } from "../../common/json";
import { PayloadForRequestHandler } from "./payloads/payload-for-request-handler";
import { Response } from "../response";

export type CommunicationStrategyName = string;

export interface CommunicationStrategy<
  T extends PayloadForRequestHandler = PayloadForRequestHandler
> {
  name: CommunicationStrategyName;
  handleRequest(data: ParsedJSON, payload: T): Promise<Response>;
}
