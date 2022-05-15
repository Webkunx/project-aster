import { ParsedJSON } from "../json";
import { PayloadForRequestHandler } from "./payloads/payload-for-request-handler";
import { CommunicationStrategy } from "./communication-strategy";

export class BaseCommunicationStrategy implements CommunicationStrategy {
  async handleRequest(
    data: ParsedJSON,
    payload: PayloadForRequestHandler
  ): Promise<{ code?: number; response: ParsedJSON }> {
    return { response: { data, payload: payload as ParsedJSON } };
  }
}
