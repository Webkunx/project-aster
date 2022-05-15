import { ParsedJSON } from "../json";
import { PayloadForRequestHandler } from "./payloads/payload-for-request-handler";

export interface CommunicationStrategy<
  T extends PayloadForRequestHandler = PayloadForRequestHandler
> {
  handleRequest(
    data: ParsedJSON,
    payload: T
  ): Promise<{ code?: number; response: ParsedJSON }>;
}
